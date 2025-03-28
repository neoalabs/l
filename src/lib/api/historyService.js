import { Redis } from '@upstash/redis';

const ENABLE_HISTORY = process.env.REACT_APP_ENABLE_HISTORY === 'true';
const HISTORY_VERSION = 'v1';

// Only initialize Redis if history is enabled
let redis = null;
if (ENABLE_HISTORY) {
  try {
    redis = new Redis({
      url: process.env.REACT_APP_UPSTASH_REDIS_REST_URL,
      token: process.env.REACT_APP_UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
  }
}

/**
 * Get a key for user's chat history
 * @param {string} userId - User ID
 * @returns {string} - Redis key for user's chat history
 */
function getUserChatKey(userId) {
  return `user:${HISTORY_VERSION}:chat:${userId}`;
}

/**
 * Get all chat history for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of chat objects
 */
export async function getChats(userId = 'anonymous') {
  if (!ENABLE_HISTORY || !redis) {
    return [];
  }

  try {
    const chats = await redis.zrange(getUserChatKey(userId), 0, -1, {
      rev: true
    });

    if (chats.length === 0) {
      return [];
    }

    const results = await Promise.all(
      chats.map(async chatKey => {
        const chat = await redis.hgetall(chatKey);
        return chat;
      })
    );

    return results
      .filter(result => {
        if (result === null || Object.keys(result).length === 0) {
          return false;
        }
        return true;
      })
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
    console.error('Error getting chats:', error);
    return [];
  }
}

/**
 * Get a specific chat by ID
 * @param {string} id - Chat ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} - Chat object or null if not found
 */
export async function getChat(id, userId = 'anonymous') {
  if (!ENABLE_HISTORY || !redis) {
    return null;
  }

  try {
    const chat = await redis.hgetall(`chat:${id}`);

    if (!chat) {
      return null;
    }

    // Parse the messages if they're stored as a string
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
    console.error('Error getting chat:', error);
    return null;
  }
}

/**
 * Save a chat to history
 * @param {Object} chat - Chat object to save
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - Success status
 */
export async function saveChat(chat, userId = 'anonymous') {
  if (!ENABLE_HISTORY || !redis) {
    return false;
  }

  try {
    const chatToSave = {
      ...chat,
      messages: JSON.stringify(chat.messages)
    };

    await redis.hmset(`chat:${chat.id}`, chatToSave);
    await redis.zadd(getUserChatKey(userId), Date.now(), `chat:${chat.id}`);

    return true;
  } catch (error) {
    console.error('Error saving chat:', error);
    return false;
  }
}

/**
 * Clear all chat history for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Result with success or error
 */
export async function clearChats(userId = 'anonymous') {
  if (!ENABLE_HISTORY || !redis) {
    return { error: 'History is not enabled' };
  }

  try {
    const userChatKey = getUserChatKey(userId);
    const chats = await redis.zrange(userChatKey, 0, -1);
    
    if (!chats.length) {
      return { error: 'No chats to clear' };
    }
    
    for (const chat of chats) {
      await redis.del(chat);
      await redis.zrem(userChatKey, chat);
    }

    return { success: true };
  } catch (error) {
    console.error('Error clearing chats:', error);
    return { error: error.message };
  }
}