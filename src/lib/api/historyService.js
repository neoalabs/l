/**
 * History service that tries to use Redis first, but falls back to localStorage if Redis fails
 */
import { Redis } from '@upstash/redis';

// Constants
const HISTORY_VERSION = 'v1';
const LOCAL_STORAGE_KEY = 'gemini-search-history';

// Environment configurations - safely access env variables
const getEnvVar = (name) => {
  return typeof window !== 'undefined' && window.env && window.env[name] 
    ? window.env[name] 
    : typeof process !== 'undefined' && process.env && process.env[name] 
      ? process.env[name] 
      : undefined;
};

const ENABLE_HISTORY = getEnvVar('REACT_APP_ENABLE_HISTORY') === 'true';
const REDIS_URL = getEnvVar('REACT_APP_UPSTASH_REDIS_REST_URL');
const REDIS_TOKEN = getEnvVar('REACT_APP_UPSTASH_REDIS_REST_TOKEN');

// Storage mode - will be set during initialization
let STORAGE_MODE = 'none';

// Redis client
let redis = null;

// Initialize the storage system
function initStorage() {
  // If history is disabled, don't initialize anything
  if (!ENABLE_HISTORY) {
    console.log('Chat history is disabled');
    return;
  }
  
  // Try to initialize Redis if credentials are provided
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      redis = new Redis({
        url: REDIS_URL,
        token: REDIS_TOKEN,
      });
      STORAGE_MODE = 'redis';
      console.log('Redis client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      STORAGE_MODE = 'localStorage';
      console.log('Falling back to localStorage for chat history');
    }
  } else {
    // Fall back to localStorage if Redis credentials are not provided
    STORAGE_MODE = 'localStorage';
    console.log('Using localStorage for chat history (Redis credentials not provided)');
  }
}

// Initialize on import
initStorage();

// Redis-specific functions
function getUserChatKey(userId) {
  return `user:${HISTORY_VERSION}:chat:${userId}`;
}

function getLocalStorageKey() {
  return `${LOCAL_STORAGE_KEY}-${HISTORY_VERSION}`;
}

/**
 * Get all chat history for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of chat objects
 */
