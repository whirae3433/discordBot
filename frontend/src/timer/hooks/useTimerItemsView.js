import { useEffect, useMemo, useState } from 'react';

function mapServerItemToUi(it) {
  return {
    id: it.id,
    title: it.title,
    durationSec: it.durationSec,
    running: !!it.running,
    endsAtMs: it.endsAt ? new Date(it.endsAt).getTime() : null,
  };
}

export function useTimerItemsView({ roomState, selectedKey, mode }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!roomState?.items) {
      setItems([]);
      return;
    }

    const mapped = (roomState.items || [])
      .filter((it) => it.setKey === selectedKey)
      .map(mapServerItemToUi);

    setItems(mapped);
  }, [roomState, selectedKey]);

  return { items, setItems };
}
