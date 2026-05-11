// Shared wavy ribbon geometry — used by both SectionDivider and Marquee.
// Generates parallel sine-wave paths that form a uniform-thickness ribbon,
// plus a centerline path for text-on-path placement, plus the "above" and
// "below" background regions for seamless section transitions.
//
// Aspect ratio chosen to match common rendered sizes so SVG doesn't crop
// in `slice` mode or letterbox in `meet` mode.

export const VIEW_W = 1400;
export const VIEW_H = 220;       // matches CSS rendered height ~ 6.4:1 aspect
export const MID = 110;          // centerline (vertically centered in viewBox)
export const AMP = 28;           // wave amplitude
export const WAVELENGTH = 720;
export const HALF_THICK = 50;    // ribbon half-thickness
const N = 200;
const PAD_X = 80;

function pointAt(x: number) {
  const k = (2 * Math.PI) / WAVELENGTH;
  const y = MID + AMP * Math.sin(k * x);
  const dy = AMP * k * Math.cos(k * x);
  const len = Math.sqrt(1 + dy * dy);
  return { x, y, nx: -dy / len, ny: 1 / len };
}

export interface RibbonPaths {
  ribbon: string;
  above: string;
  below: string;
  center: string;
}

export function buildRibbonPaths(): RibbonPaths {
  const top: { x: number; y: number }[] = [];
  const bot: { x: number; y: number }[] = [];
  const center: { x: number; y: number }[] = [];
  for (let i = 0; i <= N; i++) {
    const x = -PAD_X + (i / N) * (VIEW_W + 2 * PAD_X);
    const p = pointAt(x);
    top.push({ x: p.x - p.nx * HALF_THICK, y: p.y - p.ny * HALF_THICK });
    bot.push({ x: p.x + p.nx * HALF_THICK, y: p.y + p.ny * HALF_THICK });
    center.push({ x: p.x, y: p.y });
  }

  let aboveD = `M ${-PAD_X} 0 L ${VIEW_W + PAD_X} 0 L ${VIEW_W + PAD_X} ${top[top.length - 1].y.toFixed(2)}`;
  for (let i = top.length - 1; i >= 0; i--) {
    aboveD += ` L ${top[i].x.toFixed(2)} ${top[i].y.toFixed(2)}`;
  }
  aboveD += ' Z';

  let belowD = `M ${bot[0].x.toFixed(2)} ${bot[0].y.toFixed(2)}`;
  for (let i = 1; i < bot.length; i++) {
    belowD += ` L ${bot[i].x.toFixed(2)} ${bot[i].y.toFixed(2)}`;
  }
  belowD += ` L ${VIEW_W + PAD_X} ${VIEW_H} L ${-PAD_X} ${VIEW_H} Z`;

  let ribbonD = `M ${top[0].x.toFixed(2)} ${top[0].y.toFixed(2)}`;
  for (let i = 1; i < top.length; i++) {
    ribbonD += ` L ${top[i].x.toFixed(2)} ${top[i].y.toFixed(2)}`;
  }
  for (let i = bot.length - 1; i >= 0; i--) {
    ribbonD += ` L ${bot[i].x.toFixed(2)} ${bot[i].y.toFixed(2)}`;
  }
  ribbonD += ' Z';

  let centerD = `M ${center[0].x.toFixed(2)} ${center[0].y.toFixed(2)}`;
  for (let i = 1; i < center.length; i++) {
    centerD += ` L ${center[i].x.toFixed(2)} ${center[i].y.toFixed(2)}`;
  }

  return { ribbon: ribbonD, above: aboveD, below: belowD, center: centerD };
}
