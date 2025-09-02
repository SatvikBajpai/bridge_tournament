// Admin Panel JavaScript
let database;
let tournamentData = {
    teams: [
        { id: 1, name: 'Team Aces', players: ['', ''], wins: 0, losses: 0, points: 0 },
        { id: 2, name: 'Team Spades', players: ['', ''], wins: 0, losses: 0, points: 0 },
        { id: 3, name: 'Team Hearts', players: ['', ''], wins: 0, losses: 0, points: 0 },
        { id: 4, name: 'Team Diamonds', players: ['', ''], wins: 0, losses: 0, points: 0 },
        { id: 5, name: 'Team Clubs', players: ['', ''], wins: 0, losses: 0, points: 0 },
        { id: 6, name: 'Team Jokers', players: ['', ''], wins: 0, losses: 0, points: 0 }
    ],
    matches: []
};

// Match schedule for round-robin tournament
const MATCH_SCHEDULE = [
    {
        round: 1,
        matches: [
            { team1: 'Team Aces', team2: 'Team Spades' },
            { team1: 'Team Hearts', team2: 'Team Diamonds' },
            { team1: 'Team Clubs', team2: 'Team Jokers' }
        ]
    },
    {
        round: 2,
        matches: [
            { team1: 'Team Aces', team2: 'Team Hearts' },
            { team1: 'Team Spades', team2: 'Team Clubs' },
            { team1: 'Team Diamonds', team2: 'Team Jokers' }
        ]
    },
    {
        round: 3,
        matches: [
            { team1: 'Team Aces', team2: 'Team Diamonds' },
            { team1: 'Team Hearts', team2: 'Team Clubs' },
            { team1: 'Team Spades', team2: 'Team Jokers' }
        ]
    },
    {
        round: 4,
        matches: [
            { team1: 'Team Aces', team2: 'Team Clubs' },
            { team1: 'Team Spades', team2: 'Team Diamonds' },
            { team1: 'Team Hearts', team2: 'Team Jokers' }
        ]
    },
    {
        round: 5,
        matches: [
            { team1: 'Team Aces', team2: 'Team Jokers' },
            { team1: 'Team Spades', team2: 'Team Hearts' },
            { team1: 'Team Diamonds', team2: 'Team Clubs' }
        ]
    }
];

// Initialize the admin panel
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeAuth();
    initializeTeamInputs();
    generateMatchesUI();
    updateStandings();
});

// Initialize tab functionality
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all buttons and panels
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            btn.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });
}

// Initialize authentication
function initializeAuth() {
    const tokenInput = document.getElementById('github-token');
    const connectBtn = document.getElementById('connect-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');
    const statusIndicator = document.getElementById('connection-status');

    // Try to load saved token
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
        tokenInput.value = savedToken;
        connectToGitHub(savedToken);
    }

    connectBtn.addEventListener('click', () => {
        const token = tokenInput.value.trim();
        if (token) {
            connectToGitHub(token);
        } else {
            showNotification('Please enter a GitHub token', 'error');
        }
    });

    disconnectBtn.addEventListener('click', () => {
        disconnect();
    });
}

// Connect to GitHub
async function connectToGitHub(token) {
    try {
        showLoadingScreen(true, 'Connecting to GitHub...');
        
        database = new GitHubDatabase('SatvikBajpai', 'bridge_tournament', token);
        
        // Test the connection by trying to fetch data
        const data = await database.fetchData();
        tournamentData = data;
        
        // Update UI
        updateConnectionStatus(true);
        localStorage.setItem('adminToken', token);
        
        // Load data into admin panel
        loadDataIntoUI();
        
        showNotification('Successfully connected to GitHub!', 'success');
        document.getElementById('admin-content').style.display = 'block';
        
    } catch (error) {
        console.error('Connection failed:', error);
        showNotification('Failed to connect to GitHub. Check your token and try again.', 'error');
        updateConnectionStatus(false);
    } finally {
        showLoadingScreen(false);
    }
}

// Disconnect from GitHub
function disconnect() {
    database = null;
    updateConnectionStatus(false);
    localStorage.removeItem('adminToken');
    document.getElementById('github-token').value = '';
    document.getElementById('admin-content').style.display = 'none';
    showNotification('Disconnected from GitHub', 'info');
}

// Update connection status UI
function updateConnectionStatus(connected) {
    const connectBtn = document.getElementById('connect-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');
    const statusIndicator = document.getElementById('connection-status');

    if (connected) {
        connectBtn.style.display = 'none';
        disconnectBtn.style.display = 'inline-block';
        statusIndicator.textContent = 'Connected';
        statusIndicator.classList.add('connected');
    } else {
        connectBtn.style.display = 'inline-block';
        disconnectBtn.style.display = 'none';
        statusIndicator.textContent = 'Disconnected';
        statusIndicator.classList.remove('connected');
    }
}

