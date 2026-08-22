import { useEffect, useRef, useState } from "react";

/** 偵測橫向容器是否還有更多內容可滾動，驅動右側漸隱提示 */
export function useScrollHint<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setCanScroll(el.scrollWidth > el.clientWidth + 8);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, []);

  return { ref, canScroll };
}
