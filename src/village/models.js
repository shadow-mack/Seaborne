import * as THREE from 'three';
import { G, mat4, inked } from '../world/toon.js';
import { compose as T, shade } from '../world/props.js';

// 3D models for Palmora's restoration projects: each one has a storm-wrecked ruin,
// a scaffolded "Bob is building it tonight" version, and the finished building.
// Every model faces +z (its front) before rotation and returns its colliders and sign spot.

const STONE = '#a7a3a8';
const STONE_DARK = '#8d8a92';
const WOOD = '#7a5a40';
const PLANK = '#c49a70';

function rubble(b, base, cx, cz, r, n, seed = 1) {
  for (let i = 0; i < n; i++) {
    const a = i * 2.4 + seed;
    const d = r * (0.4 + ((i * 37) % 10) / 16);
    b.add(G.rock, i % 2 ? STONE : STONE_DARK, T(base, cx + Math.cos(a) * d, 0.12, cz + Math.sin(a) * d, a, a * 0.7, 0, 0.18 + (i % 3) * 0.08), { flat: true });
  }
}
function plankPile(b, base, x, z, rot = 0) {
  for (let i = 0; i < 4; i++) b.add(G.box, i % 2 ? PLANK : shade(PLANK, 0.9), T(base, x, 0.1 + i * 0.13, z, 0, rot + (i % 2) * 0.12, 0, 2.2, 0.12, 0.32));
}
/** Poles and planks wrapped round a footprint while Bob works on it. */
function scaffold(b, base, w, d, h) {
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.add(G.cyl6, WOOD, T(base, sx * (w / 2 + 0.4), h / 2, sz * (d / 2 + 0.4), 0, 0, 0, 0.09, h, 0.09));
  for (let y = 1.2; y < h; y += 1.6) {
    b.add(G.box, PLANK, T(base, 0, y, d / 2 + 0.4, 0, 0, 0, w + 1, 0.1, 0.5));
    b.add(G.box, PLANK, T(base, 0, y, -d / 2 - 0.4, 0, 0, 0, w + 1, 0.1, 0.5));
    b.add(G.box, PLANK, T(base, w / 2 + 0.4, y, 0, 0, 0, 0, 0.5, 0.1, d + 1));
    b.add(G.box, PLANK, T(base, -w / 2 - 0.4, y, 0, 0, 0, 0, 0.5, 0.1, d + 1));
  }
  b.add(G.box, WOOD, T(base, w / 2 + 0.4, h / 2, d / 2 + 0.42, 0, 0, 0.9, 0.06, h * 1.1, 0.06));
  plankPile(b, base, -w / 2 - 1.6, d / 2 + 1.2, 0.3);
  b.add(G.box, '#b48a5a', T(base, w / 2 + 1.4, 0.4, d / 2 + 1.2, 0, 0.4, 0, 0.8, 0.8, 0.8));
}
/** Stakes, a rope line and a pile of planks on an empty lot. */
export function emptyLot(b, x, y, z, rot, w, d) {
  const base = mat4(x, y, z, 0, rot, 0);
  b.add(G.box, '#b8a878', T(base, 0, 0.02, 0, 0, 0, 0, w, 0.04, d), { kind: 'plain' });
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.add(G.cyl6, WOOD, T(base, (sx * w) / 2, 0.4, (sz * d) / 2, 0, 0, 0, 0.06, 0.8, 0.06));
  for (const sz of [-1, 1]) b.add(G.box, '#e8dcc0', T(base, 0, 0.7, (sz * d) / 2, 0, 0, 0, w, 0.03, 0.03));
  for (const sx of [-1, 1]) b.add(G.box, '#e8dcc0', T(base, (sx * w) / 2, 0.7, 0, 0, 0, 0, 0.03, 0.03, d));
  plankPile(b, base, w / 2 - 1.4, d / 2 - 1, 0.2);
  for (const sx of [-0.9, 0.9]) b.add(G.box, WOOD, T(base, -w / 2 + 0.8 + sx, 0.5, d / 2 + 0.6, 0, 0, 0, 0.12, 1.0, 0.12)); // sign posts
  return { colliders: [], signPos: new THREE.Vector3(-w / 2 + 0.8, 0, d / 2 + 0.6).applyMatrix4(base) };
}

