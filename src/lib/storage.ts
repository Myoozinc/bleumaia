import { GeneratedAsset, ProviderId } from './types';

const STORAGE_KEYS_PREFIX = 'bleumaia_api_key_';
const STORAGE_HISTORY_KEY = 'bleumaia_history_v1';

export function getStoredApiKey(provider: ProviderId): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(`${STORAGE_KEYS_PREFIX}${provider}`) || '';
}

export function saveStoredApiKey(provider: ProviderId, key: string): void {
  if (typeof window === 'undefined') return;
  if (!key.trim()) {
    localStorage.removeItem(`${STORAGE_KEYS_PREFIX}${provider}`);
  } else {
    localStorage.setItem(`${STORAGE_KEYS_PREFIX}${provider}`, key.trim());
  }
}

export function getAllStoredApiKeys(): Record<ProviderId, string> {
  const result: Partial<Record<ProviderId, string>> = {};
  if (typeof window === 'undefined') return result as Record<ProviderId, string>;
  
  const providers: ProviderId[] = [
    'pollinations',
    'siliconflow',
    'huggingface',
    'cloudflare',
    'gemini',
    'zhipu',
    'dashscope'
  ];

  providers.forEach(p => {
    result[p] = getStoredApiKey(p);
  });

  return result as Record<ProviderId, string>;
}

export function getHistory(): GeneratedAsset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading history from localStorage', e);
    return [];
  }
}

export function saveToHistory(asset: GeneratedAsset): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getHistory();
    // Prepend new item and keep max 50 items
    const updated = [asset, ...current.filter(item => item.id !== asset.id)].slice(0, 50);
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving asset to history', e);
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_HISTORY_KEY);
}

export function deleteHistoryItem(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getHistory();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting item from history', e);
  }
}
