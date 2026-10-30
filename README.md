# 🎬 HIGGSFIELD-AI-Open-Source

> **The ultimate multi-provider, open-source creative studio for Generative AI images, cinematic videos, lip sync, and prompt enhancement — Zero subscription lock-in with Bring Your Own Key (BYOK) architecture.**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![Providers](https://img.shields.io/badge/Providers-NVIDIA%20NIM%20%7C%20Kie.ai%20%7C%20Replicate%20%7C%20Fal.ai%20%7C%20Muapi-blue.svg)]()

---

## 🌟 Overview

**HIGGSFIELD-AI-Open-Source** is an open-source, vendor-agnostic powerhouse designed to replace closed, paid platforms like Higgsfield AI. Built on Next.js 14, this studio provides a plug-and-play **Multi-Provider BYOK (Bring Your Own Key)** architecture.

Chahe aapke paas **NVIDIA NIM ke free 1,000 credits** hon, ya **Kie.ai**, **Replicate**, **Fal.ai**, ya **Muapi** ki API keys — bas settings mein apni keys dalein aur corresponding state-of-the-art AI models instantly unlock ho jayenge!

---

## ⚡ Supported AI Providers & Model Ecosystem

Aapko kisi ek paid service ka mohtaaj nahi rehna padega. Aapke paas jis provider ki API key hai, aap woh use kar sakte hain:

### 1. 🟢 NVIDIA NIM (Free Compute Tier)
* **API Key:** `nvapi-...` ([Get 1,000 Free Credits on build.nvidia.com](https://build.nvidia.com))
* **FLUX.1 Schnell** — Ultra-fast text-to-image with zero generation cost.
* **Stable Diffusion 3 Medium (SD3)** — Great typography and detailed image composition.
* **Llama 3.1 70B Instruct** — Native AI prompt enhancer for cinematic prompt engineering.

### 2. 🟣 Kie.ai & Muapi.ai (Cinematic Video & Lip Sync Engine)
* **Kling v2.1 Pro / Kling v3** — Hyper-realistic cinematic video generation with dynamic camera motion.
* **Google Veo 3** — High-definition cinematic shots with pro lighting controls.
* **ByteDance Seedance 2.0** — Fast text-to-video and image-to-video animation.
* **Nano Banana 2 & Nano Banana Pro** — Detailed portrait generations and multi-image editing.
* **OmniHuman 1.5 & Infinite Talk (I2V / V2V)** — Studio-grade audio-driven facial and lip sync animations.
* **LTX Lipsync (LTX 2.3 / LTX 2 19B)** — Fast audio-to-video synchronizer.

### 3. 🔵 Replicate & Fal.ai (Open-Source Weights & Fast Inference)
* **Wan 2.1 / Wan 2.2 Video (14B)** — State-of-the-art open-weights cinema video generation.
* **FLUX.1 Dev** — Photorealistic, commercial-grade text-to-image synthesis.
* **Midjourney v7 & SDXL Lightning** — Fast artistic styling and high-resolution rendering.

---

## 🎨 Creative Studios

| Studio | Capabilities | Supported Models & Providers |
| :--- | :--- | :--- |
| **🖼️ Image Studio** | Text-to-Image & Image-to-Image (Multi-reference support) | **FLUX.1 Schnell** (NVIDIA), **SD3 Medium** (NVIDIA), **FLUX.1 Dev** (Replicate), **Nano Banana 2** (Kie/Muapi), **Midjourney v7** |
| **🎬 Video Studio** | Text-to-Video & Image-to-Video (Start frame animation) | **Wan 2.1/2.2 (14B)** (Replicate), **Kling v2.1/v3** (Kie), **Google Veo 3** (Kie), **Seedance 2.0** (Kie) |
| **🎙️ Lip Sync Studio** | Audio-driven talking portraits & Video-to-Video lip sync | **OmniHuman 1.5** (Kie), **Infinite Talk** (Kie/Muapi), **LTX Lipsync 2.3** (Kie) |
| **🎥 Cinema Studio** | Virtual cinematography camera controls | Custom Lens (Anamorphic, Prime), Focal Lengths (8mm-85mm), Apertures (f/1.4-f/11) |

---

## ✨ Core Highlights

- **Bring Your Own Key (BYOK):** Apni keys use karein, subscription fees se bachein.
- **AI Prompt Enhancer ✨:** Single click se apne basic prompt ko rich cinematic prompt mein badlein (Powered by NVIDIA Llama-3.1-70B).
- **Smart Model Router (`availability.js`):** Jo keys aap daalenge, sirf wahi models "Active" honge. Baaqi models par badge batayega ke kaun si key required hai.
- **Normalized Sync vs Async Engine:** Instant base64 responses (NVIDIA) aur background polling (Kie/Replicate) dono ko UI seamlessly handle karta hai.
- **Zero-Logging CORS Proxy:** Next.js proxy route ke zariye request jati hai taake CORS block na ho, aur aapki keys kabhi server par save ya log nahi hoti.

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

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 API Key Configuration

Studio ke top-right corner par **Settings / Key** icon par click karein:

1. **NVIDIA NIM:** [build.nvidia.com](https://build.nvidia.com) se free API key le kar enter karein.
2. **Kie.ai / Replicate / Fal.ai:** Apni respective keys paste karein.
3. **Test Key:** Har provider ke sath "Test Key" button click karke validity confirm karein.
4. Keys safely aapke browser ke `localStorage` mein store rehti hain.

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

## 🛡️ Privacy & Security

* **Client-Side Storage:** Keys aapke browser ke `localStorage` (`KEY_NVIDIA`, `KEY_KIE`, etc.) mein rehti hain.
* **Stateless Proxy:** API proxy route (`app/api/proxy/[provider]/route.js`) sirf browser CORS limitations ko bypass karne ke liye payload forward karta hai. Yeh aapke credentials ko kabhi log ya store nahi karta.

---

## 👤 Author

* **Muhammad Umair**
* GitHub: [@umairs759](https://github.com/umairs759)
* Email: [umairghaffar759@gmail.com](mailto:umairghaffar759@gmail.com)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).