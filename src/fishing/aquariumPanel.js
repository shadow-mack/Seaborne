import { ISLANDS } from '../world/islands.js';
import { TIERS, tierIndex } from './fish.js';
import { AQUARIUM_FISH, TANKS, tankOf, TICKET_PER_SPECIES } from './aquarium.js';
import { fishSVG, rarityBadge } from '../ui/icons.js';
import { h, btn, empty } from '../ui/widgets.js';

// The aquarium menu: look into each tank and watch your donated fish swim (tap one for
// its details), and the collection list where you donate fish from your bag.
export const AQUARIUM_PANELS = {};

const imgCache = new Map();
function fishImg(f) {
  let src = imgCache.get(f.id);
  if (!src) {
    src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fishSVG(f, 160))}`;
    imgCache.set(f.id, src);
  }
  return src;
}
const where = (f) => (f.where.includes('*') ? 'Anywhere' : f.where.map((w) => ISLANDS[w].name).join(', '));
const when = (f) => [f.time !== 'any' ? (f.time === 'night' ? '🌙 Night' : '☀️ Day') : '', f.weather === 'rain' ? '🌧️ Rain' : '', f.boat ? '🚤 From a boat' : ''].filter(Boolean).join(' · ');

AQUARIUM_PANELS.aquarium = {
  wide: true,
  onOpen(ui) {
    startSwim(ui);
  },
  onClose() {
    cancelAnimationFrame(swim.raf);
    swim.raf = 0;
  },
  render(ui, opts, p) {
    const g = ui.game;
    const aq = g.aquarium;
    const n = aq.count();
    const can = aq.donatable().length;
    return {
      title: 'Palmora Aquarium',
      icon: '🐠',
      headExtra: h('span', { class: 'head-note', text: `${n} / ${AQUARIUM_FISH.length} species` }),
      tabs: [
        { id: 'tanks', label: 'Tanks', icon: '🔎' },
        { id: 'donate', label: 'Donate', icon: '🎁', badge: can || '' },
      ],
      body(tab) {
        if (tab === 'donate') return donateTab(ui);
        p.tank = p.tank || opts.tank || 'lagoon';
        return tankTab(ui, p);
      },
    };
  },
};

function tankTab(ui, p) {
  const g = ui.game;
  const aq = g.aquarium;
  const wrap = h('div', { class: 'aq' });
  const pick = h('div', { class: 'aq-pick', role: 'group', 'aria-label': 'Choose a tank' });
  for (const t of TANKS) {
    const total = AQUARIUM_FISH.filter((f) => tankOf(f) === t).length;
    const have = AQUARIUM_FISH.filter((f) => tankOf(f) === t && aq.has(f.id)).length;
    pick.append(btn(`<span aria-hidden="true">${t.icon}</span> ${t.name} <small>${have}/${total}</small>`, () => { p.tank = t.id; g.audio.sfx('click'); ui.refreshPanel(); }, p.tank === t.id ? 'primary small' : 'small', false, { 'aria-pressed': p.tank === t.id ? 'true' : 'false' }));
  }
  wrap.append(pick);
  const tank = TANKS.find((t) => t.id === p.tank);
  const fish = AQUARIUM_FISH.filter((f) => tankOf(f) === tank && aq.has(f.id));
  const view = h('div', { class: `aq-tank tank-${tank.id}`, style: { '--w1': tank.water[0], '--w2': tank.water[1] }, role: 'img', 'aria-label': `${tank.name}: ${fish.length ? fish.map((f) => f.name).join(', ') : 'empty'}` });
  view.innerHTML = `<div class="aq-rays"></div>${SCENERY[tank.id]}<div class="aq-bubbles">${'<i></i>'.repeat(10)}</div>`;
  fish.forEach((f, i) => {
    const size = 9 + tierIndex(f.tier) * 2.2 + (f.id === 'rainbow_whale' ? 10 : f.id === 'leviathan' ? 8 : 0);
    const el = h('div', {
      class: 'aq-fish',
      tabindex: '0',
      style: { width: `${size}%`, '--glow': tierIndex(f.tier) >= 2 ? TIERS[f.tier].color : 'transparent' },
      'data-tip-title': f.name,
      'data-tip': `${TIERS[f.tier].icon} ${TIERS[f.tier].name} · ${f.desc}\nFound: ${where(f)}${when(f) ? ' · ' + when(f) : ''}\nDonated on day ${aq.s.fish[f.id]}`,
    }, [h('img', { src: fishImg(f), alt: f.name, draggable: 'false' })]);
    // keep every fish fully inside the glass (the art is square, and the tank is 16:9)
    const x = Math.min(8 + ((i * 37) % 76), 100 - size);
    const y = Math.max(3, Math.min(10 + ((i * 53) % 62), 92 - size * 1.78));
    el._swim = { x, y, v: (4 + (i % 4) * 1.6) * (i % 2 ? 1 : -1), ph: i * 1.3, size };
    view.append(el);
  });
  if (!fish.length) view.append(h('div', { class: 'aq-empty', text: aq.count() ? 'No fish in this tank yet.' : 'The tanks are empty — donate your first fish!' }));
  wrap.append(view);
  wrap.append(h('p', { class: 'muted small', text: `${tank.desc} Tap a fish to see what it is.` }));
  const box = aq.s.box || 0;
  wrap.append(h('div', { class: 'row aq-box' }, [
    h('span', { html: `🎟️ Visitors pay <b>${TICKET_PER_SPECIES}</b> coins per species every morning. Ticket box: <b>🪙 ${box}</b>` }),
    btn('Collect', () => { const got = aq.collect(); if (got) g.audio.sfx('coin'); ui.refreshPanel(); }, box ? 'primary' : '', !box),
  ]));
  return wrap;
}

function donateTab(ui) {
  const g = ui.game;
  const aq = g.aquarium;
  const wrap = h('div', { class: 'aq-donate' });
  const n = aq.count();
  wrap.append(h('div', { class: 'dex-progress' }, [
    h('div', { class: 'bar' }, [h('i', { style: { width: `${(n / AQUARIUM_FISH.length) * 100}%` } }), h('span', { text: `${n} / ${AQUARIUM_FISH.length} species on display` })]),
    h('p', { class: 'muted small', text: 'Donate one of each species (junk doesn\'t count). Megan has rewards when the collection grows — check her requests.' }),
  ]));
  const ready = aq.donatable();
  if (ready.length) {
    wrap.append(h('div', { class: 'row' }, [h('b', { text: `You can donate ${ready.length} new species right now!` }), btn('Donate all', () => { for (const f of ready) aq.donate(f.id); ui.refreshPanel(); }, 'primary')]));
  } else wrap.append(empty('No new species in your bag. Catch something the aquarium doesn\'t have yet — and keep it!', '🎣'));
  const grid = h('div', { class: 'dex-grid' });
  for (const t of TANKS) {
    grid.append(h('h3', { class: 'dex-section', text: `${t.icon} ${t.name}` }));
    for (const f of AQUARIUM_FISH.filter((x) => tankOf(x) === t)) {
      const has = aq.has(f.id);
      const bag = g.state.inventory['fish_' + f.id] || 0;
      const seen = !!g.state.fishdex[f.id];
      grid.append(h('div', { class: `dex ${has ? 'found' : ''}`, style: { '--tier': TIERS[f.tier].color }, 'data-tip-title': seen ? f.name : 'Undiscovered fish', 'data-tip': `Where: ${where(f)}${when(f) ? '\nWhen: ' + when(f) : ''}${has ? `\nOn display since day ${aq.s.fish[f.id]}` : ''}` }, [
        h('div', { class: 'dex-img', html: seen ? fishSVG(f, 64) : fishSVG({ ...f, colors: ['#5a5466', '#5a5466', '#4a4458'], stripes: false, stars: false, flames: false }, 64) }),
        h('b', { text: seen ? f.name : '???' }),
        h('div', { html: rarityBadge(f.tier) }),
        has ? h('span', { class: 'tag', text: '✓ On display' }) : bag ? btn(`Donate (${bag} in bag)`, () => { aq.donate(f.id); ui.refreshPanel(); }, 'primary small') : h('div', { class: 'muted small', text: seen ? 'Catch another to donate' : 'Not caught yet' }),
      ]));
    }
  }
  wrap.append(grid);
  return wrap;
}

// tank scenery: sand, rocks, kelp and coral drawn in SVG behind the fish
const kelp = (x, h, c) => `<path d="M${x} 100 C ${x - 3} ${100 - h * 0.3}, ${x + 3} ${100 - h * 0.6}, ${x} ${100 - h}" stroke="${c}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
const SCENERY = {
  lagoon: `<svg class="aq-scene" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 88 Q 20 82 40 88 T 80 86 T 100 88 V100 H0Z" fill="#ecd9a8"/>${kelp(10, 30, '#4f8a4a')}${kelp(14, 22, '#6faa5c')}${kelp(78, 34, '#4f8a4a')}${kelp(84, 24, '#6faa5c')}<ellipse cx="55" cy="90" rx="7" ry="3.5" fill="#9b958c"/><ellipse cx="30" cy="92" rx="3" ry="1.6" fill="#f2a2b8"/></svg>`,
  reef: `<svg class="aq-scene" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 86 Q 25 80 50 86 T 100 84 V100 H0Z" fill="#e6cf98"/><path d="M8 100 L 10 80 L 13 86 L 15 74 L 18 100Z" fill="#e0604c"/><path d="M70 100 Q 72 82 78 78 Q 80 88 86 80 Q 88 92 92 100Z" fill="#f2a2b8"/><circle cx="40" cy="88" r="4" fill="#f7c95c"/><circle cx="46" cy="90" r="3" fill="#9150c9"/>${kelp(28, 26, '#3f8f6a')}${kelp(60, 30, '#4f8a4a')}</svg>`,
  abyss: `<svg class="aq-scene" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 90 Q 30 84 60 90 T 100 88 V100 H0Z" fill="#2a3346"/><path d="M12 100 L 20 70 L 28 100Z" fill="#1d2433"/><path d="M74 100 L 82 76 L 90 100Z" fill="#1d2433"/><circle cx="20" cy="70" r="1.2" fill="#7ff0d0"/><circle cx="82" cy="76" r="1.2" fill="#7ff0d0"/><circle cx="50" cy="94" r="1" fill="#f7c95c"/></svg>`,
};

