/**
 * Politician Dashboard JavaScript
 * Handles analytics display with Chart.js
 * Features: Category-wise issue count, percentage calculation, and visualization
 */

// Check role-based access on page load
(function checkAccess() {
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
        alert('Access denied. Please login first.');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const user = JSON.parse(userStr);
        if (user.role !== 'POLITICIAN') {
            alert('Access denied. This page is for Politicians only.');
            window.location.href = 'login.html';
            return;
        }
    } catch (e) {
        alert('Invalid session. Please login again.');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
})();

// DOM Elements
const alertMessage = document.getElementById('alertMessage');
const loadingElement = document.getElementById('loading');
const statsContainer = document.getElementById('statsContainer');
const issuesTableBody = document.getElementById('issuesTableBody');

// Chart instances
let pieChart = null;
let barChart = null;

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayAnalytics();
});

/**
 * Manual refresh of analytics data
 */
function refreshAnalytics() {
    const btn = document.getElementById('refreshBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Refreshing...';
    
    fetchAndDisplayAnalytics().then(() => {
        btn.disabled = false;
        btn.textContent = '🔄 Refresh Data';
        showAlert('✅ Data refreshed successfully!', 'success');
    }).catch(() => {
        btn.disabled = false;
        btn.textContent = '🔄 Refresh Data';
    });
}

/**
 * Display alert message to the user
 * @param {string} message - Message to display
 * @param {string} type - Type of alert ('success' or 'error')
 */
function showAlert(message, type) {
    alertMessage.textContent = message;
    alertMessage.className = `alert alert-${type} show`;
    
    // Auto-hide alert after 5 seconds
    setTimeout(() => {
        alertMessage.classList.remove('show');
    }, 5000);
}

/**
 * Show loading spinner
 */
function showLoading() {
    loadingElement.classList.add('show');
}

/**
 * Hide loading spinner
 */
function hideLoading() {
    loadingElement.classList.remove('show');
}

/**
 * Fetch all issues and display analytics
 * GET /api/issues
 */
async function fetchAndDisplayAnalytics() {
    showLoading();
    
    try {
        const response = await fetch(API_ENDPOINTS.GET_ALL_ISSUES);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const issues = await response.json();
        
        // Process and display analytics
        processAndDisplayAnalytics(issues);
        
        // Display issues in table
        displayIssuesTable(issues);
        
    } catch (error) {
        console.error('Error fetching analytics:', error);
        showAlert('Failed to load analytics. Please ensure the backend server is running.', 'error');
        
        // Display error message in stats container
        statsContainer.innerHTML = `
            <div class="stat-card" style="grid-column: 1 / -1;">
                <h3>⚠️ Error</h3>
                <p>Unable to connect to backend server at ${BASE_URL}</p>
            </div>
        `;
    } finally {
        hideLoading();
    }
}

/**
 * Process issues data and display analytics
 * @param {Array} issues - Array of issue objects
 */
function processAndDisplayAnalytics(issues) {
    // Check if there are no issues
    if (!issues || issues.length === 0) {
        statsContainer.innerHTML = `
            <div class="stat-card" style="grid-column: 1 / -1;">
                <h3>0</h3>
                <p>No Issues Reported Yet</p>
            </div>
        `;
        return;
    }
    
    // Calculate category-wise statistics
    const categoryStats = calculateCategoryStats(issues);
    
    // Display statistics cards
    displayStatsCards(issues.length, categoryStats);
    
    // Render charts
    renderCharts(categoryStats);
}

/**
 * Calculate category-wise issue count and percentages
 * @param {Array} issues - Array of issue objects
 * @returns {Object} - Category statistics
 */
function calculateCategoryStats(issues) {
    const stats = {};
    const totalIssues = issues.length;
    
    // Initialize all categories with zero count - including all new categories
    const categories = [
        'Road', 'Water', 'Electricity', 'Sanitation', 
        'Public Safety', 'Health', 'Education', 'Parks', 'Transport',
        'Child Safety', 'Playgrounds', 'Accessibility', 'Air Quality', 'Noise Pollution',
        'Others'
    ];
    categories.forEach(category => {
        stats[category] = {
            count: 0,
            percentage: 0
        };
    });
    
    // Count issues per category
    issues.forEach(issue => {
        const category = issue.category || 'Others';
        if (stats[category]) {
            stats[category].count++;
        } else {
            // Handle unexpected categories
            stats[category] = { count: 1, percentage: 0 };
        }
    });
    
    // Calculate percentages
    Object.keys(stats).forEach(category => {
        stats[category].percentage = ((stats[category].count / totalIssues) * 100).toFixed(2);
    });
    
    return stats;
}

/**
 * Display statistics cards
 * @param {number} totalIssues - Total number of issues
 * @param {Object} categoryStats - Category-wise statistics
 */
function displayStatsCards(totalIssues, categoryStats) {
    // Clear existing stats
    statsContainer.innerHTML = '';
    
    // Total Issues Card
    const totalCard = document.createElement('div');
    totalCard.className = 'stat-card';
    totalCard.innerHTML = `
        <h3>${totalIssues}</h3>
        <p>Total Issues</p>
    `;
    statsContainer.appendChild(totalCard);
    
    // Category-wise cards
    Object.entries(categoryStats).forEach(([category, data]) => {
        if (data.count > 0) {
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.innerHTML = `
                <h3>${data.count}</h3>
                <p>${category} (${data.percentage}%)</p>
            `;
            statsContainer.appendChild(card);
        }
    });
}

/**
 * Render Pie Chart and Bar Chart using Chart.js
 * @param {Object} categoryStats - Category-wise statistics
 */
function renderCharts(categoryStats) {
    // Prepare data for charts
    const categories = Object.keys(categoryStats);
    const counts = categories.map(cat => categoryStats[cat].count);
    const percentages = categories.map(cat => parseFloat(categoryStats[cat].percentage));
    const colors = categories.map(cat => CATEGORY_COLORS[cat] || '#95a5a6');
    
    // Destroy existing charts if they exist
    if (pieChart) pieChart.destroy();
    if (barChart) barChart.destroy();
    
    // Render Pie Chart - Percentage Distribution
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: categories.map(cat => `${cat} (${categoryStats[cat].percentage}%)`),
            datasets: [{
                label: 'Percentage Distribution',
                data: percentages,
                backgroundColor: colors,
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            return `${label}: ${context.parsed}%`;
                        }
                    }
                }
            }
        }
    });
    
    // Render Bar Chart - Issue Count per Category
    const barCtx = document.getElementById('barChart').getContext('2d');
    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Number of Issues',
                data: counts,
                backgroundColor: colors,
                borderColor: colors.map(color => color),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 12
                        }
                    },
                    title: {
                        display: true,
                        text: 'Number of Issues',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12
                        }
                    },
                    title: {
                        display: true,
                        text: 'Category',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Issues: ${context.parsed.y}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Display issues in the table
 * @param {Array} issues - Array of issue objects
 */
function displayIssuesTable(issues) {
    // Clear existing table content
    issuesTableBody.innerHTML = '';
    
    // Check if there are no issues
    if (!issues || issues.length === 0) {
        issuesTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #6c757d;">
                    No issues available
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort issues by vote count (descending)
    const sortedIssues = [...issues].sort((a, b) => (b.voteCount || b.votes || 0) - (a.voteCount || a.votes || 0));
    
    // Populate table with issues
    sortedIssues.forEach(issue => {
        const row = document.createElement('tr');
        const voteCount = issue.voteCount !== undefined ? issue.voteCount : (issue.votes || 0);
        
        row.innerHTML = `
    <td>${issue.id}</td>
    <td><strong>${escapeHtml(issue.title)}</strong></td>
    <td><span class="badge badge-${issue.category.toLowerCase()}">${issue.category}</span></td>
    <td><strong><span class="vote-count" id="vote-${issue.id}">👍 ${voteCount}</span></strong></td>
    <td>${escapeHtml(issue.description)}</td>

    <td>
        ${issue.imageUrl ? `
            <img src="http://localhost:9191${issue.imageUrl}"
                 width="120"
                 style="display:block;margin-bottom:6px;border-radius:6px;border:1px solid #ccc;" />
        ` : ''}

        ${issue.videoUrl ? `
            <video width="180" controls style="border-radius:6px;border:1px solid #ccc;">
                <source src="http://localhost:9191${issue.videoUrl}" type="video/mp4">
                Your browser does not support video.
            </video>
        ` : ''}
    </td>
`;
        
        issuesTableBody.appendChild(row);
    });
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