export async function getChats(userId = 'anonymous') {
  if (STORAGE_MODE === 'none') {
    return [];
  }
  
  if (STORAGE_MODE === 'redis') {
    try {
      const chats = await redis.zrange(getUserChatKey(userId), 0, -1, { rev: true });
      
      if (!chats || chats.length === 0) {
        return [];
      }
      
      const results = await Promise.all(
        chats.map(async chatKey => {
          try {
            const chat = await redis.hgetall(chatKey);
            return chat;
          } catch (error) {
            console.error(`Error fetching chat ${chatKey}:`, error);
            return null;
          }
        })
      );
      
      return results
        .filter(result => result && Object.keys(result).length > 0)
        .map(chat => {
          const plainChat = { ...chat };
          
          if (typeof plainChat.messages === 'string') {
            try {
              plainChat.messages = JSON.parse(plainChat.messages);
            } catch (error) {
              plainChat.messages = [];
            }
          }
          
          if (plainChat.createdAt && !(plainChat.createdAt instanceof Date)) {
            plainChat.createdAt = new Date(plainChat.createdAt);
          }
          
          return plainChat;
        });
    } catch (error) {
      console.error('Error getting chats from Redis:', error);
      return [];
    }
  } else {
    // localStorage mode
    try {
      const historyString = localStorage.getItem(getLocalStorageKey());
      if (!historyString) {
        return [];
      }
      
      const history = JSON.parse(historyString);
      return history
        .map(chat => {
          // Parse messages if needed
          if (typeof chat.messages === 'string') {
            try {
              chat.messages = JSON.parse(chat.messages);
            } catch (error) {
              chat.messages = [];
            }
          }
          
          // Ensure createdAt is a Date object
          if (chat.createdAt && typeof chat.createdAt === 'string') {
            chat.createdAt = new Date(chat.createdAt);
          }
          
          return chat;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error getting chats from localStorage:', error);
      return [];
    }
  }
}

/**
 * Get a specific chat by ID
 * @param {string} id - Chat ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} - Chat object or null if not found
 */
export async function getChat(id, userId = 'anonymous') {
  if (STORAGE_MODE === 'none') {
    return null;
  }
  
  if (STORAGE_MODE === 'redis') {
    try {
      const chat = await redis.hgetall(`chat:${id}`);
      
      if (!chat || Object.keys(chat).length === 0) {
        return null;
      }
      
      // Parse messages if needed
      if (typeof chat.messages === 'string') {
        try {
          chat.messages = JSON.parse(chat.messages);
        } catch (error) {
          chat.messages = [];
        }
      }
      
      // Ensure messages is always an array
      if (!Array.isArray(chat.messages)) {
        chat.messages = [];
      }
      
      return chat;
    } catch (error) {
      console.error('Error getting chat from Redis:', error);
      return null;
    }
  } else {
    // localStorage mode
    try {
      const chats = await getChats();
      const chat = chats.find(chat => chat.id === id);
      
      if (!chat) {
        return null;
      }
      
      return chat;
    } catch (error) {
      console.error('Error getting chat from localStorage:', error);
      return null;
    }
  }
}

/**
 * Save a chat to history
 * @param {Object} chat - Chat object to save
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - Success status
 */
export async function saveChat(chat, userId = 'anonymous') {
  if (STORAGE_MODE === 'none') {
    console.log('Chat history is disabled');
    return false;
  }
  
  if (STORAGE_MODE === 'redis') {
    try {
      // Prepare chat for saving
      const chatToSave = {
        ...chat,
        messages: typeof chat.messages === 'string' 
          ? chat.messages 
          : JSON.stringify(chat.messages)
      };
      
      // Save to Redis
      await redis.hmset(`chat:${chat.id}`, chatToSave);
      await redis.zadd(getUserChatKey(userId), Date.now(), `chat:${chat.id}`);
      
      console.log(`Chat ${chat.id} saved to Redis`);
      return true;
    } catch (error) {
      console.error('Error saving chat to Redis:', error);
      return false;
    }
  } else {
    // localStorage mode
    try {
      // Get existing chats
      const existing = localStorage.getItem(getLocalStorageKey());
      const chats = existing ? JSON.parse(existing) : [];
      
      // Prepare chat for saving
      const chatToSave = { ...chat };
      
      // Ensure createdAt is a string
      if (chatToSave.createdAt instanceof Date) {
        chatToSave.createdAt = chatToSave.createdAt.toISOString();
      }
      
      // Ensure messages is a string
      if (typeof chatToSave.messages !== 'string') {
        chatToSave.messages = JSON.stringify(chatToSave.messages);
      }
      
      // Update or add the chat
      const existingIndex = chats.findIndex(c => c.id === chat.id);
      if (existingIndex >= 0) {
        chats[existingIndex] = chatToSave;
      } else {
        chats.push(chatToSave);
      }
      
      // Save to localStorage
      localStorage.setItem(getLocalStorageKey(), JSON.stringify(chats));
      
      console.log(`Chat ${chat.id} saved to localStorage`);
      return true;
    } catch (error) {
      console.error('Error saving chat to localStorage:', error);
      return false;
    }
  }
}

/**
 * Clear all chat history for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Result with success or error
 */
export async function clearChats(userId = 'anonymous') {
  if (STORAGE_MODE === 'none') {
    return { error: 'History is not enabled' };
  }
  
  if (STORAGE_MODE === 'redis') {
    try {
      const userChatKey = getUserChatKey(userId);
      const chats = await redis.zrange(userChatKey, 0, -1);
      
      if (!chats || chats.length === 0) {
        return { message: 'No chats to clear' };
      }
      
      // Delete each chat and remove from user's history
      for (const chat of chats) {
        await redis.del(chat);
        await redis.zrem(userChatKey, chat);
      }
      
      console.log(`Cleared ${chats.length} chats for user ${userId} from Redis`);
      return { success: true };
    } catch (error) {
      console.error('Error clearing chats from Redis:', error);
      return { error: error.message };
    }
  } else {
    // localStorage mode
    try {
      localStorage.removeItem(getLocalStorageKey());
      console.log('Cleared all chats from localStorage');
      return { success: true };
    } catch (error) {
      console.error('Error clearing chats from localStorage:', error);
      return { error: error.message };
    }
  }
}