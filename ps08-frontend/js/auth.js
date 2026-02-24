/**
 * Authentication JavaScript
 * Handles user signup and login functionality
 */

// API Endpoints
const AUTH_ENDPOINTS = {
    SIGNUP: `${BASE_URL}/api/auth/signup`,
    LOGIN: `${BASE_URL}/api/auth/login`
};

/**
 * Display alert message to the user
 * @param {string} message - Message to display
 * @param {string} type - Type of alert ('success' or 'error')
 */
function showAlert(message, type) {
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.textContent = message;
    alertMessage.className = `alert alert-${type} show`;
    
    // Auto-hide alert after 5 seconds
    setTimeout(() => {
        alertMessage.classList.remove('show');
    }, 5000);
}

/**
 * Handle user signup
 * POST /api/auth/signup
 */
async function handleSignup(event) {
    event.preventDefault();
    
    // Get form data
    const signupData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        role: document.getElementById('role').value
    };
    
    // Validate form data
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.role) {
        showAlert('Please fill in all required fields', 'error');
        return;
    }
    
    if (signupData.password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        // Send POST request to backend
        const response = await fetch(AUTH_ENDPOINTS.SIGNUP, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! Status: ${response.status}`);
        }
        
        // Show success message
        showAlert('✅ Account created successfully! Redirecting to login...', 'success');
        
        // Reset form
        document.getElementById('signupForm').reset();
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    } catch (error) {
        console.error('Signup error:', error);
        showAlert(error.message || 'Failed to create account. Please try again.', 'error');
    }
}

/**
 * Handle user login
 * POST /api/auth/login
 */
async function handleLogin(event) {
    event.preventDefault();
    
    // Get form data
    const loginData = {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
    };
    
    // Validate form data
    if (!loginData.email || !loginData.password) {
        showAlert('Please enter both email and password', 'error');
        return;
    }
    
    try {
        // Send POST request to backend
        const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Invalid credentials');
        }
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role
        }));
        
        // Show success message
        showAlert('✅ Login successful! Redirecting...', 'success');
        
        // Redirect based on role after 1 second
        setTimeout(() => {
    if (data.role === 'CITIZEN') {
        window.location.href = 'citizen.html';
    } 
    else if (data.role === 'POLITICIAN') {
        window.location.href = 'politician.html';
    } 
    else if (data.role === 'ADMIN') {
        window.location.href = 'admin.html';
    } 
    else if (data.role === 'MODERATOR') {
        window.location.href = 'moderator.html';
    } 
    else {
        showAlert('Unknown user role', 'error');
    }
}, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showAlert(error.message || 'Login failed. Please check your credentials.', 'error');
    }
}

/**
 * Check if user is logged in
 * @returns {Object|null} - User object or null
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
        }
    }
    return null;
}

/**
 * Logout user
 */
function logout() {
    localStorage.removeItem('user');
    window.location.href = '../pages/login.html';
}

/**
 * Check if user has required role access
 * @param {string} requiredRole - Required role (CITIZEN or POLITICIAN)
 */
function checkRoleAccess(requiredRole) {
    const user = getCurrentUser();
    
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (user.role !== requiredRole) {
        alert(`Access denied. This page is for ${requiredRole} only.`);
        
        if (user.role === 'CITIZEN') {
            window.location.href = 'citizen.html';
        } 
        else if (user.role === 'POLITICIAN') {
            window.location.href = 'politician.html';
        } 
        else if (user.role === 'ADMIN') {
            window.location.href = 'admin.html';
        } 
        else if (user.role === 'MODERATOR') {
            window.location.href = 'moderator.html';
        }
        
        return false;
    }
    
    return true;
}
