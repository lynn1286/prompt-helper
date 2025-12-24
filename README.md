# Prompt Helper - 通用 AI 提示词助手 Chrome 扩展

![版本](https://img.shields.io/badge/版本-1.0.2-blue) ![许可证](https://img.shields.io/badge/许可证-MIT-green) ![Manifest](https://img.shields.io/badge/Manifest-V3-orange) ![React](https://img.shields.io/badge/React-18-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)

**语言版本**: [English](./README-en.md) | 中文

一个强大的 Chrome 浏览器扩展，为 10+ 主流 AI 平台提供智能化 Prompt 管理功能。支持一键模板应用、提示词收藏、导入导出，以及双语界面切换。

## ✨ 主要特性

### 🌐 全平台支持

- **ChatGPT** (chat.openai.com / chatgpt.com)
- **Google Gemini** (gemini.google.com)
- **Claude** (claude.ai)
- **Kimi** (kimi.com / kimi.moonshot.cn)
- **DeepSeek** (chat.deepseek.com)
- **通义千问** (tongyi.com)
- **腾讯元宝** (yuanbao.tencent.com)
- **Google AI Studio** (aistudio.google.com)
- **Grok** (grok.com)
- **豆包** (doubao.com)

### 🎛️ 核心功能

- **智能提示词管理**：创建、编辑、删除和组织无限数量的自定义提示词
- **一键应用**：点击即可将提示词自动填入 AI 对话输入框
- **复制功能**：快速复制提示词内容到剪贴板
- **导入导出**：备份和分享您的提示词集合（JSON 格式）
- **双语界面**：无缝中英文语言切换
- **侧边栏设计**：优雅的侧边栏 UI，不干扰原有页面

### 🔧 技术亮点

- **Manifest V3**：采用最新的 Chrome 扩展规范
- **React 18**：现代化的响应式 UI 框架
- **TypeScript**：类型安全的代码开发
- **TailwindCSS**：高效的样式管理
- **i18next**：完善的国际化支持
- **IndexedDB**：本地数据持久化存储
- **跨平台兼容**：智能识别不同 AI 平台的输入框

## 🚀 安装方法

### 前置要求

- [Node.js](https://nodejs.org/) (推荐 v18+)
- [pnpm](https://pnpm.io/)（或 npm/yarn）
- Chrome 浏览器

### 开发模式安装

1. **克隆仓库**

```bash
git clone https://github.com/lynn1286/prompt-helper.git
cd prompt-helper
```

2. **安装依赖**

```bash
pnpm install
```

3. **启动开发模式**

```bash
pnpm dev
```

4. **加载扩展**
   - 打开 Chrome，访问 `chrome://extensions/`
   - 开启右上角「开发者模式」
   - 点击「加载已解压的扩展程序」
   - 选择项目的 `dist` 目录

### 生产构建

```bash
pnpm build
```

## 📖 使用指南

### 界面概览

安装后，点击 Chrome 工具栏中的扩展图标，即可打开侧边栏面板：

1. **添加提示词**：点击「添加」按钮创建新的提示词模板
2. **编辑管理**：对已有的提示词进行编辑、复制或删除
3. **一键应用**：点击「应用」按钮将提示词填入当前 AI 平台的输入框
4. **导入导出**：通过工具栏按钮备份或恢复提示词集合
5. **语言切换**：支持中文和英文界面切换

### 使用流程

1. **访问任意支持的 AI 平台**
2. **打开扩展侧边栏**
3. **选择或创建提示词**
4. **点击「应用」一键填充**
5. **发送增强后的提示**获得更优质的 AI 回答

## 📁 项目结构

```
prompt-helper/
├── src/
│   ├── assets/       # 图标资源
│   ├── background/   # Service Worker 后台脚本
│   ├── content/      # 内容脚本（页面注入）
│   ├── i18n/         # 国际化配置
│   ├── sidepanel/    # 侧边栏 React 组件
│   ├── types/        # TypeScript 类型定义
│   └── utils/        # 工具函数和数据库操作
├── manifest.ts       # Chrome 扩展清单配置
├── sidepanel.html    # 侧边栏入口 HTML
└── ...
```

## 🛠️ 开发信息

### 技术栈

- **框架**：React 18 + TypeScript 5
- **构建**：Vite + @crxjs/vite-plugin
- **样式**：TailwindCSS 4
- **国际化**：i18next + react-i18next
- **代码规范**：ESLint + Prettier + Husky + Commitlint

### 开发命令

```bash
# 开发模式（热更新）
pnpm dev

# 生产构建
pnpm build

# 代码格式化
pnpm format

# 代码检查
pnpm lint

# 提交代码（规范化 commit message）
pnpm commit
```

## 🛡️ 隐私与安全

- **仅本地存储**：所有数据保存在浏览器本地 IndexedDB，绝不上传
- **开源透明**：GitHub 仓库完全透明，代码可审计
- **最小权限**：仅申请必要的 Chrome 扩展权限
- **无外部依赖**：不依赖任何第三方服务器

## 🐛 问题反馈

如遇问题，请提供以下信息：

- **Chrome 版本**
- **扩展版本**
- **AI 平台和 URL**
- **详细错误描述**
- **控制台错误信息**（F12 → Console）

## 📄 许可证

本项目采用 [MIT 许可证](./LICENSE) 开源。

## 🤝 贡献指南

欢迎贡献！您可以：

- 报告 Bug 或建议新功能
- 提交代码改进
- 完善文档
- 分享使用心得

## 📞 联系方式

- **项目地址**：https://github.com/lynn1286/prompt-helper
- **许可证**：MIT
- **当前版本**：v1.0.0

---

> **💡 提示**：Prompt Helper 让 AI 交互更高效更有效果。快来试试一键应用功能，立即提升您的 AI 对话质量！
