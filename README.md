# Bridge Tournament Website

A live, synchronized bridge tournament management system using GitHub as a database.

## Features

- **Real-time Synchronization**: All users see the same live data
- **Admin Control**: Secure admin system for managing tournament data
- **Round Robin Tournament**: Pre-configured 6-team tournament schedule
- **Live Updates**: Data automatically refreshes every 10 seconds
- **Mobile Responsive**: Works on all devices

## How to Use

### For Viewers (Everyone)
1. Visit the website at: `https://satvikbajpai.github.io/bridge_tournament/`
2. View live tournament data including:
   - Team information and player names
   - Match schedule and scores
   - Current standings
   - Tournament rules

### For Admins (Tournament Organizers)
1. Click "Admin Login" in the top-right corner
2. Enter your GitHub Personal Access Token
3. Now you can:
   - Edit player names
   - Update match scores
   - All changes sync live to all viewers

## GitHub Personal Access Token Setup

To get admin access, you need a GitHub Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with `repo` scope
3. Use this token to login as admin on the website

### Required Token Permissions:
- `repo` (Full control of private repositories)

## Technical Details

- **Database**: Uses GitHub repository as database via GitHub API
- **Storage**: Tournament data stored in `data/tournament-data.json`
- **Sync**: 10-second polling for live updates
- **Fallback**: Local storage backup if GitHub API fails
- **Security**: Read access for everyone, write access only for authenticated admins

## Tournament Format

- **6 Teams** (12 players total)
- **Round Robin Format**: Each team plays every other team once
- **15 Total Matches** across 5 rounds
- **Scoring**: Win = 2 points, Tie = 1 point, Loss = 0 points

## Files

- `index.html` - Main website page
- `styles.css` - Styling and responsive design
- `database.js` - GitHub API integration
- `script-github.js` - Main application logic with GitHub sync
- `data/tournament-data.json` - Tournament data storage
- `script.js` - Original local-only version (backup)

## Development

To run locally:
1. Clone the repository
2. Open `index.html` in a web browser
3. For admin features, you'll need a GitHub token

## Deployment

The website is automatically deployed via GitHub Pages at:
`https://satvikbajpai.github.io/bridge_tournament/`

Any changes pushed to the `main` branch will automatically update the live website.