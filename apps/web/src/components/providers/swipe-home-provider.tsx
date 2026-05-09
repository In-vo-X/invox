"use client";

import { PropsWithChildren, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const MIN_HORIZONTAL_SWIPE = 90;
const MAX_VERTICAL_DRIFT = 80;

export function SwipeHomeProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    function handleTouchStart(event: TouchEvent) {
      const touch = event.changedTouches[0];

      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
    }

    function handleTouchEnd(event: TouchEvent) {
      if (pathname === "/") {
        touchStartX.current = null;
        touchStartY.current = null;
        return;
      }

      const startX = touchStartX.current;
      const startY = touchStartY.current;

      if (startX === null || startY === null) {
        return;
      }

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      touchStartX.current = null;
      touchStartY.current = null;

      const isRightToLeftSwipe = deltaX <= -MIN_HORIZONTAL_SWIPE;
      const verticalDriftIsSmall = Math.abs(deltaY) <= MAX_VERTICAL_DRIFT;
      const horizontalMovementDominates = Math.abs(deltaX) > Math.abs(deltaY);

      if (
        isRightToLeftSwipe &&
        verticalDriftIsSmall &&
        horizontalMovementDominates
      ) {
        router.push("/");
      }
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pathname, router]);

  return children;
}
