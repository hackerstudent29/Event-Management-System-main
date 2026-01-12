import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

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

    // Update style if it changes
    useEffect(() => {
        if (map && loaded) {
            map.setStyle(mapStyle);
        }
    }, [mapStyle, loaded]);

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

    useEffect(() => {
        if (!map || !loaded) return;

        // different approach: create DOM element for custom marker if children provided
        const el = document.createElement('div');
        if (children) {
            // This is tricky in React without portals, usually maplibre markers are simple DOM nodes.
            // For simplicity in this prompt, we assume default marker if no children, 
            // BUT we can render children into 'el' using ReactDOM if strictly needed.
            // Let's stick to default blue marker or basic custom element class.
            el.className = 'custom-marker';
        }

        const marker = new maplibregl.Marker({
            element: children ? el : undefined,
            draggable: draggable,
            color: '#10b981' // Emerald green
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
        };
    }, [map, loaded]); // Re-create if map reloads (simplified)

    // Update position
    useEffect(() => {
        if (markerRef.current) {
            const validLon = Number.isFinite(parseFloat(longitude)) ? parseFloat(longitude) : 0;
            const validLat = Number.isFinite(parseFloat(latitude)) ? parseFloat(latitude) : 0;

            // Only update if valid
            if (Number.isFinite(validLon) && Number.isFinite(validLat)) {
                markerRef.current.setLngLat([validLon, validLat]);
            }
        }
    }, [longitude, latitude]);

    return null; // Rendered via maplibre API
};

export const MapRoute = ({ from, to, color = '#3b82f6', profile = 'driving', onRouteStats }) => {
    const { map, loaded } = React.useContext(MapContext);

    useEffect(() => {
        if (!map || !loaded || !from || !to) return;

        const fetchRoute = async () => {
            try {
                // Using OSRM public demo server (Good for dev, switch for prod if heavily used)
                const query = `http://router.project-osrm.org/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
                const res = await fetch(query);
                const data = await res.json();

                if (!data.routes || data.routes.length === 0) return;

                const route = data.routes[0];

                // Invoke callback if provided
                if (onRouteStats) {
                    onRouteStats({
                        distance: route.distance, // meters
                        duration: route.duration  // seconds
                    });
                }

                const geojson = {
                    type: 'Feature',
                    properties: {},
                    geometry: route.geometry
                };

                if (map.getSource('route')) {
                    map.getSource('route').setData(geojson);
                } else {
                    map.addSource('route', {
                        type: 'geojson',
                        data: geojson
                    });
                    map.addLayer({
                        id: 'route',
                        type: 'line',
                        source: 'route',
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        paint: {
                            'line-color': color,
                            'line-width': 4,
                            'line-opacity': 0.75
                        }
                    });
                }

                // Fit bounds
                const bounds = new maplibregl.LngLatBounds();
                bounds.extend([from.lng, from.lat]);
                bounds.extend([to.lng, to.lat]);
                map.fitBounds(bounds, { padding: 50 });

            } catch (err) {
                console.error("Failed to fetch route", err);
            }
        };

        fetchRoute();

        return () => {
            if (map && map.getLayer('route')) {
                map.removeLayer('route');
                map.removeSource('route');
            }
        };
    }, [map, loaded, from?.lng, from?.lat, to?.lng, to?.lat, profile]);

    return null;
};
