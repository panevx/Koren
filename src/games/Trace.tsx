import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { img } from "../components/Brand";
import { RIVERS } from "../content/layers";
import type { TraceGame } from "../content/schema";
import { useLocalized } from "../content/useLocalized";
import { useT } from "../i18n/useT";
import { RELIEF } from "../map/art";
import { BULGARIA_D, MAP_H, MAP_W } from "../map/geo";
import { project } from "../map/projection";
import { play } from "../sound";
import { DoneButton, Feedback, Prompt } from "./Feedback";

type Pt = [number, number];

/** Arc length along the line at each vertex. */
function cumulative(line: Pt[]): number[] {
  const out = [0];
  for (let i = 1; i < line.length; i++)
    out.push(
      out[i - 1]! +
        Math.hypot(
          line[i]![0] - line[i - 1]![0],
          line[i]![1] - line[i - 1]![1],
        ),
    );
  return out;
}

/** The nearest point of the line to (x, y), searched between arc lengths `from` and `to`: its arc length and distance. */
export function nearestOnLine(
  line: Pt[],
  cum: number[],
  x: number,
  y: number,
  from = 0,
  to = Infinity,
) {
  let best = { at: from, d: Infinity };
  for (let i = 0; i < line.length - 1; i++) {
    if (cum[i + 1]! < from || cum[i]! > to) continue;
    const [ax, ay] = line[i]!;
    const [bx, by] = line[i + 1]!;
    const len = cum[i + 1]! - cum[i]!;
    const k =
      len === 0
        ? 0
        : Math.max(
            0,
            Math.min(
              1,
              ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / (len * len),
            ),
          );
    const at = Math.max(from, Math.min(to, cum[i]! + k * len));
    const p = pointAt(line, cum, at);
    const d = Math.hypot(p[0] - x, p[1] - y);
    if (d < best.d) best = { at, d };
  }
  return best;
}

/** The point at arc length `at`. */
export function pointAt(line: Pt[], cum: number[], at: number): Pt {
  const i = Math.max(0, cum.findIndex((c) => c >= at) - 1);
  const len = cum[i + 1]! - cum[i]! || 1;
  const k = Math.max(0, Math.min(1, (at - cum[i]!) / len));
  return [
    line[i]![0] + (line[i + 1]![0] - line[i]![0]) * k,
    line[i]![1] + (line[i + 1]![1] - line[i]![1]) * k,
  ];
}

const LOOK_AHEAD = 70; // map units the finger may run ahead of the drop (≈ 40 km): no skipping the river
const TOLERANCE_PX = 38; // how far from the river a finger may be and still lead the drop
const GRAB_PX = 56; // how close to the drop a finger must start

/**
 * Follow the river: a water drop waits at the source; the child leads it with a finger along the real river line,
 * past the stops (each lights up and Koren names it), to the mouth. The map is cut to the river, with the real relief.
 * "To the next stop" moves the drop for keyboard and screen-reader users (and for children who cannot drag yet).
 */
