// Read-only Tournament Display JavaScript
let tournamentData = {
    teams: [
        { id: 1, name: 'Team Aces', players: ['Player 1', 'Player 2'], wins: 0, losses: 0, points: 0 },
        { id: 2, name: 'Team Spades', players: ['Player 1', 'Player 2'], wins: 0, losses: 0, points: 0 },
        { id: 3, name: 'Team Hearts', players: ['Player 1', 'Player 2'], wins: 0, losses: 0, points: 0 },
        { id: 4, name: 'Team Diamonds', players: ['Player 1', 'Player 2'], wins: 0, losses: 0, points: 0 },
        { id: 5, name: 'Team Clubs', players: ['Player 1', 'Player 2'], wins: 0, losses: 0, points: 0 },
        { id: 6, name: 'Team Jokers', players: ['Player 1', 'Player 2'], wins: 0, losses: 0, points: 0 }
    ],
    matches: []
};

let database;
let lastUpdateTime = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeDatabase();
    initializeTabs();
    loadTournamentData();
    addAnimations();
});

// Initialize GitHub database (read-only)
function initializeDatabase() {
    database = new GitHubDatabase('SatvikBajpai', 'bridge_tournament');
    
    // Start polling for updates every 10 seconds
    setInterval(async () => {
        try {
            await loadTournamentData(true);
        } catch (error) {
            console.error('Failed to poll for updates:', error);
        }
    }, 10000);
}

// Load tournament data from GitHub
async function loadTournamentData(silent = false) {
    try {
        if (!silent) {
            showLoadingIndicator(true);
        }
        
        const data = await database.fetchData();
        
        // Check if data has been updated
        if (data.lastUpdated && data.lastUpdated !== lastUpdateTime) {
            tournamentData = data;
            lastUpdateTime = data.lastUpdated;
            // Save to localStorage for future fallback
            localStorage.setItem('bridgeTournamentData', JSON.stringify(data));
            updateAllDisplays();
            
            if (silent && lastUpdateTime) {
                showUpdateNotification();
            }
        } else if (!lastUpdateTime) {
            // First load
            tournamentData = data;
            lastUpdateTime = data.lastUpdated;
            // Save to localStorage for future fallback
            localStorage.setItem('bridgeTournamentData', JSON.stringify(data));
            updateAllDisplays();
        }
        
    } catch (error) {
        console.error('Failed to load tournament data:', error);
        if (!silent) {
            // Don't show error message if we have cached data
            if (!tournamentData || !tournamentData.teams || tournamentData.teams.length === 0) {
                showErrorMessage('Loading tournament data...');
            }
        }
        // Still update displays with whatever data we have
        if (tournamentData && tournamentData.teams) {
            updateAllDisplays();
        }
    } finally {
        if (!silent) {
            showLoadingIndicator(false);
        }
    }
}

// Update all displays with current data
function updateAllDisplays() {
    updatePlayerNames();
    updateMatchScores();
    updateTeamStats();
    updateStandings();
}

// Update player names and team info
function updatePlayerNames() {
    tournamentData.teams.forEach(team => {
        const teamCard = document.querySelector(`[data-team="${team.id}"]`);
        if (teamCard) {
            // Update team name
            const teamNameElement = teamCard.querySelector('h3');
            if (teamNameElement) {
                teamNameElement.textContent = team.name;
            }
            
            // Update team logo/avatar
            const teamAvatar = teamCard.querySelector('.team-avatar');
            if (teamAvatar) {
                if (team.logo) {
                    // Team has a custom logo
                    teamAvatar.classList.add('has-logo');
                    teamAvatar.innerHTML = `<img src="${team.logo}" alt="${team.name} logo" onerror="this.parentElement.classList.remove('has-logo'); this.parentElement.innerHTML='';">`;
                } else {
                    // No logo, keep container empty
                    teamAvatar.classList.remove('has-logo');
                    teamAvatar.innerHTML = '';
                }
            }
            
            // Update player names
            const playerNames = teamCard.querySelectorAll('.player-name');
            playerNames[0].textContent = team.players[0] || 'Player 1';
            playerNames[1].textContent = team.players[1] || 'Player 2';
        }
    });
}

// Update match scores in the schedule
function updateMatchScores() {
    tournamentData.matches.forEach(match => {
        const matchElements = document.querySelectorAll('.match');
        matchElements.forEach(matchElement => {
            const teams = matchElement.querySelectorAll('.team');
            const team1Text = teams[0].textContent;
            const team2Text = teams[1].textContent;
            
            if ((team1Text === match.team1 && team2Text === match.team2) ||
                (team1Text === match.team2 && team2Text === match.team1)) {
                const scores = matchElement.querySelectorAll('.score');
                
                if (team1Text === match.team1) {
                    scores[0].textContent = match.score1;
                    scores[1].textContent = match.score2;
                } else {
                    scores[0].textContent = match.score2;
                    scores[1].textContent = match.score1;
                }
            }
        });
    });
}

