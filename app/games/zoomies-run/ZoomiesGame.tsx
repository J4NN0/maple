"use client";

import { useEffect, useRef, useCallback, useState } from "react";

// ── constants ────────────────────────────────────────────────────────
const W = 800, H = 300;
const GROUND = 238;
const DOG_X = 110;
const DOG_W = 64, DOG_H = 52;
const GRAVITY = 0.62;        // normal gravity: applied on descent, and on ascent once released
const GRAVITY_HOLD = 0.28;   // reduced gravity while the jump is held (up & down) → floatier, longer jump
const JUMP_V = -8;           // launch impulse: a tap clears a short gate; only a held jump clears a tall one
const JUMP_CEIL = 44;        // safety bound for mapleY so a long held jump can't leave the canvas
const INIT_SPEED = 4.5;
const MAX_SPEED = 15;

// Obstacles
const GATE_W = 38;                          // pet gate width
const GATE_H_SHORT = 40, GATE_H_TALL = 80;  // short gate clears with a tap; tall gate needs a held jump
const BEE_W = 40, BEE_H = 24;               // bee: an overhead flyer
const BEE_Y = 128;                          // bee hitbox top — head height: run under it, don't jump into it

// Sprite sheet: 3 frames laid out left→right (run-A, run-B, jump), facing right.
const SPRITE_SRC = "/maple-sprite.png";
const SPRITE_FRAMES = 3;
const SPRITE_DRAW_H = 64;   // on-canvas height of the reference frame's bounding box
const RUN_FRAME_DIST = 55;  // canvas units of travel per run-cycle frame flip (higher = slower legs)

type FrameRect = { sx: number; sy: number; sw: number; sh: number };
type Sprite = { src: CanvasImageSource | null; frames: FrameRect[]; scale: number; ready: boolean };

type Phase = "idle" | "playing" | "dead";
type ObsType = "gate" | "bee";
interface Obs { x: number; y: number; type: ObsType; w: number; h: number; }

