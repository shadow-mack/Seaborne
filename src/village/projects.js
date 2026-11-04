// Palmora restoration: community projects on the Project Board beside the Town Hall.
// The Great Storm years ago wrecked half the village. Each project is unlocked by an
// islander's request, filled with coins and goods from your bag, and built by Bob overnight.
// needs: { coins, <item id>: count }. perk: what the finished building does for you.
export const PROJECTS = [
  {
    id: 'fountain', name: 'Village Fountain', icon: '⛲', level: 4, quest: 'v_fountain',
    desc: 'The old fountain where islanders used to meet and chat. The storm left only a cracked basin.',
    needs: { coins: 400, stone: 15, driftwood: 10, shell: 8, starfish: 3 },
    perk: 'Chatting with islanders builds friendship twice as fast.',
  },
  {
    id: 'windmill', name: 'Windmill', icon: '🌾', level: 6, quest: 'v_windmill',
    desc: 'Palmora\'s windmill once ground wheat for the whole island. Now its sails lie in the grass.',
    needs: { coins: 1200, driftwood: 30, stone: 15, wheat: 20 },
    perk: 'Kitchen Basics (flour, sugar, butter, cheese…) make two at a time.',
  },
  {
    id: 'market', name: 'Market Hall', icon: '🏛️', level: 9, quest: 'v_market',
    desc: 'A covered hall where traders from every island once sold their goods.',
    needs: { coins: 3000, driftwood: 40, stone: 25, fruit_salad: 3, fish_taco: 3, berry_jam: 4 },
    perk: 'Every shop pays you 10% more when you sell.',
  },
  {
    id: 'observatory', name: 'Star Observatory', icon: '🔭', level: 11, quest: 'v_observatory',
    desc: 'The old stargazers\' dome on the western hill. Its telescope could read the weather days ahead.',
    needs: { coins: 5000, stone: 40, obsidian: 12, coral_piece: 6, pearl: 2 },
    perk: 'Shows the weather for the next 3 days — perfect for planning rain fishing and Leviathan hunts.',
  },
  {
    id: 'stage', name: 'Festival Stage', icon: '🎪', level: 14, quest: 'v_stage',
    desc: 'A grand stage for Palmora\'s festivals — the last piece of the village\'s comeback.',
    needs: { coins: 9000, driftwood: 60, stone: 40, wool: 10, pizza: 3, cake: 2, seafood_feast: 2 },
    perk: 'Every 7th day is Festival Day: cooked food sells for 50% more and the plaza lights up.',
  },
];
export const PROJECTS_BY_ID = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));

/** Festival Day comes round every 7th day once the stage is built. */
export const FESTIVAL_EVERY = 7;
