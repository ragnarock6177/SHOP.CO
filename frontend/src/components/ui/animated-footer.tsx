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
const HIGHLIGHT_LIFETIME = 250;
const CLUSTER_SIZE = 6;
const PARALLAX_EASE = 0.08;

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
  columns = 75,
  cellSize = 14,
  fontSize = 12,
  parallaxStrength = 12,
  hoverRadius = 6,
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

    const isMobile =
      typeof window !== "undefined" &&
      (window.innerWidth < 768 || "ontouchstart" in window);

    const hands: Hand[] = [];
    const wrappers = [leftWrap, rightWrap];

    const setupHand = (
      image: HTMLImageElement,
      canvas: HTMLCanvasElement,
      direction: 1 | -1,
    ) => {
      const activeCols = isMobile ? Math.min(columns, 50) : columns;
      const { rows, cells } = buildHandCells(image, activeCols, asciiChars);
      if (cells.size === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = activeCols * cellSize * dpr;
      canvas.height = rows * cellSize * dpr;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";

      const metrics = ctx.measureText("X");
      const glyphHeight =
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      const baselineOffset =
        cellSize / 2 + glyphHeight / 2 - metrics.actualBoundingBoxDescent;

      const hand: Hand = {
        canvas,
        ctx,
        cells,
        cellList: [...cells.values()],
        rows,
        columns: activeCols,
        cellSize,
        baselineOffset,
        direction,
      };

      hands.push(hand);

      // Render static frame once immediately on setup
      renderHand(hand, 0);
    };

    const loadHand = (
      src: string,
      canvas: HTMLCanvasElement,
      direction: 1 | -1,
    ) => {
      if (!src) return;
      const image = new Image();
      image.crossOrigin = "anonymous";
      let initialized = false;
      const init = () => {
        if (initialized) return;
        initialized = true;
        setupHand(image, canvas, direction);
      };
      image.onload = init;
      image.src = src;
      if (image.complete && image.naturalWidth) init();
    };

    loadHand(leftImage, leftCanvasRef.current!, 1);
    loadHand(rightImage, rightCanvasRef.current!, -1);

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
        charColor: cc,
        hoverColor: hc,
        hoverCharColor: hcc,
      } = liveRef.current;

      ctx.clearRect(0, 0, cols * cs, rows * cs);

      for (const cell of cellList) {
        const x = cell.col * cs;
        const y = cell.row * cs;
        const isHighlighted = cell.highlightEndTime > now;

        if (isHighlighted) {
          ctx.fillStyle = hc;
          ctx.fillRect(x, y, cs, cs);
        }
        ctx.fillStyle = isHighlighted ? hcc : cc;
        ctx.fillText(cell.char, x + cs / 2, y + baselineOffset);
      }
    };

    const pointer = { x: 0, y: 0 };
    const drift = { x: 0, y: 0 };
    const curtain = { offset: revealOnScroll ? 125 : 0 };
    let isMouseMoving = false;
    let idleTimer: NodeJS.Timeout;

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

    const onMouseMove = (event: MouseEvent) => {
      if (isMobile) return;
      isMouseMoving = true;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        isMouseMoving = false;
      }, 1000);

      const strength = liveRef.current.parallaxStrength;
      const rect = root.getBoundingClientRect();
      const w = rect.width || 1;
      const h = rect.height || 1;
      pointer.x = ((event.clientX - rect.left) / w - 0.5) * strength * 2;
      pointer.y = ((event.clientY - rect.top) / h - 0.5) * strength * 2;
      for (const hand of hands) hoverHand(hand, event.clientX, event.clientY);
    };

    if (!isMobile) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
    }

    let rafId = 0;
    const frame = () => {
      const now = Date.now();

      // Only re-render canvas when active mouse movement or ongoing highlight exists
      if (isMouseMoving || hands.some((h) => h.cellList.some((c) => c.highlightEndTime > now))) {
        for (const hand of hands) renderHand(hand, now);

        drift.x += (pointer.x - drift.x) * PARALLAX_EASE;
        drift.y += (pointer.y - drift.y) * PARALLAX_EASE;
        const strength = liveRef.current.parallaxStrength;
        const scale = 1 + (strength * 2) / 200;

        wrappers.forEach((wrapper, i) => {
          const dir = i === 0 ? 1 : -1;
          const revealX = i === 0 ? -curtain.offset : curtain.offset;
          const x = drift.x * dir || 0;
          const y = -drift.y || 0;
          wrapper.style.transform = `translateX(${revealX}%) translate(${x}px, ${y}px) scale(${scale})`;
        });
      }

      rafId = requestAnimationFrame(frame);
    };

    if (!isMobile) {
      rafId = requestAnimationFrame(frame);
    }

    const chars = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll("[data-af-char]"),
    );

    const animateIn = () => {
      gsap.to(curtain, {
        offset: 0,
        duration: 0.8,
        ease: "power3.out",
        overwrite: true,
        onUpdate: () => {
          wrappers.forEach((wrapper, i) => {
            const revealX = i === 0 ? -curtain.offset : curtain.offset;
            wrapper.style.transform = `translateX(${revealX}%)`;
          });
        },
      });
      gsap.to(chars, {
        yPercent: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: { each: 0.03, from: "center" },
        overwrite: true,
      });
    };

    const animateOut = () => {
      gsap.to(curtain, {
        offset: 125,
        duration: 0.4,
        ease: "power2.in",
        overwrite: true,
        onUpdate: () => {
          wrappers.forEach((wrapper, i) => {
            const revealX = i === 0 ? -curtain.offset : curtain.offset;
            wrapper.style.transform = `translateX(${revealX}%)`;
          });
        },
      });
      gsap.to(chars, {
        yPercent: 125,
        duration: 0.4,
        ease: "power2.in",
        stagger: { each: 0.01, from: "center" },
        overwrite: true,
      });
    };

    animateInRef.current = animateIn;
    animateOutRef.current = animateOut;

    const maskAll = () => {
      gsap.set(chars, { yPercent: 125 });
    };
    const showAll = () => {
      gsap.set(chars, { yPercent: 0 });
    };

    let observer: IntersectionObserver | null = null;

    if (revealed !== undefined) {
      curtain.offset = revealed ? 0 : 125;
      if (revealed) showAll();
      else maskAll();
    } else if (revealOnScroll) {
      maskAll();
      let isRevealed = false;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !isRevealed) {
              isRevealed = true;
              animateIn();
            } else if (!entry.isIntersecting && isRevealed) {
              isRevealed = false;
              animateOut();
            }
          }
        },
        { root: null, threshold: 0.05 },
      );
      observer.observe(root);
    } else {
      showAll();
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", onMouseMove);
      observer?.disconnect();
      gsap.killTweensOf([curtain, ...chars]);
    };
  }, [sig]);

  useEffect(() => {
    if (revealed === undefined) return;
    if (revealed) animateInRef.current();
    else animateOutRef.current();
  }, [revealed]);

  const startsHidden = revealed !== undefined ? !revealed : revealOnScroll;
  const offEdge = startsHidden ? 125 : 0;

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
      {/* ASCII hands */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex justify-between",
          handsAlignmentClass,
        )}
      >
        <div
          ref={leftWrapRef}
          className={cn("relative gpu-layer", handWidthClass)}
          style={{ transform: `translateX(-${offEdge}%)` }}
        >
          <canvas ref={leftCanvasRef} className="block h-auto w-full" />
        </div>
        <div
          ref={rightWrapRef}
          className={cn("relative gpu-layer", handWidthClass)}
          style={{ transform: `translateX(${offEdge}%)` }}
        >
          <canvas ref={rightCanvasRef} className="block h-auto w-full" />
        </div>
      </div>

      {/* Display headings */}
      {headingLines && headingLines.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 pt-8 sm:pt-14 pointer-events-none z-10">
          {headingLines.map((word, wi) => (
            <h2
              key={`${word}-${wi}`}
              aria-label={word}
              className="overflow-hidden font-be-vietnam-pro-black px-12 font-black leading-none tracking-widest text-black text-center translate-y-3 sm:translate-y-5 pt-[0.3em] mt-[-0.3em] pb-[0.1em]"
              style={{ fontSize: "clamp(2.5rem, 12.5vw, 11rem)" }}
            >
              {Array.from(word).map((ch, ci) => (
                <span
                  key={ci}
                  data-af-char
                  aria-hidden="true"
                  className="inline-block gpu-layer"
                >
                  {ch === " " ? " " : ch}
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
