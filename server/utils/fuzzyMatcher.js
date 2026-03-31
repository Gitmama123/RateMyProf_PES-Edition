/**
 * Fuzzy Matcher Utility
 * Provides string similarity functions for professor name matching.
 */

/**
 * Normalizes a name string by removing titles, multiple spaces, and converting to lowercase.
 */
function normalizeName(name) {
    if (!name) return "";
    return name
        .toLowerCase()
        .replace(/^(dr\.|mr\.|ms\.|mrs\.|prof\.)\s+/i, "") // Remove common titles
        .replace(/\./g, " ") // Replace dots with spaces (initials)
        .replace(/\s+/g, " ") // Collapse multiple spaces
        .trim();
}

/**
 * Calculates Levenshtein Distance between two strings.
 */
function levenshteinDistance(s1, s2) {
    const m = s1.length;
    const n = s2.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,      // Deletion
                dp[i][j - 1] + 1,      // Insertion
                dp[i - 1][j - 1] + cost // Substitution
            );
        }
    }
    return dp[m][n];
}

/**
 * Returns a score between 0 and 1 representing string similarity.
 */
function getSimilarityScore(s1, s2) {
    const n1 = normalizeName(s1);
    const n2 = normalizeName(s2);
    
    if (n1 === n2) return 1.0;
    if (n1.includes(n2) || n2.includes(n1)) return 0.9; // Partial containment is strongly suggestive

    const distance = levenshteinDistance(n1, n2);
    const maxLength = Math.max(n1.length, n2.length);
    
    if (maxLength === 0) return 1.0;
    return 1 - distance / maxLength;
}

/**
 * Check if a name matches any entry in a list of allowed names.
 * Threshold defaults to 0.85 (85% similarity).
 */
function isMemberOf(name, allowedList, threshold = 0.85) {
    if (!name || !allowedList || !Array.isArray(allowedList)) return false;
    
    for (const allowedName of allowedList) {
        if (getSimilarityScore(name, allowedName) >= threshold) {
            return true;
        }
    }
    return false;
}

module.exports = {
    normalizeName,
    getSimilarityScore,
    isMemberOf,
};
