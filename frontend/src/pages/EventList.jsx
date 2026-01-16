import React from 'react';
import EventListMobile from './EventListMobile';
import EventListDesktop from './EventListDesktop';

const EventList = () => {
    return (
        <>
            <div className="md:hidden">
                <EventListMobile />
            </div>
            <div className="hidden md:block">
                <EventListDesktop />
            </div>
        </>
    );
};

export default EventList;
