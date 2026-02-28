

/**
 * Generates a MongoDB ObjectId-like string (24 hex characters)
 * Format: 8-char timestamp + 16-char random
 */
export function generateMongoLikeId(): string {
    // Get current timestamp (seconds since epoch) in hex (8 characters)
    const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');

    // Generate 16 random hex characters
    const randomHex = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 16).toString(16)
    ).join('');

    return timestamp + randomHex;
}

/**
 * Gets existing user ID from localStorage or creates a new one
 * This ID will be used as MongoDB userId throughout the widget
 */
export function getOrCreateUserId(): string {
    const key = "cxxb_userId";

    try {
        const existingId = localStorage.getItem(key);

        // Validate existing ID (must be 24 hex characters)
        if (existingId && /^[0-9a-f]{24}$/i.test(existingId)) {
            return existingId;
        }

        // Generate new ID if not found or invalid
        const newId = generateMongoLikeId();
        localStorage.setItem(key, newId);

        console.log('✅ New user ID generated:', newId);
        return newId;

    } catch (error) {
        // Fallback if localStorage is not available
        console.warn('⚠️ localStorage not available, using session-only ID');
        return generateMongoLikeId();
    }
}

/**
 * Clears the stored user ID (useful for testing)
 */
export function clearUserId(): void {
    try {
        localStorage.removeItem("cxxb_userId");
        console.log('🗑️ User ID cleared');
    } catch (error) {
        console.warn('⚠️ Could not clear user ID');
    }
}

/**
 * Generates a unique session ID for each conversation
 */
export function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}