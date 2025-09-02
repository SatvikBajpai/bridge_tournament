// GitHub-based database system for Bridge Tournament
class GitHubDatabase {
    constructor(owner, repo, token = null) {
        this.owner = owner;
        this.repo = repo;
        this.token = token;
        this.apiBase = 'https://api.github.com';
        this.dataFile = 'data/tournament-data.json';
        this.cacheDuration = 5000; // 5 seconds cache
        this.lastFetch = 0;
        this.cachedData = null;
        this.isAdmin = !!token;
    }

    async fetchData() {
        // Use cache if available and recent
        if (this.cachedData && (Date.now() - this.lastFetch) < this.cacheDuration) {
            return this.cachedData;
        }

        try {
            const response = await fetch(
                `${this.apiBase}/repos/${this.owner}/${this.repo}/contents/${this.dataFile}`,
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        ...(this.token && { 'Authorization': `token ${this.token}` })
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const fileData = await response.json();
            const content = atob(fileData.content);
            const data = JSON.parse(content);
            
            this.cachedData = data;
            this.lastFetch = Date.now();
            
            return data;
        } catch (error) {
            console.error('Error fetching data from GitHub:', error);
            // Fallback to local storage if GitHub fails
            const localData = localStorage.getItem('bridgeTournamentData');
            if (localData) {
                return JSON.parse(localData);
            }
            throw error;
        }
    }

    async saveData(data) {
        if (!this.isAdmin || !this.token) {
            throw new Error('Admin authentication required to save data');
        }

        try {
            // First, get the current file to obtain the SHA
            const currentFile = await fetch(
                `${this.apiBase}/repos/${this.owner}/${this.repo}/contents/${this.dataFile}`,
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': `token ${this.token}`
                    }
                }
            );

            const currentFileData = await currentFile.json();
            
            // Prepare the new content
            data.lastUpdated = new Date().toISOString();
            const content = btoa(JSON.stringify(data, null, 2));

            // Update the file
            const response = await fetch(
                `${this.apiBase}/repos/${this.owner}/${this.repo}/contents/${this.dataFile}`,
                {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': `token ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Update tournament data - ${new Date().toLocaleString()}`,
                        content: content,
                        sha: currentFileData.sha
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to save data: ${response.status}`);
            }

            // Clear cache to force refresh
            this.cachedData = null;
            this.lastFetch = 0;

            return true;
        } catch (error) {
            console.error('Error saving data to GitHub:', error);
            // Fallback to local storage
            localStorage.setItem('bridgeTournamentData', JSON.stringify(data));
            throw error;
        }
    }

    // Poll for updates every 10 seconds
    startPolling(callback) {
        setInterval(async () => {
            try {
                const data = await this.fetchData();
                callback(data);
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 10000); // Poll every 10 seconds
    }
}

// Admin authentication
class AdminAuth {
    constructor() {
        this.isAuthenticated = false;
        this.token = null;
    }

    authenticate() {
        const token = prompt('Enter GitHub Personal Access Token (for admin access):');
        if (token) {
            this.token = token;
            this.isAuthenticated = true;
            localStorage.setItem('adminToken', token);
            return token;
        }
        return null;
    }

    loadSavedToken() {
        const savedToken = localStorage.getItem('adminToken');
        if (savedToken) {
            this.token = savedToken;
            this.isAuthenticated = true;
            return savedToken;
        }
        return null;
    }

    logout() {
        this.isAuthenticated = false;
        this.token = null;
        localStorage.removeItem('adminToken');
    }
}

// Export for use in main script
window.GitHubDatabase = GitHubDatabase;
window.AdminAuth = AdminAuth;