// ── Fountain ───────────────────────────────────────
export function fountain(b, x, y, z, rot, state, glow) {
  const base = mat4(x, y, z, 0, rot, 0);
  const col = [{ type: 'circle', x, z, r: 2.6 }];
  if (state === 'ruin') {
    for (let i = 0; i < 12; i++) {
      if (i % 4 === 1) continue; // gaps where the rim broke
      const a = (i / 12) * Math.PI * 2;
      b.add(G.box, i % 3 ? STONE : STONE_DARK, T(base, Math.cos(a) * 2.3, 0.25 + (i % 2) * 0.05, Math.sin(a) * 2.3, 0, -a, (i % 3) * 0.08, 0.5, 0.5 - (i % 3) * 0.12, 1.2));
    }
    b.add(G.cyl8, STONE_DARK, T(base, 0.6, 0.3, 0.2, 0, 0.4, Math.PI / 2, 0.45, 1.6, 0.45));
    b.add(G.cyl12, '#9aa86a', T(base, 0, 0.05, 0, 0, 0, 0, 2.0, 0.06, 2.0));
    rubble(b, base, 0, 0, 2.6, 8);
    return { colliders: col };
  }
  if (state === 'building') {
    b.add(G.cyl12, STONE, T(base, 0, 0.3, 0, 0, 0, 0, 2.4, 0.6, 2.4));
    scaffold(b, base, 4.8, 4.8, 2.6);
    return { colliders: col };
  }
  b.add(G.cyl12, STONE, T(base, 0, 0.32, 0, 0, 0, 0, 2.5, 0.64, 2.5));
  b.add(G.cyl12, '#c8c2b8', T(base, 0, 0.66, 0, 0, 0, 0, 2.55, 0.08, 2.55));
  b.add(G.cyl12, '#5fb4c4', T(base, 0, 0.6, 0, 0, 0, 0, 2.25, 0.06, 2.25), { kind: 'plain' });
  b.add(G.cyl8, STONE, T(base, 0, 1.2, 0, 0, 0, 0, 0.45, 1.6, 0.45));
  b.add(G.cyl12, STONE, T(base, 0, 2.05, 0, 0, 0, 0, 1.1, 0.26, 1.1));
  b.add(G.cyl12, '#7fd3e0', T(base, 0, 2.17, 0, 0, 0, 0, 0.95, 0.05, 0.95), { kind: 'plain' });
  b.add(G.cone8, '#bfeaf2', T(base, 0, 2.65, 0, 0, 0, 0, 0.18, 0.9, 0.18), { kind: 'plain' });
  b.add(G.sphere, '#f7c95c', T(base, 0, 3.15, 0, 0, 0, 0, 0.22));
  // flower beds and two benches facing it
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.5;
    b.add(G.sphere, '#5f9a5c', T(base, Math.cos(a) * 3.4, 0.25, Math.sin(a) * 3.4, 0, 0, 0, 0.5, 0.35, 0.5));
    b.add(G.sphere, ['#f2a2b8', '#f7c95c', '#ffffff'][i % 3], T(base, Math.cos(a) * 3.4, 0.55, Math.sin(a) * 3.4, 0, 0, 0, 0.14));
  }
  for (const s of [-1, 1]) {
    b.add(G.box, PLANK, T(base, s * 4.6, 0.45, 0, 0, Math.PI / 2, 0, 1.8, 0.1, 0.5));
    b.add(G.box, PLANK, T(base, s * 4.85, 0.75, 0, 0, Math.PI / 2, 0.15 * s, 1.8, 0.4, 0.08));
    for (const k of [-0.7, 0.7]) b.add(G.box, WOOD, T(base, s * 4.6, 0.2, k, 0, 0, 0, 0.1, 0.4, 0.4));
  }
  for (const s of [-1, 1]) col.push({ type: 'circle', x: x + Math.cos(rot) * s * 4.6, z: z - Math.sin(rot) * s * 4.6, r: 0.6 });
  glow?.push(new THREE.Vector3(0, 3.15, 0).applyMatrix4(base));
  return { colliders: col };
}

