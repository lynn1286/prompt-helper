/**
 * Content Script: Apply Prompt to Chat Input
 * 参考 promptHelper.js 实现，将 prompt 内容填充到 AI 网站的输入框中
 * github： https://github.com/dongshuyan/PromptHelper
 */

// ==================== 站点配置 ====================
interface SiteConfig {
  name: string;
  inputSelector: string;
  shadowRootSelector?: string;
}

const siteConfigs: Record<string, SiteConfig> = {
  'openai.com': { name: 'ChatGPT', inputSelector: '#prompt-textarea' },
  'chatgpt.com': { name: 'ChatGPT', inputSelector: '#prompt-textarea' },
  'gemini.google.com': {
    name: 'Gemini',
    shadowRootSelector: 'chat-app',
    inputSelector:
      'div.initial-input-area textarea, rich-textarea .ql-editor, [contenteditable="true"][role="textbox"]',
  },
  'claude.ai': {
    name: 'Claude',
    inputSelector: '.ProseMirror[contenteditable="true"]',
  },
  'fuclaude.com': {
    name: 'Claude',
    inputSelector: '.ProseMirror[contenteditable="true"]',
  },
  'kimi.com': {
    name: 'Kimi',
    inputSelector:
      'div.chat-input-editor[data-lexical-editor="true"], div[contenteditable="true"], textarea, [role="textbox"], [data-lexical-editor]',
  },
  'kimi.moonshot.cn': {
    name: 'Kimi',
    inputSelector:
      'div.chat-input-editor[data-lexical-editor="true"], div[contenteditable="true"], textarea, [role="textbox"], [data-lexical-editor]',
  },
  'deepseek.com': {
    name: 'DeepSeek',
    inputSelector:
      'textarea[placeholder*="随便聊点什么"], textarea[placeholder*="Ask me anything"], div[contenteditable="true"], #chat-input, [role="textbox"]',
  },
  'tongyi.com': {
    name: '通义',
    inputSelector:
      'textarea[placeholder*="有问题，随时问通义"], textarea[placeholder*="问题"], textarea, div[contenteditable="true"], [role="textbox"]',
  },
  'yuanbao.tencent.com': {
    name: '腾讯元宝',
    inputSelector:
      'textarea[placeholder*="输入问题"], textarea[placeholder*="问题"], textarea, div[contenteditable="true"], [role="textbox"]',
  },
  'aistudio.google.com': {
    name: 'Google AI Studio',
    shadowRootSelector: 'app-root',
    inputSelector:
      '[contenteditable="true"], textarea, [role="textbox"], [aria-label*="prompt"], [aria-label*="Prompt"], [placeholder*="prompt"], [placeholder*="Prompt"], .prompt-input, #prompt-input, input[type="text"]',
  },
  'grok.com': {
    name: 'Grok',
    inputSelector:
      'form .query-bar textarea[aria-label], textarea[aria-label*="Grok"], textarea[aria-label*="向 Grok"], textarea',
  },
  'doubao.com': {
    name: '豆包',
    inputSelector:
      'textarea[placeholder*="输入"], textarea[placeholder*="问题"], textarea, div[contenteditable="true"], [role="textbox"], [aria-label*="输入"], [aria-label*="提问"], [data-lexical-editor], .ProseMirror',
  },
};

// ==================== 辅助函数 ====================

function tryCreateInputEvent(
  type: string,
  opts: InputEventInit = {},
): InputEvent | Event {
  try {
    return new InputEvent(type, opts);
  } catch {
    return new Event(type, {
      bubbles: opts.bubbles ?? true,
      cancelable: opts.cancelable ?? true,
    });
  }
}

