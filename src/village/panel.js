import { formatNum } from '../shared/utils.js';
import { ITEMS } from '../shared/items.js';
import { QUESTS } from '../story/quests.js';
import { NPCS } from '../people/npcs.js';
import { itemIconHTML } from '../ui/icons.js';
import { h, btn } from '../ui/widgets.js';
import { PROJECTS } from './projects.js';

// Village menus: the Project Board (restoration projects) and the observatory forecast.
export const VILLAGE_PANELS = {};

VILLAGE_PANELS.village = {
  wide: true,
  render(ui, opts) {
    const g = ui.game;
    const s = g.state;
    const v = g.village;
    return {
      title: 'Palmora Project Board',
      icon: '🏗️',
      body() {
        const wrap = h('div', { class: 'village' });
        const built = PROJECTS.filter((p) => v.isBuilt(p.id)).length;
        wrap.append(h('div', { class: 'dex-progress' }, [
          h('div', { class: 'bar' }, [h('i', { style: { width: `${(built / PROJECTS.length) * 100}%` } }), h('span', { text: `${built} / ${PROJECTS.length} buildings restored` })]),
          h('p', { class: 'muted small', text: 'Put coins and goods into a project bit by bit. When it\'s fully funded, Bob builds it overnight — and every finished building helps you out.' }),
        ]));
        const list = [...PROJECTS].sort((a, b) => (a.id === opts.project ? -1 : b.id === opts.project ? 1 : 0));
        for (const p of list) wrap.append(projectCard(ui, p, s, v, p.id === opts.project));
        return wrap;
      },
    };
  },
};

function projectCard(ui, p, s, v, focus) {
  const g = ui.game;
  const state = v.status(p.id);
  const open = v.isOpen(p.id);
  const q = QUESTS[p.quest];
  const card = h('div', { class: `project ${state} ${focus ? 'focus' : ''}` });
  const status = state === 'built' ? '✓ Restored' : state === 'building' ? '🔨 Bob is building it tonight' : open ? 'Needs your help' : s.level < p.level ? `🔒 Level ${p.level}` : `📜 Ask ${NPCS[q.giver].name}`;
  card.append(h('div', { class: 'project-head' }, [
    h('span', { class: 'emoji project-icon', text: p.icon, 'aria-hidden': 'true' }),
    h('div', {}, [h('b', { text: p.name }), h('div', { class: 'muted small', text: p.desc })]),
    h('span', { class: state === 'built' ? 'tag' : 'lock', text: status }),
  ]));
  card.append(h('p', { class: 'perk small', text: `✨ ${state === 'built' ? '' : 'When finished: '}${p.perk}` }));
  if (state !== 'ruin') return card;
  if (!open) {
    card.append(h('p', { class: 'muted small', text: s.level < p.level ? `${NPCS[q.giver].name} will ask for help with this once you reach level ${p.level}.` : `Talk to ${NPCS[q.giver].name} — pick "Request: ${q.title}" to start this project.` }));
    return card;
  }
  const needs = h('div', { class: 'needs' });
  for (const [k, n] of Object.entries(p.needs)) {
    const got = v.given(p.id, k);
    const have = k === 'coins' ? s.coins : s.inventory[k] || 0;
    const done = got >= n;
    const name = k === 'coins' ? 'Coins' : ITEMS[k].name;
    const icon = k === 'coins' ? '<span class="emoji">🪙</span>' : itemIconHTML(k, 30);
    const canGive = !done && have > 0;
    const give = Math.min(n - got, have);
    needs.append(h('div', { class: `need ${done ? 'done' : ''}` }, [
      h('div', { class: 'need-icon', html: icon }),
      h('div', { class: 'need-info' }, [
        h('b', { text: name }),
        h('div', { class: 'bar small' }, [h('i', { style: { width: `${Math.min(1, got / n) * 100}%` } }), h('span', { text: `${formatNum(got)} / ${formatNum(n)}` })]),
        h('div', { class: 'muted small', text: done ? 'Done!' : `You have ${formatNum(have)}` }),
      ]),
      done ? h('span', { class: 'tag', text: '✓' }) : btn(canGive ? `Give ${formatNum(give)}` : 'Give', () => {
        const gave = v.contribute(p.id, k);
        if (gave) g.ui.toast(`🏗️ Gave ${formatNum(gave)} ${k === 'coins' ? 'coins' : ITEMS[k].name} to the ${p.name}`, 'good');
        ui.refreshPanel();
      }, canGive ? 'primary' : '', !canGive, { 'aria-label': `Give ${name} to the ${p.name}` }),
    ]));
  }
  card.append(needs);
  return card;
}

VILLAGE_PANELS.forecast = {
  render(ui) {
    const g = ui.game;
    const s = g.state;
    return {
      title: 'Observatory Forecast',
      icon: '🔭',
      body() {
        const wrap = h('div', { class: 'forecast' });
        wrap.append(h('p', { class: 'muted small', text: 'The old telescope reads the clouds days ahead. Rain brings rare fish — and rain after dark is when the Leviathan surfaces.' }));
        const names = ['Today', 'Tomorrow'];
        for (let i = 0; i < 4; i++) {
          const day = s.time.day + i;
          const f = g.weather.describe(day);
          const fest = g.village.isFestival(day);
          wrap.append(h('div', { class: `fc-day ${f.nightRain ? 'night-rain' : ''}` }, [
            h('span', { class: 'emoji fc-icon', text: f.icon, 'aria-hidden': 'true' }),
            h('div', {}, [h('b', { text: `${names[i] || `In ${i} days`} · Day ${day}${fest ? ' · 🎪 Festival Day' : ''}` }), h('div', { class: 'small', text: `${f.name}. ${f.text}` })]),
          ]));
        }
        g.events.emit('forecast', {});
        return wrap;
      },
    };
  },
};