// ── Windmill ───────────────────────────────────────
/** Returns { sails } — a group to spin — once it's finished. */
export function windmill(b, x, y, z, rot, state) {
  const base = mat4(x, y, z, 0, rot, 0);
  const col = [{ type: 'circle', x, z, r: 2.5 }];
  const wall = '#efe6d2';
  if (state === 'ruin') {
    b.add(G.cyl12, wall, T(base, 0, 1.0, 0, 0, 0, 0, 2.4, 2.0, 2.4));
    b.add(G.box, '#5a4636', T(base, 0, 0.8, 2.35, 0, 0, 0, 1.0, 1.6, 0.1));
    rubble(b, base, 0, 0, 3.2, 10, 2);
    // broken sails lying in the grass
    for (let i = 0; i < 2; i++) b.add(G.box, i ? '#e8dcc0' : WOOD, T(base, 3.2 + i * 0.6, 0.12, -1.5 + i * 2.2, 0, 0.6 + i, 0, 0.5, 0.12, 4.2));
    return { colliders: col };
  }
  const tiers = state === 'building' ? 2 : 3;
  for (let i = 0; i < tiers; i++) {
    const r = 2.4 - i * 0.3;
    b.add(G.cyl12, wall, T(base, 0, 1.0 + i * 2, 0, 0, 0, 0, r, 2.0, r));
    b.add(G.cyl12, shade(wall, 0.85), T(base, 0, 2.0 + i * 2, 0, 0, 0, 0, r + 0.05, 0.12, r + 0.05));
  }
  b.add(G.box, '#7a5236', T(base, 0, 1.0, 2.38, 0, 0, 0, 1.0, 1.9, 0.12));
  b.add(G.box, '#ffd98a', T(base, 0, 3.4, 2.12, 0, 0, 0, 0.6, 0.7, 0.1), { kind: 'glow' });
  if (state === 'building') {
    scaffold(b, base, 4.6, 4.6, 4.6);
    return { colliders: col };
  }
  b.add(G.cone8, '#b94a3e', T(base, 0, 7.0, 0, 0, 0, 0, 2.15, 1.8, 2.15));
  b.add(G.box, '#ffd98a', T(base, 0, 5.4, 1.85, 0, 0, 0, 0.5, 0.6, 0.1), { kind: 'glow' });
  const sails = new THREE.Group();
  const hub = inked(new THREE.CylinderGeometry(0.35, 0.35, 0.6, 10), WOOD, 0.03);
  hub.rotation.x = Math.PI / 2;
  sails.add(hub);
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Group();
    arm.rotation.z = (i / 4) * Math.PI * 2;
    const beam = inked(new THREE.BoxGeometry(0.18, 4.4, 0.12), WOOD, 0.02);
    beam.position.y = 2.3;
    arm.add(beam);
    const cloth = inked(new THREE.BoxGeometry(1.1, 3.4, 0.05), '#f4ecd8', 0.02);
    cloth.position.set(0.62, 2.7, 0.02);
    arm.add(cloth);
    for (let k = 0; k < 4; k++) {
      const slat = inked(new THREE.BoxGeometry(1.2, 0.06, 0.08), shade(WOOD, 1.2), 0);
      slat.position.set(0.62, 1.3 + k * 0.95, 0.06);
      arm.add(slat);
    }
    sails.add(arm);
  }
  sails.position.copy(new THREE.Vector3(0, 6.0, 2.45).applyMatrix4(base));
  sails.rotation.y = rot;
  return { colliders: col, sails };
}

