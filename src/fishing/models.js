import * as THREE from 'three';
import { inked, G, mat4 } from '../world/toon.js';
import { compose as T } from '../world/props.js';
import { gradientMap, glowTexture } from '../world/toon.js';
import { TIERS } from './fish.js';
import { fishSVG } from '../ui/icons.js';

// 3D models for fishing: boats, and the painted fish you catch.

/** Player's boat model, by tier. */
export function boatModel(tier) {
  const g = new THREE.Group();
  if (tier <= 0) return g;
  if (tier === 1) {
    for (let i = 0; i < 6; i++) {
      const log = inked(new THREE.CylinderGeometry(0.22, 0.22, 4.2, 8), i % 2 ? '#c9a65b' : '#b8944c', 0.025);
      log.rotation.x = Math.PI / 2;
      log.position.set(-1.1 + i * 0.44, 0.15, 0);
      g.add(log);
    }
    const mast = inked(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), '#7a5a40', 0.02);
    mast.position.set(0, 1.3, -0.5);
    g.add(mast);
    const sail = inked(new THREE.BoxGeometry(0.04, 1.6, 1.4), '#f4ecd8', 0.02);
    sail.position.set(0.05, 1.5, -0.1);
    g.add(sail);
    return g;
  }
  const big = tier === 3;
  const L = big ? 9 : 6;
  const W = big ? 3.4 : 2.2;
  const hullColor = big ? '#5a3a2a' : '#f2ece0';
  const hull = inked(new THREE.BoxGeometry(W, 1.2, L), hullColor, 0.03);
  hull.position.y = 0.3;
  g.add(hull);
  const bow = inked(new THREE.ConeGeometry(W / 2, 2.2, 4), hullColor, 0.03);
  bow.rotation.set(Math.PI / 2, Math.PI / 4, 0);
  bow.scale.set(1, 1, 0.55);
  bow.position.set(0, 0.3, L / 2 + 1.0);
  g.add(bow);
  const stripe = inked(new THREE.BoxGeometry(W + 0.05, 0.2, L), big ? '#c8a040' : '#3f8fa6', 0);
  stripe.position.y = 0.75;
  g.add(stripe);
  const masts = big ? [-2, 1.8] : [0];
  for (const mz of masts) {
    const h = big ? 7 : 5;
    const mast = inked(new THREE.CylinderGeometry(0.1, 0.12, h, 6), '#6b4f3a', 0.02);
    mast.position.set(0, h / 2 + 0.8, mz);
    g.add(mast);
    const sail = inked(new THREE.BoxGeometry(big ? 3.4 : 0.06, big ? 3.2 : 3.6, big ? 0.08 : 2.6), big ? '#2a2534' : '#fbf3e2', 0.02);
    sail.position.set(0, h * 0.58 + 0.8, mz + (big ? 0 : 1.2));
    g.add(sail);
  }
  if (big) {
    const flagM = inked(new THREE.BoxGeometry(0.04, 0.6, 1.0), '#d9534f', 0);
    flagM.position.set(0, 8.4, -1.5);
    g.add(flagM);
  }
  return g;
}

