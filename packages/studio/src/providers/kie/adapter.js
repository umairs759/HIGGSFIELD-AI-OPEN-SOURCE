/**
 * Kie.ai Provider Adapter
 * 
 * Refactored from packages/studio/src/kie.js into the uniform adapter interface.
 * Uses the serverless proxy route for CORS handling.
 */

import { createMissingKeyError } from '../types.js';

const PROXY_BASE = '/api/proxy/kie';

async function proxyRequest(action, apiKey, payload = {}) {
  const response = await fetch(PROXY_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-provider-key': apiKey,
    },
    body: JSON.stringify({ action, ...payload }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Kie proxy error: ${response.status}`);
  }
  
  return response.json();
}

function imageSlug(params) {
  const id = params.model || '';
  if (id.includes('nano-banana-pro')) return 'nano-banana-pro';
  if (id.includes('nano-banana-2')) return 'nano-banana-2';
  if (id.includes('nano-banana')) return 'nano-banana';
  if (id.includes('grok')) return 'grok-imagine/text-to-image';
  return 'nano-banana-2';
}

function editSlug(params) {
  const id = params.model || '';
  if (id.includes('qwen')) return 'qwen/image-to-image';
  if (id.includes('gpt')) return 'gpt-image-2-image-to-image';
  if (id.includes('nano-banana-pro')) return 'nano-banana-pro';
  if (id.includes('nano-banana-2')) return 'nano-banana-2';
  if (id.includes('nano-banana')) return 'nano-banana-edit';
  return 'nano-banana-edit';
}

function imageInput(params, edit) {
  const input = { output_format: 'jpg' };
  if (params.prompt) input.prompt = params.prompt;
  if (params.aspect_ratio) input.aspect_ratio = params.aspect_ratio;
  if (params.resolution) input.resolution = String(params.resolution).toUpperCase().replace('K', 'K');
  if (params.seed !== undefined && params.seed !== -1) input.seed = params.seed;

  const images = params.images_list?.length > 0 ? params.images_list : (params.image_url ? [params.image_url] : null);
  if (images) {
    if (edit) {
      const id = params.model || '';
      if (id.includes('qwen')) input.image_url = images[0];
      else if (id.includes('gpt')) input.input_urls = images;
      else input.image_input = images;
    } else {
      input.image_input = images;
    }
  }
  return input;
}

function videoSlug(params, kind, hasImage) {
  const id = params.model || '';
  if (id.includes('veo')) {
    let model = 'veo3';
    if (id.includes('fast')) model = 'veo3_fast';
    else if (id.includes('lite')) model = 'veo3_lite';
    return { family: 'veo', model, generationType: hasImage ? 'FIRST_AND_LAST_FRAMES_2_VIDEO' : 'TEXT_2_VIDEO' };
  }
  if (id.includes('kling')) {
    if (id.includes('2.1-standard')) return { family: 'jobs', model: 'kling/v2-1-standard' };
    return { family: 'jobs', model: 'kling/v2-1-pro', klingI2v: true };
  }
  if (id.includes('seedance')) {
    if (id.includes('v1.5')) return { family: 'jobs', model: 'bytedance/seedance-1.5-pro' };
    if (id.includes('lite')) return { family: 'jobs', model: 'bytedance/seedance-2-fast' };
    return { family: 'jobs', model: 'bytedance/seedance-2' };
  }
  if (id.includes('wan')) {
    return { family: 'jobs', model: 'wan/3-0-video', videoInput: 'first_frame' };
  }
  if (id.includes('sora') || id.includes('ovi')) {
    if (hasImage) return { family: 'jobs', model: id.includes('pro') ? 'sora-2-pro-image-to-video' : 'sora-2-image-to-video' };
    return { family: 'jobs', model: id.includes('pro') ? 'sora-2-pro-text-to-video' : 'sora-2-text-to-video' };
  }
  if (kind === 'i2v') return { family: 'jobs', model: 'sora-2-image-to-video' };
  return { family: 'jobs', model: 'sora-2-text-to-video' };
}

function videoInput(params, settings) {
  const input = {};
  if (params.prompt) input.prompt = params.prompt;
  if (params.aspect_ratio) input.aspect_ratio = params.aspect_ratio;
  if (params.duration) input.duration = params.duration;
  if (params.resolution) input.resolution = params.resolution;
  if (params.image_url) {
    if (settings.videoInput === 'first_frame') {
      input.first_frame_url = params.image_url;
      if (input.resolution) input.resolution = String(input.resolution).toUpperCase();
    } else {
      input.image_urls = [params.image_url];
    }
  }
  return input;
}

const kieAdapter = {
  id: 'kie',
  name: 'Kie.ai',
  capabilities: {
    t2i: true,
    i2i: true,
    t2v: true,
    i2v: true,
    v2v: false,
    lipsync: true,
    chat: false,
  },

  /**
   * Validate Kie API key by making a test request
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async validateKey(key) {
    if (!key || !key.trim()) return false;
    try {
      // Try to create a minimal task to validate key
      const result = await proxyRequest('createTask', key.trim(), {
        model: 'nano-banana',
        input: { prompt: 'test', output_format: 'jpg' },
      });
      // If we get a taskId or error about credits, key is valid format
      return result.taskId !== undefined || (result.error && result.error.includes('credit'));
    } catch (error) {
      // Network errors or 401 = invalid key
      return false;
    }
  },

  /**
   * Generate image (text-to-image)
   * @param {string} key
   * @param {Object} params
   * @returns {Promise<AdapterResult>}
   */
  async generateImage(key, params) {
    if (!key?.trim()) throw createMissingKeyError({ provider: 'kie', modelId: params.model });
    
    const slug = imageSlug(params);
    const input = imageInput(params, false);
    
    const result = await proxyRequest('createTask', key.trim(), {
      model: slug,
      input,
    });
    
    if (result.status === 'pending' && result.taskId) {
      return { status: 'pending', taskId: result.taskId, raw: result.raw };
    }
    
    return { status: 'completed', url: result.url, raw: result.raw };
  },

  /**
   * Generate image-to-image
   * @param {string} key
   * @param {Object} params
   * @returns {Promise<AdapterResult>}
   */
  async generateI2I(key, params) {
    if (!key?.trim()) throw createMissingKeyError({ provider: 'kie', modelId: params.model });
    
    const slug = editSlug(params);
    const input = imageInput(params, true);
    
    const result = await proxyRequest('createTask', key.trim(), {
      model: slug,
      input,
    });
    
    if (result.status === 'pending' && result.taskId) {
      return { status: 'pending', taskId: result.taskId, raw: result.raw };
    }
    
    return { status: 'completed', url: result.url, raw: result.raw };
  },

  /**
   * Generate video (text-to-video or image-to-video)
   * @param {string} key
   * @param {Object} params
   * @returns {Promise<AdapterResult>}
   */
  async generateVideo(key, params) {
    if (!key?.trim()) throw createMissingKeyError({ provider: 'kie', modelId: params.model });
    
    const hasImage = !!params.image_url;
    const settings = videoSlug(params, hasImage ? 'i2v' : 't2v', hasImage);
    
    if (settings.family === 'veo') {
      return this._generateVeo(key, params, settings);
    }
    
    const input = videoInput(params, settings);
    
    const result = await proxyRequest('createTask', key.trim(), {
      model: settings.model,
      input,
    });
    
    if (result.status === 'pending' && result.taskId) {
      return { status: 'pending', taskId: result.taskId, raw: result.raw };
    }
    
    return { status: 'completed', url: result.url, raw: result.raw };
  },

  /**
   * Generate image-to-video (explicit)
   * @param {string} key
   * @param {Object} params
   * @returns {Promise<AdapterResult>}
   */
  async generateI2V(key, params) {
    return this.generateVideo(key, params);
  },

  /**
   * VEO video generation (special endpoint)
   */
  async _generateVeo(key, params, settings) {
    const isI2v = !!params.image_url;
    const body = {
      prompt: params.prompt,
      model: settings.model,
      generationType: isI2v ? 'FIRST_AND_LAST_FRAMES_2_VIDEO' : 'TEXT_2_VIDEO',
      aspect_ratio: params.aspect_ratio || '16:9',
      resolution: params.resolution || '720p',
      enableFallback: false,
    };
    if (isI2v) body.imageUrls = [params.image_url];

    const result = await proxyRequest('veoGenerate', key.trim(), body);
    
    if (result.status === 'pending' && result.taskId) {
      return { status: 'pending', taskId: result.taskId, raw: result.raw };
    }
    
    return { status: 'completed', url: result.url, raw: result.raw };
  },

  /**
   * Poll for task status
   * @param {string} key
   * @param {string} taskId
   * @returns {Promise<AdapterResult>}
   */
  async pollStatus(key, taskId) {
    if (!key?.trim()) throw createMissingKeyError({ provider: 'kie', modelId: taskId });
    
    // Detect VEO task IDs (prefixed with 'veo:')
    const isVeo = taskId.startsWith('veo:');
    const actualTaskId = isVeo ? taskId.slice(4) : taskId;
    const action = isVeo ? 'veoPoll' : 'pollStatus';
    
    const result = await proxyRequest(action, key.trim(), { taskId: actualTaskId });
    return result;
  },

  /**
   * Process lip sync
   * @param {string} key
   * @param {Object} params
   * @returns {Promise<AdapterResult>}
   */
  async processLipSync(key, params) {
    if (!key?.trim()) throw createMissingKeyError({ provider: 'kie', modelId: params.model });
    
    let slug;
    let input = {};
    
    if (params.video_url && params.audio_url) {
      slug = 'volcengine/video-to-video-lip-sync';
      input = {
        mode: 'basic',
        video_url: params.video_url,
        audio_url: params.audio_url,
      };
    } else if (params.image_url && params.audio_url) {
      slug = 'omnihuman-1-5';
      input = {
        image_url: params.image_url,
        audio_url: params.audio_url,
        output_resolution: '1080',
      };
      if (params.prompt) input.prompt = params.prompt;
      if (params.seed !== undefined && params.seed !== -1) input.seed = params.seed;
    } else {
      throw new Error('LipSync requires both a source (image or video) and an audio file.');
    }
    
    const result = await proxyRequest('createTask', key.trim(), {
      model: slug,
      input,
    });
    
    if (result.status === 'pending' && result.taskId) {
      return { status: 'pending', taskId: result.taskId, raw: result.raw };
    }
    
    return { status: 'completed', url: result.url, raw: result.raw };
  },

  /**
   * Upload file to Kie
   * @param {string} key
   * @param {File} file
   * @param {Function} onProgress
   * @returns {Promise<string>} File URL
   */
  async uploadFile(key, file, onProgress) {
    return new Promise((resolve, reject) => {
      const url = 'https://api.kie.ai/api/v1/file-stream-upload';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadPath', 'open-higgsfield');
      formData.append('fileName', file.name);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.setRequestHeader('Authorization', `Bearer ${key}`);

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText);
            if (json.code && json.code !== 200) {
              reject(new Error(`File upload failed: ${json.code} ${json.msg}`));
              return;
            }
            const fileUrl = json.data?.fileUrl || json.data?.downloadUrl || json.data?.url || json.url;
            if (!fileUrl) {
              reject(new Error('No URL returned from file upload'));
            } else {
              resolve(fileUrl);
            }
          } catch (e) {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          reject(new Error(`File upload failed: ${xhr.status} - ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during file upload'));
      xhr.send(formData);
    });
  },
};

export default kieAdapter;