function tryCreateKeyboardEvent(
  type: string,
  opts: KeyboardEventInit = {},
): KeyboardEvent | Event {
  try {
    return new KeyboardEvent(type, opts);
  } catch {
    return new Event(type, {
      bubbles: opts.bubbles ?? true,
      cancelable: opts.cancelable ?? true,
    });
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function textToHtmlPreserveBlankLines(text: string): string {
  const lines = text.split('\n');
  const paras: string[] = [];
  let buf: string[] = [];

  const flush = () => {
    if (!buf.length) return;
    const inner = buf.map((ln) => escapeHtml(ln)).join('<br>');
    paras.push(`<p>${inner}</p>`);
    buf = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (ln === '') {
      flush();
      paras.push('<p><br></p>');
    } else {
      buf.push(ln);
    }
  }
  flush();
  if (paras.length === 0) paras.push('<p><br></p>');
  return paras.join('');
}

function textToProseMirrorParagraphHTML(text: string): string {
  const lines = text.split('\n');
  if (lines.length === 0) return '<p><br></p>';
  let html = '';
  for (const ln of lines) {
    if (ln === '') html += '<p><br></p>';
    else html += `<p>${escapeHtml(ln)}</p>`;
  }
  return html;
}

// 获取原生 value setter
const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
  HTMLTextAreaElement.prototype,
  'value',
)?.set;
const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  'value',
)?.set;

function setNativeValue(el: HTMLElement, value: string): void {
  const setter =
    el.tagName === 'TEXTAREA'
      ? nativeTextareaValueSetter
      : el.tagName === 'INPUT'
        ? nativeInputValueSetter
        : null;
  if (setter) setter.call(el, value);
  else (el as HTMLInputElement).value = value;
}

// ==================== 核心函数 ====================

function getCurrentSiteConfig(): SiteConfig | null {
  const hostname = window.location.hostname;
  for (const key in siteConfigs) {
    if (hostname.includes(key)) return siteConfigs[key];
  }
  return null;
}

function resolveEditableTarget(el: Element | null): HTMLElement | null {
  if (!el) return null;
  const tag = el.tagName?.toLowerCase?.();
  if (tag === 'textarea' || tag === 'input') return el as HTMLElement;
  if (
    el.getAttribute?.('contenteditable') === 'true' ||
    (el as HTMLElement).isContentEditable
  )
    return el as HTMLElement;
  const inner = el.querySelector?.(
    '[contenteditable="true"], textarea, input, [role="textbox"]',
  );
  return (inner as HTMLElement) || (el as HTMLElement);
}

function findInputElement(): HTMLElement | null {
  const siteConfig = getCurrentSiteConfig();
  if (!siteConfig) return null;

  let inputElement: HTMLElement | null = null;

  // 尝试从 shadow root 中查找
  if (siteConfig.shadowRootSelector) {
    const host = document.querySelector(siteConfig.shadowRootSelector);
    if (host && (host as Element & { shadowRoot: ShadowRoot }).shadowRoot) {
      const elementInShadow = (
        host as Element & { shadowRoot: ShadowRoot }
      ).shadowRoot.querySelector(siteConfig.inputSelector);
      if (elementInShadow) inputElement = elementInShadow as HTMLElement;
    }
  }

  // 正常 DOM 查找
  if (!inputElement) {
    const selectors = siteConfig.inputSelector.split(',').map((s) => s.trim());
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        inputElement = element as HTMLElement;
        break;
      }
      if (inputElement) break;
    }
  }

  return resolveEditableTarget(inputElement);
}

function isKimiSite(): boolean {
  const h = location.hostname;
  return (
    h.includes('kimi.moonshot.cn') ||
    h.includes('kimi.com') ||
    h.includes('www.kimi.com')
  );
}

function isClaudeSite(): boolean {
  const h = location.hostname;
  return h.includes('claude.ai') || h.includes('fuclaude.com');
}