const fishTexCache = new Map();
/** The catch-card illustration painted onto a texture (cached per species). */
export function fishTexture(f) {
  let tex = fishTexCache.get(f.id);
  if (tex) return tex;
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const img = new Image();
  img.onload = () => {
    c.getContext('2d').drawImage(img, 0, 0, 512, 512);
    tex.needsUpdate = true;
  };
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fishSVG(f, 512))}`;
  fishTexCache.set(f.id, tex);
  return tex;
}

/**
 * A caught fish: the same hand-drawn art as the catch card on a cut-out card that
 * always turns to face the camera, with a soft rarity glow behind it.
 */
export function fishMesh(f) {
  const g = new THREE.Group();
  const tex = fishTexture(f);
  const mat = new THREE.MeshToonMaterial({ map: tex, gradientMap: gradientMap(), alphaTest: 0.5, side: THREE.DoubleSide, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.45 });
  const card = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.25), mat);
  card.castShadow = false;
  g.add(card);
  if (f.tier !== 'junk' && f.tier !== 'common') {
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: TIERS[f.tier].color, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.setScalar(2.2);
    glow.position.z = -0.05;
    g.add(glow);
  }
  g.userData.billboard = true;
  return g;
}

/**
 * Palmora Aquarium (faces +z before rotation): a seaside hall with a big glass tank
 * bulging out of its front wall. Returns where the tank is so live fish can swim in it.
 */
export function aquariumBuilding(b, x, y, z, rot, glowList) {
  const base = mat4(x, y, z, 0, rot, 0);
  const W = 9;
  const D = 5;
  const H = 3.6;
  const wall = '#e0f6f2';
  const trim = '#3f6fa8';
  const back = -0.6; // the hall body sits back so the tank can stick out in front
  b.add(G.box, '#9b958c', T(base, 0, 0.15, back, 0, 0, 0, W + 0.4, 0.3, D + 0.4), { flat: true });
  b.add(G.box, wall, T(base, 0, H / 2 + 0.25, back, 0, 0, 0, W, H, D));
  for (let yy = 0.9; yy < H; yy += 0.55) b.add(G.box, '#c9e9e2', T(base, 0, yy, back - D / 2 - 0.01, 0, 0, 0, W - 0.1, 0.05, 0.02));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.add(G.box, trim, T(base, (sx * W) / 2, H / 2 + 0.25, back + (sz * D) / 2, 0, 0, 0, 0.26, H + 0.1, 0.26));
  // flat roof with a wavy blue parapet and a big friendly fish on top
  b.add(G.box, '#58b4a5', T(base, 0, H + 0.35, back, 0, 0, 0, W + 0.5, 0.25, D + 0.5));
  for (let i = 0; i < 9; i++) b.add(G.sphere, i % 2 ? '#7fd3e0' : '#3f8fb0', T(base, -W / 2 + 0.5 + i * ((W - 1) / 8), H + 0.6, back + D / 2 + 0.2, 0, 0, 0, 0.42, 0.32, 0.16));
  b.add(G.sphere, '#f0846a', T(base, -1.2, H + 1.5, back, 0, 0, 0, 1.3, 0.85, 0.55));
  b.add(G.sphere, '#fbe2d0', T(base, -1.2, H + 1.3, back + 0.05, 0, 0, 0, 1.0, 0.45, 0.5));
  b.add(G.cone4, '#f0846a', T(base, 0.6, H + 1.5, back, 0, 0, -Math.PI / 2, 0.75, 0.9, 0.2));
  b.add(G.sphere, '#ffffff', T(base, -2.05, H + 1.7, back + 0.45, 0, 0, 0, 0.2));
  b.add(G.sphere, '#2a2534', T(base, -2.08, H + 1.7, back + 0.6, 0, 0, 0, 0.1));
  b.add(G.box, '#7a5a40', T(base, -1.2, H + 0.75, back, 0, 0, 0, 0.12, 0.5, 0.12));
  // the tank: frame, sand, plants and a deep-blue backdrop (the glass is added separately)
  const tank = { x0: -4.0, x1: 1.4, y0: 0.55, y1: 3.15, z0: back + D / 2, z1: back + D / 2 + 1.25 };
  const tx = (tank.x0 + tank.x1) / 2;
  const tw = tank.x1 - tank.x0;
  const tz = (tank.z0 + tank.z1) / 2;
  const td = tank.z1 - tank.z0;
  b.add(G.box, '#3a8fb5', T(base, tx, (tank.y0 + tank.y1) / 2, tank.z0 + 0.04, 0, 0, 0, tw, tank.y1 - tank.y0, 0.06), { kind: 'plain' });
  b.add(G.box, '#ecd9a8', T(base, tx, tank.y0 + 0.12, tz, 0, 0, 0, tw, 0.24, td), { kind: 'plain' });
  for (let i = 0; i < 6; i++) {
    const px = tank.x0 + 0.4 + i * (tw - 0.8) / 5;
    const kelp = i % 2 ? '#4f8a4a' : '#6faa5c';
    b.add(G.cone6, kelp, T(base, px, tank.y0 + 0.6 + (i % 3) * 0.15, tank.z0 + 0.25, 0, i, 0, 0.12, 0.9 + (i % 3) * 0.3, 0.12), { kind: 'plain' });
    if (i % 2) b.add(G.rock, '#e0604c', T(base, px + 0.35, tank.y0 + 0.32, tank.z0 + 0.5, i, i, 0, 0.16), { kind: 'plain' });
  }
  b.add(G.box, trim, T(base, tx, tank.y0 - 0.15, tz, 0, 0, 0, tw + 0.3, 0.3, td + 0.15));
  b.add(G.box, trim, T(base, tx, tank.y1 + 0.1, tz, 0, 0, 0, tw + 0.3, 0.2, td + 0.15));
  for (const ex of [tank.x0, tank.x1]) b.add(G.box, trim, T(base, ex, (tank.y0 + tank.y1) / 2, tz, 0, 0, 0, 0.16, tank.y1 - tank.y0 + 0.4, td + 0.15));
  b.add(G.box, '#ffffff', T(base, tx, (tank.y0 + tank.y1) / 2, tank.z1, 0, 0, 0, 0.06, tank.y1 - tank.y0, 0.04));
  // door and porch on the right
  const dx = 3.0;
  const dz = back + D / 2;
  b.add(G.box, trim, T(base, dx, 1.3, dz + 0.03, 0, 0, 0, 1.4, 2.2, 0.08));
  b.add(G.box, '#7fd3e0', T(base, dx, 1.25, dz + 0.07, 0, 0, 0, 1.1, 1.95, 0.06), { kind: 'glow' });
  b.add(G.box, '#9b958c', T(base, dx, 0.12, dz + 0.6, 0, 0, 0, 1.8, 0.24, 1.0), { flat: true });
  for (const s of [-1, 1]) {
    b.add(G.box, '#3a3040', T(base, dx + s * 1.0, 2.2, dz + 0.12, 0, 0, 0, 0.08, 0.3, 0.1));
    b.add(G.box, '#ffe3a0', T(base, dx + s * 1.0, 2.25, dz + 0.25, 0, 0, 0, 0.2, 0.26, 0.2), { kind: 'glow' });
    glowList?.push(new THREE.Vector3(dx + s * 1.0, 2.25, dz + 0.3).applyMatrix4(base));
  }
  return {
    tank,
    door: new THREE.Vector3(dx, 0, dz + 1.6).applyMatrix4(base),
    signPos: new THREE.Vector3(dx, 2.9, dz + 0.12).applyMatrix4(base),
    collider: { type: 'box', x: x + Math.sin(rot) * back, z: z + Math.cos(rot) * back, hw: W / 2 + 0.2, hd: D / 2 + 0.2, rot },
    tankCollider: { type: 'box', ...xzOf(new THREE.Vector3(tx, 0, tz).applyMatrix4(base)), hw: tw / 2 + 0.2, hd: td / 2 + 0.1, rot },
  };
}

const xzOf = (v) => ({ x: v.x, z: v.z });
