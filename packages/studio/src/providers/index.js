/**
 * Provider Registry
 * 
 * Central registration and lookup for all provider adapters.
 */

import kieAdapter from './kie/adapter.js';
import nvidiaAdapter from './nvidia/adapter.js';

// Provider registry
const providers = {
  kie: kieAdapter,
  nvidia: nvidiaAdapter,
  // Future providers can be added here:
  // fal: falAdapter,
  // replicate: replicateAdapter,
  // muapi: muapiAdapter,
};

/**
 * Get a provider adapter by ID
 * @param {string} id - Provider ID ('kie', 'nvidia', etc.)
 * @returns {ProviderAdapter|null}
 */
export function getProvider(id) {
  return providers[id] || null;
}

/**
 * List all registered providers
 * @returns {Array<ProviderAdapter>}
 */
export function listProviders() {
  return Object.values(providers);
}

/**
 * Get providers that support a specific capability
 * @param {string} capability - Capability name ('t2i', 'i2i', 't2v', 'i2v', 'lipsync', 'chat')
 * @returns {Array<ProviderAdapter>}
 */
export function getProvidersByCapability(capability) {
  return Object.values(providers).filter(p => p.capabilities[capability]);
}

/**
 * Check if a provider is registered
 * @param {string} id
 * @returns {boolean}
 */
export function hasProvider(id) {
  return id in providers;
}

/**
 * Register a new provider (for extensibility)
 * @param {ProviderAdapter} adapter
 */
export function registerProvider(adapter) {
  if (!adapter || !adapter.id) {
    throw new Error('Invalid adapter: missing id');
  }
  providers[adapter.id] = adapter;
}

export default {
  getProvider,
  listProviders,
  getProvidersByCapability,
  hasProvider,
  registerProvider,
};