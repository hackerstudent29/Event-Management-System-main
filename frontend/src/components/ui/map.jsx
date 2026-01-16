import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

const MapContext = React.createContext(null);

export const Map = forwardRef(({
    initialViewState = { longitude: 0, latitude: 0, zoom: 1 },
    style,
    mapStyle = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json", // Light default
    children,
    className,
    interactive = true,
    ...props
}, ref) => {
    const mapContainer = useRef(null);
    const [map, setMap] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useImperativeHandle(ref, () => ({
        flyTo: (options) => map?.flyTo(options),
        getMap: () => map
    }));

    useEffect(() => {
        if (!mapContainer.current) return;
        if (map) return;

        const mapInstance = new maplibregl.Map({
            container: mapContainer.current,
            style: mapStyle,
            center: [initialViewState.longitude, initialViewState.latitude],
            zoom: initialViewState.zoom,
            interactive: interactive,
            attributionControl: false
        });

        mapInstance.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
        if (interactive) {
            mapInstance.addControl(new maplibregl.NavigationControl(), 'bottom-right');
        }

        mapInstance.on('load', () => {
            setLoaded(true);
            setMap(mapInstance);
        });

        if (props.onClick) {
            mapInstance.on('click', (e) => {
                props.onClick({ longitude: e.lngLat.lng, latitude: e.lngLat.lat });
            });
        }

        return () => {
            mapInstance.remove();
        };
    }, []);

    const styleRef = useRef(mapStyle);

    // Update style if it changes
    useEffect(() => {
        if (map && loaded && mapStyle !== styleRef.current) {
            map.setStyle(mapStyle);
            styleRef.current = mapStyle;
        }
    }, [mapStyle, loaded, map]);

    // Fly to new location if initialViewState changes
    useEffect(() => {
        if (map && loaded) {
            map.flyTo({
                center: [initialViewState.longitude, initialViewState.latitude],
                zoom: initialViewState.zoom || 13,
                essential: true
            });
        }
    }, [initialViewState.longitude, initialViewState.latitude, initialViewState.zoom, map, loaded]);

    return (
        <MapContext.Provider value={{ map, loaded }}>
            <div
                ref={mapContainer}
                className={cn("relative w-full h-full overflow-hidden rounded-md border bg-muted [&_.maplibregl-ctrl-attrib]:hidden [&_.maplibregl-ctrl-bottom-right]:hidden", className)}
                style={style}
            >
                {!loaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/20 backdrop-blur-sm z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                {loaded && children}
            </div>
        </MapContext.Provider>
    );
});

export const Marker = ({ longitude, latitude, draggable = false, onDragEnd, children }) => {
    const { map, loaded } = React.useContext(MapContext);
    const markerRef = useRef(null);
    const [container, setContainer] = useState(null);

    // Initialize Marker
    useEffect(() => {
        if (!map || !loaded) return;

        // Create container element if children exist
        const el = document.createElement('div');
        if (children) {
            el.className = 'custom-marker-container';
            setContainer(el);
        }

        const marker = new maplibregl.Marker({
            element: children ? el : undefined,
            draggable: draggable,
            color: '#10b981'
        })
            .setLngLat([longitude, latitude])
            .addTo(map);

        markerRef.current = marker;

        if (draggable && onDragEnd) {
            marker.on('dragend', () => {
                const lngLat = marker.getLngLat();
                onDragEnd({ longitude: lngLat.lng, latitude: lngLat.lat });
            });
        }

        return () => {
            marker.remove();
            setContainer(null);
        };
    }, [map, loaded]);

    // Update position
    useEffect(() => {
        if (markerRef.current) {
            const validLon = Number.isFinite(parseFloat(longitude)) ? parseFloat(longitude) : null;
            const validLat = Number.isFinite(parseFloat(latitude)) ? parseFloat(latitude) : null;

            if (validLon !== null && validLat !== null) {
                markerRef.current.setLngLat([validLon, validLat]);
            }
        }
    }, [longitude, latitude]);

    // Portal for custom children
    if (children && container) {
        return createPortal(children, container);
    }

    return null;
};

export const MapRoute = ({ from, to, color = '#3b82f6', profile = 'driving', onRouteStats }) => {
    const { map, loaded } = React.useContext(MapContext);
    const mapRef = useRef(map);
    const routeDataRef = useRef(null);

    // Keep mapRef in sync
    useEffect(() => { mapRef.current = map; }, [map]);

    // Helper: Haversine
    const haversineDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Draw Function
    const drawRoute = useCallback(() => {
        const m = mapRef.current;
        if (!m || !routeDataRef.current) return;

        try {
            // Safety check: style must be loaded
            if (!m.getStyle || !m.getStyle()) return;

            const layerId = 'poly-route';
            const data = routeDataRef.current;

            // Check source existence safely
            if (m.getSource && !m.getSource(layerId)) {
                m.addSource(layerId, { type: 'geojson', data });
            } else if (m.getSource) {
                m.getSource(layerId).setData(data);
            }

            // Check layer existence safely
            if (m.getLayer && !m.getLayer(layerId)) {
                // Remove if incorrectly present
                if (m.getLayer(layerId)) m.removeLayer(layerId);

                m.addLayer({
                    id: layerId,
                    type: 'line',
                    source: layerId,
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#3b82f6', // Standard Blue
                        'line-width': 6,
                        'line-opacity': 0.8
                    }
                });

                // Ensure on top - safely
                if (m.moveLayer) m.moveLayer(layerId);
            } else if (m.setPaintProperty && m.moveLayer) {
                m.setPaintProperty(layerId, 'line-color', '#3b82f6');
                m.setPaintProperty(layerId, 'line-width', 6);
                m.moveLayer(layerId);
            }
        } catch (e) {
            console.warn("MapRoute: Draw error (handled)", e);
        }
    }, []);

    // Fetch Effect
    useEffect(() => {
        if (!map || !loaded || !from || !to) return;

        const fLng = parseFloat(from.lng || from.longitude);
        const fLat = parseFloat(from.lat || from.latitude);
        const tLng = parseFloat(to.lng || to.longitude);
        const tLat = parseFloat(to.lat || to.latitude);

        if (isNaN(fLng) || isNaN(fLat) || isNaN(tLng) || isNaN(tLat)) return;
        if ((fLng === 0 && fLat === 0) || (tLng === 0 && tLat === 0)) return;

        const fetchRoute = async () => {
            try {
                const profileType = profile === 'walking' ? 'walking' : (profile === 'cycling' ? 'cycling' : 'driving');

                // Use main OSRM server for better global coverage
                const baseUrl = `https://router.project-osrm.org/route/v1/${profileType}`;
                const query = `${baseUrl}/${fLng.toFixed(6)},${fLat.toFixed(6)};${tLng.toFixed(6)},${tLat.toFixed(6)}?overview=full&geometries=geojson`;

                console.log(`MapRoute: Fetching for profile: '${profile}' -> '${profileType}'`);
                console.log(`MapRoute: Requesting URL: ${query}`);

                const res = await fetch(query);
                if (!res.ok) throw new Error(`Status ${res.status}`);

                const data = await res.json();
                if (!data.routes || !data.routes.length) throw new Error("No routes", data);

                const route = data.routes[0];
                console.log("MapRoute: OK. Geo points:", route.geometry.coordinates.length);

                // VISUAL FIX: Connect route to exact start/end dots (OSRM snaps to nearest road)
                if (route.geometry && route.geometry.coordinates) {
                    route.geometry.coordinates.unshift([fLng, fLat]);
                    route.geometry.coordinates.push([tLng, tLat]);
                }

                // Manual duration calculation to fix OSRM anomalies
                let finalDuration = route.duration;
                if (profile === 'walking') {
                    finalDuration = route.distance / 1.35; // ~4.8 km/h
                } else if (profile === 'cycling') {
                    finalDuration = route.distance / 5.5; // ~20 km/h
                }

                // Use FeatureCollection for robustness
                routeDataRef.current = {
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        properties: { isFallback: false },
                        geometry: route.geometry
                    }]
                };
                drawRoute();

                if (onRouteStats) onRouteStats({ distance: route.distance, duration: finalDuration });

                const bounds = new maplibregl.LngLatBounds();
                bounds.extend([fLng, fLat]);
                bounds.extend([tLng, tLat]);
                map.fitBounds(bounds, { padding: 80, maxZoom: 15 });

            } catch (err) {
                console.warn("MapRoute: Fallback.", err);
                routeDataRef.current = {
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        properties: { isFallback: true },
                        geometry: {
                            type: 'LineString',
                            coordinates: [[fLng, fLat], [tLng, tLat]]
                        }
                    }]
                };
                drawRoute();

                if (onRouteStats) {
                    const d = haversineDistance(fLat, fLng, tLat, tLng);
                    const s = profile === 'walking' ? 1.4 : (profile === 'cycling' ? 4.2 : 13.9);
                    onRouteStats({ distance: d, duration: (d / s) });
                }
                const bounds = new maplibregl.LngLatBounds();
                bounds.extend([fLng, fLat]);
                bounds.extend([tLng, tLat]);
                map.fitBounds(bounds, { padding: 80, maxZoom: 15 });
            }
        };

        fetchRoute();
    }, [map, loaded, from?.lng, from?.lat, to?.lng, to?.lat, profile, drawRoute]);

    // Cleanup and Style Persistence
    useEffect(() => {
        if (!map) return;

        const handleStyleData = () => {
            if (map.isStyleLoaded && map.isStyleLoaded() && routeDataRef.current) {
                drawRoute();
            }
        };

        if (map.on) map.on('styledata', handleStyleData);

        return () => {
            try {
                if (map && map.off) map.off('styledata', handleStyleData);

                // Cleanup layer on unmount - with safety
                const m = mapRef.current;
                if (m && m.getLayer && m.getSource) {
                    if (m.getLayer('poly-route')) {
                        try { m.removeLayer('poly-route'); } catch (e) { }
                    }
                    if (m.getSource('poly-route')) {
                        try { m.removeSource('poly-route'); } catch (e) { }
                    }
                }
            } catch (e) {
                // Ignore cleanup errors on unmount
            }
        };
    }, [map, drawRoute]);

    return null;
};
