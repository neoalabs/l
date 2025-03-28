import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the Google Generative AI with API key
const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Set the model name from environment variable or use default
// Using a more recent model - gemini-1.5-flash is recommended
const MODEL_NAME = process.env.REACT_APP_GEMINI_MODEL || "gemini-1.5-flash";

// Set up safety settings to prevent harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Generate response from Gemini model
 * @param {Array} messages - Array of chat messages
 * @param {Object} searchResults - Search results to include in the prompt
 * @returns {Promise<string>} - AI-generated response
 */
export async function generateResponse(messages, searchResults = null) {
  try {
    // Check if API key is configured
    if (!genAI) {
      return "API key not configured. Please set REACT_APP_GOOGLE_API_KEY in your .env file.";
    }
    
    // Log the model being used (helps with debugging)
    console.log(`Using Gemini model: ${MODEL_NAME}`);
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    // Create a chat session
    const chat = model.startChat({
      history: formatMessagesForGemini(messages.slice(0, -1)),
      safetySettings,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    // Prepare the prompt with search results if available
    let prompt = messages[messages.length - 1].content;
    if (searchResults) {
      prompt = `${prompt}\n\nSearch Results:\n${formatSearchResults(searchResults)}`;
    }

    // Generate response from the model
    const result = await chat.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating AI response:", error);
    
    // Return a more user-friendly error message
    if (error.message?.includes("403") || error.message?.includes("401")) {
      return "Authentication error: Please check your API key.";
    } else if (error.message?.includes("404")) {
      return "The specified model was not found. Please check REACT_APP_GEMINI_MODEL in your .env file.";
    }
    
    return `Failed to generate response: ${error.message}`;
  }
}

/**
 * Generate related questions based on a query
 * @param {string} query - Original search query
 * @returns {Promise<Array>} - Array of related questions
 */
export async function generateRelatedQuestions(query) {
  try {
    // Check if API key is configured
    if (!genAI) {
      console.warn("API key not configured for related questions");
      return [];
    }
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    // Create the prompt for related questions
    const prompt = `Based on the user's search query: "${query}", generate 3 related follow-up questions that they might be interested in. Return only the questions as a numbered list without any additional text.`;
    
    // Generate response from the model
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse the response into an array of questions
    const questions = text
      .split('\n')
      .filter(line => line.trim().match(/^\d+\.\s/))
      .map(line => line.replace(/^\d+\.\s/, '').trim())
      .filter(q => q.length > 0)
      .slice(0, 3);
    
    return questions;
  } catch (error) {
    console.error("Error generating related questions:", error);
    return [];
  }
}

/**
 * Format messages for Gemini API
 * @param {Array} messages - Chat messages to format
 * @returns {Array} - Formatted messages for Gemini
 */
function formatMessagesForGemini(messages) {
  return messages.map(message => ({
    role: message.role === "user" ? "user" : "model",
    parts: [{ text: message.content }],
  }));
}

/**
 * Format search results for inclusion in prompt
 * @param {Object} searchResults - Search results object
 * @returns {string} - Formatted search results
 */
function formatSearchResults(searchResults) {
  if (!searchResults || !searchResults.results) {
    return "";
  }

  return searchResults.results
    .map((result, index) => {
      return `[${index + 1}] "${result.title}"
URL: ${result.url}
${result.content}
`;
    })
    .join("\n");
}