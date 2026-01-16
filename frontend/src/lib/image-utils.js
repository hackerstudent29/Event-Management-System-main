
export const getDefaultEventImage = (type) => {
    const t = (type || '').toLowerCase();

    // Stadiums / Grand Arenas
    if (t.includes('sport') || t.includes('match') || t.includes('cricket') || t.includes('stadium') || t.includes('football'))
        return 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=800';

    // Grand Theatre / Stage
    if (t.includes('theatre') || t.includes('drama') || t.includes('play'))
        return 'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&q=80&w=800';

    // Live Music / Concert (ID confirmed working in user browser)
    if (t.includes('concert') || t.includes('music') || t.includes('dj') || t.includes('live'))
        return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800';

    // Luxury Cinema
    if (t.includes('movie') || t.includes('film') || t.includes('cinema'))
        return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800';

    // Comedy Club 
    if (t.includes('comedy') || t.includes('stand'))
        return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800';

    // Creative Arts / Workshop
    if (t.includes('workshop') || t.includes('art') || t.includes('class'))
        return 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800';

    // Generic high-quality event crowd fallback
    return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800';
};
