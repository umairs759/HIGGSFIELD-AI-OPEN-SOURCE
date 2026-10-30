# 🎬 HIGGSFIELD-AI-Open-Source

> **The extensible, multi-provider open-source creative studio for generative AI images, cinematic videos, lip sync, and prompt intelligence — without vendor lock-in or mandatory subscriptions.**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![Providers](https://img.shields.io/badge/Providers-NVIDIA%20NIM%20%7C%20Kie.ai%20%7C%20Replicate%20%7C%20Fal-blue.svg)]()

---

## 🌟 Overview

**HIGGSFIELD-AI-Open-Source** is an upgraded, production-ready alternative to proprietary AI video and image generation platforms. Built with Next.js 14, it introduces a unified **Multi-Provider BYOK (Bring Your Own Key)** architecture.

Instead of binding workflows to a single paid API gateway, users can plug in their own keys from **NVIDIA NIM (Free 1,000 Credits)**, **Kie.ai**, **Replicate**, and **Fal.ai**, managing all generative tasks through a unified studio interface.

---

## ✨ Key Features

- **Multi-Provider BYOK Architecture:** Bring your own API keys. No subscriptions or hidden usage fees.
- **NVIDIA NIM Native Integration:** Access FLUX.1 Schnell and Stable Diffusion 3 using free developer credits from NVIDIA build.
- **Smart Catalog & Router:** Dynamic model resolution via `availability.js` that lights up unlocked models based on configured active keys.
- **AI Prompt Enhancer ✨:** Integrated with NVIDIA Llama-3.1-70B to transform simple inputs into rich, cinematic Higgsfield-grade prompts.
- **Normalized Sync/Async Execution:** Seamlessly unifies instant synchronous base64 payloads (NVIDIA) and asynchronous task polling (Kie.ai / Replicate).
- **Stateless Zero-Logging CORS Proxy:** Client keys stay exclusively in browser `localStorage`. Forwarded requests pass through a stateless proxy route with zero persistence or logging.

---

## 🎨 Creative Studios

| Studio | Capabilities | Supported Models |
| :--- | :--- | :--- |
| **Image Studio** | Text-to-Image & Image-to-Image | FLUX.1 Schnell, SD3 Medium, Nano Banana 2, Midjourney |
| **Video Studio** | Text-to-Video & Image-to-Video | Kling 2.1, Veo 3, Wan 2.1, Seedance 2.0 |
| **Lip Sync Studio** | Talking portraits & audio sync | OmniHuman 1.5, Infinite Talk, LTX Lipsync |
| **Cinema Studio** | Virtual camera parameters | Focal Length, Aperture, Cinematic Film Presets |

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- Git installed on your system

### Installation & Launch

```bash
# 1. Clone the repository
git clone https://github.com/umairs759/-HIGGSFIELD-AI-OPEN-SOURCE.git
cd -HIGGSFIELD-AI-OPEN-SOURCE

# 2. Install workspace dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 API Key Configuration

Access the **Settings / Key** modal on the top-right corner of the interface:

1. **NVIDIA NIM:** Obtain an API key from [build.nvidia.com](https://build.nvidia.com) to access free compute tiers.
2. **Kie.ai / Replicate / Fal.ai:** Provide tokens for video and lip-sync generation models.
3. Save configurations. All keys persist solely inside browser `localStorage`.

---

## 🏗️ Architecture

```text
Studio UI (Image / Video / Lipsync / Cinema)
                   │
                   ▼
       Catalog & Router (availability.js)
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
   NVIDIA Adapter       Kie / Replicate Adapter
         │                   │
         ▼                   ▼
/api/proxy/nvidia      /api/proxy/kie
         │                   │
  ai.api.nvidia.com    api.kie.ai
```

---

## 🛡️ Security & Privacy

* **Client-Side Storage:** Keys are referenced strictly from browser storage (`KEY_NVIDIA`, `KEY_KIE`, etc.).
* **Stateless Proxy:** The Next.js API route (`app/api/proxy/[provider]/route.js`) forwards payload headers to bypass CORS limits without retaining credentials.

---

## 👤 Author

* **Muhammad Umair**
* GitHub: [@umairs759](https://github.com/umairs759)
* Email: [umairghaffar759@gmail.com](mailto:umairghaffar759@gmail.com)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).