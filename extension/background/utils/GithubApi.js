import { ENV } from "../../src/config/constants";
import { GITHUB_REPO_REGEX } from ".";

const BASE_URL = ENV.GITHUB_API_URL;

export const GithubApi = (apiKey = "") => {
  const headers = {
    "X-GitHub-Api-Version": "2022-11-28",
    Authorization: `Bearer ${apiKey}`,
  };

  return {
    getGithubRepo(url) {
      const matches = url.match(GITHUB_REPO_REGEX);
      const [origin, owner, repo, pullId] = matches;
      if (!owner || !repo || !pullId) return undefined;
      return { owner, repo, pullId };
    },
    async getPR(tabUrl) {
      const { owner, repo, pullId } = this.getGithubRepo(tabUrl);
      const repoUrl = `${BASE_URL}/repos/${owner}/${repo}`;
      const result = await fetch(`${repoUrl}/pulls/${pullId}`, {
        method: "GET",
        headers,
      });
      const data = await result.json();
      return data;
    },
    async getUrlData(url) {
      const result = await fetch(url, {
        method: "GET",
        headers,
      });
      const data = await result.json();
      return data;
    },
    async getGist() {
      const result = await fetch(`${BASE_URL}/gists/${ENV.GIST_ID}`);
      const data = await result.json();
      return data;
    },
  };
};
