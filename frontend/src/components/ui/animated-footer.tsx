"use client";

import * as React from "react";
import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export interface AnimatedFooterProps {
  headingLines?: string[];
  leftImage?: string;
  rightImage?: string;
  background?: string;
  textColor?: string;
  asciiChars?: string;
  charColor?: string;
  hoverColor?: string;
  hoverCharColor?: string;
  columns?: number;
  cellSize?: number;
  fontSize?: number;
  parallaxStrength?: number;
  hoverRadius?: number;
  revealOnScroll?: boolean;
  revealed?: boolean;
  handWidthClass?: string;
  handsAlignmentClass?: string;
  className?: string;
}

const DEFAULT_ASCII_CHARS = "........:::=+xX#0369";
const HIGHLIGHT_LIFETIME = 220;
const CLUSTER_SIZE = 5;
const PARALLAX_EASE = 0.06;

interface Cell {
  col: number;
  row: number;
  char: string;
  highlightEndTime: number;
}

interface Hand {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cells: Map<string, Cell>;
  cellList: Cell[];
  rows: number;
  columns: number;
  cellSize: number;
  baselineOffset: number;
  direction: 1 | -1;
}

function getResponsiveAsciiConfig(
  viewportWidth: number,
  columns: number,
  cellSize: number,
  fontSize: number,
) {
  if (viewportWidth < 640) {
    return {
      columns: Math.min(columns, 42),
      cellSize: Math.max(cellSize - 2, 10),
      fontSize: Math.max(fontSize - 1, 10),
    };
  }
  if (viewportWidth < 1024) {
    return {
      columns: Math.min(columns, 58),
      cellSize: Math.max(cellSize - 1, 11),
      fontSize,
    };
  }
  return { columns, cellSize, fontSize };
}

function buildHandCells(
  image: HTMLImageElement,
  columns: number,
  asciiChars: string,
): { rows: number; cells: Map<string, Cell> } {
  const rows = Math.max(
    1,
    Math.round(columns / (image.naturalWidth / image.naturalHeight || 1)),
  );

  const sampler = document.createElement("canvas");
  sampler.width = columns;
  sampler.height = rows;
  const sampleCtx = sampler.getContext("2d");
  const cells = new Map<string, Cell>();
  if (!sampleCtx) return { rows, cells };

  sampleCtx.drawImage(image, 0, 0, columns, rows);
  const pixels = sampleCtx.getImageData(0, 0, columns, rows).data;
  const backgroundCharIndex = asciiChars.lastIndexOf(".");

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const offset = (row * columns + col) * 4;
      const brightness =
        (pixels[offset] * 0.299 +
          pixels[offset + 1] * 0.587 +
          pixels[offset + 2] * 0.114) /
        255;
      const charIndex = Math.min(
        asciiChars.length - 1,
        Math.floor((1 - brightness) * asciiChars.length),
      );
      if (charIndex <= backgroundCharIndex) continue;

      cells.set(`${col},${row}`, {
        col,
        row,
        char: asciiChars[charIndex],
        highlightEndTime: 0,
      });
    }
  }

  return { rows, cells };
}

function highlightCluster(cells: Map<string, Cell>, startCell: Cell) {
  const now = Date.now();
  startCell.highlightEndTime = now + HIGHLIGHT_LIFETIME;

  const steps = Math.floor(Math.random() * CLUSTER_SIZE) + 1;
  const litCells = [startCell];
  let current = startCell;

  for (let step = 0; step < steps; step++) {
    const neighbours: Cell[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const neighbour = cells.get(`${current.col + dx},${current.row + dy}`);
        if (neighbour && !litCells.includes(neighbour))
          neighbours.push(neighbour);
      }
    }
    if (neighbours.length === 0) break;

    const next = neighbours[Math.floor(Math.random() * neighbours.length)];
    next.highlightEndTime = now + HIGHLIGHT_LIFETIME + step * 8;
    litCells.push(next);
    current = next;
  }
}

function applyWrapperTransform(
  wrapper: HTMLDivElement,
  revealX: number,
  x: number,
  y: number,
) {
  wrapper.style.transform = `translate3d(calc(${revealX}% + ${x}px), ${y}px, 0)`;
}

