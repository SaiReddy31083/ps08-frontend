/**
 * Configuration file for the Citizen-Politician Interaction System
 * Contains the base URL for all backend API calls
 */

// Base URL for backend API (Spring Boot server)
const BASE_URL = "http://localhost:9191";

// API Endpoints
const API_ENDPOINTS = {
    // Get all issues
    GET_ALL_ISSUES: `${BASE_URL}/api/issues`,
    
    // Create new issue
    CREATE_ISSUE: `${BASE_URL}/api/issues`,
    
    // Vote on an issue (requires issue ID)
    VOTE_ISSUE: (id) => `${BASE_URL}/api/issues/${id}/vote`,
    
    // Get top issues
    GET_TOP_ISSUES: `${BASE_URL}/api/issues/top`
};

// Category colors for charts
const CATEGORY_COLORS = {
    'Road': '#ff6b6b',
    'Water': '#4ecdc4',
    'Electricity': '#ffe66d',
    'Sanitation': '#95e1d3',
    'Others': '#a8dadc'
};

// Export configuration (for module usage if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BASE_URL, API_ENDPOINTS, CATEGORY_COLORS };
}
