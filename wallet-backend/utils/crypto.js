const crypto = require('crypto');
const bcrypt = require('bcrypt');

/**
 * Generate a unique payment ID
 */
function generatePaymentId() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `pay_${timestamp}${random}`;
}

/**
 * Generate a unique app ID
 */
function generateAppId() {
    const random = crypto.randomBytes(6).toString('hex');
    return `app_${random}`;
}

/**
 * Generate API key
 */
function generateApiKey(environment = 'sandbox') {
    const prefix = environment === 'production' ? 'sk_live' : 'sk_test';
    const random = crypto.randomBytes(24).toString('hex');
    return `${prefix}_${random}`;
}

/**
 * Hash API key for storage
 */
async function hashApiKey(apiKey) {
    return await bcrypt.hash(apiKey, 10);
}

/**
 * Verify API key
 */
async function verifyApiKey(apiKey, hash) {
    return await bcrypt.compare(apiKey, hash);
}

/**
 * Generate webhook secret
 */
function generateWebhookSecret() {
    const random = crypto.randomBytes(24).toString('hex');
    return `whsec_${random}`;
}

/**
 * Create webhook signature (HMAC SHA256)
 */
function createWebhookSignature(payload, secret) {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');
}

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(payload, signature, secret) {
    const expected = createWebhookSignature(payload, secret);
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected)
    );
}

module.exports = {
    generatePaymentId,
    generateAppId,
    generateApiKey,
    hashApiKey,
    verifyApiKey,
    generateWebhookSecret,
    createWebhookSignature,
    verifyWebhookSignature
};