// ── Market Hall ───────────────────────────────────
export function marketHall(b, x, y, z, rot, state, glow) {
  const base = mat4(x, y, z, 0, rot, 0);
  const W = 9;
  const D = 6;
  const col = [];
  b.add(G.box, '#c8c2b8', T(base, 0, 0.15, 0, 0, 0, 0, W + 0.6, 0.3, D + 0.6), { flat: true });
  const posts = [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1]];
  if (state === 'ruin') {
    for (const [i, [sx, sz]] of posts.entries()) {
      const h = [2.6, 0.9, 1.5, 0.6, 1.9, 0.4][i];
      b.add(G.cyl8, '#f2ece0', T(base, (sx * W) / 2, 0.3 + h / 2, (sz * D) / 2, 0, 0, 0, 0.28, h, 0.28));
      col.push({ local: [(sx * W) / 2, (sz * D) / 2], r: 0.4 });
    }
    b.add(G.box, '#b94a3e', T(base, 0.5, 0.6, 0.4, 0.3, 0.2, 0.25, W * 0.6, 0.18, 2.4));
    b.add(G.box, WOOD, T(base, -2, 0.45, -1, 0, 0.7, 0.1, 4.5, 0.25, 0.25));
    rubble(b, base, 0, 0, 4, 12, 3);
    return { colliders: localCols(col, x, z, rot) };
  }
  for (const [sx, sz] of posts) {
    b.add(G.cyl8, '#f2ece0', T(base, (sx * W) / 2, 1.9, (sz * D) / 2, 0, 0, 0, 0.26, 3.2, 0.26));
    col.push({ local: [(sx * W) / 2, (sz * D) / 2], r: 0.4 });
  }
  if (state === 'building') {
    scaffold(b, base, W, D, 3.6);
    return { colliders: localCols(col, x, z, rot) };
  }
  // beams and a striped double-pitched roof
  for (const sz of [-1, 1]) b.add(G.box, WOOD, T(base, 0, 3.55, (sz * D) / 2, 0, 0, 0, W + 0.6, 0.25, 0.3));
  const ang = 0.42;
  const half = D / 2 + 0.8;
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const px = -W / 2 - 0.4 + (i + 0.5) * ((W + 0.8) / 6);
      b.add(G.box, i % 2 ? '#fbf3e2' : '#d9534f', T(base, px, 3.75 + Math.tan(ang) * half * 0.5, (side * half) / 2, side * ang, 0, 0, (W + 0.8) / 6, 0.16, half / Math.cos(ang)));
    }
  }
  b.add(G.box, WOOD, T(base, 0, 3.8 + Math.tan(ang) * half, 0, Math.PI / 4, 0, 0, W + 1, 0.3, 0.3));
  // counters with produce
  const goods = ['#e2434b', '#e7b53a', '#f2d23a', '#3f8f3a', '#f29a2e', '#9bb7c9', '#f2a2b8'];
  for (const [i, [cx, cz]] of [[-2.6, 1.6], [2.6, 1.6], [-2.6, -1.4], [2.6, -1.4]].entries()) {
    b.add(G.box, PLANK, T(base, cx, 0.75, cz, 0, 0, 0, 2.6, 0.9, 0.9));
    for (let k = 0; k < 4; k++) b.add(G.sphere, goods[(k + i * 2) % goods.length], T(base, cx - 0.9 + k * 0.6, 1.32, cz, 0, 0, 0, 0.2));
  }
  for (const sx of [-1, 1]) {
    const p = new THREE.Vector3((sx * W) / 2, 3.1, D / 2 + 0.2).applyMatrix4(base);
    b.add(G.sphere, '#ffd98a', T(base, (sx * W) / 2, 3.1, D / 2 + 0.2, 0, 0, 0, 0.18), { kind: 'glow' });
    glow?.push(p);
  }
  return { colliders: localCols(col, x, z, rot), signPos: new THREE.Vector3(0, 3.55, D / 2 + 0.2).applyMatrix4(base) };
}

