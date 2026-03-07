export function useTimerApi() {
  const API_BASE = process.env.REACT_APP_BASE_URL || '';

  const replaceItems = async ({ roomId, setKey, items }) => {
    const res = await fetch(`${API_BASE}/timer/items/replace`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, setKey, items }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || 'replace failed');
    return data;
  };

  const startItem = async (itemId) => {
    const res = await fetch(`${API_BASE}/timer/items/${itemId}/start`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('start failed');
  };

  const stopItem = async (itemId) => {
    const res = await fetch(`${API_BASE}/timer/items/${itemId}/stop`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('stop failed');
  };

  return { replaceItems, startItem, stopItem };
}
