import { useEffect, useState } from 'react';
import { mapServerItemToWatch } from '../selectors/timerSelectors';

export function useTimerItemsView({ roomState, selectedKey, nowTick }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!roomState?.items) {
      setItems([]);
      return;
    }

    const mapped = (roomState.items || [])
      .filter((it) => it.setKey === selectedKey)
      .map((it) =>
        mapServerItemToWatch(it, nowTick, roomState.autoRepeatBySet),
      );

    setItems(mapped);
  }, [roomState, selectedKey, nowTick]);

  return { items, setItems };
}
