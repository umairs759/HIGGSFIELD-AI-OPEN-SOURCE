/**
 * Provider Adapter Interface Specification
 * 
 * All provider adapters must implement this interface for uniform consumption
 * by the router and UI components.
 * 
 * @module providers/types
 */

/**
 * @typedef {Object} ProviderCapabilities
 * @property {boolean} t2i - Text-to-Image
 * @property {boolean} i2i - Image-to-Image
 * @property {boolean} t2v - Text-to-Video
 * @property {boolean} i2v - Image-to-Video
 * @property {boolean} v2v - Video-to-Video
 * @property {boolean} lipsync - Lip Sync
 * @property {boolean} chat - Chat Completion (for prompt enhancement)
 */

/**
 * @typedef {Object} AdapterResult
 * @property {'completed'|'pending'} status - Generation status
 * @property {string} [url] - Result URL (data URI for sync providers, HTTPS for async)
 * @property {string} [taskId] - Task ID for async providers (polling)
 * @property {string} [content] - Text content for chat completions
 * @property {Object} [raw] - Raw provider response for debugging
 * @property {Error} [error] - Error if failed
 */

/**
 * @typedef {Object} ProviderAdapter
 * @property {string} id - Unique provider identifier (e.g., 'kie', 'nvidia', 'fal', 'replicate', 'muapi')
 * @property {string} name - Display name (e.g., 'Kie.ai', 'NVIDIA NIM')
 * @property {ProviderCapabilities} capabilities - Supported capabilities
 * @property {Function} validateKey - Validate API key format and connectivity
 *   @param {string} key - API key to validate
 *   @returns {Promise<boolean>} True if valid
 * @property {Function} generateImage - Generate image
 *   @param {string} key - API key
 *   @param {Object} params - Generation parameters
 *   @param {string} params.model - Model ID
 *   @param {string} [params.prompt] - Text prompt
 *   @param {string} [params.image_url] - Input image URL (for i2i)
 *   @param {string[]} [params.images_list] - Input image URLs
 *   @param {string} [params.aspect_ratio] - Aspect ratio
 *   @param {string|number} [params.width] - Width
 *   @param {string|number} [params.height] - Height
 *   @param {string} [params.resolution] - Resolution
 *   @param {number} [params.seed] - Seed
 *   @param {Function} [params.onRequestId] - Callback for task ID (async providers)
 *   @returns {Promise<AdapterResult>} Normalized result
 * @property {Function} generateVideo - Generate video
 *   @param {string} key - API key
 *   @param {Object} params - Generation parameters
 *   @param {string} params.model - Model ID
 *   @param {string} [params.prompt] - Text prompt
 *   @param {string} [params.image_url] - Input image URL (for i2v)
 *   @param {string} [params.video_url] - Input video URL (for v2v)
 *   @param {string} [params.aspect_ratio] - Aspect ratio
 *   @param {number} [params.duration] - Duration in seconds
 *   @param {string} [params.resolution] - Resolution
 *   @param {string} [params.quality] - Quality preset
 *   @param {string} [params.mode] - Generation mode
 *   @param {Function} [params.onRequestId] - Callback for task ID
 *   @returns {Promise<AdapterResult>} Normalized result
 * @property {Function} [pollStatus] - Poll for async task status
 *   @param {string} key - API key
 *   @param {string} taskId - Task ID from generateImage/generateVideo
 *   @returns {Promise<AdapterResult>} Normalized result
 * @property {Function} [chat] - Chat completion (for prompt enhancement)
 *   @param {string} key - API key
 *   @param {Array<Object>} messages - Chat messages [{role, content}]
 *   @returns {Promise<string>} Generated text content
 */

/**
 * Normalization Rules for Adapter Implementations:
 * 
 * 1. SYNC PROVIDERS (NVIDIA NIM):
 *    - Return immediately: { status: 'completed', url: 'data:image/png;base64,...' }
 *    - No polling needed - UI components check status === 'completed'
 * 
 * 2. ASYNC PROVIDERS (Kie.ai, Replicate, Fal):
 *    - generateImage/Video returns: { status: 'pending', taskId: '...' }
 *    - Call pollStatus(key, taskId) repeatedly until status === 'completed' or error
 *    - pollStatus returns: { status: 'completed', url: 'https://...' } or { status: 'pending' }
 * 
 * 3. ERROR HANDLING:
 *    - Throw errors for network/auth failures
 *    - Return { status: 'completed', error: Error } for generation failures
 *    - Never return undefined/null - always return AdapterResult object
 * 
 * 4. CHAT COMPLETIONS:
 *    - Only required for providers supporting prompt enhancement (NVIDIA)
 *    - Return plain string content
 *    - Throw on failure
 */

/**
 * @typedef {Object} MissingKeyError
 * @property {string} name - 'MissingKeyError'
 * @property {string} provider - Provider ID that needs a key
 * @property {string} modelId - Model ID that was requested
 * @property {string} message - Human-readable error message
 */

/**
 * Creates a MissingKeyError
 * @param {Object} params
 * @param {string} params.provider
 * @param {string} params.modelId
 * @returns {MissingKeyError}
 */
export function createMissingKeyError({ provider, modelId }) {
  const error = new Error(`Missing API key for ${provider} to use model ${modelId}`);
  error.name = 'MissingKeyError';
  error.provider = provider;
  error.modelId = modelId;
  return error;
}

/**
 * Checks if an error is a MissingKeyError
 * @param {Error} error
 * @returns {boolean}
 */
export function isMissingKeyError(error) {
  return error && error.name === 'MissingKeyError';
}