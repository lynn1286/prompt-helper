# Prompt Helper - Universal AI Prompt Assistant Chrome Extension

![Version](https://img.shields.io/badge/version-1.0.2-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Manifest](https://img.shields.io/badge/Manifest-V3-orange) ![React](https://img.shields.io/badge/React-18-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)

**Language**: English | [中文](./README.md)

A powerful Chrome browser extension that provides intelligent Prompt management for 10+ mainstream AI platforms. Features one-click template application, prompt collection, import/export, and bilingual interface switching.

## ✨ Key Features

### 🌐 Full Platform Support

- **ChatGPT** (chat.openai.com / chatgpt.com)
- **Google Gemini** (gemini.google.com)
- **Claude** (claude.ai)
- **Kimi** (kimi.com / kimi.moonshot.cn)
- **DeepSeek** (chat.deepseek.com)
- **Tongyi Qianwen** (qianwen.com)
- **Tencent Yuanbao** (yuanbao.tencent.com)
- **Google AI Studio** (aistudio.google.com)
- **Grok** (grok.com)
- **Doubao** (doubao.com)

### 🎛️ Core Features

- **Smart Prompt Management**: Create, edit, delete, and organize unlimited custom prompts
- **One-Click Apply**: Click to automatically fill prompts into AI chat input boxes
- **Copy Function**: Quickly copy prompt content to clipboard
- **Import/Export**: Backup and share your prompt collections (JSON format)
- **Bilingual Interface**: Seamless Chinese/English language switching
- **Sidebar Design**: Elegant sidebar UI without disturbing the original page

### 🔧 Technical Highlights

- **Manifest V3**: Using the latest Chrome extension specification
- **React 18**: Modern responsive UI framework
- **TypeScript**: Type-safe code development
- **TailwindCSS**: Efficient style management
- **i18next**: Complete internationalization support
- **IndexedDB**: Local data persistent storage
- **Cross-Platform Compatibility**: Smart detection of input boxes across different AI platforms

## 🚀 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)
- Chrome browser

### Development Mode Installation

1. **Clone the repository**

```bash
git clone https://github.com/lynn1286/prompt-helper.git
cd prompt-helper
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Start development mode**

```bash
pnpm dev
```

4. **Load the extension**
   - Open Chrome and visit `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked"
   - Select the `dist` directory of the project

### Production Build

```bash
pnpm build
```

## 📖 Usage Guide

### Interface Overview

After installation, click the extension icon in Chrome toolbar to open the sidebar panel:

1. **Add Prompt**: Click the "Add" button to create a new prompt template
2. **Edit & Manage**: Edit, copy, or delete existing prompts
3. **One-Click Apply**: Click the "Apply" button to fill the prompt into the current AI platform's input box
4. **Import/Export**: Backup or restore prompt collections via toolbar buttons
5. **Language Switch**: Support for Chinese and English interface

### Workflow

1. **Visit any supported AI platform**
2. **Open the extension sidebar**
3. **Select or create a prompt**
4. **Click "Apply" to fill automatically**
5. **Send the enhanced prompt** for better AI responses

## 📁 Project Structure

```
prompt-helper/
├── src/
│   ├── assets/       # Icon resources
│   ├── background/   # Service Worker background scripts
│   ├── content/      # Content scripts (page injection)
│   ├── i18n/         # Internationalization config
│   ├── sidepanel/    # Sidebar React components
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions and database operations
├── manifest.ts       # Chrome extension manifest config
├── sidepanel.html    # Sidebar entry HTML
└── ...
```

## 🛠️ Development Info

### Tech Stack

- **Framework**: React 18 + TypeScript 5
- **Build**: Vite + @crxjs/vite-plugin
- **Styling**: TailwindCSS 4
- **i18n**: i18next + react-i18next
- **Code Quality**: ESLint + Prettier + Husky + Commitlint

### Development Commands

```bash
# Development mode (hot reload)
pnpm dev

# Production build
pnpm build

# Format code
pnpm format

# Lint code
pnpm lint

# Commit code (standardized commit message)
pnpm commit
```

## 🛡️ Privacy & Security

- **Local Storage Only**: All data stored in browser's local IndexedDB, never uploaded
- **Open Source**: GitHub repository fully transparent, code auditable
- **Minimal Permissions**: Only essential Chrome extension permissions requested
- **No External Dependencies**: No reliance on third-party servers

## 🐛 Bug Reports

If you encounter issues, please provide:

- **Chrome version**
- **Extension version**
- **AI platform and URL**
- **Detailed error description**
- **Console error messages** (F12 → Console)

## 📄 License

This project is open source under the [MIT License](./LICENSE).

## 🤝 Contributing

Contributions are welcome! You can:

- Report bugs or suggest features
- Submit code improvements
- Improve documentation
- Share usage tips and best practices

## 📞 Contact

- **Repository**: https://github.com/lynn1286/prompt-helper
- **License**: MIT
- **Current Version**: v1.0.0

---

> **💡 Tip**: Prompt Helper makes AI interactions more efficient and effective. Try the one-click apply feature to instantly improve your AI conversation quality!
