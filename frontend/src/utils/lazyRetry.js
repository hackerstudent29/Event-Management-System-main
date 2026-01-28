import React, { lazy } from 'react';

// Retry logic to handle chunk load errors (often caused by new deployments)
export const lazyRetry = (componentImport) => {
    return lazy(async () => {
        const pageHasAlreadyBeenForceRefreshed = JSON.parse(
            window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
        );

        try {
            return await componentImport();
        } catch (error) {
            if (!pageHasAlreadyBeenForceRefreshed) {
                // Assuming that the user is not on the latest version of the application.
                // Let's refresh the page immediately.
                window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
                window.location.reload();
            }

            // The page has already been reloaded
            // Assuming that user is already using the latest version of the application.
            // Let's let the application crash and raise the error.
            throw error;
        }
    });
};