function clearEditableContent(el: HTMLElement): void {
  const target = resolveEditableTarget(el);
  if (!target) return;

  try {
    target.focus();
    try {
      document.execCommand('selectAll', false, undefined);
    } catch {
      // ignore
    }

    try {
      target.dispatchEvent(
        tryCreateInputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          inputType: 'deleteByCut',
          data: '',
        }),
      );
    } catch {
      // ignore
    }

    try {
      target.dispatchEvent(
        tryCreateInputEvent('input', {
          bubbles: true,
          cancelable: true,
          inputType: 'deleteByCut',
          data: '',
        }),
      );
    } catch {
      // ignore
    }

    try {
      document.execCommand('delete');
    } catch {
      // ignore
    }

    try {
      target.innerHTML = '';
    } catch {
      try {
        target.textContent = '';
      } catch {
        // ignore
      }
    }

    try {
      target.dispatchEvent(new Event('input', { bubbles: true }));
    } catch {
      // ignore
    }
    try {
      target.dispatchEvent(new Event('change', { bubbles: true }));
    } catch {
      // ignore
    }
  } catch {
    try {
      target.innerHTML = '';
    } catch {
      try {
        target.textContent = '';
      } catch {
        // ignore
      }
    }
    try {
      target.dispatchEvent(new Event('input', { bubbles: true }));
    } catch {
      // ignore
    }
  }
}

interface ReplaceOptions {
  mode?: 'default' | 'html-direct' | 'paste-only';
  clearBefore?: boolean;
  pmStrict?: boolean;
}

