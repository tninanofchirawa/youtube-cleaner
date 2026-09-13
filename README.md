# YouTube Cleaner — Minimal AI-Style Interface

A lightweight, distraction-free Chrome Extension (Manifest V3) that removes YouTube's algorithmic home feed, recommendation sidebars, shorts, and clutter. It replaces the default homepage with an interactive, customizable **Mindmap Learning Hub** and search interface built with vanilla JavaScript, HTML5 SVG, and CSS glassmorphism.

---

## 🌟 Overview

**YouTube Cleaner** turns YouTube from a dopamine-driven recommendation engine into a focused learning tool. By injecting a clean stylesheet (`clean.css`) and a content script (`script.js`), the extension strips away feed grids, trending videos, and promotional distractions while keeping YouTube's core video player and search infrastructure intact.

---

## 🎯 What Problem Does It Solve?

Standard YouTube is optimized for maximum retention through infinite scroll feeds, algorithmic recommendations, and distracting sidebars. Users seeking educational content (e.g. computer science, mathematics, music theory) are constantly pulled into unrelated rabbit holes. 

**YouTube Cleaner** solves this by:
1. Hiding the homepage video feed grid.
2. Hiding "Related Videos" recommendation sidebars on watch pages.
3. Scrubbing promotional badge links (e.g., YouTube Music, YouTube Gaming, Podcasts).
4. Presenting an interactive **Mindmap Learning Hub** where users store, categorize, and click through to their preferred topics.

---

## ✨ Features

* **Interactive Mindmap Learning Hub**: A dynamic canvas displaying learning topics as nodes connected to a central search hub.
* **Physics Simulation Engine**: Nodes gently float, repel each other, and snap into place using real-time damped spring physics ($F = -k \cdot x$).
* **Drag-and-Drop Organization**: Drag topics across the screen to arrange your personal study workspace.
* **Topic Management**: Add, edit, soft-delete, and restore learning topics via glassmorphic modal dialogs.
* **Custom Backgrounds & Blur**: Personalize your home hub with custom Unsplash image URLs or solid color gradients with adjustable backdrop blur ($0\text{px} - 20\text{px}$).
* **Native HTML5 Video Player Restoration**: Preserves YouTube's native HTML5 player sizing, theater mode, and full-screen controls without black screen loading delays.
* **Full-Width Channel View**: Extends YouTube channel pages across the entire viewport width for cleaner browsing.
* **Zero External Dependencies**: Built with pure Vanilla JS and CSS—no React, jQuery, or third-party tracking scripts.

---

## 🏗️ Architecture & How It Works

```
YouTube Page Load (document_start)
  │
  ├──► [1] clean.css Injected
  │       ├── Suppresses YouTube feed grids (#primary, ytd-rich-grid-renderer)
  │       ├── Suppresses related recommendation sidebars (#related)
  │       └── Applies glassmorphic theme tokens (--cg-bg, --cg-surface)
  │
  └──► [2] script.js Content Script Executed
          ├── Initializes MutationObserver watching DOM additions
          ├── Intercepts YouTube SPA navigation events (yt-navigate-finish)
          │
          ├── [Homepage Context]
          │   ├── Injects Custom Search Bar & Mindmap Hub Container (#cg-hub-container)
          │   ├── Loads topic nodes from localStorage (__yt_mindmap_topics__)
          │   ├── Renders SVG connector lines on #cg-connector-canvas
          │   └── Runs low-CPU damped spring physics animation loop
          │
          └── [Watch / Search / Channel Context]
              ├── Hides homepage Mindmap overlay
              └── Restores native HTML5 player sizing & channel width
```

---

## 📁 Project Structure

```
youtube-cleaner/
├── manifest.json   # Chrome Extension Manifest V3 configuration
├── script.js       # Content script (Mindmap UI, physics engine, DOM observers, modals)
├── clean.css       # Clean stylesheet (Hide rules, dark glassmorphism, responsive styles)
├── updates.xml     # Google Update Protocol XML template for CRX updates
└── .gitignore      # Git ignore file excluding build artifacts (*.crx, *.pem)
```

### Important Files Description

