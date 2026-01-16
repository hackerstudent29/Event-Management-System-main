import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { getDefaultEventImage } from '../lib/image-utils';

const EventListDesktop = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get('/events');
                setEvents(res.data);
            } catch (error) {
                console.error("Failed to fetch events", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading events...</div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">Upcoming Events</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event) => {
                    const minPrice = event.categories?.length
                        ? Math.min(...event.categories.map(c => c.price))
                        : 0;

                    return (
                        <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate(`/events/${event.id}`)}>
                            <div className="aspect-video relative overflow-hidden">
                                <img
                                    src={event.imageUrl || getDefaultEventImage(event.eventType)}
                                    alt={event.name}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-sm">
                                    {event.eventType}
                                </div>
                            </div>
                            <CardHeader className="p-4 pb-2">
                                <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{event.name}</h3>
                                <div className="flex items-center text-sm text-slate-500 gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span className="line-clamp-1">{event.locationName}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="flex items-center text-sm text-slate-500 gap-2 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(event.eventDate), 'PPP')}
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-auto bg-slate-50/50">
                                <div className="text-lg font-bold text-slate-900">
                                    ₹{minPrice}
                                    <span className="text-xs font-normal text-slate-500 ml-1">onwards</span>
                                </div>
                                <Button size="sm">Book Now</Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default EventListDesktop;
