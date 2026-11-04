import * as THREE from 'three';
import { Batcher } from '../world/toon.js';
import * as P from '../world/props.js';
import { FISH, FISH_BY_ID, tierIndex } from './fish.js';
import { aquariumBuilding, fishMesh } from './models.js';
import { emptyLot } from '../village/models.js';

// Megan's aquarium on Palmora: donate one of every species (junk doesn't count) and
// watch them swim. Three tanks by rarity; visitors' ticket money piles up each day.
export const AQUARIUM_FISH = FISH.filter((f) => f.tier !== 'junk');
export const TANKS = [
  { id: 'lagoon', name: 'Lagoon Tank', icon: '🐟', tiers: ['common', 'uncommon'], water: ['#7fd3e0', '#2f8fb5'], desc: 'Bright, shallow water for everyday island fish.' },
  { id: 'reef', name: 'Reef Hall', icon: '🪸', tiers: ['rare', 'epic'], water: ['#4fb3c9', '#1f5f8a'], desc: 'A coral reef for the rare and dazzling.' },
  { id: 'abyss', name: 'The Abyss', icon: '🌌', tiers: ['legendary', 'mythic'], water: ['#2a4f7a', '#0d1830'], desc: 'The deepest, darkest tank — home to legends.' },
];
export const tankOf = (f) => TANKS.find((t) => t.tiers.includes(f.tier));
/** Ticket money per donated species, paid into the box every morning. */
export const TICKET_PER_SPECIES = 3;

export class AquariumSystem {
  constructor(game) {
    this.game = game;
    this.group = null;
    this.swimmers = [];
    game.events.on('newDay', () => this.onNewDay());
    game.events.on('flag', ({ id }) => id === 'aquarium' && this.rebuild(true));
  }
  get s() {
    const st = this.game.state;
    st.aquarium ||= { fish: {}, box: 0 };
    return st.aquarium;
  }
  isBuilt() {
    return !!this.game.state?.flags.aquarium;
  }
  count() {
    return this.game.state ? Object.keys(this.s.fish).length : 0;
  }
  has(id) {
    return !!this.s.fish[id];
  }
  /** Fish in your bag that the aquarium doesn't have yet. */
  donatable() {
    const inv = this.game.state.inventory;
    return AQUARIUM_FISH.filter((f) => !this.has(f.id) && (inv['fish_' + f.id] || 0) > 0);
  }
  donate(id) {
    const g = this.game;
    const f = FISH_BY_ID[id];
    if (!f || !this.isBuilt() || this.has(id) || !(g.state.inventory['fish_' + id] > 0)) return false;
    g.removeItem('fish_' + id, 1, true);
    this.s.fish[id] = g.state.time.day;
    g.audio.sfx(tierIndex(f.tier) >= 3 ? 'catchRare' : 'pickup');
    g.addXP(5 + tierIndex(f.tier) * 5);
    const n = this.count();
    g.ui.toast(`🐠 ${f.name} now lives in the ${tankOf(f).name}! (${n}/${AQUARIUM_FISH.length})`, 'good');
    if (n === AQUARIUM_FISH.length) g.ui.banner('Aquarium complete!', 'Every species on display — Megan is speechless!', '🐋');
    g.quests.refresh();
    this.rebuild();
    g.save();
    return true;
  }
  onNewDay() {
    if (!this.game.state || !this.isBuilt()) return;
    this.s.box = Math.min(9999, (this.s.box || 0) + this.count() * TICKET_PER_SPECIES);
  }
  collect() {
    const n = this.s.box || 0;
    if (!n) return 0;
    this.s.box = 0;
    this.game.give({ coins: n });
    return n;
  }
  /** After a catch: a nudge when the aquarium still needs this species. */
  onCatch(f) {
    if (this.isBuilt() && f.tier !== 'junk' && !this.has(f.id) && !this._told?.[f.id]) {
      this._told = { ...(this._told || {}), [f.id]: true };
      setTimeout(() => this.game.ui.toast(`🐠 The aquarium doesn't have a ${f.name} yet — keep one to donate!`, 'info'), 1600);
    }
  }

