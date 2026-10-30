"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  getAllKeys, 
  setKey, 
  removeKey, 
  hasKey, 
  validateKeyFormat 
} from 'studio/providers/keyStore';
import { getProvider, listProviders } from 'studio/providers/index';

const PROVIDER_CONFIG = {
  nvidia: {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    badge: 'NVIDIA',
    badgeColor: 'bg-green-500/20 text-green-400 border-green-500/50',
    keyPrefix: 'nvapi-',
    keyPlaceholder: 'nvapi-xxxxxxxxxxxxxxxx',
    getKeyUrl: 'https://build.nvidia.com/explore/discover',
    description: 'Free tier credits for FLUX, SD3, and Llama models',
    capabilities: ['t2i', 'chat'],
  },
  kie: {
    id: 'kie',
    name: 'Kie.ai',
    badge: 'KIE',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    getKeyUrl: 'https://kie.ai',
    description: 'Comprehensive video, image, and lip-sync models',
    capabilities: ['t2i', 'i2i', 't2v', 'i2v', 'lipsync'],
  },
  replicate: {
    id: 'replicate',
    name: 'Replicate',
    badge: 'REP',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    keyPrefix: 'r8_',
    keyPlaceholder: 'r8_xxxxxxxxxxxxxxxx',
    getKeyUrl: 'https://replicate.com/account/api-tokens',
    description: 'Run open-source models in the cloud',
    capabilities: ['t2i', 't2v', 'i2v'],
  },
  fal: {
    id: 'fal',
    name: 'Fal.ai',
    badge: 'FAL',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    keyPlaceholder: 'xxxxxxxxxxxxxxxxxxxx',
    getKeyUrl: 'https://fal.ai/dashboard/keys',
    description: 'Fast inference for FLUX, SDXL, and video models',
    capabilities: ['t2i', 't2v'],
  },
  muapi: {
    id: 'muapi',
    name: 'Muapi.ai',
    badge: 'MUA',
    badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
    keyPlaceholder: 'xxxxxxxxxxxxxxxxxxxx',
    getKeyUrl: 'https://muapi.ai',
    description: 'Unified API for multiple AI providers',
    capabilities: ['t2i', 't2v', 'i2v'],
  },
};

const CAPABILITY_LABELS = {
  t2i: 'Text→Image',
  i2i: 'Image→Image',
  t2v: 'Text→Video',
  i2v: 'Image→Video',
  v2v: 'Video→Video',
  lipsync: 'Lip Sync',
  chat: 'Chat/Prompt Enhance',
};

