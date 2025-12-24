/**
 * IndexedDB 封装模块
 * 用于 prompt 数据的持久化存储
 */

// 数据库配置
const DB_NAME = 'prompt-helper';
const DB_VERSION = 1;
const STORE_NAME = 'prompts';

// Prompt 接口定义
export interface Prompt {
  id?: number; // 自增主键
  name: string;
  content: string;
  category?: string;
  model?: string;
  createdAt: number; // 创建时间戳
  updatedAt: number; // 更新时间戳
}

// 新增 Prompt 的输入类型（不含 id 和时间戳）
export type PromptInput = Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * 打开/初始化数据库
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 创建 prompts 对象存储
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });

        // 创建索引便于后续查询
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
  });
}

/**
 * 添加新的 Prompt
 * @param input Prompt 输入数据（不含 id 和时间戳）
 * @returns 新创建的 Prompt id
 */
export async function addPrompt(input: PromptInput): Promise<number> {
  const db = await openDB();
  const now = Date.now();

  const prompt: Prompt = {
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(prompt);

    request.onsuccess = () => {
      resolve(request.result as number);
    };

    request.onerror = () => {
      reject(new Error('Failed to add prompt'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * 根据 id 获取单个 Prompt
 * @param id Prompt id
 * @returns Prompt 或 undefined
 */
export async function getPrompt(id: number): Promise<Prompt | undefined> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result as Prompt | undefined);
    };

    request.onerror = () => {
      reject(new Error('Failed to get prompt'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * 获取所有 Prompts
 * @returns Prompt 数组
 */
export async function getAllPrompts(): Promise<Prompt[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as Prompt[]);
    };

    request.onerror = () => {
      reject(new Error('Failed to get all prompts'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * 更新 Prompt
 * @param id Prompt id
 * @param input 要更新的字段
 */
export async function updatePrompt(
  id: number,
  input: Partial<PromptInput>,
): Promise<void> {
  const db = await openDB();
  const existing = await getPrompt(id);

  if (!existing) {
    throw new Error(`Prompt with id ${id} not found`);
  }

  const updated: Prompt = {
    ...existing,
    ...input,
    updatedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(updated);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to update prompt'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * 删除 Prompt
 * @param id Prompt id
 */
export async function deletePrompt(id: number): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to delete prompt'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}
