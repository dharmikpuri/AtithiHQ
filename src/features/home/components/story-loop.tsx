"use client";

import { createContext, Fragment, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** How long one run of a story plays and then holds its finished state. */
const PLAY_MS = 7200;
/** Fade-out before the story starts again. Matches the `duration-500` transition below, plus a beat. */
const FADE_MS = 600;

const RunContext = createContext(0);

/**
 * Plays an illustration's story on a loop: each run re-mounts the `<Replay>` parts so their
 * CSS animations start from the beginning. It starts over whenever the illustration scrolls
 * back into view, runs only while it is on screen and the tab is visible, and stays still for
 * people who prefer reduced motion.
 */
export function StoryLoop({ className, children }: { className?: string; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let inView = true;
    /** Set once the illustration has been off screen, so coming back replays it from the start. */
    let wasHidden = false;
    let playTimer: number | undefined;
    let fadeTimer: number | undefined;
    const stop = () => {
      window.clearTimeout(playTimer);
      window.clearTimeout(fadeTimer);
    };
    const start = () => {
      stop();
      playTimer = window.setTimeout(() => {
        setFading(true);
        fadeTimer = window.setTimeout(() => {
          setFading(false);
          setRun((value) => value + 1);
        }, FADE_MS);
      }, PLAY_MS);
    };
    const update = () => (inView && !document.hidden ? start() : stop());

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) wasHidden = true;
      else if (wasHidden) {
        stop();
        setRun((value) => value + 1);
        return;
      }
      update();
    });
    observer.observe(root);
    document.addEventListener("visibilitychange", update);
    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [run]);

  return (
    <div ref={rootRef} data-fading={fading || undefined} className={cn("group/story", className)}>
      <RunContext.Provider value={run}>{children}</RunContext.Provider>
    </div>
  );
}

/** A part of the story that replays every run (and fades out between runs). */
export function Replay({ className, children }: { className?: string; children: ReactNode }) {
  const run = useContext(RunContext);
  return (
    <div className={cn("transition-opacity duration-500 ease-out group-data-fading/story:opacity-0", className)}>
      <Fragment key={run}>{children}</Fragment>
    </div>
  );
}
