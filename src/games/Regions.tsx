import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { img } from "../components/Brand";
import {
  PROVINCES,
  PROVINCE_FILL,
  insideProvince,
  provinceBox,
} from "../content/layers";
import type { RegionsGame } from "../content/schema";
import { useLocalized } from "../content/useLocalized";
import { useT } from "../i18n/useT";
import { RELIEF } from "../map/art";
import { BULGARIA_D } from "../map/geo";
import { bouncy, m } from "../motion";
import { play } from "../sound";
import { useDrag } from "./drag";
import { DoneButton, Feedback, Prompt } from "./Feedback";
import { shuffledIndexes } from "./shuffle";

const VIEW = { x: 40, y: 45, w: 915, h: 600 }; // Bulgaria with a little sea around it
const TRAY = 3; // shapes waiting at a time (the full 28-piece puzzle stays calm)
const FORGIVE = 24; // map units (≈ 13 km): a drop this close to a province's middle still counts (tiny Sofia City)

export type Direction = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/** Which way to look, from a point to a province: "north", "south-east"… (i18n keys dir.*) */
export function direction(
  fx: number,
  fy: number,
  tx: number,
  ty: number,
): Direction {
  const dx = tx - fx;
  const dy = ty - fy;
  const ns = Math.abs(dy) > Math.abs(dx) * 0.45 ? (dy < 0 ? "n" : "s") : "";
  const ew = Math.abs(dx) > Math.abs(dy) * 0.45 ? (dx > 0 ? "e" : "w") : "";
  return (ns + ew || "n") as Direction;
}

/**
 * The provinces puzzle: the shapes of the chosen provinces wait under the map (three at a time); the others are already
 * in place. Drag a shape to its empty place — or tap it, then tap the place. A wrong place: Raya says which way to look;
 * the second time the right place glows. Every empty place is also a button ("Empty province 3") for the keyboard.
 */