// Load data into UI
function loadDataIntoUI() {
    loadTeamData();
    loadMatchData();
    updateStandings();
}

// Initialize team inputs
function initializeTeamInputs() {
    const saveButtons = document.querySelectorAll('.save-team-btn');
    const saveAllBtn = document.getElementById('save-all-teams');

    saveButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const teamCard = e.target.closest('.team-admin-card');
            const teamId = parseInt(teamCard.getAttribute('data-team'));
            await saveTeam(teamId, btn);
        });
    });

    saveAllBtn.addEventListener('click', async () => {
        await saveAllTeams();
    });
}

// Load team data into inputs
function loadTeamData() {
    tournamentData.teams.forEach(team => {
        const teamCard = document.querySelector(`[data-team="${team.id}"]`);
        if (teamCard) {
            const inputs = teamCard.querySelectorAll('.player-input');
            inputs[0].value = team.players[0] || '';
            inputs[1].value = team.players[1] || '';
        }
    });
}

// Save single team
async function saveTeam(teamId, button) {
    try {
        button.disabled = true;
        button.textContent = 'Saving...';

        const teamCard = document.querySelector(`[data-team="${teamId}"]`);
        const inputs = teamCard.querySelectorAll('.player-input');
        
        const team = tournamentData.teams.find(t => t.id === teamId);
        team.players[0] = inputs[0].value.trim();
        team.players[1] = inputs[1].value.trim();

        await database.saveData(tournamentData);
        
        button.textContent = 'Saved!';
        button.style.background = '#28a745';
        
        setTimeout(() => {
            button.textContent = 'Save Team';
            button.style.background = '#2a5298';
            button.disabled = false;
        }, 2000);

        showNotification(`${team.name} saved successfully!`, 'success');
        
    } catch (error) {
        console.error('Failed to save team:', error);
        showNotification('Failed to save team data', 'error');
        
        button.textContent = 'Error';
        button.style.background = '#dc3545';
        
        setTimeout(() => {
            button.textContent = 'Save Team';
            button.style.background = '#2a5298';
            button.disabled = false;
        }, 2000);
    }
}

// Save all teams
async function saveAllTeams() {
    try {
        const saveAllBtn = document.getElementById('save-all-teams');
        saveAllBtn.disabled = true;
        saveAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving All Teams...';

        // Update all team data
        tournamentData.teams.forEach(team => {
            const teamCard = document.querySelector(`[data-team="${team.id}"]`);
            const inputs = teamCard.querySelectorAll('.player-input');
            team.players[0] = inputs[0].value.trim();
            team.players[1] = inputs[1].value.trim();
        });

        await database.saveData(tournamentData);
        
        saveAllBtn.innerHTML = '<i class="fas fa-check"></i> All Teams Saved!';
        saveAllBtn.style.background = '#28a745';
        
        setTimeout(() => {
            saveAllBtn.innerHTML = '<i class="fas fa-save"></i> Save All Teams';
            saveAllBtn.style.background = '#2a5298';
            saveAllBtn.disabled = false;
        }, 3000);

        showNotification('All teams saved successfully!', 'success');
        
    } catch (error) {
        console.error('Failed to save all teams:', error);
        showNotification('Failed to save team data', 'error');
        
        const saveAllBtn = document.getElementById('save-all-teams');
        saveAllBtn.innerHTML = '<i class="fas fa-times"></i> Error Saving';
        saveAllBtn.style.background = '#dc3545';
        
        setTimeout(() => {
            saveAllBtn.innerHTML = '<i class="fas fa-save"></i> Save All Teams';
            saveAllBtn.style.background = '#2a5298';
            saveAllBtn.disabled = false;
        }, 3000);
    }
}