export function AnimatedFooter({
  headingLines = ["AIRAVÉ"],
  leftImage = "/animated-footer/hand-left.jpg",
  rightImage = "/animated-footer/hand-right.jpg",
  background,
  textColor,
  charColor,
  hoverColor,
  hoverCharColor,
  asciiChars = DEFAULT_ASCII_CHARS,
  columns = 88,
  cellSize = 11,
  fontSize = 11,
  parallaxStrength = 5,
  hoverRadius = 5,
  revealOnScroll = true,
  handWidthClass = "w-2/5 min-w-[200px]",
  handsAlignmentClass = "items-center",
  revealed,
  className,
}: AnimatedFooterProps) {
  const rootRef = useRef<HTMLElement>(null);
  const leftWrapRef = useRef<HTMLDivElement>(null);
  const rightWrapRef = useRef<HTMLDivElement>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);

  const animateInRef = useRef<() => void>(() => {});
  const animateOutRef = useRef<() => void>(() => {});

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const cc = charColor ?? (isDark ? "#803500" : "#a3a3a3");
  const hc = hoverColor ?? "#000000";
  const hcc = hoverCharColor ?? "#ffffff";

  const liveRef = useRef({
    charColor: cc,
    hoverColor: hc,
    hoverCharColor: hcc,
    parallaxStrength,
    hoverRadius,
  });

  useEffect(() => {
    liveRef.current = {
      charColor: cc,
      hoverColor: hc,
      hoverCharColor: hcc,
      parallaxStrength,
      hoverRadius,
    };
  }, [cc, hc, hcc, parallaxStrength, hoverRadius]);

  useEffect(() => {
    [leftImage, rightImage].forEach((src) => {
      if (!src || typeof document === "undefined") return;
      if (document.querySelector(`link[data-af-preload="${src}"]`)) return;
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      link.setAttribute("data-af-preload", src);
      document.head.appendChild(link);
    });
  }, [leftImage, rightImage]);

  const sig = useMemo(
    () =>
      JSON.stringify({
        leftImage,
        rightImage,
        columns,
        cellSize,
        fontSize,
        asciiChars,
        revealOnScroll,
        headingLines,
      }),
    [
      leftImage,
      rightImage,
      columns,
      cellSize,
      fontSize,
      asciiChars,
      revealOnScroll,
      headingLines,
    ],
  );

  useEffect(() => {
    const root = rootRef.current;
    const leftWrap = leftWrapRef.current;
    const rightWrap = rightWrapRef.current;
    if (!root || !leftWrap || !rightWrap) return;

    const isTouchDevice =
      typeof window !== "undefined" &&
      (window.innerWidth < 768 || "ontouchstart" in window);

    const hands: Hand[] = [];
    const wrappers = [leftWrap, rightWrap];
    let handsLoaded = 0;
    let isRevealed = false;
    let wantsReveal = false;

    const setupHand = (
      image: HTMLImageElement,
      canvas: HTMLCanvasElement,
      direction: 1 | -1,
    ) => {
      const responsive = getResponsiveAsciiConfig(
        window.innerWidth,
        columns,
        cellSize,
        fontSize,
      );
      const { rows, cells } = buildHandCells(
        image,
        responsive.columns,
        asciiChars,
      );
      if (cells.size === 0) {
        handsLoaded += 1;
        onHandReady();
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = responsive.columns * responsive.cellSize * dpr;
      canvas.height = rows * responsive.cellSize * dpr;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${responsive.fontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";

      const metrics = ctx.measureText("X");
      const glyphHeight =
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      const baselineOffset =
        responsive.cellSize / 2 +
        glyphHeight / 2 -
        metrics.actualBoundingBoxDescent;

      const hand: Hand = {
        canvas,
        ctx,
        cells,
        cellList: [...cells.values()],
        rows,
        columns: responsive.columns,
        cellSize: responsive.cellSize,
        baselineOffset,
        direction,
      };

      hands.push(hand);
      renderHand(hand, 0);
      handsLoaded += 1;
      onHandReady();
    };

    let onHandReady: () => void = () => {};

    const renderHand = (hand: Hand, now: number) => {
      const {
        ctx,
        cellList,
        cellSize: cs,
        baselineOffset,
        columns: cols,
        rows,
      } = hand;
      const {
        charColor: activeCharColor,
        hoverColor: activeHoverColor,
        hoverCharColor: activeHoverCharColor,
      } = liveRef.current;

      ctx.clearRect(0, 0, cols * cs, rows * cs);

      for (const cell of cellList) {
        const x = cell.col * cs;
        const y = cell.row * cs;
        const isHighlighted = cell.highlightEndTime > now;

        if (isHighlighted) {
          ctx.fillStyle = activeHoverColor;
          ctx.fillRect(x, y, cs, cs);
        }
        ctx.fillStyle = isHighlighted ? activeHoverCharColor : activeCharColor;
        ctx.fillText(cell.char, x + cs / 2, y + baselineOffset);
      }
    };

    const pointer = { x: 0, y: 0 };
    const drift = { x: 0, y: 0 };
    const curtain = { offset: revealOnScroll ? 125 : 0 };
    let isPointerInside = false;
    let isFooterVisible = !revealOnScroll;
    let rafId = 0;

    const hoverHand = (hand: Hand, clientX: number, clientY: number) => {
      const rect = hand.canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const mouseCol = ((clientX - rect.left) / rect.width) * hand.columns;
      const mouseRow = ((clientY - rect.top) / rect.height) * hand.rows;

      let closest: Cell | null = null;
      let closestDist = Infinity;
      for (const cell of hand.cellList) {
        const dx = mouseCol - cell.col;
        const dy = mouseRow - cell.row;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closest = cell;
        }
      }
      if (closest && closestDist <= liveRef.current.hoverRadius) {
        highlightCluster(hand.cells, closest);
      }
    };

    const onPointerMove = (event: MouseEvent) => {
      if (isTouchDevice || !isFooterVisible) return;

      const strength = liveRef.current.parallaxStrength;
      const rect = root.getBoundingClientRect();
      const w = rect.width || 1;
      const h = rect.height || 1;
      pointer.x = ((event.clientX - rect.left) / w - 0.5) * strength;
      pointer.y = ((event.clientY - rect.top) / h - 0.5) * strength * 0.35;

      for (const hand of hands) hoverHand(hand, event.clientX, event.clientY);
    };

    const onPointerEnter = () => {
      isPointerInside = true;
    };

    const onPointerLeave = () => {
      isPointerInside = false;
      pointer.x = 0;
      pointer.y = 0;
    };

    if (!isTouchDevice) {
      root.addEventListener("mousemove", onPointerMove, { passive: true });
      root.addEventListener("mouseenter", onPointerEnter, { passive: true });
      root.addEventListener("mouseleave", onPointerLeave, { passive: true });
    }

    const frame = () => {
      const now = Date.now();
      const hasHighlights = hands.some((hand) =>
        hand.cellList.some((cell) => cell.highlightEndTime > now),
      );
      const shouldAnimateParallax =
        !isTouchDevice && isFooterVisible && (isPointerInside || hasHighlights);

      if (shouldAnimateParallax) {
        drift.x += (pointer.x - drift.x) * PARALLAX_EASE;
        drift.y += (pointer.y - drift.y) * PARALLAX_EASE;
      } else {
        drift.x += (0 - drift.x) * PARALLAX_EASE;
        drift.y += (0 - drift.y) * PARALLAX_EASE;
      }

      if (hasHighlights) {
        for (const hand of hands) renderHand(hand, now);
      }

      wrappers.forEach((wrapper, index) => {
        const revealX = index === 0 ? -curtain.offset : curtain.offset;
        const direction = index === 0 ? 1 : -1;
        applyWrapperTransform(
          wrapper,
          revealX,
          drift.x * direction,
          -drift.y,
        );
      });

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    const chars = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll("[data-af-char]"),
    );

    const syncRevealTransforms = () => {
      wrappers.forEach((wrapper, index) => {
        const revealX = index === 0 ? -curtain.offset : curtain.offset;
        applyWrapperTransform(wrapper, revealX, 0, 0);
      });
    };

    const animateIn = () => {
      gsap.to(curtain, {
        offset: 0,
        duration: 0.85,
        ease: "power3.out",
        overwrite: true,
      });
      gsap.to(chars, {
        yPercent: 0,
        duration: 0.85,
        ease: "power3.out",
        stagger: { each: 0.03, from: "center" },
        overwrite: true,
      });
    };

    const animateOut = () => {
      gsap.to(curtain, {
        offset: 125,
        duration: 0.45,
        ease: "power2.in",
        overwrite: true,
      });
      gsap.to(chars, {
        yPercent: 125,
        duration: 0.45,
        ease: "power2.in",
        stagger: { each: 0.01, from: "center" },
        overwrite: true,
      });
    };

    animateInRef.current = animateIn;
    animateOutRef.current = animateOut;

    const tryReveal = () => {
      if (!wantsReveal || isRevealed) return;
      if (handsLoaded < 2) return;
      isRevealed = true;
      animateIn();
    };

    onHandReady = tryReveal;

    const loadHand = (
      src: string,
      canvas: HTMLCanvasElement,
      direction: 1 | -1,
    ): Promise<void> => {
      if (!src) {
        handsLoaded += 1;
        onHandReady();
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        let initialized = false;
        const init = () => {
          if (initialized) return;
          initialized = true;
          setupHand(image, canvas, direction);
          resolve();
        };
        const fail = () => {
          handsLoaded += 1;
          onHandReady();
          resolve();
        };
        image.onload = init;
        image.onerror = fail;
        image.src = src;
        if (image.complete && image.naturalWidth) init();
      });
    };

    const requestReveal = () => {
      wantsReveal = true;
      tryReveal();
    };

    const requestHide = () => {
      wantsReveal = false;
      if (!isRevealed) return;
      isRevealed = false;
      animateOut();
    };

    void Promise.all([
      loadHand(leftImage, leftCanvasRef.current!, 1),
      loadHand(rightImage, rightCanvasRef.current!, -1),
    ]);

    const maskAll = () => {
      gsap.set(chars, { yPercent: 125 });
    };
    const showAll = () => {
      gsap.set(chars, { yPercent: 0 });
    };

    let observer: IntersectionObserver | null = null;

    if (revealed !== undefined) {
      if (revealed) {
        wantsReveal = true;
        isRevealed = false;
        curtain.offset = 125;
        if (handsLoaded >= 2) {
          curtain.offset = 0;
          isRevealed = true;
          showAll();
        } else {
          maskAll();
        }
      } else {
        curtain.offset = 125;
        maskAll();
        wantsReveal = false;
        isRevealed = false;
      }
      syncRevealTransforms();
    } else if (revealOnScroll) {
      maskAll();
      syncRevealTransforms();

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            isFooterVisible = entry.isIntersecting;
            if (entry.isIntersecting) {
              requestReveal();
            } else {
              isPointerInside = false;
              pointer.x = 0;
              pointer.y = 0;
              requestHide();
            }
          }
        },
        { root: null, threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
      );
      observer.observe(root);

      const rect = root.getBoundingClientRect();
      const alreadyVisible =
        rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
      if (alreadyVisible) {
        isFooterVisible = true;
        requestReveal();
      }
    } else {
      showAll();
      curtain.offset = 0;
      isRevealed = true;
      syncRevealTransforms();
    }

    return () => {
      cancelAnimationFrame(rafId);
      root.removeEventListener("mousemove", onPointerMove);
      root.removeEventListener("mouseenter", onPointerEnter);
      root.removeEventListener("mouseleave", onPointerLeave);
      observer?.disconnect();
      gsap.killTweensOf([curtain, ...chars]);
    };
  }, [sig, revealOnScroll, revealed]);

  useEffect(() => {
    if (revealed === undefined) return;
    if (revealed) animateInRef.current();
    else animateOutRef.current();
  }, [revealed]);

  return (
    <footer
      ref={rootRef}
      className={cn(
        "relative h-full w-full overflow-hidden select-none gpu-layer",
        !background && "bg-white dark:bg-black",
        !textColor && "text-black dark:text-white",
        className,
      )}
      style={{
        backgroundColor: background,
        color: textColor,
      }}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex justify-between",
          handsAlignmentClass,
        )}
      >
        <div
          ref={leftWrapRef}
          className={cn("relative gpu-layer will-change-transform", handWidthClass)}
        >
          <canvas ref={leftCanvasRef} className="block h-auto w-full opacity-90" />
        </div>
        <div
          ref={rightWrapRef}
          className={cn("relative gpu-layer will-change-transform", handWidthClass)}
        >
          <canvas ref={rightCanvasRef} className="block h-auto w-full opacity-90" />
        </div>
      </div>

      {headingLines && headingLines.length > 0 && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4 pb-2 pt-6 sm:px-8 sm:pb-4 sm:pt-10">
          {headingLines.map((word, wordIndex) => (
            <h2
              key={`${word}-${wordIndex}`}
              aria-label={word}
              className="overflow-hidden px-4 text-center font-be-vietnam-pro-black font-black leading-none tracking-[0.08em] text-black sm:px-10 sm:tracking-widest"
              style={{ fontSize: "clamp(2rem, 11vw, 9.5rem)" }}
            >
              {Array.from(word).map((character, charIndex) => (
                <span
                  key={charIndex}
                  data-af-char
                  aria-hidden="true"
                  className="inline-block gpu-layer"
                >
                  {character === " " ? "\u00a0" : character}
                </span>
              ))}
            </h2>
          ))}
        </div>
      )}
    </footer>
  );
}

export default AnimatedFooter;
