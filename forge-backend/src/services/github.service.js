// forge-backend/src/services/github.service.js
import { ApiError } from '../utils/ApiError.js';

/**
 * Search GitHub for repositories related to the project
 * Returns top 5 repos with key info
 */
export async function searchGitHubRepos(projectDescription) {
  if (!projectDescription || projectDescription.trim().length === 0) {
    return [];
  }

  try {
    // Extract key terms from description (first 100 chars usually has the essence)
    const searchTerm = projectDescription.substring(0, 100).split(' ').filter(word => word.length > 3).slice(0, 3).join('+');
    
    if (!searchTerm) {
      return [];
    }

    // Call GitHub API to search repositories
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(searchTerm)}&sort=stars&order=desc&per_page=5`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Forge-AI', // GitHub requires User-Agent
        },
      }
    );

    if (!response.ok) {
      console.warn(`[GitHubService] API error: ${response.status}`, await response.text());
      return [];
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    // Extract relevant info from repos
    const repos = data.items.map(repo => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description || 'No description',
      stars: repo.stargazers_count,
      language: repo.language || 'Unknown',
      topics: repo.topics || [],
    }));

    console.log(`✅ Found ${repos.length} GitHub repos for: "${searchTerm}"`);
    return repos;
  } catch (err) {
    console.error('[GitHubService] Error searching GitHub:', err.message);
    // Don't throw — GitHub search is optional enhancement
    return [];
  }
}

/**
 * Search GitHub for repos related to specific technologies
 * Useful for finding libraries and frameworks
 */
export async function searchGitHubByTech(technologies) {
  if (!Array.isArray(technologies) || technologies.length === 0) {
    return {};
  }

  const results = {};

  for (const tech of technologies.slice(0, 3)) {
    // Limit to 3 techs to avoid too many API calls
    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=language:${encodeURIComponent(tech)}&sort=stars&order=desc&per_page=3`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Forge-AI',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          results[tech] = data.items.map(repo => ({
            name: repo.name,
            url: repo.html_url,
            stars: repo.stargazers_count,
          }));
        }
      }
    } catch (err) {
      console.warn(`[GitHubService] Failed to search ${tech}:`, err.message);
    }
  }

  return results;
}