// ── Observatory ───────────────────────────────────
export function observatory(b, x, y, z, rot, state, glow) {
  const base = mat4(x, y, z, 0, rot, 0);
  const col = [{ type: 'circle', x, z, r: 3.0 }];
  if (state === 'ruin') {
    b.add(G.cyl12, STONE, T(base, 0, 0.7, 0, 0, 0, 0, 2.8, 1.4, 2.8));
    for (let i = 0; i < 4; i++) b.add(G.sphere, '#7fb3b0', T(base, -2.5 + i * 1.6, 0.25, 2.8 + (i % 2) * 0.8, i, i * 0.6, 0, 0.6, 0.2, 0.5), { flat: true });
    b.add(G.cyl8, '#8a8f99', T(base, 2.6, 0.3, -2.4, 0, 0.8, Math.PI / 2, 0.3, 2.4, 0.3));
    rubble(b, base, 0, 0, 3.6, 9, 4);
    return { colliders: col };
  }
  b.add(G.cyl12, STONE, T(base, 0, 1.6, 0, 0, 0, 0, 2.8, 3.2, 2.8));
  b.add(G.cyl12, STONE_DARK, T(base, 0, 3.25, 0, 0, 0, 0, 2.95, 0.2, 2.95));
  b.add(G.box, '#7a5236', T(base, 0, 1.0, 2.76, 0, 0, 0, 1.1, 2.0, 0.12));
  for (const s of [-1, 1]) b.add(G.box, '#ffd98a', T(base, s * 1.5, 2.2, 2.4, 0, s * 0.55, 0, 0.5, 0.6, 0.1), { kind: 'glow' });
  if (state === 'building') {
    scaffold(b, base, 5.6, 5.6, 4.4);
    return { colliders: col };
  }
  // copper dome with an open slit and the telescope poking out
  b.add(G.sphereHi, '#7fb3b0', T(base, 0, 3.3, 0, 0, 0, 0, 2.7, 2.4, 2.7));
  b.add(G.box, '#2a2f4a', T(base, 0, 4.6, 0.8, -0.5, 0, 0, 0.8, 0.12, 2.6));
  b.add(G.cyl8, '#d9b34a', T(base, 0, 5.4, 1.6, -0.9, 0, 0, 0.32, 2.6, 0.32));
  b.add(G.cyl8, '#2a2534', T(base, 0, 6.05, 2.2, -0.9, 0, 0, 0.36, 0.2, 0.36));
  b.add(G.sphere, '#f7c95c', T(base, 0, 5.85, 0, 0, 0, 0, 0.25));
  glow?.push(new THREE.Vector3(0, 2.2, 2.6).applyMatrix4(base));
  return { colliders: col };
}

