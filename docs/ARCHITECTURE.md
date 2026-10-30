# Open Higgsfield AI Studio - Multi-Provider Architecture

## Overview
This document describes the system architecture for transforming the hardcoded single-provider (Kie.ai) codebase into a modular, production-ready Multi-Provider BYOK (Bring Your Own Key) Studio supporting Kie.ai, NVIDIA NIM, Replicate, Fal.ai, and Muapi with an extensible adapter pattern, automatic CORS proxy, model availability router, and unified settings modal.

---

## 1. Storage Strategy

### localStorage Keys
| Key | Provider | Description |
|-----|----------|-------------|
| `KEY_KIE` | Kie.ai | Primary Kie.ai API key |
| `KEY_NVIDIA` | NVIDIA NIM | NVIDIA API key (format: `nvapi-...`) |
| `KEY_MUAPI` | Muapi.ai | Legacy Muapi key |
| `KEY_FAL` | Fal.ai | Fal.ai API key |
| `KEY_REPLICATE` | Replicate | Replicate API token |

### Migration Logic
- On first load, check for legacy `kie_key` in localStorage
- If found and `KEY_KIE` is empty, migrate: `KEY_KIE = localStorage.getItem('kie_key')`
- Remove legacy key after successful migration

### SSR Guards
All localStorage operations wrapped in:
```javascript
if (typeof window !== 'undefined') {
  // safe to access localStorage
}
```

---

## 2. Serverless Proxy Route

### Route: `app/api/proxy/[provider]/route.js`
Dynamic Next.js App Router route handling CORS and provider-specific forwarding.

#### Parameter Handling
```javascript
const { provider } = await Promise.resolve(params);
```

#### Provider Handlers

##### NVIDIA (`provider === 'nvidia'`)
- **Target URL**: `https://ai.api.nvidia.com/v1/genai/${model}`
- **Auth**: Extract client key from header `x-provider-key` (never logged/persisted)
- **Request**: Forward JSON payload with appropriate headers
- **Response**: 
  - For image generation: Convert base64 response to `data:image/png;base64,...` data URI
  - Return uniform `{ status: 'completed', url: 'data:image/png;base64,...' }`

##### Kie (`provider === 'kie'`)
- **Target URL**: `https://api.kie.ai/api/v1/jobs/createTask` (and polling endpoints)
- **Auth**: Bearer token from `x-provider-key` header
- **Request**: Forward payload with model slug and input
- **Response**: Normalize to `{ status: 'pending', taskId: '...' }` or `{ status: 'completed', url: '...' }`

#### Error Handling
- Uniform error response: `{ error: 'message' }` with appropriate HTTP status
- Never expose internal errors or stack traces
- Timeout handling for upstream requests

---

## 3. Adapter Pattern Contract

### File: `packages/studio/src/providers/types.js`

```javascript
/**
 * @typedef {Object} ProviderAdapter
 * @property {string} id - Unique provider identifier (e.g., 'kie', 'nvidia')
 * @property {string} name - Display name (e.g., 'Kie.ai', 'NVIDIA NIM')
 * @property {string[]} capabilities - Supported capabilities: ['t2i', 'i2i', 't2v', 'i2v', 'lipsync', 'chat']
 * @property {Function} validateKey - async (key: string) => boolean
 * @property {Function} generateImage - async (key: string, params: Object) => Promise<AdapterResult>
 * @property {Function} generateVideo - async (key: string, params: Object) => Promise<AdapterResult>
 * @property {Function} pollStatus - async (key: string, taskId: string) => Promise<AdapterResult>
 * @property {Function} chat - async (key: string, messages: Array) => Promise<string>
 */

/**
 * @typedef {Object} AdapterResult
 * @property {'completed'|'pending'} status
 * @property {string} [url] - Result URL (data URI for sync providers)
 * @property {string} [taskId] - Task ID for async providers
 * @property {Object} [raw] - Raw provider response for debugging
 */
```

### Normalization Rules
- **Sync providers (NVIDIA)**: Return `{ status: 'completed', url: 'data:image/png;base64,...' }` immediately
- **Async providers (Kie)**: Return `{ status: 'pending', taskId: '...' }` on submit, then poll via `pollStatus`
- **UI components** never enter infinite polling loop - they check `status` field

---

## 4. Router Logic

### File: `packages/studio/src/services/router.js`

#### Model Availability Map (`catalog/availability.js`)
Maps 15 core models to providers with tags and recommendations:

