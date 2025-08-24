export interface BoxData {
  [boxId: string]: string[];
}

export class GitHubStorage {
  private token: string;
  private owner: string;
  private repo: string;
  private fileName: string = 'boxes.json';

  constructor(token: string, owner: string, repo: string) {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
  }

  private async makeRequest(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getBoxData(): Promise<BoxData> {
    try {
      const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.fileName}`;
      const data = await this.makeRequest(url);
      
      // Decode base64 content
      const content = atob(data.content);
      return JSON.parse(content);
    } catch (error) {
      console.error('Error loading box data:', error);
      // If file doesn't exist, return empty object
      return {};
    }
  }

  async saveBoxData(boxData: BoxData): Promise<void> {
    try {
      const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.fileName}`;
      
      // Get current file SHA (required for updates)
      let sha: string | undefined;
      try {
        const currentFile = await this.makeRequest(url);
        sha = currentFile.sha;
      } catch (error) {
        // File doesn't exist yet, that's fine
      }

      // Encode content as base64
      const content = btoa(JSON.stringify(boxData, null, 2));

      const body = {
        message: `Update box data - ${new Date().toISOString()}`,
        content,
        ...(sha && { sha }),
      };

      await this.makeRequest(url, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error('Error saving box data:', error);
      throw error;
    }
  }

  async getBoxItems(boxId: string): Promise<string[]> {
    try {
      const boxData = await this.getBoxData();
      return boxData[boxId] || [];
    } catch (error) {
      console.error('Error getting box items:', error);
      return [];
    }
  }

  async addItemToBox(boxId: string, item: string): Promise<void> {
    try {
      const boxData = await this.getBoxData();
      if (!boxData[boxId]) {
        boxData[boxId] = [];
      }
      if (!boxData[boxId].includes(item)) {
        boxData[boxId].push(item);
        await this.saveBoxData(boxData);
      }
    } catch (error) {
      console.error('Error adding item to box:', error);
      throw error;
    }
  }

  async removeItemFromBox(boxId: string, item: string): Promise<void> {
    try {
      const boxData = await this.getBoxData();
      if (boxData[boxId]) {
        boxData[boxId] = boxData[boxId].filter(i => i !== item);
        await this.saveBoxData(boxData);
      }
    } catch (error) {
      console.error('Error removing item from box:', error);
      throw error;
    }
  }

  async getAllBoxes(): Promise<string[]> {
    try {
      const boxData = await this.getBoxData();
      return Object.keys(boxData);
    } catch (error) {
      console.error('Error getting all boxes:', error);
      return [];
    }
  }
}

// Singleton pattern for storage service
let storageService: GitHubStorage | null = null;

export const initializeStorage = (token: string, owner: string, repo: string) => {
  storageService = new GitHubStorage(token, owner, repo);
  
  // Save credentials to localStorage for convenience
  localStorage.setItem('github_token', token);
  localStorage.setItem('github_owner', owner);
  localStorage.setItem('github_repo', repo);
  
  return storageService;
};

export const getStorageService = (): GitHubStorage => {
  if (!storageService) {
    // Try to restore from localStorage
    const token = localStorage.getItem('github_token');
    const owner = localStorage.getItem('github_owner');
    const repo = localStorage.getItem('github_repo');
    
    if (token && owner && repo) {
      storageService = new GitHubStorage(token, owner, repo);
    } else {
      throw new Error('Storage service not initialized. Please configure GitHub credentials.');
    }
  }
  return storageService;
};

export const isStorageConfigured = (): boolean => {
  const token = localStorage.getItem('github_token');
  const owner = localStorage.getItem('github_owner');
  const repo = localStorage.getItem('github_repo');
  return !!(token && owner && repo);
};

export const clearStorageConfig = () => {
  localStorage.removeItem('github_token');
  localStorage.removeItem('github_owner');
  localStorage.removeItem('github_repo');
  storageService = null;
};