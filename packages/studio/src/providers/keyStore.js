/**
 * Key Store - Client-side API key management using localStorage
 * 
 * Keys:
 * - KEY_KIE: Kie.ai API key
 * - KEY_NVIDIA: NVIDIA NIM API key (nvapi-...)
 * - KEY_MUAPI: Muapi.ai API key
 * - KEY_FAL: Fal.ai API key
 * - KEY_REPLICATE: Replicate API token
 */

const STORAGE_KEYS = {
  KIE: 'KEY_KIE',
  NVIDIA: 'KEY_NVIDIA',
  MUAPI: 'KEY_MUAPI',
  FAL: 'KEY_FAL',
  REPLICATE: 'KEY_REPLICATE',
  // Legacy key for migration
  LEGACY_KIE: 'kie_key',
};

function isBrowser() {
  return typeof window !== 'undefined';
}

function safeGetItem(key) {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key, value) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore quota exceeded, private browsing, etc.
  }
}

function safeRemoveItem(key) {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
}

/**
 * Get API key for a provider
 * @param {'kie'|'nvidia'|'muapi'|'fal'|'replicate'} providerId
 * @returns {string|null}
 */
export function getKey(providerId) {
  const keyMap = {
    kie: STORAGE_KEYS.KIE,
    nvidia: STORAGE_KEYS.NVIDIA,
    muapi: STORAGE_KEYS.MUAPI,
    fal: STORAGE_KEYS.FAL,
    replicate: STORAGE_KEYS.REPLICATE,
  };
  
  const storageKey = keyMap[providerId];
  if (!storageKey) return null;
  
  // Check primary key
  let key = safeGetItem(storageKey);
  
  // Migration: if primary is empty but legacy kie_key exists, migrate it
  if (!key && providerId === 'kie') {
    const legacyKey = safeGetItem(STORAGE_KEYS.LEGACY_KIE);
    if (legacyKey) {
      key = legacyKey;
      safeSetItem(STORAGE_KEYS.KIE, legacyKey);
      safeRemoveItem(STORAGE_KEYS.LEGACY_KIE);
    }
  }
  
  return key;
}

/**
 * Set API key for a provider
 * @param {'kie'|'nvidia'|'muapi'|'fal'|'replicate'} providerId
 * @param {string} key
 */
export function setKey(providerId, key) {
  const keyMap = {
    kie: STORAGE_KEYS.KIE,
    nvidia: STORAGE_KEYS.NVIDIA,
    muapi: STORAGE_KEYS.MUAPI,
    fal: STORAGE_KEYS.FAL,
    replicate: STORAGE_KEYS.REPLICATE,
  };
  
  const storageKey = keyMap[providerId];
  if (!storageKey) return;
  
  if (key && key.trim()) {
    safeSetItem(storageKey, key.trim());
  } else {
    safeRemoveItem(storageKey);
  }
}

/**
 * Remove API key for a provider
 * @param {'kie'|'nvidia'|'muapi'|'fal'|'replicate'} providerId
 */
export function removeKey(providerId) {
  setKey(providerId, '');
}

/**
 * Get all stored keys
 * @returns {Object}
 */
export function getAllKeys() {
  return {
    kie: getKey('kie'),
    nvidia: getKey('nvidia'),
    muapi: getKey('muapi'),
    fal: getKey('fal'),
    replicate: getKey('replicate'),
  };
}

/**
 * Check if a provider has a valid key stored
 * @param {'kie'|'nvidia'|'muapi'|'fal'|'replicate'} providerId
 * @returns {boolean}
 */
export function hasKey(providerId) {
  const key = getKey(providerId);
  return !!key && key.trim().length > 0;
}

/**
 * Validate key format for a provider (basic client-side validation)
 * @param {'kie'|'nvidia'|'muapi'|'fal'|'replicate'} providerId
 * @param {string} key
 * @returns {boolean}
 */
export function validateKeyFormat(providerId, key) {
  if (!key || !key.trim()) return false;
  
  const trimmed = key.trim();
  
  switch (providerId) {
    case 'nvidia':
      // NVIDIA keys start with nvapi-
      return trimmed.startsWith('nvapi-') && trimmed.length > 10;
    case 'replicate':
      // Replicate tokens typically start with r8_
      return trimmed.startsWith('r8_') && trimmed.length > 10;
    case 'fal':
      // Fal keys are typically long alphanumeric
      return trimmed.length > 20;
    case 'kie':
    case 'muapi':
    default:
      // Generic validation - non-empty string of reasonable length
      return trimmed.length > 10;
  }
}