/**
 * Prompt Enhancer Service
 * 
 * Uses NVIDIA NIM chat models to enhance user prompts into
 * cinematic Higgsfield-style prompts.
 */

import { getKey, hasKey } from '../providers/keyStore.js';
import { getProvider } from '../providers/index.js';

/**
 * System prompt for cinematic prompt enhancement
 */
const ENHANCEMENT_SYSTEM_PROMPT = `You are an expert cinematographer and prompt engineer for AI image/video generation.
Transform the user's prompt into a detailed, cinematic prompt optimized for Higgsfield-style generation.

Guidelines:
- Add camera details (camera type, lens, focal length, aperture)
- Add lighting details (lighting style, time of day, mood)
- Add composition details (rule of thirds, leading lines, framing)
- Add technical details (resolution, film stock, color grading)
- Keep the user's core subject and intent intact
- Make it specific and visual
- Output ONLY the enhanced prompt, no explanations`;

/**
 * Quick enhancement patterns for common scenarios
 */
const QUICK_ENHANCEMENTS = {
  portrait: 'professional portrait, 85mm lens, f/1.8, soft studio lighting, shallow depth of field, high detail skin texture, 8K',
  landscape: 'epic landscape, 24mm wide angle, f/11, golden hour lighting, deep focus, hyper-detailed, 8K resolution',
  cinematic: 'cinematic shot, 35mm anamorphic lens, f/2.8, dramatic lighting, color graded, film grain, 8K',
  product: 'product photography, 100mm macro, f/8, clean studio lighting, white background, ultra-sharp, 8K',
  night: 'night photography, 35mm f/1.4, neon lights, bokeh, long exposure, cinematic color grading, 8K',
};

/**
 * Enhance a prompt using NVIDIA NIM chat model
 * @param {string} prompt - User's original prompt
 * @param {string} [style] - Optional style hint ('portrait', 'landscape', 'cinematic', 'product', 'night')
 * @returns {Promise<string>} Enhanced prompt
 */
export async function enhancePrompt(prompt, style = null) {
  if (!prompt?.trim()) return prompt;
  
  // If no NVIDIA key, apply quick enhancement based on style
  if (!hasKey('nvidia')) {
    return applyQuickEnhancement(prompt, style);
  }
  
  try {
    const adapter = getProvider('nvidia');
    if (!adapter || typeof adapter.chat !== 'function') {
      return applyQuickEnhancement(prompt, style);
    }
    
    const messages = [
      { role: 'system', content: ENHANCEMENT_SYSTEM_PROMPT },
      { role: 'user', content: buildEnhancementPrompt(prompt, style) },
    ];
    
    const enhanced = await adapter.chat(getKey('nvidia'), messages);
    
    // Clean up the response
    return cleanEnhancedPrompt(enhanced);
  } catch (error) {
    console.warn('[PromptEnhancer] Enhancement failed, using fallback:', error.message);
    return applyQuickEnhancement(prompt, style);
  }
}

/**
 * Build the enhancement prompt for the chat model
 * @param {string} prompt
 * @param {string} style
 * @returns {string}
 */
function buildEnhancementPrompt(prompt, style) {
  let userPrompt = `Enhance this prompt for AI image generation: "${prompt}"`;
  
  if (style) {
    userPrompt += ` Style hint: ${style}.`;
  }
  
  userPrompt += ' Return only the enhanced prompt.';
  
  return userPrompt;
}

/**
 * Apply quick pattern-based enhancement (fallback)
 * @param {string} prompt
 * @param {string} style
 * @returns {string}
 */
function applyQuickEnhancement(prompt, style) {
  const base = prompt.trim();
  
  if (style && QUICK_ENHANCEMENTS[style]) {
    return `${base}, ${QUICK_ENHANCEMENTS[style]}`;
  }
  
  // Auto-detect style from prompt keywords
  const lower = base.toLowerCase();
  
  if (lower.includes('portrait') || lower.includes('face') || lower.includes('person')) {
    return `${base}, ${QUICK_ENHANCEMENTS.portrait}`;
  }
  if (lower.includes('landscape') || lower.includes('mountain') || lower.includes('sunset') || lower.includes('nature')) {
    return `${base}, ${QUICK_ENHANCEMENTS.landscape}`;
  }
  if (lower.includes('cinematic') || lower.includes('movie') || lower.includes('film') || lower.includes('scene')) {
    return `${base}, ${QUICK_ENHANCEMENTS.cinematic}`;
  }
  if (lower.includes('product') || lower.includes('object') || lower.includes('item')) {
    return `${base}, ${QUICK_ENHANCEMENTS.product}`;
  }
  if (lower.includes('night') || lower.includes('dark') || lower.includes('neon') || lower.includes('low light')) {
    return `${base}, ${QUICK_ENHANCEMENTS.night}`;
  }
  
  // Default enhancement
  return `${base}, professional photography, 8K resolution, highly detailed, cinematic lighting`;
}

/**
 * Clean up the enhanced prompt from chat response
 * @param {string} enhanced
 * @returns {string}
 */
function cleanEnhancedPrompt(enhanced) {
  return enhanced
    .trim()
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .replace(/^enhanced prompt:\s*/i, '') // Remove "Enhanced prompt:" prefix
    .replace(/^here is the enhanced prompt:\s*/i, '')
    .replace(/^the enhanced prompt is:\s*/i, '')
    .trim();
}

/**
 * Enhance prompt for video generation
 * @param {string} prompt
 * @returns {Promise<string>}
 */
export async function enhanceVideoPrompt(prompt) {
  if (!prompt?.trim()) return prompt;
  
  const videoSystemPrompt = `${ENHANCEMENT_SYSTEM_PROMPT}
  
For video generation, also include:
- Camera movement (static, pan, tilt, dolly, zoom, handheld)
- Motion description (subject movement, background motion)
- Duration feel (slow motion, real-time, timelapse)
- Transition style if applicable`;
  
  if (!hasKey('nvidia')) {
    return applyQuickVideoEnhancement(prompt);
  }
  
  try {
    const adapter = getProvider('nvidia');
    if (!adapter || typeof adapter.chat !== 'function') {
      return applyQuickVideoEnhancement(prompt);
    }
    
    const messages = [
      { role: 'system', content: videoSystemPrompt },
      { role: 'user', content: `Enhance this prompt for AI video generation: "${prompt}". Return only the enhanced prompt.` },
    ];
    
    const enhanced = await adapter.chat(getKey('nvidia'), messages);
    return cleanEnhancedPrompt(enhanced);
  } catch (error) {
    console.warn('[PromptEnhancer] Video enhancement failed:', error.message);
    return applyQuickVideoEnhancement(prompt);
  }
}

/**
 * Quick video enhancement fallback
 * @param {string} prompt
 * @returns {string}
 */
function applyQuickVideoEnhancement(prompt) {
  return `${prompt.trim()}, cinematic camera movement, smooth motion, high quality video, 4K, professional cinematography`;
}

export default {
  enhancePrompt,
  enhanceVideoPrompt,
};