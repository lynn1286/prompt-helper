import { clsx } from 'clsx';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Prompt } from '../utils/db';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: {
    id?: number;
    name: string;
    content: string;
    category?: string;
    model?: string;
  }) => void;
  editingPrompt?: Prompt | null;
}

const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPrompt,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [model, setModel] = useState('');
  const [errors, setErrors] = useState<{ name?: string; content?: string }>({});

  const isEditing = !!editingPrompt;

  useEffect(() => {
    if (editingPrompt) {
      setName(editingPrompt.name);
      setContent(editingPrompt.content);
      setCategory(editingPrompt.category || '');
      setModel(editingPrompt.model || '');
    } else {
      // Reset form when opening for new prompt
      setName('');
      setContent('');
      setCategory('');
      setModel('');
    }
    setErrors({});
  }, [editingPrompt, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const newErrors: { name?: string; content?: string } = {};
    if (!name.trim()) newErrors.name = t('modal.required_field');
    if (!content.trim()) newErrors.content = t('modal.required_field');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: editingPrompt?.id,
      name: name.trim(),
      content: content.trim(),
      category: category.trim(),
      model: model.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="animate-in fade-in zoom-in w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl duration-200">
        <div className="p-6">
          <h2 className="mb-6 text-xl font-bold text-zinc-900">
            {isEditing ? t('modal.title_edit') : t('modal.title')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">
                {t('modal.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder={t('modal.placeholder_name')}
                className={clsx(
                  'w-full rounded-lg border bg-zinc-50 px-4 py-2 text-zinc-900 transition-all focus:ring-2 focus:ring-zinc-400 focus:outline-none',
                  errors.name ? 'border-red-500' : 'border-zinc-200',
                )}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">
                {t('modal.content')} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content)
                    setErrors({ ...errors, content: undefined });
                }}
                placeholder={t('modal.placeholder_content')}
                rows={4}
                className={clsx(
                  'w-full resize-none rounded-lg border bg-zinc-50 px-4 py-2 text-zinc-900 transition-all focus:ring-2 focus:ring-zinc-400 focus:outline-none',
                  errors.content ? 'border-red-500' : 'border-zinc-200',
                )}
              />
              {errors.content && (
                <p className="mt-1 text-xs text-red-500">{errors.content}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">
                  {t('modal.category')}
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={t('modal.placeholder_category')}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-900 transition-all focus:ring-2 focus:ring-zinc-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">
                  {t('modal.model')}
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={t('modal.placeholder_model')}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-900 transition-all focus:ring-2 focus:ring-zinc-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              {t('modal.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-zinc-900 px-6 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-95"
            >
              {t('modal.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;