// Update team statistics in team cards
function updateTeamStats() {
    tournamentData.teams.forEach(team => {
        const teamCard = document.querySelector(`[data-team="${team.id}"]`);
        if (teamCard) {
            const winsSpan = teamCard.querySelector('.wins');
            const pointsSpan = teamCard.querySelector('.points');
            
            winsSpan.textContent = `${team.wins} Wins`;
            pointsSpan.textContent = `${team.points} Points`;
        }
    });
}

// Update standings table
function updateStandings() {
    // Sort teams by points (descending), then by wins (descending)
    const sortedTeams = [...tournamentData.teams].sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        return b.wins - a.wins;
    });
    
    // Update standings display
    sortedTeams.forEach((team, index) => {
        const standingsRow = document.querySelector(`.standings-row[data-team="${team.id}"]`);
        if (standingsRow) {
            standingsRow.querySelector('.rank').textContent = index + 1;
            standingsRow.querySelector('.wins').textContent = team.wins;
            standingsRow.querySelector('.losses').textContent = team.losses;
            standingsRow.querySelector('.points').textContent = team.points;
            
            // Add special styling for top 3
            standingsRow.classList.remove('first-place', 'second-place', 'third-place');
            if (index === 0) {
                standingsRow.classList.add('first-place');
            } else if (index === 1) {
                standingsRow.classList.add('second-place');
            } else if (index === 2) {
                standingsRow.classList.add('third-place');
            }
        }
    });
}

// Tab functionality
function initializeTabs() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all buttons and tabs
            navBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked button and corresponding tab
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Add animations and interactions
function addAnimations() {
    // Add hover effects to team cards
    const teamCards = document.querySelectorAll('.team-card');
    teamCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add CSS animations and styles
    const style = document.createElement('style');
    style.textContent = `
        .first-place .rank {
            background: linear-gradient(135deg, #ffd700, #ffed4a);
            color: #333;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        
        .second-place .rank {
            background: linear-gradient(135deg, #c0c0c0, #e2e8f0);
            color: #333;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        
        .third-place .rank {
            background: linear-gradient(135deg, #cd7f32, #d69e2e);
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        
        .match-score {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 700;
            color: #2a5298;
            font-size: 1.2rem;
        }
        
        .score {
            background: #f8f9fa;
            padding: 0.3rem 0.8rem;
            border-radius: 5px;
            border: 2px solid #e9ecef;
            min-width: 30px;
            text-align: center;
        }
        
        .score-separator {
            color: #666;
        }
        
        .player-name {
            font-weight: 500;
            color: #333;
        }
        
        .loading-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(42, 82, 152, 0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 1000;
            display: none;
        }
        
        .loading-indicator.show {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .loading-indicator:before {
            content: "";
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .notification-area {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1001;
            max-width: 300px;
        }
        
        .notification {
            background: #333;
            color: white;
            padding: 10px 15px;
            margin-bottom: 5px;
            border-radius: 5px;
            font-size: 13px;
            animation: slideIn 0.3s ease;
        }
        
        .notification-success {
            background: #28a745;
        }
        
        .notification-error {
            background: #dc3545;
        }
        
        .notification-info {
            background: #17a2b8;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .update-pulse {
            animation: pulse 0.5s ease-in-out;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

// Utility functions
function showLoadingIndicator(show) {
    let indicator = document.getElementById('loading-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'loading-indicator';
        indicator.className = 'loading-indicator';
        indicator.innerHTML = '<span>Loading tournament data...</span>';
        document.body.appendChild(indicator);
    }
    
    if (show) {
        indicator.classList.add('show');
    } else {
        indicator.classList.remove('show');
    }
}

function showUpdateNotification() {
    showNotification('Tournament data updated!', 'info');
    
    // Add pulse effect to updated elements
    const teamCards = document.querySelectorAll('.team-card');
    const standingsRows = document.querySelectorAll('.standings-row');
    
    [...teamCards, ...standingsRows].forEach(element => {
        element.classList.add('update-pulse');
        setTimeout(() => {
            element.classList.remove('update-pulse');
        }, 500);
    });
}

function showErrorMessage(message) {
    showNotification(message, 'error');
}

function showNotification(message, type = 'info') {
    let notificationArea = document.getElementById('notification-area');
    
    if (!notificationArea) {
        notificationArea = document.createElement('div');
        notificationArea.id = 'notification-area';
        notificationArea.className = 'notification-area';
        document.body.appendChild(notificationArea);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notificationArea.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                document.querySelector('[data-tab="teams"]').click();
                break;
            case '2':
                e.preventDefault();
                document.querySelector('[data-tab="schedule"]').click();
                break;
            case '3':
                e.preventDefault();
                document.querySelector('[data-tab="standings"]').click();
                break;
            case '4':
                e.preventDefault();
                document.querySelector('[data-tab="rules"]').click();
                break;
            case 'r':
                e.preventDefault();
                loadTournamentData();
                break;
        }
    }
});

// Manual refresh functionality
document.addEventListener('keydown', function(e) {
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        loadTournamentData();
    }
});