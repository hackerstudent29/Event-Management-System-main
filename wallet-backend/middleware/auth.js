const { verifyApiKey } = require('../utils/crypto');

/**
 * Middleware: Authenticate API requests
 * Supports both X-API-Key header and Authorization: Bearer
 */
async function authenticateApiKey(pool) {
    return async (req, res, next) => {
        // Try both common header names
        let apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];

        // If not found, check Authorization header for Bearer token
        if (!apiKey) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                apiKey = authHeader.substring(7);
            }
        }

        if (!apiKey) {
            return res.status(401).json({
                error: 'unauthorized',
                message: 'Missing API Key. Provide it in X-API-Key or Authorization: Bearer header.'
            });
        }

        try {
            // Find all active apps
            const result = await pool.query(
                'SELECT id, app_id, api_key_hash, is_active FROM apps WHERE is_active = true'
            );

            let authenticatedApp = null;

            for (const app of result.rows) {
                const isValid = await verifyApiKey(apiKey, app.api_key_hash);
                if (isValid) {
                    authenticatedApp = app;
                    break;
                }
            }

            if (!authenticatedApp) {
                return res.status(403).json({
                    error: 'forbidden',
                    message: 'Invalid or inactive API Key'
                });
            }

            // Attach app to request
            req.app = authenticatedApp;
            next();

        } catch (error) {
            console.error('Auth error:', error);
            return res.status(500).json({
                error: 'internal_error',
                message: 'Authentication failed'
            });
        }
    };
}

/**
 * Middleware: Log API requests
 */
function logApiRequest(pool) {
    return async (req, res, next) => {
        const startTime = Date.now();

        // Capture original end function
        const originalEnd = res.end;

        res.end = function (...args) {
            const duration = Date.now() - startTime;

            // Log to database (fire and forget)
            if (req.app) {
                pool.query(
                    `INSERT INTO api_logs (app_id, method, path, status_code, duration_ms, ip_address, user_agent)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        req.app.id,
                        req.method,
                        req.path,
                        res.statusCode,
                        duration,
                        req.ip,
                        req.get('user-agent')
                    ]
                ).catch(err => console.error('Failed to log API request:', err));
            }

            // Call original end
            originalEnd.apply(res, args);
        };

        next();
    };
}

module.exports = {
    authenticateApiKey,
    logApiRequest
};
