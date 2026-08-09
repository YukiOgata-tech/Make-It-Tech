"use client";

import { useEffect, useRef } from "react";

/**
 * 背景の「場」。
 *
 * ポインタやタッチの位置を CSS 変数に流し込み、そこを中心に読み取り範囲の
 * ような光をにじませる。ページ全体が反応する面であることを示すためのもので、
 * このサイトの見た目を決めている中心。
 *
 * 座標の更新は requestAnimationFrame でまとめ、1フレームに1回だけ書き込む。
 * 動きを減らす設定のときは何もしない（CSS 側でも transition を止めている）。
 */
export function NfcField() {
  const frame = useRef<number | null>(null);
  const point = useRef({ x: 50, y: 28 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const root = document.querySelector<HTMLElement>(".nfc-root");
    if (!root) return;

    const apply = () => {
      frame.current = null;
      root.style.setProperty("--nfc-px", `${point.current.x}%`);
      root.style.setProperty("--nfc-py", `${point.current.y}%`);
    };

    const schedule = () => {
      if (frame.current !== null) return;
      frame.current = window.requestAnimationFrame(apply);
    };

    const track = (clientX: number, clientY: number) => {
      point.current = {
        x: (clientX / window.innerWidth) * 100,
        y: (clientY / window.innerHeight) * 100,
      };
      schedule();
    };

    const onPointerMove = (event: PointerEvent) => track(event.clientX, event.clientY);
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) track(touch.clientX, touch.clientY);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <>
      <div className="nfc-grid" aria-hidden />
      <div className="nfc-field" aria-hidden />
    </>
  );
}
