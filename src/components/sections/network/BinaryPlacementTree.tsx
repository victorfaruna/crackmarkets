"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  buildBinaryLevels,
  countBinaryDescendants,
  visibleBinaryDepth,
  type BinaryPlacementMember,
  type BinaryTreeSlot,
  type BinaryDescendantCounts,
} from "@/src/lib/referrals/binary-tree";

interface BinaryPlacementTreeProps {
  rootId: string;
  rootName: string;
  members: BinaryPlacementMember[];
  isLoading: boolean;
}

interface CanvasView {
  x: number;
  y: number;
  scale: number;
}

const CELL_WIDTH = 336;
const MIN_SCALE = 0.1;
const MAX_SCALE = 2;

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

export default function BinaryPlacementTree({
  rootId,
  rootName,
  members,
  isLoading,
}: BinaryPlacementTreeProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const [view, setView] = useState<CanvasView>({ x: 0, y: 0, scale: 1 });
  const viewRef = useRef(view);
  const memberById = useMemo(
    () => new Map(members.map((member) => [member.id, member])),
    [members],
  );
  const focusId = selectedId && memberById.has(selectedId) ? selectedId : rootId;
  const focus = useMemo(
    () =>
      focusId === rootId
        ? { id: rootId, name: rootName, level: 0 }
        : memberById.get(focusId) ?? { id: rootId, name: rootName, level: 0 },
    [focusId, memberById, rootId, rootName],
  );
  const levels = useMemo(() => buildBinaryLevels(focus, members), [focus, members]);
  const descendantCounts = useMemo(
    () => countBinaryDescendants(rootId, members),
    [rootId, members],
  );
  const visibleDepth = visibleBinaryDepth(levels);
  const rows = levels.slice(0, visibleDepth + 1);
  const treeWidth = 2 ** visibleDepth * CELL_WIDTH;

  const applyView = useCallback((next: CanvasView) => {
    viewRef.current = next;
    setView(next);
  }, []);

  const resetView = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scale = canvas.clientWidth < 640 ? 0.6 : Math.min(1, canvas.clientWidth / 1100);
    applyView({
      x: (canvas.clientWidth - treeWidth * scale) / 2,
      y: 76,
      scale,
    });
  }, [applyView, treeWidth]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isLoading || !rootId) return;
    pointersRef.current.clear();
    resetView();
    let previousWidth = canvas.clientWidth;
    let previousHeight = canvas.clientHeight;
    const observer = new ResizeObserver(() => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width !== previousWidth || height !== previousHeight) {
        const current = viewRef.current;
        applyView({
          ...current,
          x: current.x + (width - previousWidth) / 2,
          y: current.y + (height - previousHeight) / 2,
        });
        previousWidth = width;
        previousHeight = height;
      }
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [applyView, focusId, isLoading, resetView, rootId]);

  const zoomAt = useCallback((factor: number, clientX?: number, clientY?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const anchorX = (clientX ?? rect.left + rect.width / 2) - rect.left;
    const anchorY = (clientY ?? rect.top + rect.height / 2) - rect.top;
    const current = viewRef.current;
    const scale = clampScale(current.scale * factor);
    applyView({
      x: anchorX - ((anchorX - current.x) / current.scale) * scale,
      y: anchorY - ((anchorY - current.y) / current.scale) * scale,
      scale,
    });
  }, [applyView]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isLoading || !rootId) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomAt(Math.exp(-event.deltaY * 0.0015), event.clientX, event.clientY);
    };
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [isLoading, rootId, zoomAt]);

  const fitTree = () => {
    const canvas = canvasRef.current;
    const tree = treeRef.current;
    if (!canvas || !tree) return;
    const availableHeight = canvas.clientHeight - 80;
    const scale = clampScale(Math.min(
      1,
      (canvas.clientWidth - 32) / treeWidth,
      (availableHeight - 32) / tree.offsetHeight,
    ));
    applyView({
      x: (canvas.clientWidth - treeWidth * scale) / 2,
      y: 64 + (availableHeight - tree.offsetHeight * scale) / 2,
      scale,
    });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pointers = pointersRef.current;
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    const before = [...pointers.values()];
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const after = [...pointers.values()];
    const current = viewRef.current;
    if (after.length === 1) {
      applyView({ ...current, x: current.x + event.clientX - previous.x, y: current.y + event.clientY - previous.y });
      return;
    }
    const [oldA, oldB] = before;
    const [newA, newB] = after;
    const oldDistance = Math.hypot(oldA.x - oldB.x, oldA.y - oldB.y);
    const newDistance = Math.hypot(newA.x - newB.x, newA.y - newB.y);
    if (oldDistance === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const oldCenterX = (oldA.x + oldB.x) / 2 - rect.left;
    const oldCenterY = (oldA.y + oldB.y) / 2 - rect.top;
    const newCenterX = (newA.x + newB.x) / 2 - rect.left;
    const newCenterY = (newA.y + newB.y) / 2 - rect.top;
    const scale = clampScale(current.scale * newDistance / oldDistance);
    applyView({
      x: newCenterX - ((oldCenterX - current.x) / current.scale) * scale,
      y: newCenterY - ((oldCenterY - current.y) / current.scale) * scale,
      scale,
    });
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (isLoading) {
    return <div className="skeleton mx-auto h-52 w-full max-w-xl rounded-xl" />;
  }

  if (!rootId) {
    return (
      <p className="py-12 text-center text-sm text-error">
        Your profile is unavailable. Please try again later.
      </p>
    );
  }

  const handleBack = () => {
    const parentId = memberById.get(focusId)?.parentId;
    setSelectedId(parentId && parentId !== rootId ? parentId : null);
  };

  return (
    <div className="w-full py-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-secondary">
            {focusId === rootId ? "Your binary tree" : `${focus.name}'s branch`}
          </p>
          <p className="text-xs text-secondary/60">
            Each card shows direct and indirect members below it. Select a member to view deeper levels.
          </p>
        </div>
        {focusId !== rootId && (
          <button type="button" onClick={handleBack} className="btn btn-ghost btn-xs text-secondary">
            Back
          </button>
        )}
      </div>

      <div
        ref={canvasRef}
        role="region"
        aria-label="Binary tree canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={handlePointerEnd}
        className="relative h-136 w-full cursor-grab touch-none overflow-hidden rounded-2xl border border-secondary/10 bg-primary/30 select-none active:cursor-grabbing sm:h-168"
      >
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-xl border border-secondary/10 bg-background p-1 shadow-sm">
          <button type="button" onClick={() => zoomAt(0.8)} aria-label="Zoom out" className="btn btn-ghost btn-square btn-sm text-secondary">−</button>
          <span className="min-w-10 text-center text-xs text-secondary/60" aria-live="polite">{Math.round(view.scale * 100)}%</span>
          <button type="button" onClick={() => zoomAt(1.25)} aria-label="Zoom in" className="btn btn-ghost btn-square btn-sm text-secondary">+</button>
          <span className="mx-1 h-5 w-px bg-secondary/10" aria-hidden="true" />
          <button type="button" onClick={fitTree} className="btn btn-ghost btn-sm text-secondary">Fit</button>
          <button type="button" onClick={resetView} className="btn btn-ghost btn-sm text-secondary">Reset</button>
        </div>
        <div
          ref={treeRef}
          className="absolute left-0 top-0 will-change-transform"
          style={{ width: treeWidth, transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`, transformOrigin: "top left" }}
        >
          {rows.map((row, depth) => (
            <div key={depth}>
              <p className="mb-2 text-center text-[11px] font-medium text-secondary/60">
                Level {focus.level + depth} · {row.filter((slot) => slot.person).length} {row.filter((slot) => slot.person).length === 1 ? "member" : "members"}
                {focusId !== rootId ? " in this branch" : ""}
              </p>
              <div
                className="grid w-full"
                style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}
              >
                {row.map((slot, index) => (
                  <div key={`${depth}-${index}`} className="flex min-w-0 justify-center px-1">
                    <PositionCard
                      slot={slot}
                      isRoot={depth === 0}
                      isOwnRoot={focusId === rootId}
                      counts={slot.person ? descendantCounts.get(slot.person.id) ?? { direct: 0, indirect: 0 } : undefined}
                      onSelect={setSelectedId}
                    />
                  </div>
                ))}
              </div>
              {depth < visibleDepth && (
                <div
                  className="grid w-full"
                  style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}
                  aria-hidden="true"
                >
                  {row.map((slot, index) => {
                    const leftChild = rows[depth + 1][index * 2]?.person;
                    const rightChild = rows[depth + 1][index * 2 + 1]?.person;
                    return (
                      <div key={`${depth}-${index}`} className="relative h-8">
                        {slot.person && (leftChild || rightChild) && (
                          <>
                            <span className="absolute left-1/2 top-0 h-1/2 w-px bg-secondary/20" />
                            <span className={`absolute top-1/2 h-px bg-secondary/20 ${leftChild ? "left-1/4" : "left-1/2"} ${rightChild ? "right-1/4" : "right-1/2"}`} />
                            {leftChild && <span className="absolute bottom-0 left-1/4 top-1/2 w-px bg-secondary/20" />}
                            {rightChild && <span className="absolute bottom-0 right-1/4 top-1/2 w-px bg-secondary/20" />}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-background/90 px-2 py-1 text-xs text-secondary/60">
          Drag to move · scroll or pinch to zoom
        </p>
      </div>
    </div>
  );
}

function PositionCard({
  slot,
  isRoot,
  isOwnRoot,
  counts,
  onSelect,
}: {
  slot: BinaryTreeSlot;
  isRoot: boolean;
  isOwnRoot: boolean;
  counts?: BinaryDescendantCounts;
  onSelect: (id: string) => void;
}) {
  if (!slot.person) return null;

  const person = slot.person;
  const label = isRoot
    ? isOwnRoot ? "Your position" : "Selected position"
    : slot.side === "LEFT" ? "Left" : "Right";
  const initial = person.name.trim().charAt(0).toUpperCase() || "T";
  const hasDownline = (counts?.direct ?? 0) > 0;
  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-secondary/70">
          {label}
        </span>
        <span className="rounded-full border border-secondary/15 px-3 py-1.5 text-xs font-medium text-secondary/60">
          Level {person.level}
        </span>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent/15 text-lg font-semibold text-accent ring-4 ring-accent/10" aria-hidden="true">
          {initial}
        </span>
        <span className="line-clamp-2 min-w-0 text-lg font-semibold leading-6 text-secondary" title={person.name}>
          {person.name}
        </span>
      </div>

      <div className="my-5 border-t border-secondary/10" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="flex items-center gap-1.5 text-xs text-secondary/60">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
              <circle cx="9" cy="7" r="3" />
              <path d="M3 20v-2a6 6 0 0 1 12 0v2M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5v1" />
            </svg>
            Direct
          </span>
          <strong className="mt-1 block text-2xl font-semibold leading-7 text-secondary">{counts?.direct ?? 0}</strong>
        </div>
        <div>
          <span className="flex items-center gap-1.5 text-xs text-secondary/60">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
              <path d="M12 3v6m0 0H6v5m6-5h6v5M6 14v7m12-7v7" />
            </svg>
            Indirect
          </span>
          <strong className="mt-1 block text-2xl font-semibold leading-7 text-secondary">{counts?.indirect ?? 0}</strong>
        </div>
      </div>

      <div className="mt-auto pt-5">
        {isRoot || !hasDownline ? (
          <span className="flex h-12 items-center justify-center rounded-xl bg-primary text-sm font-medium text-secondary/60">
            {isRoot ? "Current branch" : "No downline yet"}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onSelect(person.id)}
            aria-label={`View ${person.name}'s branch: ${counts?.direct ?? 0} direct and ${counts?.indirect ?? 0} indirect members`}
            className="btn btn-ghost h-12 min-h-12 w-full rounded-xl bg-primary text-sm font-medium text-secondary hover:bg-secondary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            View branch
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className={`card size-80 rounded-3xl border bg-background p-5 shadow-xs ${isRoot ? "border-accent/30" : "border-secondary/10"}`}>
      {content}
    </div>
  );
}
