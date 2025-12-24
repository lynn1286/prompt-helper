import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// 自动收集 locales 目录下所有语言文件
const localeModules = import.meta.glob('./locales/*.json', { eager: true });

const resources: Record<string, { translation: Record<string, unknown> }> = {};

for (const path in localeModules) {
  // 从路径中提取语言代码，如 './locales/zh-CN.json' -> 'zh-CN'
  const langCode = path.match(/\.\/locales\/(.+)\.json$/)?.[1];
  if (langCode) {
    resources[langCode] = {
      translation: (localeModules[path] as { default: Record<string, unknown> })
        .default,
    };
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-CN',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
