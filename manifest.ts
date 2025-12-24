import { defineManifest } from '@crxjs/vite-plugin';
import packageJson from './package.json';

// 将版本转换为 chrome 扩展格式
const { version } = packageJson;
const [major, minor, patch, label = '0'] = version
  .replace(/[^\d.-]+/g, '')
  .split(/[.-]/);

export default defineManifest({
  manifest_version: 3,
  name: '提示词助手',
  description:
    '在任何 AI 网页上，都能快速检索、套用、填变量并插入 Prompt，同时支持收藏、标签、版本管理与分享。',
  version: `${major}.${minor}.${patch}.${label}`,
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  side_panel: {
    default_path: 'sidepanel.html',
  },
  icons: {
    '16': 'src/assets/icon-16.png',
    '32': 'src/assets/icon-32.png',
    '48': 'src/assets/icon-48.png',
    '128': 'src/assets/icon-128.png',
  },
  permissions: ['storage', 'activeTab', 'sidePanel', 'scripting'],
  content_scripts: [
    {
      matches: [
        'https://chat.openai.com/*',
        'https://chatgpt.com/*',
        'https://gemini.google.com/*',
        'https://claude.ai/*',
        'https://demo.fuclaude.com/*',
        'https://www.kimi.com/*',
        'https://kimi.com/*',
        'https://kimi.moonshot.cn/*',
        'https://chat.deepseek.com/*',
        'https://www.qianwen.com/*',
        'https://yuanbao.tencent.com/chat/*',
        'https://aistudio.google.com/*',
        'https://grok.com/*',
        'https://www.grok.com/*',
        'https://doubao.com/*',
        'https://www.doubao.com/*',
      ],
      js: ['src/content/apply-prompt.ts'],
    },
  ],
});
