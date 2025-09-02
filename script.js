// Tournament data storage
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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeTeamInputs();
    initializeScoreInputs();
    loadFromLocalStorage();
    updateStandings();
});

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

// Team player input functionality
function initializeTeamInputs() {
    const playerInputs = document.querySelectorAll('.player-input');
    
    playerInputs.forEach((input, index) => {
        input.addEventListener('blur', function() {
            const teamCard = input.closest('.team-card');
            const teamId = parseInt(teamCard.getAttribute('data-team'));
            const playerIndex = Array.from(teamCard.querySelectorAll('.player-input')).indexOf(input);
            
            // Update tournament data
            tournamentData.teams[teamId - 1].players[playerIndex] = input.value;
            
            // Save to localStorage
            saveToLocalStorage();
        });
    });
}

// Score input functionality
function initializeScoreInputs() {
    const updateButtons = document.querySelectorAll('.update-score');
    
    updateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const match = button.closest('.match');
            const scoreInputs = match.querySelectorAll('.score-input');
            const teams = match.querySelectorAll('.team');
            
            const team1Name = teams[0].textContent;
            const team2Name = teams[1].textContent;
            const score1 = parseInt(scoreInputs[0].value) || 0;
            const score2 = parseInt(scoreInputs[1].value) || 0;
            
            if (scoreInputs[0].value === '' || scoreInputs[1].value === '') {
                alert('Please enter scores for both teams');
                return;
            }
            
            // Update match result
            updateMatchResult(team1Name, team2Name, score1, score2);
            
            // Visual feedback
            button.textContent = 'Updated!';
            button.style.background = '#28a745';
            
            setTimeout(() => {
                button.textContent = 'Update';
                button.style.background = '#2a5298';
            }, 2000);
            
            // Update standings
            updateStandings();
            
            // Save to localStorage
            saveToLocalStorage();
        });
    });
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
    
    // Update team cards
    updateTeamCards();
}

// Update team cards with current statistics
function updateTeamCards() {
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
    
    updateTeamCards();
}

// Save data to localStorage
function saveToLocalStorage() {
    localStorage.setItem('bridgeTournamentData', JSON.stringify(tournamentData));
}

// Load data from localStorage
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('bridgeTournamentData');
    if (savedData) {
        tournamentData = JSON.parse(savedData);
        
        // Update player inputs
        tournamentData.teams.forEach((team, teamIndex) => {
            const teamCard = document.querySelector(`[data-team="${team.id}"]`);
            if (teamCard) {
                const playerInputs = teamCard.querySelectorAll('.player-input');
                playerInputs[0].value = team.players[0] || '';
                playerInputs[1].value = team.players[1] || '';
            }
        });
        
        // Update match scores
        tournamentData.matches.forEach(match => {
            const matchElements = document.querySelectorAll('.match');
            matchElements.forEach(matchElement => {
                const teams = matchElement.querySelectorAll('.team');
                const team1Text = teams[0].textContent;
                const team2Text = teams[1].textContent;
                
                if ((team1Text === match.team1 && team2Text === match.team2) ||
                    (team1Text === match.team2 && team2Text === match.team1)) {
                    const scoreInputs = matchElement.querySelectorAll('.score-input');
                    if (team1Text === match.team1) {
                        scoreInputs[0].value = match.score1;
                        scoreInputs[1].value = match.score2;
                    } else {
                        scoreInputs[0].value = match.score2;
                        scoreInputs[1].value = match.score1;
                    }
                }
            });
        });
        
        updateStandings();
    }
}

// Add some fun animations and interactions
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Add click animation to update buttons
    const updateButtons = document.querySelectorAll('.update-score');
    updateButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            button.style.position = 'relative';
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
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
    `;
    document.head.appendChild(style);
});

// Add reset functionality (optional)
function resetTournament() {
    if (confirm('Are you sure you want to reset the entire tournament? This will clear all scores and player names.')) {
        localStorage.removeItem('bridgeTournamentData');
        location.reload();
    }
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
        }
    }
});