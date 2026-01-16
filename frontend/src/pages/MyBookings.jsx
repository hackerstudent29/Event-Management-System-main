import React from 'react';
import MyBookingsMobile from './MyBookingsMobile';
import MyBookingsDesktop from './MyBookingsDesktop';

const MyBookings = () => {
    return (
        <>
            <div className="md:hidden">
                <MyBookingsMobile />
            </div>
            <div className="hidden md:block">
                <MyBookingsDesktop />
            </div>
        </>
    );
};

export default MyBookings;
