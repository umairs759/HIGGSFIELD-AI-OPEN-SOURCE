/**
 * Model Availability Catalog
 * 
 * Maps model IDs to provider availability, tags, and recommendations.
 * Used by the router to resolve which provider to use for a given model.
 */

/**
 * @typedef {Object} ModelAvailability
 * @property {string} id - Model ID
 * @property {string} name - Display name
 * @property {Object} providers - Provider-specific model identifiers
 * @property {string} providers.kie - Kie.ai model slug
 * @property {string} providers.nvidia - NVIDIA NIM model identifier
 * @property {string[]} tags - Descriptive tags
 * @property {string} recommendation - User-facing recommendation
 * @property {string} category - Model category ('image', 'video', 'lipsync')
 */

const modelAvailability = {
  // ========== IMAGE MODELS ==========
  
  'flux-schnell': {
    id: 'flux-schnell',
    name: 'FLUX.1 Schnell',
    providers: {
      nvidia: 'black-forest-labs/flux.1-schnell',
      kie: 'flux-schnell',
    },
    tags: ['fast', 'free-tier', 'high-quality'],
    recommendation: 'Fastest generation with free NVIDIA credits',
    category: 'image',
  },
  
  'flux-dev': {
    id: 'flux-dev',
    name: 'FLUX.1 Dev',
    providers: {
      nvidia: 'black-forest-labs/flux.1-dev',
      kie: 'flux-dev',
    },
    tags: ['quality', 'detail'],
    recommendation: 'High quality FLUX variant',
    category: 'image',
  },
  
  'sd3-medium': {
    id: 'sd3-medium',
    name: 'Stable Diffusion 3 Medium',
    providers: {
      nvidia: 'stabilityai/stable-diffusion-3-medium',
      kie: 'sd3-medium',
    },
    tags: ['typography', 'fast', 'text-rendering'],
    recommendation: 'Best for text rendering and typography',
    category: 'image',
  },
  
  'sd3.5-large': {
    id: 'sd3.5-large',
    name: 'Stable Diffusion 3.5 Large',
    providers: {
      nvidia: 'stabilityai/stable-diffusion-3.5-large',
    },
    tags: ['quality', 'detail', 'latest'],
    recommendation: 'Latest SD3.5 with highest quality',
    category: 'image',
  },
  
  'nano-banana-2': {
    id: 'nano-banana-2',
    name: 'Nano Banana 2',
    providers: {
      kie: 'nano-banana-2',
    },
    tags: ['high-quality', 'detail', 'creative'],
    recommendation: 'Highest detail quality for creative images',
    category: 'image',
  },
  
  'nano-banana-pro': {
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    providers: {
      kie: 'nano-banana-pro',
    },
    tags: ['professional', 'high-res', '4k'],
    recommendation: 'Professional grade with 4K output',
    category: 'image',
  },
  
  'gpt4o-text-to-image': {
    id: 'gpt4o-text-to-image',
    name: 'GPT-4o Image',
    providers: {
      kie: 'gpt4o-text-to-image',
    },
    tags: ['multimodal', 'instruction-following'],
    recommendation: 'Best for complex instruction following',
    category: 'image',
  },
  
  'qwen-image': {
    id: 'qwen-image',
    name: 'Qwen Image',
    providers: {
      kie: 'qwen-image',
    },
    tags: ['chinese', 'text-rendering'],
    recommendation: 'Excellent Chinese text rendering',
    category: 'image',
  },
  
  'ideogram-v3': {
    id: 'ideogram-v3-t2i',
    name: 'Ideogram v3',
    providers: {
      kie: 'ideogram-v3-t2i',
    },
    tags: ['text', 'design', 'logos'],
    recommendation: 'Best for text-heavy designs and logos',
    category: 'image',
  },
  
  'midjourney-v7': {
    id: 'midjourney-v7-text-to-image',
    name: 'Midjourney v7',
    providers: {
      kie: 'midjourney-v7-text-to-image',
    },
    tags: ['artistic', 'aesthetic'],
    recommendation: 'Most artistic and aesthetic results',
    category: 'image',
  },
  
  // ========== VIDEO MODELS ==========
  
  'veo3': {
    id: 'veo3',
    name: 'Veo 3',
    providers: {
      kie: 'veo3',
    },
    tags: ['cinematic', 'video', 'high-quality', 'google'],
    recommendation: 'Cinematic video generation from Google',
    category: 'video',
  },
  
  'veo3-fast': {
    id: 'veo3-fast',
    name: 'Veo 3 Fast',
    providers: {
      kie: 'veo3_fast',
    },
    tags: ['fast', 'video', 'google'],
    recommendation: 'Faster Veo 3 generation',
    category: 'video',
  },
  
  'kling-v2-1-pro': {
    id: 'kling-v2-1-pro',
    name: 'Kling v2.1 Pro',
    providers: {
      kie: 'kling/v2-1-pro',
    },
    tags: ['cinematic', 'video', 'pro-quality'],
    recommendation: 'Professional video generation',
    category: 'video',
  },
  
  'kling-v2-1-standard': {
    id: 'kling-v2-1-standard',
    name: 'Kling v2.1 Standard',
    providers: {
      kie: 'kling/v2-1-standard',
    },
    tags: ['video', 'balanced'],
    recommendation: 'Balanced quality and speed',
    category: 'video',
  },
  
  'seedance-v2': {
    id: 'bytedance/seedance-2',
    name: 'Seedance 2.0',
    providers: {
      kie: 'bytedance/seedance-2',
    },
    tags: ['video', 'byte-dance'],
    recommendation: 'Latest Seedance video model',
    category: 'video',
  },
  
  'seedance-v1-5': {
    id: 'bytedance/seedance-1.5-pro',
    name: 'Seedance 1.5 Pro',
    providers: {
      kie: 'bytedance/seedance-1.5-pro',
    },
    tags: ['video', 'byte-dance'],
    recommendation: 'Proven Seedance video quality',
    category: 'video',
  },
  
  'wan-video': {
    id: 'wan/3-0-video',
    name: 'Wan 3.0 Video',
    providers: {
      kie: 'wan/3-0-video',
    },
    tags: ['video', 'open-source'],
    recommendation: 'Open-source video generation',
    category: 'video',
  },
  
  'sora-2': {
    id: 'sora-2-text-to-video',
    name: 'Sora 2',
    providers: {
      kie: 'sora-2-text-to-video',
    },
    tags: ['video', 'openai-style'],
    recommendation: 'Sora-style video generation',
    category: 'video',
  },
  
  // ========== LIP SYNC MODELS ==========
  
  'omnihuman-1-5': {
    id: 'omnihuman-1-5',
    name: 'OmniHuman 1.5',
    providers: {
      kie: 'omnihuman-1-5',
    },
    tags: ['lipsync', 'portrait', 'high-quality'],
    recommendation: 'Best lip-sync quality for portraits',
    category: 'lipsync',
  },
  
  'volcengine-lipsync': {
    id: 'volcengine/video-to-video-lip-sync',
    name: 'VolcEngine Lip Sync',
    providers: {
      kie: 'volcengine/video-to-video-lip-sync',
    },
    tags: ['lipsync', 'video', 'basic'],
    recommendation: 'Video-to-video lip sync',
    category: 'lipsync',
  },
};