// ── Festival Stage ───────────────────────────────
export function stage(b, x, y, z, rot, state, glow) {
  const base = mat4(x, y, z, 0, rot, 0);
  const W = 9;
  const D = 5;
  // the stage is brand new: until it's funded there's just a staked-out lot
  if (state === 'ruin') return emptyLot(b, x, y, z, rot, W, D);
  const col = [{ type: 'box', x, z, hw: W / 2, hd: D / 2, rot }];
  b.add(G.box, '#9b7a58', T(base, 0, 0.5, 0, 0, 0, 0, W, 1.0, D), { flat: true });
  b.add(G.box, '#c49a70', T(base, 0, 1.03, 0, 0, 0, 0, W - 0.2, 0.06, D - 0.2));
  for (let i = 0; i < 3; i++) b.add(G.box, '#b48a5a', T(base, 0, 0.17 + i * 0.33, D / 2 + 0.25 + (2 - i) * 0.35, 0, 0, 0, 3, 0.33, 0.35));
  if (state === 'building') {
    scaffold(b, base, W, D, 5);
    return { colliders: col };
  }
  // back wall, posts, a scalloped canopy, bunting and footlights
  b.add(G.box, '#3f6fa8', T(base, 0, 3.0, -D / 2 + 0.15, 0, 0, 0, W, 4.0, 0.2));
  b.add(G.box, '#f7c95c', T(base, 0, 3.0, -D / 2 + 0.28, 0, 0, 0, 2.6, 2.6, 0.05));
  b.add(G.sphere, '#f2a2b8', T(base, 0, 3.0, -D / 2 + 0.32, 0, 0, 0, 0.7, 0.7, 0.05));
  for (const sx of [-1, 1]) b.add(G.cyl8, '#f2ece0', T(base, (sx * W) / 2, 3.0, D / 2 - 0.2, 0, 0, 0, 0.18, 4.0, 0.18));
  for (let i = 0; i < 9; i++) {
    const px = -W / 2 + (i + 0.5) * (W / 9);
    b.add(G.box, i % 2 ? '#fbf3e2' : '#d9534f', T(base, px, 5.05, 0, 0, 0, 0, W / 9, 0.14, D + 0.4));
    b.add(G.cone4, i % 2 ? '#fbf3e2' : '#d9534f', T(base, px, 4.78, D / 2 + 0.15, Math.PI, Math.PI / 4, 0, 0.36, 0.4, 0.18));
  }
  const flags = ['#d9534f', '#f7c95c', '#58b4a5', '#f2a2b8', '#7d5ba6'];
  for (let i = 0; i < 12; i++) {
    const px = -W / 2 + 0.4 + i * ((W - 0.8) / 11);
    const sag = Math.sin((i / 11) * Math.PI) * 0.5;
    b.add(G.cone4, flags[i % flags.length], T(base, px, 4.3 - sag, D / 2 - 0.2, Math.PI, Math.PI / 4, 0, 0.18, 0.4, 0.06));
  }
  for (let i = 0; i < 5; i++) {
    const px = -W / 2 + 1 + i * ((W - 2) / 4);
    b.add(G.sphere, '#ffe3a0', T(base, px, 1.15, D / 2 - 0.3, 0, 0, 0, 0.14), { kind: 'glow' });
    glow?.push(new THREE.Vector3(px, 1.3, D / 2 - 0.3).applyMatrix4(base));
  }
  return { colliders: col, signPos: new THREE.Vector3(0, 5.55, D / 2 + 0.3).applyMatrix4(base) };
}

/** Post colliders given in the model's local frame → world circles. */
function localCols(list, x, z, rot) {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  return list.map(({ local: [lx, lz], r }) => ({ type: 'circle', x: x + lx * c + lz * s, z: z - lx * s + lz * c, r }));
}

/** A little notice board for the Project Board beside the Town Hall. */
export function projectBoard(b, x, y, z, rot) {
  const base = mat4(x, y, z, 0, rot, 0);
  for (const sx of [-1, 1]) b.add(G.box, WOOD, T(base, sx * 1.2, 1.1, 0, 0, 0, 0, 0.18, 2.2, 0.18));
  b.add(G.box, '#a8d0d8', T(base, 0, 1.6, 0, 0, 0, 0, 2.6, 1.4, 0.12));
  b.add(G.box, '#fbf3e2', T(base, -0.6, 1.7, 0.08, 0, 0, 0.06, 0.7, 0.8, 0.02));
  b.add(G.box, '#ffe9a8', T(base, 0.15, 1.55, 0.08, 0, 0, -0.05, 0.6, 0.7, 0.02));
  b.add(G.box, '#f2a2b8', T(base, 0.85, 1.7, 0.08, 0, 0, 0.08, 0.55, 0.6, 0.02));
  b.add(G.box, WOOD, T(base, 0, 2.4, 0, 0, 0, 0, 2.9, 0.16, 0.3));
  return { collider: { type: 'box', x, z, hw: 1.4, hd: 0.3, rot } };
}