// Generate matches UI
function generateMatchesUI() {
    const container = document.getElementById('matches-container');
    
    MATCH_SCHEDULE.forEach(roundData => {
        const roundSection = document.createElement('div');
        roundSection.className = 'round-section';
        
        roundSection.innerHTML = `
            <h3 class="round-title">Round ${roundData.round}</h3>
            ${roundData.matches.map((match, index) => `
                <div class="match-admin-card" data-round="${roundData.round}" data-match="${index}">
                    <div class="match-teams">
                        <span class="team1">${match.team1}</span>
                        <span class="vs-text">vs</span>
                        <span class="team2">${match.team2}</span>
                    </div>
                    <div class="match-score-inputs">
                        <input type="number" min="0" class="score-input team1-score" placeholder="0">
                        <span class="score-separator">:</span>
                        <input type="number" min="0" class="score-input team2-score" placeholder="0">
                        <button class="update-match-btn">Update</button>
                    </div>
                </div>
            `).join('')}
        `;
        
        container.appendChild(roundSection);
    });
    
    // Add event listeners to match update buttons
    const updateButtons = container.querySelectorAll('.update-match-btn');
    updateButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const matchCard = e.target.closest('.match-admin-card');
            await updateMatchScore(matchCard, btn);
        });
    });
    
    // Add event listeners for bulk actions
    document.getElementById('save-all-matches').addEventListener('click', saveAllMatches);
    document.getElementById('reset-all-matches').addEventListener('click', resetAllMatches);
}

// Load match data into inputs
function loadMatchData() {
    tournamentData.matches.forEach(match => {
        const matchCards = document.querySelectorAll('.match-admin-card');
        
        matchCards.forEach(card => {
            const team1Name = card.querySelector('.team1').textContent;
            const team2Name = card.querySelector('.team2').textContent;
            
            if ((team1Name === match.team1 && team2Name === match.team2) ||
                (team1Name === match.team2 && team2Name === match.team1)) {
                
                const team1Input = card.querySelector('.team1-score');
                const team2Input = card.querySelector('.team2-score');
                
                if (team1Name === match.team1) {
                    team1Input.value = match.score1;
                    team2Input.value = match.score2;
                } else {
                    team1Input.value = match.score2;
                    team2Input.value = match.score1;
                }
            }
        });
    });
}

// Update match score
async function updateMatchScore(matchCard, button) {
    try {
        button.disabled = true;
        button.textContent = 'Updating...';

        const team1Name = matchCard.querySelector('.team1').textContent;
        const team2Name = matchCard.querySelector('.team2').textContent;
        const score1 = parseInt(matchCard.querySelector('.team1-score').value) || 0;
        const score2 = parseInt(matchCard.querySelector('.team2-score').value) || 0;

        if (matchCard.querySelector('.team1-score').value === '' || 
            matchCard.querySelector('.team2-score').value === '') {
            showNotification('Please enter scores for both teams', 'warning');
            button.disabled = false;
            button.textContent = 'Update';
            return;
        }

        // Update match result in tournament data
        updateMatchResult(team1Name, team2Name, score1, score2);
        
        // Save to GitHub
        await database.saveData(tournamentData);
        
        button.textContent = 'Updated!';
        button.style.background = '#28a745';
        
        setTimeout(() => {
            button.textContent = 'Update';
            button.style.background = '#28a745';
            button.disabled = false;
        }, 2000);

        // Update standings
        updateStandings();
        
        showNotification(`Match result updated: ${team1Name} ${score1} - ${score2} ${team2Name}`, 'success');
        
    } catch (error) {
        console.error('Failed to update match:', error);
        showNotification('Failed to update match result', 'error');
        
        button.textContent = 'Error';
        button.style.background = '#dc3545';
        
        setTimeout(() => {
            button.textContent = 'Update';
            button.style.background = '#28a745';
            button.disabled = false;
        }, 2000);
    }
}

// Update match result and team statistics
function updateMatchResult(team1Name, team2Name, score1, score2) {
    const team1 = tournamentData.teams.find(t => t.name === team1Name);
    const team2 = tournamentData.teams.find(t => t.name === team2Name);
    
    if (!team1 || !team2) return;
    
    // Check if match already exists
    const existingMatch = tournamentData.matches.find(m => 
        (m.team1 === team1Name && m.team2 === team2Name) ||
        (m.team1 === team2Name && m.team2 === team1Name)
    );
    
    // Remove previous result if exists
    if (existingMatch) {
        // Subtract previous points
        if (existingMatch.score1 > existingMatch.score2) {
            const winner = tournamentData.teams.find(t => t.name === existingMatch.team1);
            const loser = tournamentData.teams.find(t => t.name === existingMatch.team2);
            winner.wins--;
            winner.points -= 2;
            loser.losses--;
        } else if (existingMatch.score2 > existingMatch.score1) {
            const winner = tournamentData.teams.find(t => t.name === existingMatch.team2);
            const loser = tournamentData.teams.find(t => t.name === existingMatch.team1);
            winner.wins--;
            winner.points -= 2;
            loser.losses--;
        } else {
            // It was a tie
            team1.points--;
            team2.points--;
        }
        
        // Remove the match
        const matchIndex = tournamentData.matches.indexOf(existingMatch);
        tournamentData.matches.splice(matchIndex, 1);
    }
    
    // Add new result
    const matchResult = {
        team1: team1Name,
        team2: team2Name,
        score1: score1,
        score2: score2
    };
    
    tournamentData.matches.push(matchResult);
    
    // Update team statistics
    if (score1 > score2) {
        // Team 1 wins
        team1.wins++;
        team1.points += 2;
        team2.losses++;
    } else if (score2 > score1) {
        // Team 2 wins
        team2.wins++;
        team2.points += 2;
        team1.losses++;
    } else {
        // Tie
        team1.points += 1;
        team2.points += 1;
    }
}

