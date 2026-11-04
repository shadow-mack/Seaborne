import * as THREE from 'three';
import { Batcher, G } from '../world/toon.js';
import * as P from '../world/props.js';
import { ITEMS } from '../shared/items.js';
import { PROJECTS, PROJECTS_BY_ID, FESTIVAL_EVERY } from './projects.js';
import { fountain, windmill, marketHall, observatory, stage, projectBoard } from './models.js';

/** A thin box running from a to b (for ropes). */
function segment(a, b, thick) {
  const dir = b.clone().sub(a);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize());
  return new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), q, new THREE.Vector3(thick, thick, dir.length() + 0.04));
}

const BUILDERS = { fountain, windmill, market: marketHall, observatory, stage };
const SIGN = { fountain: 'FOUNTAIN', windmill: 'WINDMILL', market: 'MARKET HALL', observatory: 'OBSERVATORY', stage: 'FESTIVAL STAGE' };

/**
 * Palmora restoration: the Project Board, the five project sites and the perks
 * finished buildings give. Bob builds a fully funded project overnight.
 */
export class VillageSystem {
  constructor(game) {
    this.game = game;
    this.group = null;
    this.t = 0;
    game.events.on('newDay', () => this.onNewDay());
  }
  get s() {
    const st = this.game.state;
    st.village ||= { got: {}, built: [], pending: [] };
    return st.village;
  }

  // ── progress ───────────────────────────────────
  isBuilt(id) {
    return !!this.game.state && this.s.built.includes(id);
  }
  isPending(id) {
    return this.s.pending.includes(id);
  }
  /** A project is open for donations once its request has been accepted. */
  isOpen(id) {
    const p = PROJECTS_BY_ID[id];
    const q = this.game.state.quests;
    return !!q.active[p.quest] || q.done.includes(p.quest);
  }
  status(id) {
    if (this.isBuilt(id)) return 'built';
    if (this.isPending(id)) return 'building';
    return 'ruin';
  }
  given(id, k) {
    return this.s.got[id]?.[k] || 0;
  }
  missing(id) {
    const p = PROJECTS_BY_ID[id];
    return Object.entries(p.needs).filter(([k, n]) => this.given(id, k) < n);
  }
  /** Put coins or goods from your bag into a project. Returns how many went in. */
  contribute(id, k) {
    const g = this.game;
    const st = g.state;
    const p = PROJECTS_BY_ID[id];
    if (!p || this.status(id) !== 'ruin' || !this.isOpen(id)) return 0;
    const left = p.needs[k] - this.given(id, k);
    const have = k === 'coins' ? st.coins : st.inventory[k] || 0;
    const n = Math.min(left, have);
    if (n <= 0) return 0;
    if (k === 'coins') g.spend(n, 0);
    else g.removeItem(k, n, true);
    const got = (this.s.got[id] ||= {});
    got[k] = (got[k] || 0) + n;
    g.audio.sfx(k === 'coins' ? 'coin' : 'pickup');
    if (!this.missing(id).length) {
      this.s.pending.push(id);
      g.ui.banner('Project funded!', `Bob will build the ${p.name} tonight`, p.icon);
      g.audio.sfx('questDone');
      this.rebuild();
    }
    g.save();
    return n;
  }
  /** Bob finishes everything that was funded by morning. */
  onNewDay() {
    const st = this.game.state;
    if (!st) return;
    const done = this.s.pending.splice(0);
    for (const id of done) {
      if (!this.s.built.includes(id)) this.s.built.push(id);
      const p = PROJECTS_BY_ID[id];
      setTimeout(() => {
        this.game.ui.banner(`${p.name} finished!`, p.perk, p.icon);
        this.game.audio.sfx('levelup');
      }, 2600);
    }
    if (done.length) {
      this.rebuild();
      this.game.quests.refresh();
    }
    if (this.isFestival()) setTimeout(() => this.game.ui.banner('Festival Day!', 'Cooked food sells for 50% more today. The plaza is lit up!', '🎪'), 4200);
    else if (this.isBuilt('observatory')) {
      const w = this.game.weather.describe(st.time.day);
      if (w.nightRain) setTimeout(() => this.game.ui.toast('🔭 The observatory predicts rain after dark tonight — Leviathan weather!', 'info'), 4200);
    }
  }