export function Regions({
  game,
  onDone,
}: {
  game: RegionsGame;
  onDone: () => void;
}) {
  const t = useT();
  const l = useLocalized();
  const order = useMemo(
    () =>
      shuffledIndexes(game.regions.length, l(game.prompt)).map(
        (i) => game.regions[i]!,
      ),
    [game.regions, l, game.prompt],
  );
  const holes = PROVINCES.filter((p) => game.regions.includes(p.id)); // stable order = the numbers of the empty places
  const [placed, setPlaced] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [misses, setMisses] = useState<Record<string, number>>({});
  const [bump, setBump] = useState<{ id: string; n: number } | null>(null);
  const [say, setSay] = useState<{ good: boolean; text: string } | undefined>();
  const solved = placed.length === game.regions.length;
  const tray = order.filter((id) => !placed.includes(id)).slice(0, TRAY);
  const svg = useRef<SVGSVGElement>(null);
  const byId = (id: string) => PROVINCES.find((p) => p.id === id)!;

  const tryPlace = (
    piece: string,
    at: { x: number; y: number },
    hole?: string,
  ) => {
    if (placed.includes(piece)) return;
    setSelected(null);
    const p = byId(piece);
    const close = Math.hypot(at.x - p.lx, at.y - p.ly) < FORGIVE;
    if (hole === piece || insideProvince(piece, at.x, at.y) || close) {
      play("correct");
      setPlaced((s) => [...s, piece]);
      setSay({ good: true, text: t("regions.good", { name: l(p.name) }) });
      return;
    }
    play("hint");
    const n = (misses[piece] ?? 0) + 1;
    setMisses((x) => ({ ...x, [piece]: n }));
    setBump({ id: piece, n });
    setSay({
      good: false,
      text: t("regions.look", {
        name: l(p.name),
        dir: t(`dir.${direction(at.x, at.y, p.lx, p.ly)}`),
      }),
    });
  };

  /** Screen point → map units (null where the browser cannot tell, e.g. in tests). */
  const toMap = (x: number, y: number) => {
    const m = svg.current?.getScreenCTM?.();
    if (!m) return null;
    const p = new DOMPoint(x, y).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };
  const drag = useDrag((id, target, at) => {
    const hole =
      target === "map" ? undefined : PROVINCES.find((p) => p.id === target);
    const pt = toMap(at.x, at.y) ?? (hole ? { x: hole.lx, y: hole.ly } : null);
    if (pt) tryPlace(id, pt, hole?.id);
  });

  const tapHole = (id: string) => {
    if (selected === null) {
      play("tap");
      setSay({ good: false, text: t("regions.pickFirst") });
      return;
    }
    const h = byId(id);
    tryPlace(selected, { x: h.lx, y: h.ly }, id);
  };
  const keyHole = (e: KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      tapHole(id);
    }
  };
  const glowing = Object.entries(misses).find(
    ([id, n]) => n >= 2 && !placed.includes(id) && tray.includes(id),
  )?.[0];

  return (
    <div className="flex flex-1 flex-col gap-3">
      <Prompt>{l(game.prompt)}</Prompt>
      {/* On a wide screen the tray stands next to the map: both are always in sight while dragging. */}
      <div className="flex flex-col gap-3 side:grid side:grid-cols-[minmax(0,1fr)_auto] side:items-center short:items-start">
        <div className="mx-auto w-full max-w-[min(100%,calc((100dvh-17rem)*1.52))] side:max-w-[min(100%,calc((100dvh-11rem)*1.52))]">
          <svg
            ref={svg}
            viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
            role="group"
            aria-label={t("regions.map")}
            data-drop="map"
            className="block w-full overflow-hidden rounded-[2rem] bg-[#A9DDF8] shadow-soft select-none"
            style={{ aspectRatio: `${VIEW.w} / ${VIEW.h}` }}
          >
            <image
              href={img(RELIEF)}
              x={0}
              y={0}
              width={1000}
              height={690}
              preserveAspectRatio="none"
              opacity={0.8}
            />
            {PROVINCES.map((p) => {
              const hole =
                game.regions.includes(p.id) && !placed.includes(p.id);
              if (hole) return null;
              const fresh = placed.includes(p.id);
              return (
                <m.path
                  key={p.id}
                  d={p.d}
                  fillRule="evenodd"
                  fill={PROVINCE_FILL[p.color % PROVINCE_FILL.length]}
                  fillOpacity={fresh ? 0.95 : 0.6}
                  stroke="#fff"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                  initial={fresh ? { opacity: 0, scale: 1.25 } : false}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={bouncy}
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: "center",
                  }}
                />
              );
            })}
            {holes
              .filter((p) => !placed.includes(p.id))
              .map((p) => (
                <path
                  key={p.id}
                  d={p.d}
                  fillRule="evenodd"
                  data-drop={p.id}
                  role="button"
                  tabIndex={0}
                  aria-label={t("regions.hole", { n: holes.indexOf(p) + 1 })}
                  onClick={() => tapHole(p.id)}
                  onKeyDown={(e) => keyHole(e, p.id)}
                  className={`cursor-pointer outline-none focus-visible:[stroke-width:5] data-[over=true]:fill-[#FFE9A8] ${glowing === p.id ? "anim-glow" : ""}`}
                  fill={glowing === p.id ? "#FFE9A8" : "#FFFDF6"}
                  fillOpacity={glowing === p.id ? 0.9 : 0.55}
                  stroke={glowing === p.id ? "#E2AB1E" : "#0C6B3C"}
                  strokeWidth={glowing === p.id ? 4 : 2}
                  strokeDasharray="7 5"
                  vectorEffect="non-scaling-stroke"
                  style={
                    glowing === p.id
                      ? { transformBox: "fill-box", transformOrigin: "center" }
                      : undefined
                  }
                />
              ))}
            <path
              d={BULGARIA_D}
              fill="none"
              stroke="#0C6B3C"
              strokeWidth={2.5}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              pointerEvents="none"
            />
          </svg>
        </div>

        {!solved && (
          <ul
            aria-label={t("regions.tray")}
            className="flex flex-wrap justify-center gap-2.5 side:flex-col short:grid short:grid-cols-2 short:gap-2"
          >
            {tray.map((id) => {
              const p = byId(id);
              const b = provinceBox(id);
              const pad = Math.max(b.w, b.h) * 0.08;
              const active = selected === id;
              return (
                <li key={id}>
                  <button
                    key={bump?.id === id ? bump.n : undefined}
                    type="button"
                    {...drag(id)}
                    onClick={() => {
                      play("tap");
                      setSelected(active ? null : id);
                    }}
                    aria-pressed={active}
                    className={`tap press flex w-[min(6.5rem,28vw)] flex-col short:w-[5.5rem] items-center gap-0.5 rounded-[1.5rem] px-1.5 pt-1.5 pb-1.5 font-extrabold select-none [container-type:inline-size] ${
                      active
                        ? "bg-gold text-ink shadow-float"
                        : "bg-white shadow-soft"
                    } ${bump?.id === id ? "anim-wiggle" : ""}`}
                  >
                    <svg
                      viewBox={`${b.x - pad} ${b.y - pad} ${b.w + 2 * pad} ${b.h + 2 * pad}`}
                      aria-hidden="true"
                      className="pop-3d size-[min(3.75rem,15vw)] short:size-10"
                    >
                      <path
                        d={p.d}
                        fillRule="evenodd"
                        fill={PROVINCE_FILL[p.color % PROVINCE_FILL.length]}
                        stroke="#0C6B3C"
                        strokeWidth={2}
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                    <span className="w-full text-center text-[length:clamp(0.5rem,12cqw,0.85rem)] leading-tight">
                      {l(p.name)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {!solved && (
        <p className="text-center text-sm font-bold text-muted">
          {t("regions.left", { n: game.regions.length - placed.length })}
        </p>
      )}
      <Feedback
        correct={solved ? t("regions.done") : say?.good ? say.text : undefined}
        help={!solved && say && !say.good ? say.text : undefined}
        nudge={Object.values(misses).reduce((a, b) => a + b, 0)}
        idle={t("regions.idle")}
      />
      {solved && <DoneButton onClick={onDone} />}
    </div>
  );
}