  // ── world ──────────────────────────────────────
  attach(world) {
    this.detach();
    if (world.id !== 'palmora' || !world.villageSites || !this.game.state) return;
    this.world = world;
    this.group = new THREE.Group();
    world.dynamic.add(this.group);
    this.rebuild();
  }
  detach() {
    if (this.group) this.group.parent?.remove(this.group);
    if (this.world) {
      this.world.interactables = this.world.interactables.filter((i) => !i.aquarium);
      this.world.colliders = this.world.colliders.filter((c) => !c.aquarium);
      this.world.props = this.world.props.filter((p) => !p.aquarium);
    }
    this.group = null;
    this.world = null;
    this.swimmers = [];
  }
  rebuild(fresh = false) {
    const w = this.world;
    if (!w || !this.group) return;
    this.group.clear();
    w.interactables = w.interactables.filter((i) => !i.aquarium);
    w.colliders = w.colliders.filter((c) => !c.aquarium);
    w.props = w.props.filter((p) => !p.aquarium);
    this.swimmers = [];
    this.glows = [];
    const st = w.villageSites.aquarium;
    const y = w.heightAt(st.x, st.z);
    const b = new Batcher();
    if (!this.isBuilt()) {
      const lot = emptyLot(b, st.x, y, st.z, st.rot, st.w, st.d);
      this.group.add(b.build(w.glowMat));
      this.group.add(P.signBoard('FUTURE AQUARIUM', lot.signPos.clone().setY(y + 1.1), st.rot, { bg: '#d9f0ec', w: 2.4 }));
      this.entrance = new THREE.Vector3(st.x + Math.sin(st.rot) * 4, y, st.z + Math.cos(st.rot) * 4);
      w.props.push({ aquarium: true, pos: new THREE.Vector3(st.x, y, st.z), h: 1, tip: () => ({ title: 'Empty lot by the dock road', desc: this.game.quests.isActive('aq1') ? 'Megan\'s aquarium will stand here once Bob has his driftwood and stone.' : 'Megan the fish seller dreams of building something here one day…' }) });
      return;
    }
    const glow = [];
    const res = aquariumBuilding(b, st.x, y, st.z, st.rot, glow);
    this.group.add(b.build(w.glowMat));
    this.group.add(P.signBoard('AQUARIUM', res.signPos, st.rot, { bg: '#d9f0ec', w: 2.2 }));
    w.colliders.push({ ...res.collider, aquarium: true }, { ...res.tankCollider, aquarium: true });
    for (const p of glow) {
      const s = P.glowSprite(p, '#ffcf7a', 2.4);
      this.glows.push(s);
      this.group.add(s);
    }
    // glass and the fish swimming behind it, in the building's own frame
    const tank = res.tank;
    const frame = new THREE.Group();
    frame.position.set(st.x, y, st.z);
    frame.rotation.y = st.rot;
    this.group.add(frame);
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(tank.x1 - tank.x0, tank.y1 - tank.y0, tank.z1 - tank.z0 - 0.08),
      new THREE.MeshBasicMaterial({ color: '#8fe0f0', transparent: true, opacity: 0.22, depthWrite: false }),
    );
    glass.position.set((tank.x0 + tank.x1) / 2, (tank.y0 + tank.y1) / 2, (tank.z0 + tank.z1) / 2 + 0.02);
    glass.renderOrder = 2;
    frame.add(glass);
    const show = AQUARIUM_FISH.filter((f) => this.has(f.id)).sort((a, c) => tierIndex(c.tier) - tierIndex(a.tier) || this.s.fish[c.id] - this.s.fish[a.id]).slice(0, 7);
    show.forEach((f, i) => {
      const m = fishMesh(f);
      const size = 0.5 + tierIndex(f.tier) * 0.06;
      m.scale.setScalar(size);
      const lane = tank.y0 + 0.75 + ((i * 0.53) % 1) * (tank.y1 - tank.y0 - 1.2);
      m.position.set(tank.x0 + 0.6 + ((i * 0.37) % 1) * (tank.x1 - tank.x0 - 1.2), lane, tank.z0 + 0.35 + (i % 3) * 0.25);
      frame.add(m);
      this.swimmers.push({ m, size, lane, x0: tank.x0 + 0.5, x1: tank.x1 - 0.5, v: (0.35 + (i % 3) * 0.15) * (i % 2 ? 1 : -1), ph: i * 1.7 });
    });
    this.entrance = res.door;
    const tipFn = () => ({
      title: 'Palmora Aquarium',
      desc: `${this.count()} / ${AQUARIUM_FISH.length} species on display.${this.s.box ? `\n🪙 ${this.s.box} ticket money waiting.` : ''}\nTap it (or press E at the door) to look inside and donate fish.`,
    });
    w.interact({
      pos: res.door, r: 2.6, priority: 2, aquarium: true, icon: '🐠', tipH: 2.4,
      tip: tipFn,
      label: () => 'Visit the aquarium',
      action: () => this.open(),
      // tapping the building opens it straight away when you're close enough
      tapOpen: () => this.game.player.pos.distanceTo(res.door) < 16 && (this.open(), true),
    });
    // big building: several tap points across the front (tank, roof fish, sign) that win over nearby bushes
    const tapOpen = () => this.game.player.pos.distanceTo(res.door) < 16 && (this.open(), true);
    for (const [lx, ly, lz] of [[(tank.x0 + tank.x1) / 2, 1.9, tank.z1], [-1.2, 5.1, -0.6], [3.0, 2.9, 1.9], [tank.x0 + 0.8, 2.6, tank.z1], [tank.x1 - 0.8, 1.2, tank.z1]]) {
      const pos = new THREE.Vector3(lx, ly, lz).applyAxisAngle(new THREE.Vector3(0, 1, 0), st.rot).add(new THREE.Vector3(st.x, y, st.z));
      w.props.push({ aquarium: true, pos, h: 0, pickBias: 0.55, tip: tipFn, tapOpen });
    }
    if (fresh) this.game.particles.burst(res.door.clone().setY(res.door.y + 2), { count: 50, color: '#7fd3e0', speed: 4, up: 5, life: 1.2 });
  }
  open(tab) {
    this.game.ui.openPanel('aquarium', tab ? { tab } : {});
    this.game.events.emit('aquarium', {});
  }
  targetFor() {
    if (!this.world) return null;
    return this.entrance ? { pos: this.entrance.clone(), label: this.isBuilt() ? 'Aquarium — press E to donate fish' : 'Future aquarium site' } : null;
  }
  update(dt, glowAmt = 0) {
    if (!this.group) return;
    const t = (this._t = (this._t || 0) + dt);
    for (const sw of this.swimmers) {
      sw.m.position.x += sw.v * dt;
      if (sw.m.position.x > sw.x1) sw.v = -Math.abs(sw.v);
      if (sw.m.position.x < sw.x0) sw.v = Math.abs(sw.v);
      sw.m.position.y = sw.lane + Math.sin(t * 1.3 + sw.ph) * 0.12;
      sw.m.scale.x = sw.v > 0 ? -sw.size : sw.size; // the art faces left
      sw.m.rotation.z = Math.sin(t * 2 + sw.ph) * 0.06;
    }
    for (const s of this.glows || []) s.material.opacity = glowAmt * 0.8;
  }
}

