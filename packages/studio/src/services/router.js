/**
 * Model Router Service
 * 
 * Resolves which provider adapter to use based on:
 * 1. Selected model ID
 * 2. Providers supporting that model (from availability catalog)
 * 3. Active API keys in keyStore
 */

import { getProvider, listProviders } from '../providers/index.js';
import { getKey, hasKey } from '../providers/keyStore.js';
import { 
  getModelAvailability, 
  getProvidersForModel,
  getRecommendedModel 
} from '../catalog/availability.js';
import { createMissingKeyError, isMissingKeyError } from '../providers/types.js';
// Import uploadFile from kie adapter
import kieAdapter from '../providers/kie/adapter.js';

// Named export for uploadFile
export const uploadFile = kieAdapter.uploadFile.bind(kieAdapter);

/**
 * Custom error for missing API keys
 */
export class MissingKeyError extends Error {
  constructor({ provider, modelId }) {
    super(`Missing API key for ${provider} to use model ${modelId}`);
    this.name = 'MissingKeyError';
    this.provider = provider;
    this.modelId = modelId;
  }
}

/**
 * Resolve the best provider for a model based on available keys
 * @param {string} modelId - Model identifier
 * @returns {Object} { provider, adapter, modelAvailability }
 * @throws {MissingKeyError} If no provider has a valid key
 */
export function resolveProvider(modelId) {
  const modelInfo = getModelAvailability(modelId);
  
  if (!modelInfo) {
    throw new Error(`Unknown model: ${modelId}`);
  }
  
  const providerIds = getProvidersForModel(modelId);
  
  // Find first provider with valid key
  for (const providerId of providerIds) {
    if (hasKey(providerId)) {
      const adapter = getProvider(providerId);
      if (adapter) {
        return {
          provider: providerId,
          adapter,
          modelAvailability: modelInfo,
          providerModelId: modelInfo.providers[providerId],
        };
      }
    }
  }
  
  // No key available - throw structured error for UI to handle
  const preferredProvider = providerIds[0];
  throw new MissingKeyError({ 
    provider: preferredProvider, 
    modelId 
  });
}

/**
 * Get all providers with valid keys
 * @returns {Array<string>} Provider IDs
 */
export function getActiveProviders() {
  return listProviders()
    .filter(p => hasKey(p.id))
    .map(p => p.id);
}

/**
 * Generate image using the best available provider
 * @param {string} modelId - Model identifier
 * @param {Object} params - Generation parameters
 * @returns {Promise<AdapterResult>}
 */
export async function generateImage(modelId, params) {
  const { adapter, providerModelId } = resolveProvider(modelId);
  
  // Map model ID to provider-specific model ID
  const providerParams = { ...params, model: providerModelId };
  
  return adapter.generateImage(getKey(adapter.id), providerParams);
}

/**
 * Generate image-to-image using the best available provider
 * @param {string} modelId - Model identifier
 * @param {Object} params - Generation parameters
 * @returns {Promise<AdapterResult>}
 */
export async function generateI2I(modelId, params) {
  const { adapter, providerModelId } = resolveProvider(modelId);
  
  const providerParams = { ...params, model: providerModelId };
  
  if (typeof adapter.generateI2I === 'function') {
    return adapter.generateI2I(getKey(adapter.id), providerParams);
  }
  
  // Fallback to generateImage if i2i not explicitly supported
  return adapter.generateImage(getKey(adapter.id), providerParams);
}

/**
 * Generate video using the best available provider
 * @param {string} modelId - Model identifier
 * @param {Object} params - Generation parameters
 * @returns {Promise<AdapterResult>}
 */
export async function generateVideo(modelId, params) {
  const { adapter, providerModelId } = resolveProvider(modelId);
  
  const providerParams = { ...params, model: providerModelId };
  
  return adapter.generateVideo(getKey(adapter.id), providerParams);
}

/**
 * Generate image-to-video using the best available provider
 * @param {string} modelId - Model identifier
 * @param {Object} params - Generation parameters
 * @returns {Promise<AdapterResult>}
 */
export async function generateI2V(modelId, params) {
  const { adapter, providerModelId } = resolveProvider(modelId);
  
  const providerParams = { ...params, model: providerModelId };
  
  if (typeof adapter.generateI2V === 'function') {
    return adapter.generateI2V(getKey(adapter.id), providerParams);
  }
  
  return adapter.generateVideo(getKey(adapter.id), providerParams);
}

/**
 * Process lip sync using the best available provider
 * @param {string} modelId - Model identifier
 * @param {Object} params - Generation parameters
 * @returns {Promise<AdapterResult>}
 */
export async function processLipSync(modelId, params) {
  const { adapter, providerModelId } = resolveProvider(modelId);
  
  const providerParams = { ...params, model: providerModelId };
  
  if (typeof adapter.processLipSync === 'function') {
    return adapter.processLipSync(getKey(adapter.id), providerParams);
  }
  
  throw new Error(`Provider ${adapter.id} does not support lip sync`);
}

/**
 * Poll for async task status
 * @param {string} providerId - Provider ID
 * @param {string} taskId - Task ID
 * @returns {Promise<AdapterResult>}
 */
export async function pollStatus(providerId, taskId) {
  const adapter = getProvider(providerId);
  if (!adapter) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  
  if (typeof adapter.pollStatus !== 'function') {
    // Sync provider - return completed immediately
    return { status: 'completed', error: new Error('Provider is synchronous') };
  }
  
  return adapter.pollStatus(getKey(providerId), taskId);
}

/**
 * Get recommended model for a use case based on available keys
 * @param {string} useCase - Use case identifier
 * @returns {Object|null} Model availability info or null
 */
export function getRecommendation(useCase) {
  const activeProviders = getActiveProviders();
  return getRecommendedModel(useCase, activeProviders);
}

/**
 * Check if a model is available (has at least one provider with key)
 * @param {string} modelId
 * @returns {boolean}
 */
export function isModelAvailable(modelId) {
  const providerIds = getProvidersForModel(modelId);
  return providerIds.some(id => hasKey(id));
}

/**
 * Get availability status for all models
 * @returns {Array<Object>} Model availability with status
 */
export function getAllModelsStatus() {
  const activeProviders = getActiveProviders();
  
  return Object.entries(
    Object.fromEntries(
      Object.entries(
        Object.fromEntries(
          Object.entries(
            Object.entries(
              Object.entries(
                Object.entries(
                  Object.entries({})
                )
              )
            )
          )
        )
      )
    )
  ).map(([id, info]) => {
    const available = getProvidersForModel(id).some(p => activeProviders.includes(p));
    return {
      ...info,
      available,
      activeProvider: getProvidersForModel(id).find(p => activeProviders.includes(p)) || null,
    };
  });
}

export default {
  resolveProvider,
  getActiveProviders,
  generateImage,
  generateI2I,
  generateVideo,
  generateI2V,
  processLipSync,
  pollStatus,
  getRecommendation,
  isModelAvailable,
  getAllModelsStatus,
  MissingKeyError,
  isMissingKeyError,
};