/**
 * Get model availability by ID
 * @param {string} modelId
 * @returns {ModelAvailability|null}
 */
export function getModelAvailability(modelId) {
  return modelAvailability[modelId] || null;
}

/**
 * Get all models for a specific category
 * @param {'image'|'video'|'lipsync'} category
 * @returns {Array<ModelAvailability>}
 */
export function getModelsByCategory(category) {
  return Object.values(modelAvailability).filter(m => m.category === category);
}

/**
 * Get all models supported by a provider
 * @param {string} providerId
 * @returns {Array<ModelAvailability>}
 */
export function getModelsByProvider(providerId) {
  return Object.values(modelAvailability).filter(m => m.providers[providerId]);
}

/**
 * Get providers that support a model
 * @param {string} modelId
 * @returns {Array<string>} Provider IDs
 */
export function getProvidersForModel(modelId) {
  const model = modelAvailability[modelId];
  if (!model) return [];
  return Object.keys(model.providers);
}

/**
 * Get recommended model for a use case
 * @param {string} useCase - 'fast', 'quality', 'video', 'lipsync', 'text', 'cinematic'
 * @param {string[]} availableProviders - Provider IDs with valid keys
 * @returns {ModelAvailability|null}
 */
export function getRecommendedModel(useCase, availableProviders) {
  const models = Object.values(modelAvailability);
  
  // Filter to models with at least one available provider
  const availableModels = models.filter(m => 
    Object.keys(m.providers).some(p => availableProviders.includes(p))
  );
  
  if (availableModels.length === 0) return null;
  
  // Score models based on use case
  const scored = availableModels.map(m => {
    let score = 0;
    const tags = m.tags || [];
    
    switch (useCase) {
      case 'fast':
        if (tags.includes('fast')) score += 10;
        if (tags.includes('free-tier')) score += 5;
        break;
      case 'quality':
        if (tags.includes('high-quality') || tags.includes('quality')) score += 10;
        if (tags.includes('detail')) score += 5;
        break;
      case 'video':
        if (m.category === 'video') score += 10;
        if (tags.includes('cinematic')) score += 5;
        break;
      case 'lipsync':
        if (m.category === 'lipsync') score += 10;
        if (tags.includes('high-quality')) score += 5;
        break;
      case 'text':
        if (tags.includes('text-rendering') || tags.includes('typography') || tags.includes('text')) score += 10;
        break;
      case 'cinematic':
        if (tags.includes('cinematic')) score += 10;
        if (m.category === 'video') score += 5;
        break;
    }
    
    return { model: m, score };
  });
  
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.model || null;
}

/**
 * Get all model IDs as a flat array
 * @returns {Array<string>}
 */
export function getAllModelIds() {
  return Object.keys(modelAvailability);
}

export default modelAvailability;