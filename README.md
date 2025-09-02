# Bridge Tournament Website

A live, synchronized bridge tournament management system using GitHub as a database.

## Features

- **Read-Only Website**: Clean, live display for all viewers
- **Separate Admin Panel**: Full control from your local system
- **Real-time Synchronization**: All users see the same live data
- **Round Robin Tournament**: Pre-configured 6-team tournament schedule
- **Live Updates**: Data automatically refreshes every 10 seconds
- **Mobile Responsive**: Works on all devices

## How to Use

### For Viewers (Tournament Participants)
Visit the website at: `https://satvikbajpai.github.io/bridge_tournament/`

The website automatically displays:
- Team information and player names
- Live match schedule and scores
- Current standings
- Tournament rules

**No editing capabilities** - everything is controlled from the admin panel.

### For Tournament Organizers (Admin)
1. **Download the repository** to your local computer
2. **Open `admin-panel.html`** in your web browser
3. **Enter your GitHub Personal Access Token** to connect
4. **Control everything** from the admin panel:
   - Edit all player names
   - Update match scores
   - Reset matches if needed
   - View live standings

## GitHub Personal Access Token Setup

To use the admin panel, you need a GitHub Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with `repo` scope
3. Copy the token and use it in the admin panel

### Required Token Permissions:
- `repo` (Full control of private repositories)

## System Architecture

### Public Website (`index.html`)
- **Read-only display** for all users
- **No input fields** or editing capabilities
- **Auto-refreshes** every 10 seconds
- **Mobile responsive** design

### Admin Control Panel (`admin-panel.html`)
- **Complete tournament management**
- **Secure token-based authentication**
- **Real-time data synchronization**
- **Bulk operations** (save all teams, reset all matches)

### Database
- **GitHub repository** as database via GitHub API
- **Data stored** in `data/tournament-data.json`
- **Automatic version control** and backup
- **Live synchronization** between admin and viewers

## Tournament Format

- **6 Teams** (12 players total)
- **Round Robin Format**: Each team plays every other team once
- **15 Total Matches** across 5 rounds
- **Scoring**: Win = 2 points, Tie = 1 point, Loss = 0 points

## Files

### Public Website
- `index.html` - Read-only tournament display
- `styles.css` - Website styling and responsive design
- `script-readonly.js` - View-only functionality with live updates

### Admin Panel
- `admin-panel.html` - Complete tournament management interface
- `admin-styles.css` - Admin panel styling
- `admin-panel.js` - Full admin functionality

### Shared
- `database.js` - GitHub API integration
- `data/tournament-data.json` - Tournament data storage

### Legacy Files (for reference)
- `script-github.js` - Previous version with editing capabilities
- `script.js` - Original local-only version

## Deployment

The public website is automatically deployed via GitHub Pages at:
`https://satvikbajpai.github.io/bridge_tournament/`

Any changes you make through the admin panel instantly update the live website for all viewers.

## Local Setup for Admins

1. Clone or download the repository
2. Open `admin-panel.html` in any modern web browser
3. Enter your GitHub token to connect
4. Start managing the tournament!

The admin panel works entirely in the browser - no server setup required.