* **`manifest.json`**: Registers `clean.css` and `script.js` as content scripts targeting `*://*.youtube.com/*` at `document_start`.
* **`script.js`**: Contains the core JavaScript logic—mindmap node physics, SVG line drawing, `localStorage` persistence, custom search injection, distraction scrubbing, and modal handling.
* **`clean.css`**: Divided into 12 logical sections containing all custom design variables, YouTube feed suppression selectors, mindmap canvas styling, and layout overrides.
* **`updates.xml`**: XML template used if hosting self-signed `.crx` updates outside the Chrome Web Store.

---

## 🧠 Technical Deep-Dive & Complex Components

### 1. Mindmap Physics Engine (`script.js`)
* **What is it?**: A custom 2D force-directed spring physics simulator written in vanilla JavaScript.
* **Why does it exist?**: To make learning topic nodes float naturally around the central search hub instead of sitting in rigid static grids.
* **How it works**:
  * Each topic node has a position $(x, y)$ and velocity $(vx, vy)$.
  * **Attraction Force**: Nodes are pulled toward the central hub with spring attraction ($F = -k \cdot \text{distance}$).
  * **Repulsion Force**: Nodes push away from each other if they get too close to prevent overlapping.
  * **Low-CPU Sleeping**: When all node velocities drop below $v < 0.05 \text{ px/frame}$, the `requestAnimationFrame` loop automatically pauses to save CPU resources.

### 2. SVG Line Renderer (`script.js`)
* **What is it?**: Real-time SVG `<path>` generator drawing smooth curved lines from the central search bar to each topic node.
* **How it works**: Uses cubic Bézier curves (`d="M x1 y1 C cx1 cy1, cx2 cy2, x2 y2"`) to draw glowing connections on an underlying `<svg>` canvas layer.

### 3. Storage Persistence Layer
* Uses native browser `window.localStorage`:
  * `__yt_mindmap_topics__`: JSON array storing active topics, position offsets, and search URLs.
  * `__yt_mindmap_deleted_history__`: JSON array storing soft-deleted topics for easy restoration.
  * `__yt_mindmap_bg_img__`: User-configured custom background image URL.
  * `__yt_mindmap_bg_blur__`: User-configured background blur intensity in pixels.

---

## 🔒 Security & Privacy

* **Secrets & API Keys**: `None`. The extension operates entirely client-side.
* **Network Privacy**: Zero external API calls, zero telemetry, zero analytics tracking.
* **User Input Safety**: All node titles and custom background links pass through an `escapeHtml()` sanitizer prior to DOM rendering.
* **Safe URL Handling**: Links validate protocol schemes (`http://`, `https://`, `/`) before opening, preventing `javascript:` URI injection vectors.

---

## 🚀 Installation & Usage

### Installing in Google Chrome / Brave / Edge

1. Download or clone this repository to your local computer:
   ```bash
   git clone https://github.com/YOUR_GITHUB_USERNAME/youtube-cleaner.git
   ```
2. Open your browser and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click **Load unpacked**.
5. Select the `youtube-cleaner` directory.
6. Open [YouTube](https://www.youtube.com) to see your new distraction-free Mindmap Learning Hub!

---

## 🛠️ Configuration & Customization

* **Add New Topic**: Click `+ Add Topic` on the home hub, enter a title (e.g. *Quantum Computing*) and optional search URL or query.
* **Drag Nodes**: Click and hold any topic node to reposition it on the canvas.
* **Edit / Delete**: Hover over any topic node to display the action icons.
* **Custom Background**: Click `⚙ Settings` to paste an Unsplash image URL and set custom blur levels.

---

## ❓ Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| Video player screen looks black initially | YouTube native layout script adjusting | Ensure `clean.css` Section 8 is loaded without external CSS overrides. |
| Custom background image fails to display | Invalid image URL or CORS policy | Use direct HTTPS image links (e.g., Unsplash image source URLs). |
| Home feed still visible on cold load | Content script execution timing | Ensure extension is enabled in `chrome://extensions/` and running at `document_start`. |

---

## 📄 License

This project is open-source and available under the **MIT License**.