// ── draw: background & ground ─────────────────────────────────────────
function drawBackground(ctx: CanvasRenderingContext2D, scroll: number) {
  // Sky / wall
  ctx.fillStyle = "#F5EDE0";
  ctx.fillRect(0, 0, W, GROUND);

  // Parallax furniture silhouettes
  ctx.fillStyle = "#E8D5BC";
  for (let i = 0; i < 3; i++) {
    const bx = ((i * 320 - scroll * 0.2) % (W + 200) + W + 200) % (W + 200) - 100;
    // Sofa
    ctx.beginPath();
    ctx.roundRect(bx, GROUND - 68, 140, 60, 8);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(bx + 4, GROUND - 84, 36, 22, 6);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(bx + 100, GROUND - 84, 36, 22, 6);
    ctx.fill();
  }

  // Floor
  ctx.fillStyle = "#E0C9A8";
  ctx.fillRect(0, GROUND, W, H - GROUND);

  // Ground line
  ctx.strokeStyle = "#C4922A";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND);
  ctx.lineTo(W, GROUND);
  ctx.stroke();

  // Scrolling paw prints on floor
  ctx.fillStyle = "#C4922A44";
  for (let i = 0; i < 6; i++) {
    const px = ((i * 160 - scroll * 0.9) % (W + 160) + W + 160) % (W + 160) - 60;
    const py = GROUND + 22;
    // main pad
    ctx.beginPath();
    ctx.ellipse(px, py, 9, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // toes
    for (let t = 0; t < 4; t++) {
      ctx.beginPath();
      ctx.ellipse(px - 10 + t * 7, py - 10, 3.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ── draw: Maple ───────────────────────────────────────────────────────
function drawMaple(ctx: CanvasRenderingContext2D, y: number, frame: number, dead: boolean) {
  const x = DOG_X;
  const isAir = y < GROUND - DOG_H - 2;
  const swing = isAir ? 0 : Math.sin(frame * 0.38) * 7;

  const C  = "#C4882A"; // caramel
  const D  = "#8B5E1A"; // dark
  const L  = "#DBA040"; // light highlight
  const BK = "#150800"; // near-black

  ctx.save();

  if (dead) {
    // Tilt Maple when dead
    ctx.translate(x + DOG_W / 2, y + DOG_H / 2);
    ctx.rotate(0.35);
    ctx.translate(-(x + DOG_W / 2), -(y + DOG_H / 2));
  }

  // ── tail ──
  ctx.strokeStyle = C; ctx.lineWidth = 7; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 24);
  ctx.bezierCurveTo(x - 5, y + 16, x - 9, y + 6, x + 1, y + 2);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x + 3, y + 3, 5, Math.PI * 0.9, Math.PI * 0.1, true);
  ctx.stroke();

  // ── hind legs ──
  ctx.fillStyle = D;
  if (isAir) {
    ctx.beginPath(); ctx.roundRect(x + 6,  y + 33, 9, 11, 4); ctx.fill();
    ctx.beginPath(); ctx.roundRect(x + 18, y + 33, 9, 11, 4); ctx.fill();
  } else {
    ctx.beginPath(); ctx.roundRect(x + 6,  y + 32 + swing,  9, 16, 4); ctx.fill();
    ctx.beginPath(); ctx.roundRect(x + 18, y + 32 - swing,  9, 16, 4); ctx.fill();
  }

  // ── body ──
  ctx.fillStyle = C;
  ctx.beginPath();
  ctx.ellipse(x + 28, y + 26, 23, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // fluffy body highlights
  ctx.fillStyle = L;
  ctx.beginPath(); ctx.ellipse(x + 26, y + 22, 14, 9, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 14, y + 25, 6, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 36, y + 20, 7, 5, 0, 0, Math.PI * 2); ctx.fill();

  // ── front legs ──
  ctx.fillStyle = D;
  if (isAir) {
    ctx.beginPath(); ctx.roundRect(x + 36, y + 33, 9, 11, 4); ctx.fill();
    ctx.beginPath(); ctx.roundRect(x + 48, y + 33, 9, 11, 4); ctx.fill();
  } else {
    ctx.beginPath(); ctx.roundRect(x + 36, y + 32 - swing, 9, 16, 4); ctx.fill();
    ctx.beginPath(); ctx.roundRect(x + 48, y + 32 + swing, 9, 16, 4); ctx.fill();
  }

  // ── head ──
  ctx.fillStyle = C;
  ctx.beginPath();
  ctx.ellipse(x + 48, y + 15, 15, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // fluffy head highlight
  ctx.fillStyle = L;
  ctx.beginPath(); ctx.ellipse(x + 46, y + 10, 11, 8, 0, 0, Math.PI * 2); ctx.fill();
  // cheek poof
  ctx.beginPath(); ctx.ellipse(x + 57, y + 17, 8, 6, 0.3, 0, Math.PI * 2); ctx.fill();

  // ── ear ──
  ctx.fillStyle = D;
  ctx.beginPath();
  ctx.ellipse(x + 56, y + 21, 7, 10, 0.35, 0, Math.PI * 2);
  ctx.fill();

  // ── eye ──
  ctx.fillStyle = BK;
  ctx.beginPath(); ctx.ellipse(x + 53, y + 12, 3, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "white";
  ctx.beginPath(); ctx.ellipse(x + 54.5, y + 11, 1.2, 1.2, 0, 0, Math.PI * 2); ctx.fill();

  // ── nose ──
  ctx.fillStyle = BK;
  ctx.beginPath(); ctx.ellipse(x + 61, y + 16, 3.5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#44100880";
  ctx.beginPath(); ctx.ellipse(x + 60, y + 15, 1.5, 1, 0, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

// ── draw: Maple sprite ────────────────────────────────────────────────
// Draws one sprite frame anchored by its feet (bbox bottom → ground) and
// horizontally centered on the hitbox, so frames of differing size/position
// animate without jitter. The hitbox itself (DOG_X/W/H) is unchanged.
function drawMapleSprite(
  ctx: CanvasRenderingContext2D,
  src: CanvasImageSource,
  fr: FrameRect,
  scale: number,
  y: number,
  dead: boolean,
) {
  const dw = fr.sw * scale;
  const dh = fr.sh * scale;
  const centerX = DOG_X + DOG_W / 2;
  const footY = y + DOG_H;
  const dx = centerX - dw / 2;
  const dy = footY - dh;

  ctx.save();
  ctx.imageSmoothingEnabled = false; // keep pixel art crisp
  if (dead) {
    const cy = footY - dh / 2;
    ctx.translate(centerX, cy);
    ctx.rotate(0.35);
    ctx.translate(-centerX, -cy);
  }
  ctx.drawImage(src, fr.sx, fr.sy, fr.sw, fr.sh, dx, dy, dw, dh);
  ctx.restore();
}

// ── draw: obstacles ───────────────────────────────────────────────────
function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obs, frame: number) {
  const bx = obs.x;

  if (obs.type === "gate") {
    // Pet gate: a tall wooden panel for Maple to leap over.
    const top = obs.y;
    const post = "#7B4A1E", rail = "#9B6B30", bar = "#C49A5A";
    ctx.fillStyle = rail;
    ctx.beginPath(); ctx.roundRect(bx, top, obs.w, 8, 3); ctx.fill();             // top rail
    ctx.beginPath(); ctx.roundRect(bx, GROUND - 12, obs.w, 9, 3); ctx.fill();     // bottom rail
    ctx.fillStyle = bar;                                                          // vertical bars
    for (let i = 1; i <= 2; i++) {
      const vx = bx + (obs.w * i) / 3 - 2;
      ctx.beginPath(); ctx.roundRect(vx, top + 7, 4, obs.h - 18, 2); ctx.fill();
    }
    ctx.fillStyle = post;
    ctx.beginPath(); ctx.roundRect(bx, top, 7, obs.h, 3); ctx.fill();             // left post
    ctx.beginPath(); ctx.roundRect(bx + obs.w - 7, top, 7, obs.h, 3); ctx.fill(); // right post

  } else {
    // Bee: a striped overhead flyer with fluttering wings, facing left (its
    // direction of travel, toward Maple).
    const cx = bx + obs.w / 2, cy = obs.y + obs.h / 2;
    const flap = (frame >> 2) & 1 ? 5 : 9;
    ctx.fillStyle = "#FFFFFFCC";                                                  // wings
    ctx.beginPath(); ctx.ellipse(cx - 3, cy - 8, 7, flap, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 7, cy - 8, 7, flap, 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2B2014";                                                    // stinger (trailing, right)
    ctx.beginPath();
    ctx.moveTo(bx + obs.w - 6, cy);
    ctx.lineTo(bx + obs.w + 1, cy - 2.5);
    ctx.lineTo(bx + obs.w + 1, cy + 2.5);
    ctx.fill();
    ctx.fillStyle = "#F2B500";                                                    // body
    ctx.beginPath(); ctx.ellipse(cx, cy, obs.w / 2 - 5, obs.h / 2 - 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2B2014";                                                    // stripes
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.ellipse(cx + i * 6, cy, 2, obs.h / 2 - 5, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "#150800";                                                    // eye (head, left)
    ctx.beginPath(); ctx.ellipse(bx + 7, cy - 2, 2, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  }
}

// ── draw: HUD & overlays ──────────────────────────────────────────────
function drawHUD(ctx: CanvasRenderingContext2D, score: number, best: number) {
  ctx.save();
  ctx.textAlign = "right";
  ctx.fillStyle = "#7B4A1E";
  ctx.font = 'bold 20px Nunito, sans-serif';
  ctx.fillText(`${Math.floor(score)}m`, W - 16, 30);
  ctx.fillStyle = "#C4922A";
  ctx.font = '14px Nunito, sans-serif';
  ctx.fillText(`Best: ${Math.floor(best)}m`, W - 16, 50);
  ctx.restore();
}

function drawIdleOverlay(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.fillStyle = "#7B4A1ECC";
  ctx.beginPath(); ctx.roundRect(W / 2 - 170, H / 2 - 38, 340, 68, 12); ctx.fill();
  ctx.textAlign = "center"; ctx.fillStyle = "#F5EDE0";
  ctx.font = 'bold 22px Nunito, sans-serif';
  ctx.fillText("Tap or Space to start! 🐾", W / 2, H / 2 - 8);
  ctx.font = '15px Nunito, sans-serif'; ctx.fillStyle = "#E8D5BC";
  ctx.fillText("Hold to jump higher  •  don't jump into the bees! 🐝", W / 2, H / 2 + 18);
  ctx.restore();
}

function drawDeadOverlay(ctx: CanvasRenderingContext2D, score: number, best: number) {
  ctx.save();
  ctx.fillStyle = "#7B4A1ECC";
  ctx.beginPath(); ctx.roundRect(W / 2 - 190, H / 2 - 52, 380, 100, 14); ctx.fill();
  ctx.textAlign = "center"; ctx.fillStyle = "#F5EDE0";
  ctx.font = 'bold 26px Nunito, sans-serif';
  ctx.fillText("Maple tripped! 😅", W / 2, H / 2 - 20);
  ctx.font = 'bold 17px Nunito, sans-serif'; ctx.fillStyle = "#E8D5BC";
  ctx.fillText(`Distance: ${Math.floor(score)}m  •  Best: ${Math.floor(best)}m`, W / 2, H / 2 + 6);
  ctx.font = '15px Nunito, sans-serif'; ctx.fillStyle = "#C4922A";
  ctx.fillText("Tap or Space to try again", W / 2, H / 2 + 30);
  ctx.restore();
}

// ── component ─────────────────────────────────────────────────────────
export default function ZoomiesGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const spriteRef = useRef<Sprite>({ src: null, frames: [], scale: 1, ready: false });

  const g = useRef({
    phase: "idle" as Phase,
    mapleY: GROUND - DOG_H,
    mapleVY: 0,
    jumpsLeft: 2,
    holding: false,
    score: 0,
    highScore: 0,
    speed: INIT_SPEED,
    frame: 0,
    scrollX: 0,
    obstacles: [] as Obs[],
    nextIn: 100,
  });

  const [uiPhase, setUiPhase] = useState<Phase>("idle");

  const jump = useCallback(() => {
    const s = g.current;
    if (s.phase === "idle") {
      s.phase = "playing";
      setUiPhase("playing");
      return;
    }
    if (s.phase === "dead") {
      s.phase = "idle";
      s.mapleY = GROUND - DOG_H;
      s.mapleVY = 0;
      s.jumpsLeft = 2;
      s.holding = false;
      s.score = 0;
      s.speed = INIT_SPEED;
      s.frame = 0;
      s.scrollX = 0;
      s.obstacles = [];
      s.nextIn = 100;
      setUiPhase("idle");
      return;
    }
    if (s.jumpsLeft > 0) {
      s.mapleVY = JUMP_V;
      s.jumpsLeft = 0;
      s.holding = true;   // sustain the rise (reduced gravity) for as long as the input is held
    }
  }, []);

  // Releasing the input ends the "float": gravity returns to normal so Maple
  // arcs down. A quick tap → normal jump; holding → higher, longer jump.
  const release = useCallback(() => {
    g.current.holding = false;
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("zoomies-hs");
    if (saved) g.current.highScore = parseFloat(saved);
  }, []);

  // Load the sprite sheet. The generated sheet ships fully opaque with the grey
  // "transparency" checkerboard baked in, so we chroma-key the neutral grey to
  // real transparency on an offscreen canvas, then detect each frame's tight
  // bounding box from the cleaned alpha (the sheet isn't on a clean grid) so the
  // frames anchor consistently. Falls back to the procedural drawing until ready.
  useEffect(() => {
    const img = new Image();
    img.src = SPRITE_SRC;
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight;
      const off = document.createElement("canvas");
      off.width = w; off.height = h;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      octx.drawImage(img, 0, 0);

      // Chroma-key: neutral mid/bright greys (low chroma, not near-black) become
      // transparent; colored fur and near-black outlines/eyes/nose are kept.
      const id = octx.getImageData(0, 0, w, h);
      const data = id.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        if (mx - mn <= 16 && mx >= 60) data[i + 3] = 0;
      }
      octx.putImageData(id, 0, 0);

      const colW = w / SPRITE_FRAMES;
      const frames: FrameRect[] = [];
      for (let c = 0; c < SPRITE_FRAMES; c++) {
        const x0 = Math.floor(c * colW), x1 = Math.floor((c + 1) * colW);
        let minX = x1, minY = h, maxX = x0, maxY = 0, found = false;
        for (let y = 0; y < h; y++) {
          for (let x = x0; x < x1; x++) {
            if (data[(y * w + x) * 4 + 3] > 40) {
              found = true;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        frames.push(found
          ? { sx: minX, sy: minY, sw: maxX - minX + 1, sh: maxY - minY + 1 }
          : { sx: x0, sy: 0, sw: x1 - x0, sh: h });
      }
      spriteRef.current = { src: off, frames, scale: SPRITE_DRAW_H / frames[0].sh, ready: true };
    };
  }, []);

  useEffect(() => {
    const isJumpKey = (e: KeyboardEvent) => e.code === "Space" || e.code === "ArrowUp";
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isJumpKey(e)) return;
      e.preventDefault();
      if (e.repeat) return;   // ignore OS key-repeat: holding = one long jump, not a burst of jumps
      jump();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (isJumpKey(e)) release();
    };
    // Tap anywhere to jump (mobile-friendly): a single window-level listener so
    // the whole screen is a jump target, not just the canvas box. Skip taps on
    // links/buttons (e.g. the "Back" nav) so they still work normally.
    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement | null)?.closest("a, button")) return;
      jump();
    };
    const onPointerUp = () => release();   // lift finger / mouse → end the held jump
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [jump, release]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    // Spawn the next hazard. Two kinds, with opposite counters:
    //  • Pet gate — a tall ground obstacle to leap. A single one needs a normal
    //    jump; clusters of 2–3 (unlocking with speed) want the floaty held jump
    //    to clear their width.
    //  • Bee — an overhead flyer at head height, always solo. The counter is to
    //    STAY GROUNDED: any real jump clips it.
    // Returns the extra horizontal span beyond a single obstacle so the cadence
    // below gives wider clusters proportionally more room before the next spawn.
    function spawn(): number {
      const s = g.current;

      // Bees unlock once the pace picks up; keep them solo and occasional.
      if (s.speed > 6 && Math.random() < 0.3) {
        s.obstacles.push({ x: W + 30, y: BEE_Y, type: "bee", w: BEE_W, h: BEE_H });
        return 0;
      }

      const maxGroup = s.speed > 9 ? 3 : s.speed > 6.5 ? 2 : 1;
      const r = Math.random();
      const count = maxGroup >= 3 && r > 0.85 ? 3
                  : maxGroup >= 2 && r > 0.6  ? 2
                  : 1;

      // Each cluster is a single height: short gates clear with a quick tap,
      // tall ones force a held jump. (A cluster of either still wants the hold
      // for the extra air-time needed to cross its width.)
      const h = Math.random() < 0.45 ? GATE_H_TALL : GATE_H_SHORT;
      const GAP = 30; // tight horizontal gap between gates within a cluster
      const step = GATE_W + GAP;
      for (let i = 0; i < count; i++) {
        s.obstacles.push({ x: W + 30 + i * step, y: GROUND - h, type: "gate", w: GATE_W, h });
      }
      return (count - 1) * step;
    }

    function tick() {
      const s = g.current;
      ctx.clearRect(0, 0, W, H);

      if (s.phase === "playing") {
        s.frame++;
        s.score += s.speed / 60;
        s.speed = Math.min(MAX_SPEED, INIT_SPEED + s.score * 0.045);
        s.scrollX += s.speed;

        // physics — variable jump: while the input is held, gravity is reduced
        // for the whole arc (rise & fall) so the jump floats higher and stays up
        // longer; releasing snaps back to normal gravity so Maple drops on cue.
        const grav = s.holding ? GRAVITY_HOLD : GRAVITY;
        s.mapleVY += grav;
        s.mapleY  += s.mapleVY;
        if (s.mapleY < JUMP_CEIL) {            // bonk the ceiling → stop climbing
          s.mapleY = JUMP_CEIL;
          if (s.mapleVY < 0) s.mapleVY = 0;
        }
        if (s.mapleY >= GROUND - DOG_H) {
          s.mapleY = GROUND - DOG_H;
          s.mapleVY = 0;
          s.jumpsLeft = 2;
          s.holding = false;                   // landed → next press starts a fresh jump
        }

        // obstacle spawn & move
        s.nextIn--;
        if (s.nextIn <= 0) {
          const extra = spawn();
          s.nextIn = Math.max(50, 125 - s.speed * 5) + Math.random() * 35 + extra / s.speed;
        }
        s.obstacles = s.obstacles.filter(o => o.x + o.w > -20);
        for (const o of s.obstacles) o.x -= s.speed;

        // collision (AABB with a little shrink for fairness). Each obstacle has
        // its own vertical band (o.y), so the airborne bee is only hit when
        // Maple actually jumps up into it — grounded, she runs safely beneath.
        const DSK = 8, OSK = 5;
        const mL = DOG_X + DSK, mR = DOG_X + DOG_W - DSK;
        const mT = s.mapleY + DSK, mB = s.mapleY + DOG_H - 4;
        for (const o of s.obstacles) {
          const oL = o.x + OSK, oR = o.x + o.w - OSK;
          const oT = o.y + OSK, oB = o.y + o.h - OSK;
          if (mR > oL && mL < oR && mB > oT && mT < oB) {
            s.phase = "dead";
            if (s.score > s.highScore) {
              s.highScore = s.score;
              localStorage.setItem("zoomies-hs", String(s.score));
            }
            setUiPhase("dead");
            break;
          }
        }
      }

      drawBackground(ctx, s.scrollX);
      for (const o of s.obstacles) drawObstacle(ctx, o, s.frame);

      const spr = spriteRef.current;
      if (spr.ready && spr.src) {
        const isAir = s.mapleY < GROUND - DOG_H - 2;
        const frameIdx = isAir
          ? 2                                                  // jump
          : s.phase === "idle"
            ? 1                                                // resting stance
            : Math.floor(s.scrollX / RUN_FRAME_DIST) % 2;      // run cycle
        drawMapleSprite(ctx, spr.src, spr.frames[frameIdx], spr.scale, s.mapleY, s.phase === "dead");
      } else {
        drawMaple(ctx, s.mapleY, s.frame, s.phase === "dead");
      }
      drawHUD(ctx, s.score, s.highScore);
      if (s.phase === "idle") drawIdleOverlay(ctx);
      if (s.phase === "dead") drawDeadOverlay(ctx, s.score, s.highScore);

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    // Jumping is handled by a window-level pointerdown listener (see effect
    // above) so a tap anywhere on the screen jumps — not just inside the canvas.
    // The wrapper keeps generous mobile padding for layout/breathing room and
    // touch-action:none to suppress double-tap zoom over the game; desktop hugs
    // the canvas (sm:py-0).
    <div
      className="w-full flex items-center justify-center cursor-pointer select-none py-12 sm:py-0"
      style={{ touchAction: "none" }}
    >
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="w-full block rounded-none sm:rounded-2xl"
      />
    </div>
  );
}
