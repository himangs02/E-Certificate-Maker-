# 🎓 Dynamic E-Certificate Generator Studio

A high-performance, pixel-accurate web application built with **React**, **Tailwind CSS**, **HTML5 Canvas**, and **jsPDF** for generating and exporting professional certificates of appreciation and participation.

---

## 🌟 Features

- **Split Screen Layout**: Real-time form controls on the left with a live, high-resolution (1200×1700 Hi-DPI) preview canvas on the right.
- **Base Template Upload**: Upload any custom certificate template image (`JPG`, `PNG`, `WEBP`) or use the built-in Geeta University style template.
- **Reference Presets**: Instant 1-click loading for the reference templates:
  - Preset 1: *Mr. Rahul Sharma* — 1st Position (Tech Innovation Competition)
  - Preset 2: *Dr. Priya Sharma* — Assistant Professor (Annual Management Fest – Bizz Fiesta 2026)
  - Preset 3: *Mr. Rahul Sharma* — Participation (National Youth Design Summit)
- **Interactive Drag & Coordinate Tuner**:
  - Click & drag any text element directly on the canvas to move it in real-time.
  - Dedicated Coordinate Tuner panel with sliders for **X**, **Y**, **Font Size**, **Typography Family**, **Color**, **Bold/Italic**, and **Alignment**.
- **High-Resolution Multi-Format Export**:
  - 📄 **Print-Ready PDF** (A4 Portrait via `jsPDF`)
  - 🖼️ **High-DPI Lossless PNG**
  - 🖼️ **High-Quality JPG**
- **Bulk CSV Batch Generator**: Upload a CSV or paste tabular student/faculty data to generate multiple certificates and download them instantly in a **ZIP archive** (powered by `JSZip`).

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 📐 How to Adjust Coordinates, Fonts & Colors

All default positions and styles are defined in [`src/constants/defaultConfig.js`](file:///c:/D/D/nnsbbsh/Downloads/work/E-Certificate%20Maker/E-Certificate-Maker-/src/constants/defaultConfig.js).

Base Canvas Resolution: **1200 × 1700 pixels** (standard A4 portrait ratio).

### Example Configuration:
```javascript
export const DEFAULT_TEXT_CONFIG = {
  // Recipient Name (e.g. "Mr. Rahul Sharma")
  recipientName: {
    label: "Recipient Name",
    x: 600,                                   // X coordinate (600 = Center of 1200px)
    y: 695,                                   // Y coordinate (Distance from top)
    fontSize: 52,                             // Font size in pixels
    fontFamily: "'Playfair Display', serif",  // Typography family
    fontWeight: "700",                        // 400 for normal, 700 for bold
    fontStyle: "italic",                      // 'italic' or 'normal'
    color: "#4A5568",                         // Hex or RGB color
    align: "center",                          // 'left' | 'center' | 'right'
  },
  
  // Multi-line text auto-wraps using maxWidth & lineHeight:
  appreciationParagraph: {
    label: "Appreciation Paragraph",
    x: 600,
    y: 1025,
    fontSize: 24,
    fontFamily: "'Merriweather', serif",
    fontWeight: "300",
    color: "#2D3748",
    align: "center",
    maxWidth: 940,                            // Wraps words beyond 940px
    lineHeight: 44,                           // Vertical line spacing
  }
};
```

---

## 📂 Project Architecture

```
E-Certificate-Maker-/
├── index.html                   # Google Fonts imports & HTML shell
├── package.json                 # Dependencies (React, Tailwind, jsPDF, JSZip, Lucide)
├── tailwind.config.js           # Custom typography & color themes
├── vite.config.js               # Vite bundler config
└── src/
    ├── App.jsx                  # Main application state & split screen layout
    ├── index.css                # Tailwind base styles & custom scrollbars
    ├── main.jsx                 # React root renderer
    ├── components/
    │   ├── CertificateForm.jsx      # Form inputs, template uploader, preset chips
    │   ├── CertificatePreview.jsx   # HTML5 Canvas viewport, zoom, drag & export
    │   ├── CoordinateTuner.jsx      # Fine-tuning sliders & typography panel
    │   └── BatchGeneratorModal.jsx  # CSV batch generator & ZIP exporter
    ├── constants/
    │   ├── defaultConfig.js         # Text coordinate map & font list
    │   └── presets.js               # Reference data presets
    └── utils/
        ├── canvasRenderer.js        # High-res canvas drawer & text auto-wrapper
        ├── defaultTemplateGenerator.js # Built-in Geeta University vector template
        └── pdfExporter.js           # PDF & image download routines
```