export default function ProviderSettingsModal({ isOpen, onClose, onKeysChange }) {
  const [keys, setKeys] = useState({});
  const [showKey, setShowKey] = useState({});
  const [testing, setTesting] = useState({});
  const [testResults, setTestResults] = useState({});
  const [saving, setSaving] = useState(false);

  // Load keys on open
  useEffect(() => {
    if (isOpen) {
      setKeys(getAllKeys());
      setTestResults({});
      setTesting({});
    }
  }, [isOpen]);

  const handleKeyChange = useCallback((providerId, value) => {
    setKeys(prev => ({ ...prev, [providerId]: value }));
    // Clear test result when key changes
    setTestResults(prev => ({ ...prev, [providerId]: null }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      Object.entries(keys).forEach(([providerId, key]) => {
        if (key && key.trim()) {
          setKey(providerId, key.trim());
        } else {
          removeKey(providerId);
        }
      });
      onKeysChange?.(getAllKeys());
      onClose?.();
    } finally {
      setSaving(false);
    }
  }, [keys, onKeysChange, onClose]);

  const handleTestKey = useCallback(async (providerId) => {
    const key = keys[providerId];
    if (!key?.trim()) return;
    
    const config = PROVIDER_CONFIG[providerId];
    if (!validateKeyFormat(providerId, key.trim())) {
      setTestResults(prev => ({ ...prev, [providerId]: { valid: false, message: 'Invalid key format' } }));
      return;
    }

    setTesting(prev => ({ ...prev, [providerId]: true }));
    setTestResults(prev => ({ ...prev, [providerId]: { valid: null, message: 'Testing...' } }));

    try {
      const adapter = getProvider(providerId);
      if (adapter && typeof adapter.validateKey === 'function') {
        const valid = await adapter.validateKey(key.trim());
        setTestResults(prev => ({ 
          ...prev, 
          [providerId]: { 
            valid, 
            message: valid ? 'Key is valid ✓' : 'Key validation failed' 
          } 
        }));
      } else {
        // Format-only validation
        const valid = validateKeyFormat(providerId, key.trim());
        setTestResults(prev => ({ 
          ...prev, 
          [providerId]: { 
            valid, 
            message: valid ? 'Format valid (connectivity not tested)' : 'Invalid format' 
          } 
        }));
      }
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [providerId]: { valid: false, message: error.message.slice(0, 50) } 
      }));
    } finally {
      setTesting(prev => ({ ...prev, [providerId]: false }));
    }
  }, [keys]);

  const handleRemoveKey = useCallback((providerId) => {
    setKeys(prev => ({ ...prev, [providerId]: '' }));
    setTestResults(prev => ({ ...prev, [providerId]: null }));
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  const providerEntries = Object.entries(PROVIDER_CONFIG);

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 id="settings-title" className="text-xl font-black text-white">API Keys & Providers</h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors p-1"
            aria-label="Close settings"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Provider List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {providerEntries.map(([providerId, config]) => {
            const key = keys[providerId] || '';
            const isVisible = showKey[providerId];
            const isTesting = testing[providerId];
            const testResult = testResults[providerId];
            const hasValidKey = hasKey(providerId);

            return (
              <div 
                key={providerId} 
                className={`bg-white/5 rounded-2xl p-4 border transition-all ${
                  hasValidKey ? 'border-primary/30 bg-primary/5' : 'border-white/10'
                }`}
              >
                {/* Provider Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.badgeColor}`}>
                    {config.badge}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{config.name}</h3>
                    <p className="text-xs text-white/50">{config.description}</p>
                  </div>
                  {hasValidKey && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-full border border-green-500/50">
                      Active
                    </span>
                  )}
                </div>

                {/* Key Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={isVisible ? 'text' : 'password'}
                      value={key}
                      onChange={(e) => handleKeyChange(providerId, e.target.value)}
                      placeholder={config.keyPlaceholder}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors pr-12"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(prev => ({ ...prev, [providerId]: !prev[providerId] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                      aria-label={isVisible ? 'Hide key' : 'Show key'}
                    >
                      {isVisible ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {config.keyPrefix && key && !key.startsWith(config.keyPrefix) && (
                    <p className="text-xs text-yellow-400">Expected prefix: <code>{config.keyPrefix}</code></p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleTestKey(providerId)}
                      disabled={isTesting || !key.trim() || saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all border border-primary/20 disabled:opacity-50"
                    >
                      {isTesting ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                            <path d="M12 2v4" strokeOpacity="1" />
                          </svg>
                          Testing...
                        </>
                      ) : (
                        'Test Key'
                      )}
                    </button>

                    {key && (
                      <button
                        type="button"
                        onClick={() => handleRemoveKey(providerId)}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all border border-red-500/20"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        Remove
                      </button>
                    )}

                    <a
                      href={config.getKeyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-xs font-bold transition-all border border-white/10"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      Get Key
                    </a>
                  </div>

                  {/* Test Result */}
                  {testResult && (
                    <div className={`mt-2 px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 ${
                      testResult.valid === true 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : testResult.valid === false 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {testResult.valid === true ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : testResult.valid === false ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                          <path d="M12 2v4" strokeOpacity="1" />
                        </svg>
                      )}
                      <span>{testResult.message}</span>
                    </div>
                  )}

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
                    {config.capabilities.map(cap => (
                      <span 
                        key={cap} 
                        className="px-2 py-0.5 bg-white/5 text-white/60 text-[10px] font-medium rounded-full border border-white/10"
                        title={CAPABILITY_LABELS[cap] || cap}
                      >
                        {CAPABILITY_LABELS[cap] || cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-primary text-black rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save All Keys'}
          </button>
        </div>
      </div>
    </div>
  );
}