  // ── perks ──────────────────────────────────────
  /** Friendship points from chatting. */
  chatPoints(base) {
    return this.isBuilt('fountain') ? base * 2 : base;
  }
  /** How many a Kitchen Basics recipe makes. */
  basicsQty(r) {
    return (r.qty || 1) * (r.cat === 'basics' && this.isBuilt('windmill') ? 2 : 1);
  }
  isFestival(day = this.game.state?.time.day) {
    return this.isBuilt('stage') && day % FESTIVAL_EVERY === 0;
  }
  /** Extra sell bonus from the Market Hall and Festival Day (on cooked food). */
  sellBonus(itemId) {
    if (!this.game.state) return 0;
    let b = this.isBuilt('market') ? 0.1 : 0;
    if (itemId && this.isFestival() && ITEMS[itemId]?.type === 'product') b += 0.5;
    return b;
  }
  daysToFestival() {
    const d = this.game.state.time.day;
    return (FESTIVAL_EVERY - (d % FESTIVAL_EVERY)) % FESTIVAL_EVERY;
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
      this.world.interactables = this.world.interactables.filter((i) => !i.village);
      this.world.colliders = this.world.colliders.filter((c) => !c.village);
      this.world.props = this.world.props.filter((p) => !p.village);
    }
    this.group = null;
    this.world = null;
    this.sails = null;
    this.glows = [];
  }
  rebuild() {
    const w = this.world;
    if (!w || !this.group) return;
    this.group.clear();
    w.interactables = w.interactables.filter((i) => !i.village);
    w.colliders = w.colliders.filter((c) => !c.village);
    w.props = w.props.filter((p) => !p.village);
    this.sails = null;
    this.glows = [];
    const b = new Batcher();
    const glow = [];
    const sites = w.villageSites;
    const at = (st) => [st.x, w.heightAt(st.x, st.z), st.z, st.rot];

    // the Project Board beside the Town Hall
    const bs = sites.board;
    const board = projectBoard(b, ...at(bs));
    w.colliders.push({ ...board.collider, village: true });
    const boardPos = new THREE.Vector3(bs.x + Math.sin(bs.rot) * 1.4, w.heightAt(bs.x, bs.z), bs.z + Math.cos(bs.rot) * 1.4);
    this.boardPos = boardPos;
    w.interact({
      pos: boardPos, r: 2.6, priority: 1, village: true, icon: '🏗️', tipH: 2.2,
      enabled: () => this.anyOpen(),
      tip: () => ({ title: 'Project Board', desc: 'Help rebuild Palmora! Put coins and goods into the village projects — Bob builds each one overnight once it\'s fully funded.\nPress E to read it.' }),
      label: () => 'Read the Project Board',
      action: () => this.game.ui.openPanel('village'),
    });
    if (!this.anyOpen()) w.props.push({ village: true, pos: boardPos, h: 2.2, tip: { title: 'Project Board', desc: 'An empty notice board. Mayor Mike has plans for it…' } });

    for (const p of PROJECTS) {
      const st = sites[p.id];
      const state = this.status(p.id);
      const res = BUILDERS[p.id](b, ...at(st), state, glow);
      for (const c of res.colliders || []) w.colliders.push({ ...c, village: true });
      if (res.sails) {
        this.sails = res.sails;
        this.group.add(res.sails);
      }
      if (state === 'built') {
        const sp = res.signPos || new THREE.Vector3(st.x + Math.sin(st.rot) * (st.d / 2 + 0.6), w.heightAt(st.x, st.z) + (p.id === 'fountain' ? 0.9 : 2.9), st.z + Math.cos(st.rot) * (st.d / 2 + 0.6));
        if (p.id !== 'fountain') this.group.add(P.signBoard(SIGN[p.id], sp, st.rot, { bg: '#fbe9c8', w: 2.6 }));
      } else if (state === 'ruin' && res.signPos) this.group.add(P.signBoard(`FUTURE ${SIGN[p.id]}`, res.signPos.clone().setY(res.signPos.y + 1.1), st.rot, { bg: '#fbe9c8', w: 2.4 }));
      const front = new THREE.Vector3(st.x + Math.sin(st.rot) * (st.d / 2 + 1.6), 0, st.z + Math.cos(st.rot) * (st.d / 2 + 1.6));
      front.y = w.heightAt(front.x, front.z);
      p.front = front;
      const tip = () => this.siteTip(p);
      if (state === 'built' && p.id === 'observatory') {
        w.interact({ pos: front, r: 3, priority: 1, village: true, icon: '🔭', tipH: 3, tip, label: () => 'Look through the telescope', action: () => this.game.ui.openPanel('forecast') });
      } else if (state !== 'built') {
        w.interact({ pos: front, r: 3, priority: 0, village: true, icon: p.icon, tipH: 1.5, enabled: () => this.isOpen(p.id), tip, label: () => `${p.name} — project`, action: () => this.game.ui.openPanel('village', { project: p.id }) });
        if (!this.isOpen(p.id)) w.props.push({ village: true, pos: new THREE.Vector3(st.x, w.heightAt(st.x, st.z), st.z), h: 1.5, tip });
      } else w.props.push({ village: true, pos: new THREE.Vector3(st.x, w.heightAt(st.x, st.z), st.z), h: p.id === 'windmill' ? 5 : 3, tip });
    }
    // festival lights across the plaza once the stage stands
    if (this.isBuilt('stage')) this.buntings(b, glow);
    this.group.add(b.build(w.glowMat));
    for (const p of glow) {
      const s = P.glowSprite(p, '#ffcf7a', 2.6);
      s.material.opacity = 0;
      this.glows.push(s);
      this.group.add(s);
    }
  }
  /** Strings of flags and lanterns between the plaza lamp posts. */
  buntings(b, glow) {
    const w = this.world;
    const flags = ['#d9534f', '#f7c95c', '#58b4a5', '#f2a2b8', '#7d5ba6'];
    for (let i = 0; i < 6; i++) {
      const a0 = (i / 6) * Math.PI * 2 + 0.3;
      const a1 = ((i + 1) / 6) * Math.PI * 2 + 0.3;
      const x0 = Math.cos(a0) * 11.5;
      const z0 = 6 + Math.sin(a0) * 11.5;
      const x1 = Math.cos(a1) * 11.5;
      const z1 = 6 + Math.sin(a1) * 11.5;
      const y = w.heightAt(x0, z0) + 3.0;
      const yaw = Math.atan2(x1 - x0, z1 - z0);
      for (let k = 0; k < 10; k++) {
        const t = k / 10;
        const x = x0 + (x1 - x0) * t;
        const z = z0 + (z1 - z0) * t;
        const sag = Math.sin(t * Math.PI) * 0.7;
        const sag2 = Math.sin(((k + 1) / 10) * Math.PI) * 0.7;
        // the rope, one short piece at a time so it droops between the posts
        const mx = x + (x1 - x0) / 20;
        const mz = z + (z1 - z0) / 20;
        b.add(G.box, '#efe6d2', segment(new THREE.Vector3(x, y - sag, z), new THREE.Vector3(mx * 2 - x, y - sag2, mz * 2 - z), 0.035));
        if (!k) continue;
        b.add(G.cone4, flags[(k + i) % flags.length], P.compose(new THREE.Matrix4(), x, y - sag - 0.2, z, Math.PI, yaw + Math.PI / 2, 0, 0.16, 0.36, 0.05));
        if (k % 3 === 0) glow.push(new THREE.Vector3(x, y - sag - 0.3, z));
      }
    }
  }
  siteTip(p) {
    const state = this.status(p.id);
    if (state === 'built') return { title: p.name, desc: `${p.desc.split('.')[0]} — restored!\n✨ ${p.perk}${p.id === 'observatory' ? '\nPress E to see the forecast.' : ''}` };
    if (state === 'building') return { title: `${p.name} (being built)`, desc: 'Fully funded! Bob is building it tonight — come back in the morning.' };
    if (!this.isOpen(p.id)) return { title: `Ruined ${p.name}`, desc: `${p.desc}\n${this.game.state.level < p.level ? `An islander will ask for help with this from level ${p.level}.` : 'Talk to the islanders — someone wants this rebuilt.'}` };
    const left = this.missing(p.id).length;
    return { title: `${p.name} — village project`, desc: `${p.desc}\nStill needs ${left} thing${left === 1 ? '' : 's'}. Press E (or use the Project Board by the Town Hall) to contribute.\n✨ When finished: ${p.perk}` };
  }
  anyOpen() {
    return !!this.game.state && PROJECTS.some((p) => this.isOpen(p.id));
  }
  /** Where the quest arrow should point for a project. */
  targetFor(id) {
    if (!this.world) return null;
    const p = PROJECTS_BY_ID[id];
    if (this.status(id) === 'building') return null;
    return { pos: (p.front || this.boardPos).clone(), label: `${p.name} — press E to contribute` };
  }

  update(dt, glowAmt = 0) {
    if (!this.group) return;
    this.t += dt;
    if (this.sails) this.sails.rotation.z += dt * 0.6;
    const lit = this.isFestival() ? Math.max(glowAmt, 0.55) : glowAmt;
    for (const s of this.glows) s.material.opacity = lit * 0.85;
  }
}
