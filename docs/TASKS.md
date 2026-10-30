# Open Higgsfield AI Studio - Refactoring Task Checklist

## Phase 1: Workflow Initialization

- [x] **Task 1.1**: Create `docs/ARCHITECTURE.md` with system design, adapter contract, proxy design
- [x] **Task 1.2**: Create `docs/TASKS.md` with detailed phase-by-phase checklist

## Phase 2: Server-Side Secure CORS Proxy

- [x] **Task 2.1**: Implement `app/api/proxy/[provider]/route.js`
  - [x] Dynamic route handling `POST` requests for provider forwarding
  - [x] Safe params handling: `const { provider } = await Promise.resolve(params);`
  - [x] NVIDIA handler: target `https://ai.api.nvidia.com/v1/genai/${model}`
  - [x] Extract client key from `x-provider-key` header (no logging/persistence)
  - [x] Forward payload, handle responses, format base64 → data URIs
  - [x] Kie handler: forward to Kie endpoints
  - [x] Uniform errors: `{ error: message }` with proper HTTP status
- [x] **Task 2.2**: Automated Route Verification
  - [x] Verify `NextResponse` imports
  - [x] Test error handling without server crashes

## Phase 3: Provider Adapter Engine (`packages/studio/src/providers/`)

- [x] **Task 3.1**: Create `packages/studio/src/providers/keyStore.js`
  - [x] `getKey(providerId)`, `setKey(providerId, key)`, `removeKey(providerId)`
  - [x] `getAllKeys()`, `hasKey(providerId)`
  - [x] Keys: `KEY_KIE`, `KEY_NVIDIA`, `KEY_MUAPI`, `KEY_REPLICATE`, `KEY_FAL`
  - [x] Legacy migration: `kie_key` → `KEY_KIE`
  - [x] SSR guards (`typeof window !== 'undefined'`)
- [x] **Task 3.2**: Create `packages/studio/src/providers/types.js`
  - [x] JSDoc `ProviderAdapter` interface specification
  - [x] `id`, `name`, `capabilities` (t2i, i2i, t2v, i2v, lipsync, chat)
  - [x] `validateKey(key)` → boolean
  - [x] `generateImage(key, params)` → `{ status: 'completed'|'pending', url?, taskId? }`
  - [x] `generateVideo(key, params)` → same
  - [x] `pollStatus(key, taskId)` → same
  - [x] `chat(key, messages)` → string
- [x] **Task 3.3**: Implement `packages/studio/src/providers/kie/adapter.js`
  - [x] Refactor existing `kie.js` logic into uniform adapter interface
  - [x] Handle async task polling normalization
- [x] **Task 3.4**: Implement `packages/studio/src/providers/nvidia/adapter.js`
  - [x] `generateImage`: route via `/api/proxy/nvidia` for FLUX.1-schnell / SD3
  - [x] Return instant `{ status: 'completed', url: dataUri }`
  - [x] `chat`: connect to NVIDIA chat completion (`meta/llama-3.1-70b-instruct`)
  - [x] `validateKey`: fast health-check for `nvapi-...` token validity
- [x] **Task 3.5**: Create `packages/studio/src/providers/index.js`
  - [x] Register `kie` and `nvidia` adapters
  - [x] Export `getProvider(id)`, `listProviders()`
  - [x] Export all from `packages/studio/src/index.js`

## Phase 4: Catalog & Model Availability (`packages/studio/src/catalog/`)

- [x] **Task 4.1**: Create `packages/studio/src/catalog/availability.js`
  - [x] Map 15 core models with provider availability and tags
  - [x] `flux-schnell`: NVIDIA (`black-forest-labs/flux.1-schnell`) & Kie, tags: `['fast', 'free-tier']`
  - [x] `sd3-medium`: NVIDIA (`stabilityai/stable-diffusion-3-medium`), tags: `['typography', 'fast']`
  - [x] `nano-banana-2`: Kie (`nano-banana-2`), tags: `['high-quality', 'detail']`
  - [x] `veo3`: Kie (`veo3`), tags: `['cinematic', 'video']`
  - [x] `kling-v2-1-pro`: Kie (`kling/v2-1-pro`), tags: `['cinematic', 'video']`
  - [x] `omnihuman-1-5`: Kie (`omnihuman-1-5`), tags: `['lipsync']`
- [x] **Task 4.2**: Create `packages/studio/src/services/router.js`
  - [x] Resolve adapter by: selected model ID → providers supporting model → active keys
  - [x] Throw `MissingKeyError({ provider, modelId })` if no key
  - [x] Handle sync vs async provider responses seamlessly
- [x] **Task 4.3**: Create `packages/studio/src/services/promptEnhancer.js`
  - [x] Connect to NVIDIA NIM chat model for prompt optimization
  - [x] Fall back gracefully if NVIDIA key not supplied

## Phase 5: UI & Settings Modal Upgrade

- [x] **Task 5.1**: Create `components/settings/ProviderSettingsModal.js`
  - [x] Replace legacy single-key modal
  - [x] Provider rows: NVIDIA, Kie, Replicate, Fal, Muapi
  - [x] Each row: badge, key input (password + show/hide), "Get API Key" link, "Test Key" button
  - [x] Test Key calls `adapter.validateKey()` with status indicator
  - [x] Save/Sync with `keyStore.js`
- [x] **Task 5.2**: Create `packages/studio/src/components/RecommendationBadge.jsx`
  - [x] Display badges: `[Free Credits Available]`, `[Best for Cinema]`, `[Key Required]`
- [x] **Task 5.3**: Update Studio Views
  - [x] `ImageStudio.jsx`: replace `kie.js` calls with `router.generateImage()`
  - [x] `VideoStudio.jsx`: replace `kie.js` calls with `router.generateVideo()`
  - [x] `LipSyncStudio.jsx`: replace `kie.js` calls with `router.generateVideo()` / lipsync
  - [x] Add "Enhance ✨" button near prompt inputs → `promptEnhancer.js`
  - [x] Catch `MissingKeyError` → open `ProviderSettingsModal` pre-focused on required provider

## Phase 6: Validation, Build Audit & Cleanup

- [x] **Task 6.1**: Run `npm run build` in root directory
- [x] **Task 6.2**: Inspect build output
  - [x] Fix any import mismatches
  - [x] Fix JSX errors
  - [x] Fix undefined variables
  - [x] Re-test until build passes with 0 errors
- [x] **Task 6.3**: Update Documentation
  - [x] Mark all completed items `[x]` in `docs/TASKS.md`
  - [x] Write summary of changes in `docs/RELEASE_NOTES.md`

---

## Progress Tracking

| Phase | Total Tasks | Completed | In Progress | Remaining |
|-------|-------------|-----------|-------------|-----------|
| 1 | 2 | 2 | 0 | 0 |
| 2 | 2 | 2 | 0 | 0 |
| 3 | 5 | 5 | 0 | 0 |
| 4 | 3 | 3 | 0 | 0 |
| 5 | 3 | 3 | 0 | 0 |
| 6 | 3 | 3 | 0 | 0 |
| **Total** | **18** | **18** | **0** | **0** |

---

## Notes

- Each task must pass `npm run build` verification before marking complete
- Never break existing monorepo core - work strictly in `packages/studio/` and `app/`/`components/`
- Properly export new services from `packages/studio/src/index.js`
- Sync vs async adapter normalization is critical for UI polling behavior