// fish swim back and forth; the one you're reading about holds still
const swim = { raf: 0, last: 0 };
function startSwim(ui) {
  cancelAnimationFrame(swim.raf);
  swim.last = performance.now();
  const step = (now) => {
    const dt = Math.min(0.05, (now - swim.last) / 1000);
    swim.last = now;
    const reduce = ui.game.settings.reduceMotion;
    const t = now / 1000;
    for (const el of ui.panel?.box.querySelectorAll('.aq-fish') || []) {
      const s = el._swim;
      if (!s) continue;
      if (ui._tipFor !== el && !reduce) {
        s.x += s.v * dt;
        const max = 100 - s.size;
        if (s.x > max) s.v = -Math.abs(s.v);
        if (s.x < 0) s.v = Math.abs(s.v);
      }
      const bob = reduce ? 0 : Math.sin(t * 1.4 + s.ph) * 2.2;
      el.style.left = `${s.x}%`;
      el.style.top = `${s.y + bob}%`;
      // the fish art faces left, so flip it when swimming right
      el.style.transform = `scaleX(${s.v > 0 ? -1 : 1}) rotate(${reduce ? 0 : Math.sin(t * 2 + s.ph) * 4}deg)`;
    }
    swim.raf = ui.panel ? requestAnimationFrame(step) : 0;
  };
  swim.raf = requestAnimationFrame(step);
}