// Save all matches
async function saveAllMatches() {
    try {
        const saveAllBtn = document.getElementById('save-all-matches');
        saveAllBtn.disabled = true;
        saveAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving All Matches...';

        // Process all match cards
        const matchCards = document.querySelectorAll('.match-admin-card');
        
        matchCards.forEach(card => {
            const team1Name = card.querySelector('.team1').textContent;
            const team2Name = card.querySelector('.team2').textContent;
            const score1Input = card.querySelector('.team1-score');
            const score2Input = card.querySelector('.team2-score');
            
            if (score1Input.value !== '' && score2Input.value !== '') {
                const score1 = parseInt(score1Input.value) || 0;
                const score2 = parseInt(score2Input.value) || 0;
                updateMatchResult(team1Name, team2Name, score1, score2);
            }
        });

        await database.saveData(tournamentData);
        updateStandings();
        
        saveAllBtn.innerHTML = '<i class="fas fa-check"></i> All Matches Saved!';
        saveAllBtn.style.background = '#28a745';
        
        setTimeout(() => {
            saveAllBtn.innerHTML = '<i class="fas fa-save"></i> Save All Match Results';
            saveAllBtn.style.background = '#2a5298';
            saveAllBtn.disabled = false;
        }, 3000);

        showNotification('All match results saved successfully!', 'success');
        
    } catch (error) {
        console.error('Failed to save all matches:', error);
        showNotification('Failed to save match results', 'error');
    }
}

// Reset all matches
async function resetAllMatches() {
    if (!confirm('Are you sure you want to reset ALL match results? This cannot be undone.')) {
        return;
    }
    
    try {
        const resetBtn = document.getElementById('reset-all-matches');
        resetBtn.disabled = true;
        resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';

        // Reset all team statistics
        tournamentData.teams.forEach(team => {
            team.wins = 0;
            team.losses = 0;
            team.points = 0;
        });
        
        // Clear all matches
        tournamentData.matches = [];
        
        // Clear all score inputs
        const scoreInputs = document.querySelectorAll('.score-input');
        scoreInputs.forEach(input => input.value = '');

        await database.saveData(tournamentData);
        updateStandings();
        
        resetBtn.innerHTML = '<i class="fas fa-check"></i> Reset Complete!';
        resetBtn.style.background = '#28a745';
        
        setTimeout(() => {
            resetBtn.innerHTML = '<i class="fas fa-undo"></i> Reset All Matches';
            resetBtn.style.background = '#dc3545';
            resetBtn.disabled = false;
        }, 3000);

        showNotification('All match results have been reset', 'info');
        
    } catch (error) {
        console.error('Failed to reset matches:', error);
        showNotification('Failed to reset match results', 'error');
    }
}

// Update standings display
function updateStandings() {
    // Sort teams by points (descending), then by wins (descending)
    const sortedTeams = [...tournamentData.teams].sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        return b.wins - a.wins;
    });
    
    const standingsBody = document.getElementById('standings-body');
    standingsBody.innerHTML = '';
    
    sortedTeams.forEach((team, index) => {
        const row = document.createElement('tr');
        if (index === 0) row.className = 'rank-1';
        else if (index === 1) row.className = 'rank-2';
        else if (index === 2) row.className = 'rank-3';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${team.name}</td>
            <td>${team.wins}</td>
            <td>${team.losses}</td>
            <td><strong>${team.points}</strong></td>
        `;
        
        standingsBody.appendChild(row);
    });
    
    // Refresh standings button
    document.getElementById('refresh-standings').addEventListener('click', () => {
        updateStandings();
        showNotification('Standings refreshed', 'info');
    });
}

// Utility functions
function showLoadingScreen(show, message = 'Loading...') {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = loadingScreen.querySelector('p');
    
    if (show) {
        loadingText.textContent = message;
        loadingScreen.style.display = 'flex';
    } else {
        loadingScreen.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    const notificationArea = document.getElementById('notification-area');
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add click to dismiss
    notification.addEventListener('click', () => notification.remove());
    
    notificationArea.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}