| Model ID | Providers | Tags | Recommendation |
|----------|-----------|------|----------------|
| `flux-schnell` | NVIDIA (`black-forest-labs/flux.1-schnell`), Kie | `['fast', 'free-tier']` | Fastest generation with free credits |
| `sd3-medium` | NVIDIA (`stabilityai/stable-diffusion-3-medium`) | `['typography', 'fast']` | Best for text rendering |
| `nano-banana-2` | Kie (`nano-banana-2`) | `['high-quality', 'detail']` | Highest detail quality |
| `veo3` | Kie (`veo3`) | `['cinematic', 'video']` | Cinematic video generation |
| `kling-v2-1-pro` | Kie (`kling/v2-1-pro`) | `['cinematic', 'video']` | Professional video |
| `omnihuman-1-5` | Kie (`omnihuman-1-5`) | `['lipsync']` | Best lip-sync quality |

#### Resolution Algorithm
```javascript
function resolveProvider(modelId) {
  const model = availability[modelId];
  if (!model) throw new Error(`Unknown model: ${modelId}`);
  
  // Priority: NVIDIA (free tier) > Kie > others
  for (const providerId of model.providers) {
    if (keyStore.hasKey(providerId)) return providerId;
  }
  
  // No key available - throw structured error
  throw new MissingKeyError({ 
    provider: model.providers[0], 
    modelId 
  });
}
```

#### MissingKeyError
```javascript
class MissingKeyError extends Error {
  constructor({ provider, modelId }) {
    super(`Missing API key for ${provider} to use ${modelId}`);
    this.name = 'MissingKeyError';
    this.provider = provider;
    this.modelId = modelId;
  }
}
```

---

## 5. Prompt Enhancer

### File: `packages/studio/src/services/promptEnhancer.js`
- Connects to NVIDIA NIM chat model (`meta/llama-3.1-70b-instruct`)
- Transforms user prompts into cinematic Higgsfield-style prompts
- Graceful fallback if NVIDIA key not available (returns original prompt)

---

## 6. UI Components

### ProviderSettingsModal
Replaces legacy single-key modal with multi-provider management:
- Provider rows: NVIDIA, Kie, Replicate, Fal, Muapi
- Each row: badge, key input (password + show/hide), "Get API Key" link, "Test Key" button
- Test Key calls `adapter.validateKey()` with status indicator

### RecommendationBadge
Displays contextual badges:
- `[Free Credits Available]`
- `[Best for Cinema]`
- `[Key Required]`

### Studio View Updates
- `ImageStudio`, `VideoStudio`, `LipSyncStudio` use `router.generateImage/Video/LipSync`
- "Enhance ✨" button near prompt inputs wired to `promptEnhancer`
- Catch `MissingKeyError` → open `ProviderSettingsModal` pre-focused on required provider

---

## 7. Export Structure

### `packages/studio/src/index.js`
```javascript
// Provider system
export * from './providers';
export * from './providers/keyStore';
export * from './providers/types';
export { getProvider, listProviders } from './providers/index';

// Catalog & Router
export * from './catalog/availability';
export * from './services/router';
export * from './services/promptEnhancer';

// Components (existing)
export { default as ImageStudio } from './components/ImageStudio';
export { default as VideoStudio } from './components/VideoStudio';
export { default as LipSyncStudio } from './components/LipSyncStudio';
export { default as CinemaStudio } from './components/CinemaStudio';
```

---

## 8. File Structure

```
packages/studio/src/
├── index.js                    # Main exports
├── providers/
│   ├── index.js                # Provider registry
│   ├── keyStore.js             # localStorage management
│   ├── types.js                # Adapter interface (JSDoc)
│   ├── kie/
│   │   └── adapter.js          # Kie.ai adapter
│   └── nvidia/
│       └── adapter.js          # NVIDIA NIM adapter
├── catalog/
│   └── availability.js         # Model ↔ Provider map
├── services/
│   ├── router.js               # Provider resolution
│   └── promptEnhancer.js       # NVIDIA chat prompt enhancement
├── components/
│   ├── ImageStudio.jsx
│   ├── VideoStudio.jsx
│   ├── LipSyncStudio.jsx
│   ├── CinemaStudio.jsx
│   └── RecommendationBadge.jsx
└── models.js                   # Model definitions (existing)
```

---

## 9. Key Privacy & Security

- **Zero Logging**: Proxy route never logs API keys or request headers
- **Client-Side Keys**: All keys stored exclusively in browser `localStorage`
- **Header Forwarding**: Client sends key via `x-provider-key` header (not in body)
- **No Persistence**: Server never stores keys, only forwards requests

---

## 10. Backward Compatibility

- Legacy `kie_key` automatically migrated to `KEY_KIE`
- Existing `ApiKeyModal` replaced by `ProviderSettingsModal`
- All existing studio components continue working via router abstraction