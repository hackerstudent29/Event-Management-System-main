import React from 'react';
import ProfileMobile from './ProfileMobile';
import ProfileDesktop from './ProfileDesktop';

const Profile = () => {
    return (
        <>
            <div className="md:hidden">
                <ProfileMobile />
            </div>
            <div className="hidden md:block">
                <ProfileDesktop />
            </div>
        </>
    );
};

export default Profile;
