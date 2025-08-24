import React, { useState } from 'react';

interface GitHubSetupProps {
  onConfigured: (token: string, owner: string, repo: string) => void;
}

const GitHubSetup: React.FC<GitHubSetupProps> = ({ onConfigured }) => {
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Test the credentials by making a simple API call
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error('Invalid credentials or repository not found');
      }

      onConfigured(token, owner, repo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Configuration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <h1>🗂️ Peek Setup</h1>
        <p>Configure your private GitHub repository to store box data securely.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="owner">GitHub Username</label>
            <input
              type="text"
              id="owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="your-username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="repo">Repository Name</label>
            <input
              type="text"
              id="repo"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="peek-boxes"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="token">Personal Access Token</label>
            <input
              type="password"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              required
            />
            <small>
              Create a token at{' '}
              <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
                GitHub Settings → Developer settings → Personal access tokens
              </a>
              <br />
              Needs "Contents" permission for the repository.
            </small>
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Configuring...' : 'Configure'}
          </button>
        </form>

        <div className="setup-info">
          <h3>Setup Instructions:</h3>
          <ol>
            <li>Create a private GitHub repository (e.g., "peek-boxes")</li>
            <li>Go to GitHub Settings → Developer settings → Personal access tokens</li>
            <li>Generate a new token with "Contents" permission</li>
            <li>Enter your details above</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default GitHubSetup;