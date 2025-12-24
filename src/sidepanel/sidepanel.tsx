import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  addPrompt,
  deletePrompt,
  getAllPrompts,
  Prompt,
  updatePrompt,
} from '../utils/db';
import PromptModal from './add-prompt-modal';

const SidePanel: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [sortType, setSortType] = useState<'time' | 'name'>('time');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLangOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isLangOpen && !(event.target as Element).closest('.lang-selector')) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLangOpen]);

  const loadPrompts = useCallback(async () => {
    try {
      const data = await getAllPrompts();
      setPrompts(data);
    } catch (error) {
      console.error('Failed to load prompts:', error);
    }
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const handleSavePrompt = async (prompt: {
    id?: number;
    name: string;
    content: string;
    category?: string;
    model?: string;
  }) => {
    try {
      if (prompt.id) {
        await updatePrompt(prompt.id, {
          name: prompt.name,
          content: prompt.content,
          category: prompt.category,
          model: prompt.model,
        });
      } else {
        await addPrompt({
          name: prompt.name,
          content: prompt.content,
          category: prompt.category,
          model: prompt.model,
        });
      }
      await loadPrompts();
      setEditingPrompt(null);
    } catch (error) {
      console.error('Failed to save prompt:', error);
    }
  };

  const handleCopy = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopiedId(prompt.id!);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleApply = async (prompt: Prompt) => {
    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) {
        console.error('No active tab found');
        return;
      }

      // 发送消息到内容脚本
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'APPLY_PROMPT',
        content: prompt.content,
      });

      if (response?.success) {
        console.log('Prompt applied successfully');
      } else {
        console.error('Failed to apply prompt: input element not found');
      }
    } catch (error) {
      console.error('Failed to apply prompt:', error);
    }
  };

  const handleClearInput = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) {
        console.error('No active tab found');
        return;
      }

      await chrome.tabs.sendMessage(tab.id, {
        type: 'CLEAR_INPUT',
      });
    } catch (error) {
      console.error('Failed to clear input:', error);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(prompts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompts_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string);
          if (Array.isArray(importedData)) {
            for (const item of importedData) {
              await addPrompt({
                name: item.name,
                content: item.content,
                category: item.category,
                model: item.model,
              });
            }
            await loadPrompts();
          }
        } catch (error) {
          console.error('Failed to import prompts:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleSort = () => {
    setSortType((prev) => (prev === 'time' ? 'name' : 'time'));
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePrompt(id);
      await loadPrompts();
      setDeletingId(null);
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  };

  const filteredPrompts = prompts
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortType === 'name') {
        return a.name.localeCompare(b.name);
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

  const openAddModal = () => {
    setEditingPrompt(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-full flex-col bg-zinc-50 text-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 p-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-900">
                {t('sidepanel.title')}
              </h1>
              <div className="lang-selector relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 active:scale-95"
                  title="Change Language"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </button>

                {isLangOpen && (
                  <div className="absolute top-full left-0 z-50 mt-2 w-32 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg ring-1 ring-black/5">
                    <button
                      onClick={() => changeLanguage('zh-CN')}
                      className={`flex w-full items-center px-3 py-2 text-xs font-medium transition-colors hover:bg-zinc-50 ${
                        i18n.language === 'zh-CN'
                          ? 'text-zinc-900'
                          : 'text-zinc-500'
                      } first:rounded-t-lg`}
                    >
                      中文 (简体)
                    </button>
                    <button
                      onClick={() => changeLanguage('en-US')}
                      className={`flex w-full items-center px-3 py-2 text-xs font-medium transition-colors hover:bg-zinc-50 ${
                        i18n.language === 'en-US'
                          ? 'text-zinc-900'
                          : 'text-zinc-500'
                      } last:rounded-b-lg`}
                    >
                      English
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              {t('sidepanel.subtitle')}
            </p>
          </div>
        </div>
        <button
          onClick={handleClearInput}
          className="group flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 active:scale-95"
          title={t('sidepanel.clear_button')}
        >
          <svg
            className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          {t('sidepanel.clear_button')}
        </button>
      </div>

      <div className="space-y-4 p-4">
        <button
          onClick={openAddModal}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 font-bold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-95"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {t('sidepanel.add_button')}
        </button>

        <div className="flex w-full divide-x divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <button
            onClick={handleImport}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 py-2 text-[10px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 active:bg-zinc-100"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            {t('sidepanel.import')}
          </button>
          <button
            onClick={handleExport}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 py-2 text-[10px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 active:bg-zinc-100"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {t('sidepanel.export')}
          </button>
          <button
            onClick={handleSort}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 py-2 text-[10px] font-medium transition-colors hover:bg-zinc-50 hover:text-zinc-900 active:bg-zinc-100 ${
              sortType === 'name' ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-600'
            }`}
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {sortType === 'time' ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                />
              )}
            </svg>
            {t('sidepanel.sort')}
          </button>
        </div>

        <div className="relative">
          <svg
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('sidepanel.search_placeholder')}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pr-4 pl-10 text-sm transition-all focus:ring-2 focus:ring-zinc-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filteredPrompts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-2 text-zinc-300 opacity-50">
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="text-sm">{t('sidepanel.empty_state')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="group cursor-pointer rounded-xl border border-zinc-200 bg-white p-3 transition-all hover:border-zinc-300 hover:shadow-sm"
                onClick={() => openEditModal(prompt)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-zinc-800">
                        {prompt.name}
                      </h3>
                      {prompt.model && (
                        <span className="shrink-0 rounded-md border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                          {prompt.model}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                      {prompt.content}
                    </p>
                    {prompt.category && (
                      <span className="mt-2 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500">
                        {prompt.category}
                      </span>
                    )}
                  </div>
                  <div
                    className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {deletingId === prompt.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(prompt.id!)}
                          className="cursor-pointer rounded-lg bg-red-500 px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-red-600"
                        >
                          {t('sidepanel.delete_confirm')}
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="cursor-pointer rounded-lg bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-600 transition-colors hover:bg-zinc-200"
                        >
                          {t('sidepanel.delete_cancel')}
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setDeletingId(prompt.id!)}
                          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg bg-zinc-100 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          title={t('sidepanel.delete')}
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleCopy(prompt)}
                          className="cursor-pointer rounded-lg bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-600 transition-colors hover:bg-zinc-200"
                          title={t('sidepanel.copy')}
                        >
                          {copiedId === prompt.id
                            ? t('sidepanel.copied')
                            : t('sidepanel.copy')}
                        </button>
                        <button
                          onClick={() => handleApply(prompt)}
                          className="cursor-pointer rounded-lg bg-zinc-900 px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-zinc-800"
                          title={t('sidepanel.apply')}
                        >
                          {t('sidepanel.apply')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 p-2 text-center">
        <div className="flex flex-col items-center justify-center space-y-0.5 text-[10px] text-zinc-400">
          <div className="flex items-center gap-1">
            <span className="font-medium text-zinc-500">prompt-helper</span>
            <span className="opacity-50">by</span>
            <span className="font-medium text-zinc-500">lynn</span>
          </div>
          <a
            href="https://github.com/lynn1286/prompt-helper"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-zinc-600"
          >
            v1.0.0
          </a>
        </div>
      </div>

      <PromptModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPrompt(null);
        }}
        onSave={handleSavePrompt}
        editingPrompt={editingPrompt}
      />
    </div>
  );
};

export default SidePanel;