export function Trace({
  game,
  onDone,
}: {
  game: TraceGame;
  onDone: () => void;
}) {
  const t = useT();
  const l = useLocalized();
  const river = RIVERS.find((r) => r.id === game.river)!;
  const line = river.t!;
  const cum = useMemo(() => cumulative(line), [line]);
  const total = cum[cum.length - 1]!;
  const stops = useMemo(
    () =>
      game.stops.map((s) => {
        const p = project(s.lat, s.lon);
        return {
          ...s,
          x: p.x,
          y: p.y,
          at: nearestOnLine(line, cum, p.x, p.y).at,
        };
      }),
    [game.stops, line, cum],
  );

  // The map is cut to the river (+ room for the names), never thinner than 3:4 or wider than 16:9.
  const box = useMemo(() => {
    const xs = [...line.map((p) => p[0]), ...stops.map((s) => s.x)];
    const ys = [...line.map((p) => p[1]), ...stops.map((s) => s.y)];
    let x0 = Math.min(...xs) - 50;
    let x1 = Math.max(...xs) + 50;
    let y0 = Math.min(...ys) - 40;
    let y1 = Math.max(...ys) + 40;
    const grow = (a: number, b: number, size: number): [number, number] => [
      a - (size - (b - a)) / 2,
      b + (size - (b - a)) / 2,
    ];
    if ((x1 - x0) / (y1 - y0) < 0.75) [x0, x1] = grow(x0, x1, (y1 - y0) * 0.75);
    if ((x1 - x0) / (y1 - y0) > 16 / 9)
      [y0, y1] = grow(y0, y1, (x1 - x0) / (16 / 9));
    // keep the frame on the relief picture (outside it there is only empty blue)
    const keep = (a: number, b: number, max: number): [number, number] =>
      b - a >= max
        ? [a, b]
        : a < 0
          ? [0, b - a]
          : b > max
            ? [a - (b - max), max]
            : [a, b];
    [x0, x1] = keep(x0, x1, MAP_W);
    [y0, y1] = keep(y0, y1, MAP_H);
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }, [line, stops]);

  const [at, setAt] = useState(0);
  const [say, setSay] = useState<{ good: boolean; text: string } | undefined>();
  const [misses, setMisses] = useState(0);
  const reached = stops.filter((s) => s.at <= at + 0.5).length;
  const done = at >= total - 0.5;
  const drop = pointAt(line, cum, at);

  // Map units per screen pixel (the SVG keeps its aspect ratio, so one number is enough).
  const svg = useRef<SVGSVGElement>(null);
  const [unit, setUnit] = useState(box.w / 340);
  useLayoutEffect(() => {
    const el = svg.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0)
        setUnit(Math.max(box.w / r.width, box.h / r.height));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [box]);

  /** Move the drop to arc length `next`; announce the stops it passes and the end. */
  const advance = (next: number) => {
    if (next <= at) return;
    const passed = stops.filter((s) => s.at > at + 0.5 && s.at <= next + 0.5);
    setAt(next);
    if (next >= total - 0.5) {
      play("correct");
      setSay(undefined);
    } else if (passed.length) {
      const s = passed[passed.length - 1]!;
      play("correct");
      setSay({ good: true, text: s.say ? `${l(s)}! ${l(s.say)}` : `${l(s)}!` });
    }
  };

  const nextStop = () => {
    play("tap");
    const s = stops.find((x) => x.at > at + 0.5);
    advance(s ? s.at : total);
  };

  // ── leading the drop with a finger ──
  const leading = useRef<number | null>(null);
  const strayed = useRef(false);
  const toMap = (e: PointerEvent<SVGSVGElement>): Pt | null => {
    const m = svg.current?.getScreenCTM?.();
    if (!m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [p.x, p.y];
  };
  const onDown = (e: PointerEvent<SVGSVGElement>) => {
    const p = toMap(e);
    if (!p || done) return;
    if (Math.hypot(p[0] - drop[0], p[1] - drop[1]) / unit > GRAB_PX) {
      setSay({ good: false, text: t("trace.grab") });
      setMisses((n) => n + 1);
      return;
    }
    leading.current = e.pointerId;
    strayed.current = false;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* still works while the finger stays on the map */
    }
  };
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (leading.current !== e.pointerId) return;
    const p = toMap(e);
    if (!p) return;
    const near = nearestOnLine(line, cum, p[0], p[1], at, at + LOOK_AHEAD);
    if (near.d / unit <= TOLERANCE_PX) advance(near.at);
    else if (!strayed.current) {
      strayed.current = true;
      setSay({ good: false, text: t("trace.stray") });
      setMisses((n) => n + 1);
    }
  };
  const onUp = (e: PointerEvent<SVGSVGElement>) => {
    if (leading.current === e.pointerId) leading.current = null;
  };

  useEffect(() => {
    if (done) setSay(undefined);
  }, [done]);

  const path = (pts: Pt[]) =>
    `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L")}`;
  const travelled = [...line.filter((_, i) => cum[i]! < at), drop];
  const label = (
    x: number,
    y: number,
    text: string,
    strong = false,
    key?: string,
  ) => (
    <text
      key={key}
      x={x}
      y={y - 13 * unit}
      textAnchor={
        x < box.x + box.w * 0.2
          ? "start"
          : x > box.x + box.w * 0.8
            ? "end"
            : "middle"
      }
      fontSize={(strong ? 15 : 13) * unit}
      fontWeight={900}
      fill={strong ? "#0C6B3C" : "#1F2A26"}
      stroke="#fff"
      strokeWidth={4 * unit}
      paintOrder="stroke"
    >
      {text}
    </text>
  );

  return (
    <div className="flex flex-1 flex-col gap-3">
      <Prompt>{l(game.prompt)}</Prompt>
      <div className="relative mx-auto w-full max-w-[min(100%,calc((100dvh-15rem)*1.3))]">
        <svg
          ref={svg}
          viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
          role="img"
          aria-label={t("trace.map", { river: l(river.name) })}
          className="block w-full touch-none overflow-hidden rounded-[2rem] bg-[#A9DDF8] shadow-soft select-none"
          style={{ aspectRatio: `${box.w} / ${box.h}` }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <image
            href={img(RELIEF)}
            x={0}
            y={0}
            width={MAP_W}
            height={MAP_H}
            preserveAspectRatio="none"
          />
          <path
            d={BULGARIA_D}
            fill="none"
            stroke="#0C6B3C"
            strokeWidth={2.5}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* the way to go: wide and pale; the travelled part: deep blue */}
          <path
            d={path(line)}
            fill="none"
            stroke="#fff"
            strokeOpacity={0.75}
            strokeWidth={20}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={path(line)}
            fill="none"
            stroke="#72C8F5"
            strokeWidth={6}
            strokeDasharray="2 10"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={path(travelled)}
            fill="none"
            stroke="#1F7FC4"
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {stops.map((s, i) => {
            const got = i < reached;
            const p = pointAt(line, cum, s.at);
            return (
              <g key={i}>
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r={8 * unit}
                  fill={got ? "#FFD35A" : "#fff"}
                  stroke={got ? "#C98A00" : "#1F7FC4"}
                  strokeWidth={3 * unit}
                />
                {got && label(p[0], p[1], l(s))}
              </g>
            );
          })}
          {label(line[0]![0], line[0]![1], l(game.start), true, "start")}
          {label(
            line[line.length - 1]![0],
            line[line.length - 1]![1] + 34 * unit,
            l(game.end),
            true,
            "end",
          )}
          {/* the water drop */}
          <g transform={`translate(${drop[0]} ${drop[1]}) scale(${unit})`}>
            {!done && at === 0 && (
              <circle
                r={GRAB_PX / 2.2}
                fill="#FFD35A"
                fillOpacity={0.5}
                className="anim-glow"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
            )}
            <circle r={GRAB_PX / 2.6} fill="#1F7FC4" fillOpacity={0.18} />
            <path
              d="M0 -15 C 6 -6 11 -1 11 5 A 11 11 0 0 1 -11 5 C -11 -1 -6 -6 0 -15 Z"
              fill="#2B8FD6"
              stroke="#fff"
              strokeWidth={3}
            />
            <ellipse
              cx={-4}
              cy={3}
              rx={2.5}
              ry={4}
              fill="#fff"
              fillOpacity={0.7}
            />
          </g>
        </svg>
      </div>
      {!done && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={nextStop}
            className="edge-light relative tap press rounded-full mat-paper px-5 py-2 text-base font-extrabold text-green-dark"
          >
            {reached < stops.length
              ? t("trace.next")
              : t("trace.toEnd", { end: l(game.end) })}
          </button>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {t("trace.progress", { n: reached, total: stops.length })}
      </p>
      <Feedback
        correct={done ? l(game.fact) : say?.good ? say.text : undefined}
        help={!done && say && !say.good ? say.text : undefined}
        nudge={misses}
        idle={t("trace.idle", { end: l(game.end) })}
      />
      {done && <DoneButton onClick={onDone} />}
    </div>
  );
}
