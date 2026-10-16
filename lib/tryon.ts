// Virtual try-on engine: loads Google's MediaPipe Face Landmarker, estimates
// where the ear lobes are from the 478-point face mesh, and draws earrings
// there with a little pendulum physics so dangly styles swing as you move.

import type { FaceLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { StyleId } from "./design";

/** Hosted face landmark model (float16, ~3.6 MB), fetched at runtime. */
export const FACE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

/** WebAssembly runtime, copied from node_modules into public/ by scripts/copy-mediapipe.mjs. */
export const WASM_BASE = "/mediapipe/wasm";

let landmarker: Promise<FaceLandmarker> | null = null;

/** Lazily creates one shared Face Landmarker (GPU when available, CPU otherwise). */
export function loadFaceLandmarker() {
  landmarker ??= (async () => {
    const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
    const make = (delegate: "GPU" | "CPU") =>
      FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: FACE_MODEL_URL, delegate },
        runningMode: "VIDEO",
        numFaces: 1,
      });
    try {
      return await make("GPU");
    } catch {
      return await make("CPU");
    }
  })();
  landmarker.catch(() => (landmarker = null)); // allow a retry after a network error
  return landmarker;
}

export type Ear = {
  side: "left" | "right";
  /** Lobe position in source pixels. */
  x: number;
  y: number;
  /** Face height in pixels, used to size the earring. */
  faceH: number;
  /** Head roll in radians (tilting the head sideways). */
  roll: number;
  /** 0..1, fades out the ear turning away from the camera. */
  visible: number;
};

const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

// Face-mesh indices: 234/454 face outline at ear level, 10 forehead, 152 chin,
// 33/263 outer eye corners, 1 nose tip.
const EDGE_L = 234;
const EDGE_R = 454;

/** Estimates both ear lobes from a face mesh (normalised landmarks → pixels). */
export function earsFromLandmarks(lm: NormalizedLandmark[], w: number, h: number): Ear[] {
  const P = (i: number) => ({ x: lm[i].x * w, y: lm[i].y * h });
  const top = P(10);
  const chin = P(152);
  const faceH = Math.hypot(chin.x - top.x, chin.y - top.y);
  const down = { x: (chin.x - top.x) / faceH, y: (chin.y - top.y) / faceH };
  const eyeL = P(33);
  const eyeR = P(263);
  const roll = Math.atan2(eyeR.y - eyeL.y, eyeR.x - eyeL.x);

  const L = P(EDGE_L);
  const R = P(EDGE_R);
  const nose = P(1);
  const across = { x: R.x - L.x, y: R.y - L.y };
  const width = Math.hypot(across.x, across.y) || 1;
  // Where the nose sits between the two face edges: ~0.5 facing the camera.
  const t = ((nose.x - L.x) * across.x + (nose.y - L.y) * across.y) / (width * width);

  // When the head turns, the near ear shows further out than the face outline,
  // so push it outward in proportion to the turn (`near` is 0 when facing the camera).
  const lobe = (edge: { x: number; y: number }, dir: number, near: number) => {
    const out = faceH * (0.015 + 0.2 * near);
    return {
      x: edge.x + down.x * faceH * 0.11 + (across.x / width) * dir * out,
      y: edge.y + down.y * faceH * 0.11 + (across.y / width) * dir * out,
    };
  };

  return [
    { side: "left", ...lobe(L, -1, Math.max(0, t - 0.5)), faceH, roll, visible: smooth(0.3, 0.42, t) },
    { side: "right", ...lobe(R, 1, Math.max(0, 0.5 - t)), faceH, roll, visible: smooth(0.3, 0.42, 1 - t) },
  ];
}

/** How long each style hangs, as a fraction of face height. */
export const STYLE_LENGTH: Record<StyleId, number> = {
  stud: 0.09,
  "clip-on": 0.12,
  huggie: 0.17,
  drop: 0.2,
  hoop: 0.3,
  dangle: 0.34,
  chandelier: 0.42,
  threader: 0.48,
  cuff: 0.3,
  climber: 0.3,
};

const SWINGS: Record<StyleId, number> = {
  stud: 0,
  "clip-on": 0,
  cuff: 0,
  climber: 0,
  huggie: 0.6,
  hoop: 0.8,
  drop: 0.9,
  dangle: 1,
  chandelier: 1,
  threader: 1,
};

/** Damped pendulum driven by the ear's sideways acceleration. */
export class Pendulum {
  angle = 0;
  private vel = 0;
  private lastX: number | null = null;
  private lastVx = 0;

  step(x: number, dt: number, length: number, breeze = 0) {
    dt = Math.min(dt, 0.05);
    if (this.lastX === null || dt <= 0) {
      this.lastX = x;
      return this.angle;
    }
    const vx = (x - this.lastX) / dt;
    const ax = (vx - this.lastVx) / dt;
    this.lastX = x;
    this.lastVx = vx;
    const L = Math.max(length, 20);
    const g = 2600; // px/s², tuned so a ~100px earring swings at a natural pace
    const acc = (-g * Math.sin(this.angle) - ax * Math.cos(this.angle) * 0.6) / L - 3.2 * this.vel + breeze;
    this.vel += acc * dt;
    this.angle = Math.max(-0.7, Math.min(0.7, this.angle + this.vel * dt));
    return this.angle;
  }
}

export type DrawSpec = {
  img: HTMLImageElement;
  style: StyleId;
  /** Artwork width / height and the point (0..1) that attaches to the ear. */
  ratio: number;
  anchor: { x: number; y: number };
  size: number;
};

/** Draws one earring hanging from an ear. */
export function drawEarring(ctx: CanvasRenderingContext2D, ear: Ear, spec: DrawSpec, swing: number) {
  if (ear.visible < 0.1 || !spec.img.complete) return;
  const h = ear.faceH * STYLE_LENGTH[spec.style] * spec.size;
  const w = h * spec.ratio;
  const angle = ear.roll * (1 - SWINGS[spec.style]) + swing * SWINGS[spec.style];
  ctx.save();
  ctx.globalAlpha = ear.visible;
  ctx.translate(ear.x, ear.y);
  ctx.rotate(angle);
  // The pair is mirrored, so the second ear gets the flipped artwork.
  if (ear.side === "right") ctx.scale(-1, 1);
  ctx.shadowColor = "rgba(40, 20, 60, 0.35)";
  ctx.shadowBlur = h * 0.06;
  ctx.shadowOffsetY = h * 0.03;
  ctx.drawImage(spec.img, -spec.anchor.x * w, -spec.anchor.y * h, w, h);
  ctx.restore();
}

export const earringLength = (faceH: number, style: StyleId, size: number) => faceH * STYLE_LENGTH[style] * size;
