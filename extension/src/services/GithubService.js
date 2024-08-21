import { ENV } from "../config/constants";
import jQuery from "../utils/initJquery";

const BASE_URL = ENV.GITHUB_API_URL;

export const GithubService = (apiKey) => {
  const headers = {
    "X-GitHub-Api-Version": "2022-11-28",
    Authorization: `Bearer ${apiKey}`,
  };

  return {
    getGist() {
      return $.ajax({
        url: `${BASE_URL}/gists/${ENV.GIST_ID}`,
      });
    },
  };
};
