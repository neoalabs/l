import { sanitizeUrl } from "../utils";

/**
 * Search API configuration
 */
const config = {
  tavily: {
    apiKey: process.env.REACT_APP_TAVILY_API_KEY,
    endpoint: "https://api.tavily.com/search"
  },
  serper: {
    apiKey: process.env.REACT_APP_SERPER_API_KEY,
    endpoint: "https://google.serper.dev/search"
  }
};

/**
 * Search provider to use (tavily or serper)
 */
const searchProvider = process.env.REACT_APP_SEARCH_PROVIDER || "tavily";

/**
 * Performs a web search using the configured search provider
 * @param {string} query - Search query 
 * @param {number} maxResults - Maximum number of results to return
 * @param {string} searchDepth - Search depth (basic or advanced)
 * @param {string[]} includeDomains - Domains to include in search
 * @param {string[]} excludeDomains - Domains to exclude from search
 * @returns {Promise<SearchResults>} - Search results
 */
export async function search(
  query,
  maxResults = 10,
  searchDepth = "basic",
  includeDomains = [],
  excludeDomains = []
) {
  if (searchProvider === "tavily") {
    return tavilySearch(query, maxResults, searchDepth, includeDomains, excludeDomains);
  } else {
    return serperSearch(query);
  }
}

/**
 * Search with Tavily API
 * @param {string} query - Search query
 * @param {number} maxResults - Maximum number of results
 * @param {string} searchDepth - Search depth (basic or advanced)
 * @param {string[]} includeDomains - Domains to include
 * @param {string[]} excludeDomains - Domains to exclude
 * @returns {Promise<SearchResults>} - Search results
 */
async function tavilySearch(
  query,
  maxResults = 10,
  searchDepth = "basic",
  includeDomains = [],
  excludeDomains = []
) {
  const apiKey = config.tavily.apiKey;
  if (!apiKey) {
    throw new Error("REACT_APP_TAVILY_API_KEY is not set");
  }
  
  const includeImageDescriptions = true;
  const response = await fetch(config.tavily.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: Math.max(maxResults, 5),
      search_depth: searchDepth,
      include_images: true,
      include_image_descriptions: includeImageDescriptions,
      include_answers: true,
      include_domains: includeDomains,
      exclude_domains: excludeDomains
    })
  });

  if (!response.ok) {
    throw new Error(
      `Tavily API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  
  // Process images based on whether they include descriptions
  const processedImages = includeImageDescriptions
    ? data.images
        .map(({ url, description }) => ({
          url: sanitizeUrl(url),
          description
        }))
        .filter(
          image =>
            typeof image === "object" &&
            image.description !== undefined &&
            image.description !== ""
        )
    : data.images.map(url => sanitizeUrl(url));

  return {
    ...data,
    images: processedImages
  };
}

/**
 * Search with Serper API
 * @param {string} query - Search query
 * @returns {Promise<SearchResults>} - Search results
 */
async function serperSearch(query) {
  const apiKey = config.serper.apiKey;
  if (!apiKey) {
    throw new Error("REACT_APP_SERPER_API_KEY is not set");
  }

  const response = await fetch(config.serper.endpoint, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ q: query })
  });

  if (!response.ok) {
    throw new Error(
      `Serper API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  
  // Format Serper results to match our application's format
  return {
    results: data.organic.map(item => ({
      title: item.title,
      url: item.link,
      content: item.snippet
    })),
    query: query,
    images: data.images?.map(image => sanitizeUrl(image.imageUrl)) || [],
    number_of_results: data.organic.length
  };
}

/**
 * Performs a video search using Serper API
 * @param {string} query - Search query
 * @returns {Promise<SearchResults>} - Search results with videos
 */
export async function videoSearch(query) {
  const apiKey = config.serper.apiKey;
  if (!apiKey) {
    throw new Error("REACT_APP_SERPER_API_KEY is not set");
  }

  try {
    const response = await fetch("https://google.serper.dev/videos", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ q: query })
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return await response.json();
  } catch (error) {
    console.error("Video Search API error:", error);
    return null;
  }
}