/**
 * NVIDIA NIM Provider Adapter
 * 
 * Synchronous provider - returns immediate results via proxy route.
 * Supports FLUX.1-schnell, SD3, and chat completions for prompt enhancement.
 */

import { createMissingKeyError } from '../types.js';

const PROXY_BASE = '/api/proxy/nvidia';

// NVIDIA NIM model mappings
const NVIDIA_MODELS = {
  // Image generation
  'flux-schnell': 'black-forest-labs/flux.1-schnell',
  'flux-dev': 'black-forest-labs/flux.1-dev',
  'sd3-medium': 'stabilityai/stable-diffusion-3-medium',
  'sd3.5-large': 'stabilityai/stable-diffusion-3.5-large',
  'sd3.5-large-turbo': 'stabilityai/stable-diffusion-3.5-large-turbo',
  
  // Chat (for prompt enhancement)
  'llama-3.1-70b': 'meta/llama-3.1-70b-instruct',
  'llama-3.1-8b': 'meta/llama-3.1-8b-instruct',
  'nemotron-3-ultra': 'nvidia/nemotron-3-ultra',
};

function mapModelId(modelId) {
  return NVIDIA_MODELS[modelId] || modelId;
}

async function proxyRequest(apiKey, modelId, payload) {
  const nimModel = mapModelId(modelId);
  
  const response = await fetch(PROXY_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-provider-key': apiKey,
    },
    body: JSON.stringify({ model: nimModel, ...payload }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `NVIDIA proxy error: ${response.status}`);
  }
  
  return response.json();
}

const nvidiaAdapter = {
  id: 'nvidia',
  name: 'NVIDIA NIM',
  capabilities: {
    t2i: true,
    i2i: false,  // NVIDIA NIM doesn't support i2i directly
    t2v: false,  // Video via other models not in NIM yet
    i2v: false,
    v2v: false,
    lipsync: false,
    chat: true,  // For prompt enhancement
  },

  /**
   * Validate NVIDIA API key
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async validateKey(key) {
    if (!key?.trim()) return false;
    if (!key.trim().startsWith('nvapi-')) return false;
    
    try {
      // Quick validation with a minimal chat request
      const result = await proxyRequest(key.trim(), 'llama-3.1-8b', {
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
        temperature: 0,
      });
      return !!result.content;
    } catch (error) {
      // 401 = invalid key, network errors = potentially valid but unreachable
      return error.message.includes('401') ? false : true;
    }
  },

  /**
   * Generate image (text-to-image)
   * Returns immediate result with data URI
   * @param {string} key
   * @param {Object} params
   * @returns {Promise<AdapterResult>}
   */
  async generateImage(key, params) {
    if (!key?.trim()) throw createMissingKeyError({ provider: 'nvidia', modelId: params.model });
    
    const { model, prompt, aspect_ratio, width, height, resolution, seed, num_images, ...rest } = params;
    
    // Build payload for NVIDIA NIM image generation
    const payload = {
      prompt: prompt || '',
      ...rest,
    };
    
    // Handle dimensions
    if (width && height) {
      payload.width = parseInt(width);
      payload.height = parseInt(height);
    } else if (aspect_ratio) {
      // Convert aspect ratio to dimensions (default 1024 base)
      const base = 1024;
      const [w, h] = aspect_ratio.split(':').map(Number);
      if (w && h) {
        const scale = base / Math.max(w, h);
        payload.width = Math.round(w * scale / 64) * 64;
        payload.height = Math.round(h * scale / 64) * 64;
      } else {
        payload.width = base;
        payload.height = base;
      }
    } else {
      payload.width = 1024;
      payload.height = 1024;
    }
    
    if (resolution) {
      // Handle resolution strings like "1K", "2K", "4K"
      const resMap = { '1k': 1024, '2k': 2048, '4k': 4096 };
      const base = resMap[resolution.toLowerCase()] || 1024;
      payload.width = base;
      payload.height = base;
    }
    
    if (seed !== undefined && seed !== -1) {
      payload.seed = parseInt(seed);
    }
    
    if (num_images) {
      payload.num_images = Math.min(parseInt(num_images), 4);
    }
    
    // Negative prompt support
    if (params.negative_prompt) {
      payload.negative_prompt = params.negative_prompt;
    }
    
    const result = await proxyRequest(key.trim(), model, payload);
    
    // Result already normalized by proxy to { status: 'completed', url: 'data:image/png;base64,...' }
    return result;
  },

  /**
   * Generate video - not supported directly by NVIDIA NIM yet
   * @param {string} key
   * @param {Object} params
   * @returns {Promise<AdapterResult>}
   */
  async generateVideo(key, params) {
    throw new Error('Video generation not supported by NVIDIA NIM adapter. Use Kie.ai for video models.');
  },

  /**
   * Chat completion for prompt enhancement
   * @param {string} key
   * @param {Array<Object>} messages
   * @returns {Promise<string>}
   */
  async chat(key, messages) {
    if (!key?.trim()) throw createMissingKeyError({ provider: 'nvidia', modelId: 'chat' });
    
    const result = await proxyRequest(key.trim(), 'llama-3.1-70b', {
      messages,
      max_tokens: 2048,
      temperature: 0.7,
      top_p: 0.9,
    });
    
    return result.content || '';
  },

  /**
   * Poll status - not needed for sync provider
   * @param {string} key
   * @param {string} taskId
   * @returns {Promise<AdapterResult>}
   */
  async pollStatus(key, taskId) {
    // NVIDIA is synchronous - no polling needed
    return { status: 'completed', error: new Error('NVIDIA NIM is synchronous - no polling required') };
  },
};

export default nvidiaAdapter;