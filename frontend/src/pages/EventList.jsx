import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Hero Section */}
            <div className="relative bg-muted/30 py-20 px-6 text-center border-b border-border/50">
                <div className="max-w-4xl mx-auto space-y-6">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Experience the Extraordinary
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
                        Secure your spot at the world's most exclusive events.
                        Real-time booking, instant confirmation.
                    </p>
                </div>
            </div>

            {/* Content Container */}
            <div className="container mx-auto px-6 -mt-10">
                {events.length === 0 ? (
                    <div className="card empty-state">
                        <h2 className="text-2xl font-semibold mb-2">No Events Available</h2>
                        <p className="text-muted-foreground">
                            There are no upcoming events at the moment.
                            Please check back later.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event, index) => (
                            <div
                                key={event.id}
                                className="group bg-card border border-border/60 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Decorative Header */}
                                <div className="h-32 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
                                    <span className="text-6xl transform group-hover:scale-110 transition-transform duration-300">📅</span>
                                </div>

                                <div className="p-6 flex-1 flex flex-col space-y-4">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
                                                {event.eventType || 'Event'}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                                            {event.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1 font-medium">
                                            {new Date(event.eventDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>

                                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                                        {event.description || "Join us for this amazing event. Book your tickets before they run out!"}
                                    </p>

                                    <div className="pt-4 mt-auto">
                                        <Button asChild className="w-full shadow-lg hover:shadow-primary/25 transition-all">
                                            <Link to={`/events/${event.id}`}>View Details & Book</Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventList;