function replaceContentEditable(
  el: HTMLElement,
  text: string,
  opts: ReplaceOptions = {},
): void {
  const target = resolveEditableTarget(el);
  if (!target) return;

  const mode = opts.mode || 'default';
  const clearBefore = opts.clearBefore ?? false;
  const pmStrict = opts.pmStrict ?? false;

  try {
    target.focus();
    if (clearBefore) {
      clearEditableContent(target);
    }

    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(target);
    sel?.removeAllRanges();
    sel?.addRange(range);

    if (mode === 'html-direct') {
      const html = pmStrict
        ? textToProseMirrorParagraphHTML(text)
        : textToHtmlPreserveBlankLines(text);
      let ok = false;
      try {
        ok = document.execCommand('insertHTML', false, html);
      } catch {
        ok = false;
      }
      if (!ok) {
        try {
          target.innerHTML = html;
        } catch {
          target.textContent = text;
        }
      }
    } else if (mode === 'paste-only') {
      try {
        const html = pmStrict
          ? textToProseMirrorParagraphHTML(text)
          : textToHtmlPreserveBlankLines(text);
        const dt = new DataTransfer();
        dt.setData('text/plain', text);
        dt.setData('text/html', html);
        const evt = new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: dt,
        });
        const ok = target.dispatchEvent(evt);
        if (!ok) {
          target.innerHTML = html;
        }
      } catch {
        try {
          target.innerHTML = pmStrict
            ? textToProseMirrorParagraphHTML(text)
            : textToHtmlPreserveBlankLines(text);
        } catch {
          target.textContent = text;
        }
      }
    } else {
      try {
        document.execCommand('insertText', false, text);
      } catch {
        // ignore
      }
    }

    target.dispatchEvent(new Event('input', { bubbles: true }));
    target.dispatchEvent(new Event('change', { bubbles: true }));
  } catch {
    try {
      target.textContent = text;
    } catch {
      // ignore
    }
    target.dispatchEvent(new Event('input', { bubbles: true }));
    target.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function applyPromptToChat(
  inputElement: HTMLElement,
  finalPrompt: string,
): void {
  const target = resolveEditableTarget(inputElement);
  if (!target) return;

  const tagName = target.tagName?.toLowerCase?.();

  if (tagName === 'textarea') {
    const textarea = target as HTMLTextAreaElement;

    if (location.hostname.includes('tongyi.com')) {
      // 通义千问特殊处理
      textarea.focus();
      textarea.value = '';
      textarea.value = finalPrompt;

      [
        new Event('focus', { bubbles: true }),
        tryCreateInputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: finalPrompt,
        }),
        tryCreateInputEvent('input', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: finalPrompt,
        }),
        new Event('change', { bubbles: true }),
      ].forEach((ev, i) =>
        setTimeout(() => textarea.dispatchEvent(ev), i * 10),
      );

      setTimeout(() => {
        if (textarea.value !== finalPrompt) textarea.value = finalPrompt;
        textarea.blur();
        setTimeout(() => {
          textarea.focus();
          textarea.value = finalPrompt;
          textarea.dispatchEvent(
            tryCreateInputEvent('input', {
              bubbles: true,
              cancelable: true,
              data: finalPrompt,
              inputType: 'insertText',
            }),
          );
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
        }, 50);
      }, 150);
    } else if (location.hostname.includes('grok.com')) {
      // Grok 特殊处理
      textarea.focus();
      setNativeValue(textarea, '');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      setNativeValue(textarea, finalPrompt);

      try {
        textarea.setAttribute('value', finalPrompt);
      } catch {
        // ignore
      }

      textarea.dispatchEvent(
        tryCreateInputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertFromPaste',
          data: finalPrompt,
        }),
      );
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(
        tryCreateInputEvent('input', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: finalPrompt,
        }),
      );
      textarea.dispatchEvent(new Event('change', { bubbles: true }));

      try {
        textarea.setSelectionRange(finalPrompt.length, finalPrompt.length);
      } catch {
        // ignore
      }

      setTimeout(() => {
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
      }, 50);
    } else if (
      location.hostname.includes('openai.com') ||
      location.hostname.includes('chatgpt.com')
    ) {
      // ChatGPT 特殊处理
      textarea.value = finalPrompt;
      setTimeout(() => {
        textarea.focus();
        textarea.value = finalPrompt;
        if (typeof textarea.setSelectionRange === 'function')
          textarea.setSelectionRange(finalPrompt.length, finalPrompt.length);
        textarea.dispatchEvent(
          tryCreateInputEvent('input', {
            bubbles: true,
            cancelable: false,
            inputType: 'insertText',
          }),
        );
      }, 50);
    } else {
      // 默认 textarea 处理
      textarea.value = finalPrompt;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));

      // DeepSeek 特殊处理
      if (location.hostname.includes('deepseek.com')) {
        const parentDiv = textarea.parentElement;
        if (parentDiv) {
          let displayDiv = parentDiv.querySelector('.b13855df') as HTMLElement;
          if (!displayDiv) {
            const allDivs = parentDiv.querySelectorAll('div');
            for (const div of allDivs) {
              if (!div.classList.contains('_24fad49') && div !== parentDiv) {
                displayDiv = div as HTMLElement;
                break;
              }
            }
          }
          if (displayDiv) {
            displayDiv.innerHTML = '';
            finalPrompt.split('\n').forEach((line, idx) => {
              if (idx > 0) displayDiv.appendChild(document.createElement('br'));
              displayDiv.appendChild(document.createTextNode(line));
            });
          }
        }
      }
    }
  } else if (
    target.getAttribute?.('contenteditable') === 'true' ||
    target.isContentEditable
  ) {
    // contenteditable 元素处理
    if (isKimiSite()) {
      replaceContentEditable(target, finalPrompt, {
        mode: 'paste-only',
        clearBefore: true,
      });
      // Kimi 使用 Lexical 编辑器，不需要额外事件，直接返回
      return;
    } else if (isClaudeSite()) {
      replaceContentEditable(target, finalPrompt, {
        mode: 'html-direct',
        clearBefore: true,
        pmStrict: true,
      });
      // Claude 使用 ProseMirror 编辑器，不需要额外事件，直接返回
      return;
    } else if (
      location.hostname.includes('openai.com') ||
      location.hostname.includes('chatgpt.com')
    ) {
      // ChatGPT contenteditable
      target.innerHTML = '';
      const lines = finalPrompt.split('\n');
      lines.forEach((line, index) => {
        if (index > 0) target.appendChild(document.createElement('br'));
        if (line.length > 0) target.appendChild(document.createTextNode(line));
        else if (index < lines.length - 1)
          target.appendChild(document.createElement('br'));
      });

      const htmlWithBreaks = escapeHtml(finalPrompt).replace(/\n/g, '<br>');
      setTimeout(() => {
        target.focus();
        target.innerHTML = htmlWithBreaks;
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(target);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
        target.dispatchEvent(
          tryCreateInputEvent('input', {
            bubbles: true,
            cancelable: false,
            inputType: 'insertFromPaste',
          }),
        );
      }, 50);
    } else {
      // 默认 contenteditable 处理
      target.textContent = finalPrompt;
      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } else {
    // 其他类型元素
    if ('value' in target) (target as HTMLInputElement).value = finalPrompt;
    if (target.textContent !== undefined) target.textContent = finalPrompt;
  }

  // 触发通用事件
  const commonEvents =
    isKimiSite() || isClaudeSite()
      ? ['input', 'change', 'keydown', 'keyup']
      : ['input', 'change', 'keydown', 'keyup', 'paste'];

  commonEvents.forEach((type) => {
    let ev: Event;
    if (type === 'input')
      ev = tryCreateInputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: finalPrompt,
      });
    else if (type === 'keydown' || type === 'keyup')
      ev = tryCreateKeyboardEvent(type, {
        bubbles: true,
        cancelable: true,
        key: 'a',
        code: 'KeyA',
      });
    else ev = new Event(type, { bubbles: true, cancelable: true });
    try {
      target.dispatchEvent(ev);
    } catch {
      // ignore
    }
  });

  // DeepSeek 额外事件
  if (location.hostname.includes('deepseek.com')) {
    ['keydown', 'keypress', 'keyup'].forEach((t) =>
      target.dispatchEvent(
        tryCreateKeyboardEvent(t, {
          bubbles: true,
          cancelable: true,
          key: 'a',
          code: 'KeyA',
        }),
      ),
    );
    target.dispatchEvent(new Event('compositionstart', { bubbles: true }));
    target.dispatchEvent(new Event('compositionupdate', { bubbles: true }));
    target.dispatchEvent(new Event('compositionend', { bubbles: true }));
  }

  // 设置光标位置
  target.focus();
  if (tagName === 'textarea' || (target as HTMLInputElement).type === 'text') {
    try {
      (target as HTMLTextAreaElement).setSelectionRange(
        finalPrompt.length,
        finalPrompt.length,
      );
    } catch {
      // ignore
    }
  } else if (target.getAttribute?.('contenteditable') === 'true') {
    const range = document.createRange();
    const sel = window.getSelection();
    if (sel && target.childNodes.length > 0) {
      range.selectNodeContents(target);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  // 延迟触发事件确保生效
  setTimeout(() => {
    try {
      target.dispatchEvent(new Event('input', { bubbles: true }));
    } catch {
      // ignore
    }
    try {
      target.dispatchEvent(new Event('change', { bubbles: true }));
    } catch {
      // ignore
    }
  }, 100);
}

// ==================== 消息监听 ====================

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'APPLY_PROMPT') {
    const inputElement = findInputElement();
    if (inputElement) {
      applyPromptToChat(inputElement, message.content);
      sendResponse({ success: true });
    } else {
      console.error('[PromptHelper] Input element not found');
      sendResponse({ success: false, error: 'Input element not found' });
    }
    return true;
  }

  if (message.type === 'CLEAR_INPUT') {
    const inputElement = findInputElement();
    if (inputElement) {
      const target = resolveEditableTarget(inputElement);
      if (target) {
        if (target.tagName?.toLowerCase() === 'textarea') {
          (target as HTMLTextAreaElement).value = '';
          target.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          clearEditableContent(target);
        }
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Target not found' });
      }
    } else {
      sendResponse({ success: false, error: 'Input element not found' });
    }
    return true;
  }

  return false;
});

console.log('[PromptHelper] Content script loaded');
