// Friendship stories: every islander has three personal requests, offered when they
// reach 3, 6 and 10 hearts (hearts grow by chatting and giving gifts). Each one tells a
// little more of their life on the islands. `hearts` gates the offer; `requires` keeps the order.

const T = (target, text, hint, lines, give) => ({ type: 'talk', target, text, hint, lines, ...(give ? { give } : {}) });
const HINT = {
  mayor: 'Mayor Mike is in the village square, by the Town Hall.',
  finn: 'Old Ross stands by the blue-roofed tackle hut at the dock.',
  marina: 'Megan runs the fish market at the start of the dock.',
  coco: 'Chloe\'s fruit stand has a pink-and-white striped roof in the village square.',
  luna: 'Lily stands outside the pink boutique on the west side of the square.',
  bo: 'Bob\'s workshop has a straw roof, east of the village square.',
  reyes: 'Captain Jack stands at the start of the Palmora dock.',
  pip: 'Tommy plays around the village square during the day.',
  nana: 'Grandma Rose stands outside her kitchen on the east side of the square.',
  moth: 'Madison camps on the west beach of Palmora — only at night (7 PM–7 AM).',
  shelly: 'Sarah runs the reef shop on Coralia Reef.',
  mo: 'Coach LeBron stands at the start of the Coralia pier.',
  kai: 'Kyle hangs out on Coralia\'s beach during the day.',
  ash: 'Hank\'s forge is the dark house in Ember Isle\'s village.',
  sage: 'Grace stands near the hot spring on Ember Isle.',
  patch: 'Pete trades from his camp on Skull Cay.',
};
const talkTo = (id, text, lines, give) => T(id, text, HINT[id], lines, give);
const bring = (item, count, text, hint) => ({ type: 'have', target: item, count, consume: true, text, hint });

export const FRIEND_QUESTS = {
  // ── Mayor Mike ─────────────────────────────────────
  f_mayor1: {
    title: 'Mike the Mighty', giver: 'mayor', hearts: 3,
    desc: 'Captain Jack keeps calling the Mayor "Mike the Mighty". What\'s the story?',
    offer: 'Can I tell you a secret, {name}? I wasn\'t always a mayor. Ask Captain Jack about "Mike the Mighty" — then come back and I\'ll tell you my side.',
    objectives: [
      talkTo('reyes', 'Ask Captain Jack about "Mike the Mighty"', [
        'Mike the Mighty! Ha! He actually told you to ask me?',
        'Thirty years ago Mike was the boldest sailor in the archipelago. He sailed through the Great Storm to carry medicine to Coralia.',
        { you: 'Why did he stop sailing?' },
        'Ask him yourself. But go easy on him — that storm cost him his boat.',
      ]),
      talkTo('mayor', 'Hear the Mayor\'s side of the story', [
        'So Jack told you. Yes... "the Mighty". My little boat, the Sea Lark, broke apart on the reef that night.',
        'Coralia got their medicine, though. I swam the last mile with the crate on my back!',
        { you: 'That\'s amazing, Mike.' },
        'After that I decided Palmora needed someone to look after it on land. So here I am. Thank you for listening, friend.',
      ]),
    ],
    rewards: { coins: 150, xp: 120 },
  },
  f_mayor2: {
    title: 'Founders\' Stew', giver: 'mayor', hearts: 6, requires: 'f_mayor1', minLevel: 6,
    desc: 'Mike wants to honour Palmora\'s founders with their favourite dish.',
    offer: 'Palmora\'s founders were fishers who ate fish stew every night. For Founders\' Day I\'d love a proper bowl. Would you cook one for an old man?',
    objectives: [
      bring('fish_stew', 1, 'Bring Mike a Fish Stew', 'Cook it in your kitchen: Meals → Fish Stew (from level 6). Then talk to Mike → "Hand over".'),
      talkTo('mayor', 'Share the stew with Mike', [
        '*slurp* ...Oh. Oh my. That tastes exactly like my mother\'s.',
        'She used to say a village is just a pot of stew — everyone adds something, and it\'s better together.',
        { you: 'I like that.' },
        'So do I. Here — the founders\' old bench. I\'d like it to be at your home.',
      ]),
    ],
    rewards: { gems: 8, xp: 220, items: { decor_bench: 1 } },
  },
  f_mayor3: {
    title: 'Key to Palmora', giver: 'mayor', hearts: 10, requires: 'f_mayor2', minLevel: 9,
    desc: 'The village council wants to make you an honorary citizen.',
    offer: 'The council has voted, {name}: we\'d like to make you an honorary citizen of Palmora! Tradition says every new citizen brings a Starlight Koi to the ceremony...',
    objectives: [
      bring('fish_starlight_koi', 1, 'Bring a Starlight Koi', 'An epic fish around Palmora at night. Glow Bait helps a lot. Then talk to Mike → "Hand over".'),
      talkTo('mayor', 'Join the citizenship ceremony', [
        '*clears throat* By the power vested in me by... well, me... I name {name} an honorary citizen of Palmora!',
        'You washed up with nothing. Now look at you — this island is better because you\'re on it.',
        { you: 'This place is home now.' },
        'Then take these lanterns, and never let your home go dark. Welcome home, citizen.',
      ]),
    ],
    rewards: { coins: 1500, gems: 25, xp: 400, items: { decor_lantern: 4 } },
  },

  // ── Old Ross ───────────────────────────────────────
  f_finn1: {
    title: 'Ross\'s Lucky Lure', giver: 'finn', hearts: 3,
    desc: 'Ross has lost his lucky lure. He thinks a fish swallowed it.',
    offer: 'Kid, I\'ve lost my lucky lure! Last I saw, a fish ran off with it. Catch me five fish around Palmora — one of \'em must have it.',
    objectives: [
      { type: 'catch', target: 'island:palmora', count: 5, text: 'Catch 5 fish around Palmora', hint: 'Fish anywhere around Palmora — the dock is best.' },
      talkTo('finn', 'Bring Ross the news', [
        'Any luck? No lure? ...Hang on, what\'s this in my vest pocket?',
        '*Ross pulls out a shiny red lure* ...It was in my pocket the whole time.',
        { you: 'Ross!' },
        'Heh. Fifty years of fishing and I still lose my own stuff. Here — shrimp for your trouble.',
      ]),
    ],
    rewards: { xp: 90, items: { bait_shrimp: 10 } },
  },
  f_finn2: {
    title: 'The One That Got Away', giver: 'finn', hearts: 6, requires: 'f_finn1', minLevel: 5,
    desc: 'For twenty years a glowing eel has stolen Ross\'s bait. Time for revenge.',
    offer: 'Every night for twenty years, a Glowfin Eel steals my bait. Twenty years! Catch one for me, will ya? I just want to look it in the eye.',
    objectives: [
      bring('fish_glowfin', 1, 'Bring Ross a Glowfin Eel', 'A rare fish that bites at night anywhere. Glow Bait helps. Then talk to Ross → "Hand over".'),
      talkTo('finn', 'Watch Ross meet his nemesis', [
        'So THIS is the little thief! ...Huh. It\'s kind of beautiful up close, ain\'t it?',
        'You know what? I\'ll let it go. Twenty years of chasing it kept these old bones going.',
        { you: 'That\'s really kind, Ross.' },
        'Don\'t tell anyone. Here — glow bait. You\'ll be the night fisher now.',
      ]),
    ],
    rewards: { gems: 10, xp: 200, items: { bait_glow: 10 } },
  },
  f_finn3: {
    title: 'Passing the Rod', giver: 'finn', hearts: 10, requires: 'f_finn2', minLevel: 10,
    desc: 'Ross wants to see you land a legend before he hangs up his hat.',
    offer: 'I\'m getting old, kid. Before I retire, I want to see one thing: you landing a legendary fish. Then I\'ll know the dock\'s in good hands.',
    objectives: [
      { type: 'catch', target: 'tier:legendary', count: 1, text: 'Catch a Legendary fish', hint: 'Golden Marlin (daytime, anywhere), Storm Serpent (rain), Coral Dragon (Coralia, rain), Phoenix Fin (Ember, night) or Kraken Spawn (Skull Cay, night). Use your best rod and lure.' },
      talkTo('finn', 'Show Ross your legendary catch', [
        'You did it. You really did it! I watched the whole thing from the dock!',
        'When I was your age, my old teacher gave me his shirt the day I landed my first legend. Now it\'s your turn.',
        { you: 'I\'ll wear it proudly.' },
        'And I\'m not retiring. Not while there\'s fishing to watch. Go on — the sea\'s yours.',
      ]),
    ],
    rewards: { gems: 30, xp: 500, cosmetics: ['sailor'], items: { bait_magic: 5 } },
  },

  // ── Megan ──────────────────────────────────────────
  f_marina1: {
    title: 'Market Mix-Up', giver: 'marina', hearts: 3,
    desc: 'Megan promised a restaurant on Coralia some fish — and ran out.',
    offer: 'Oh no, oh no! I promised Snapper and Mackerel to a restaurant on Coralia and sold them all by accident! Could you catch me some?',
    objectives: [
      bring('fish_snapper', 1, 'Bring Megan a Red Snapper', 'Red Snapper bites in the daytime around Palmora and Coralia. Then talk to Megan → "Hand over".'),
      bring('fish_mackerel', 2, 'Bring Megan 2 Tiger Mackerel', 'Tiger Mackerel bite around Palmora, Coralia and Skull Cay. Then talk to Megan → "Hand over".'),
      talkTo('marina', 'Tell Megan the order is saved', [
        'You saved my reputation! The chef on Coralia is SO picky.',
        'My dad always said: a fish seller is only as good as her friends. Guess I\'ve got a good one.',
      ]),
    ],
    rewards: { coins: 160, xp: 100 },
  },
  f_marina2: {
    title: 'Sushi Bar Dream', giver: 'marina', hearts: 6, requires: 'f_marina1', minLevel: 8,
    desc: 'Megan dreams of a little sushi bar on the dock.',
    offer: 'Can I tell you my dream? A sushi bar right here on the dock. But I\'ve never tasted a really good Sushi Platter. Could you make one?',
    objectives: [
      bring('sushi_platter', 1, 'Bring Megan a Sushi Platter', 'Cook it in your kitchen (Meals → Sushi Platter, from level 8). Then talk to Megan → "Hand over".'),
      talkTo('marina', 'Watch Megan taste it', [
        '*Megan takes one careful bite and closes her eyes for a long time*',
        'That\'s it. That\'s what I want to make. I\'m going to start saving tonight!',
        { you: 'You\'ll do it, Megan.' },
        'Take this umbrella — the first piece of furniture for my future sushi bar. Keep it warm for me.',
      ]),
    ],
    rewards: { gems: 10, xp: 250, items: { decor_umbrella: 1 } },
  },
  f_marina3: {
    title: 'Dad\'s Journal', giver: 'marina', hearts: 10, requires: 'f_marina2', minLevel: 10,
    desc: 'Megan\'s father studied manta rays. She found his old journal.',
    offer: 'I found my dad\'s old journal. He spent years trying to catch a Manta Ray, just to see one up close before letting it go. He never managed. Would you try — for him?',
    objectives: [
      { type: 'catch', target: 'manta', count: 1, text: 'Catch a Manta Ray', hint: 'An epic fish on Coralia Reef during the day. Use a strong rod.' },
      talkTo('marina', 'Tell Megan about the manta', [
        'You caught one? Tell me everything. How big? What colour were its wings?',
        '*she writes it all down in the journal, under her dad\'s handwriting*',
        { you: 'He\'d be proud of you, Megan.' },
        'Thank you. Really. Here — Dad\'s lucky scarf. It belongs with someone who loves the sea.',
      ]),
    ],
    rewards: { gems: 30, xp: 450, cosmetics: ['scarf'], items: { pearl: 1 } },
  },

  // ── Chloe ──────────────────────────────────────────
  f_coco1: {
    title: 'Seeds of Friendship', giver: 'coco', hearts: 3,
    desc: 'Chloe is planting a school garden with Tommy and the island kids.',
    offer: 'I\'m starting a garden for the island kids! Tommy wants strawberries — lots of them. Could you grow some for the first lesson?',
    objectives: [
      { type: 'harvest', target: '*', count: 4, text: 'Harvest 4 crops', hint: 'Plant, water and harvest anything at your farm.' },
      bring('strawberry', 5, 'Bring Chloe 5 Strawberries', 'Grow strawberries at your farm (seeds from Chloe). Then talk to her → "Hand over".'),
      talkTo('coco', 'Hear how the lesson went', [
        'The kids LOVED them! Tommy ate four before we planted a single seed.',
        'Gardens are like friendships, you know — a little water every day. Here, a banana sapling for your farm!',
      ]),
    ],
    rewards: { xp: 100, items: { sapling_banana: 1 } },
  },
  f_coco2: {
    title: 'Smoothie Stand', giver: 'coco', hearts: 6, requires: 'f_coco1', minLevel: 5,
    desc: 'Chloe wants to sell smoothies on hot afternoons.',
    offer: 'Idea! A smoothie stand! But my blender skills are... explosive. Could you make two Mango Smoothies so I can see how it\'s done?',
    objectives: [
      bring('mango_smoothie', 2, 'Bring Chloe 2 Mango Smoothies', 'Kitchen → Drinks → Mango Smoothie. Mangoes grow on wild trees and saplings. Then talk to Chloe → "Hand over".'),
      talkTo('coco', 'Help Chloe open her smoothie stand', [
        'Mmm! Sold out in ten minutes — and the Mayor bought three!',
        'Half the profits are yours, partner. And plant this mango sapling so we never run out!',
      ]),
    ],
    rewards: { coins: 200, gems: 8, xp: 200, items: { sapling_mango: 1 } },
  },
  f_coco3: {
    title: 'Grandma\'s Orchard', giver: 'coco', hearts: 10, requires: 'f_coco2', minLevel: 12,
    desc: 'Chloe\'s grandmother grew the island\'s only dragon fruit, long ago.',
    offer: 'My grandma grew the only dragon fruit on Palmora. When I was little, she promised me a whole basket one day... she never got the chance. Would you grow me some?',
    objectives: [
      bring('dragonfruit', 4, 'Bring Chloe 4 Dragon Fruit', 'Grow dragon fruit at your farm (seeds from Chloe, from level 12). Then talk to her → "Hand over".'),
      talkTo('coco', 'Share the basket with Chloe', [
        '*Chloe holds the basket for a long time without saying anything*',
        'They taste just like I remember. Thank you, {name}. Really.',
        { you: 'Your grandma would be glad.' },
        'Grandma\'s flower crown is yours now. She\'d want it worn by someone who makes things grow.',
      ]),
    ],
    rewards: { gems: 30, xp: 450, cosmetics: ['flower_crown'], items: { super_fertilizer: 5 } },
  },

  // ── Lily ───────────────────────────────────────────
  f_luna1: {
    title: 'Beach Couture', giver: 'luna', hearts: 3,
    desc: 'Lily is designing a beach-themed collection.',
    offer: 'Darling, inspiration has struck: a beach collection! Starfish buttons, shell beads... Bring me three starfish, would you?',
    objectives: [
      bring('starfish', 3, 'Bring Lily 3 Starfish', 'Starfish wash up on sandy beaches. Then talk to Lily → "Hand over".'),
      talkTo('luna', 'See Lily\'s new design', [
        '*Lily holds up a sketch covered in starfish* Fabulous. Simply fabulous.',
        'You have an eye for this, darling. Here — commission for my muse.',
      ]),
    ],
    rewards: { coins: 180, xp: 90 },
  },
  f_luna2: {
    title: 'Fabric of the Sea', giver: 'luna', hearts: 6, requires: 'f_luna1', minLevel: 6,
    desc: 'Lily wants coral and a pearl for a gown.',
    offer: 'I\'m making a gown the colour of the sea. It needs coral beads and one perfect pearl. Could you find them for me?',
    objectives: [
      bring('coral_piece', 5, 'Bring Lily 5 Coral Pieces', 'Coral pieces wash up on Coralia Reef\'s beaches. Then talk to Lily → "Hand over".'),
      bring('pearl', 1, 'Bring Lily a Pearl', 'Pearl Oysters sometimes hold pearls, and treasure chests can too. Then talk to Lily → "Hand over".'),
      talkTo('luna', 'Watch Lily finish the gown', [
        'The pearl goes... right... here. *steps back* Oh, I could cry.',
        'Everyone thinks fashion is silly. But making someone feel beautiful? That\'s magic.',
        'This sarong is from the same fabric. Wear it to the beach for me.',
      ]),
    ],
    rewards: { gems: 12, xp: 220, cosmetics: ['sarong_blue'] },
  },
  f_luna3: {
    title: 'Lily\'s Grand Collection', giver: 'luna', hearts: 10, requires: 'f_luna2', minLevel: 10,
    desc: 'Lily is ready for her big show — and needs the finest materials.',
    offer: 'Darling, it\'s time. My Grand Collection! Soft island wool and a ruby for the finale piece. Then you\'ll walk in my show. No arguments!',
    objectives: [
      bring('wool', 6, 'Bring Lily 6 Wool', 'Raise sheep at your farm (Bob builds a sheep fold, Chloe sells sheep from level 10). Then talk to Lily → "Hand over".'),
      bring('ruby', 1, 'Bring Lily a Ruby', 'Rubies turn up in buried treasure. Dig up X marks! Then talk to Lily → "Hand over".'),
      talkTo('luna', 'Walk in Lily\'s fashion show', [
        '*music plays, the whole village watches as you walk down the plaza*',
        'They LOVED it! You\'re a natural, darling. A star!',
        { you: 'I was so nervous!' },
        'Nobody could tell. Here — the Fairy Wings from the finale. They were always meant for you.',
      ]),
    ],
    rewards: { gems: 20, xp: 450, cosmetics: ['wings'] },
  },

  // ── Bob ────────────────────────────────────────────
  f_bo1: {
    title: 'A Bench for Rose', giver: 'bo', hearts: 3,
    desc: 'Bob wants to build Grandma Rose a bench — secretly.',
    offer: 'Psst. Grandma Rose stands all day at her kitchen. I want to build her a bench, as a surprise. I\'m short on wood and stone though...',
    objectives: [
      bring('driftwood', 8, 'Bring Bob 8 Driftwood', 'Walk over driftwood on the beaches. Then talk to Bob → "Hand over".'),
      bring('stone', 5, 'Bring Bob 5 Stone', 'Pick up stones near big grey rocks. Then talk to Bob → "Hand over".'),
      talkTo('nana', 'Tell Grandma Rose about her surprise', [
        'A bench? For me? Did Bob make this? That big softie!',
        'Tell him he\'s getting pie. A whole one. Don\'t you dare tell him it was my idea to make it a big one.',
      ]),
    ],
    rewards: { coins: 120, xp: 100, items: { decor_flowerpot: 2 } },
  },
  f_bo2: {
    title: 'Builder\'s Lunch', giver: 'bo', hearts: 6, requires: 'f_bo1', minLevel: 6,
    desc: 'Bob works through lunch every day. Time for a proper meal.',
    offer: 'I\'ve been eating sawdust sandwiches for a week. ...Not real sawdust. Mostly. Could you cook me a real lunch?',
    objectives: [
      bring('grilled_fish', 3, 'Bring Bob 3 Grilled Fish', 'Kitchen → Meals → Grilled Fish. Then talk to Bob → "Hand over".'),
      bring('coconut_juice', 2, 'Bring Bob 2 Coconut Juice', 'Kitchen → Drinks → Coconut Juice. Then talk to Bob → "Hand over".'),
      talkTo('bo', 'Have lunch with Bob', [
        '*munch* You know what I want to build one day? A bridge. All the way to Coralia.',
        'Everyone laughs. Too far, they say. But my dad built the lighthouse when they said that too.',
        { you: 'I\'d walk across it.' },
        'Ha! First customer. Take this hammock — a builder knows the value of a good nap.',
      ]),
    ],
    rewards: { gems: 8, xp: 200, items: { decor_hammock: 1 } },
  },
  f_bo3: {
    title: 'Master Builder', giver: 'bo', hearts: 10, requires: 'f_bo2', minLevel: 10,
    desc: 'Bob wants to celebrate his father\'s lighthouse with a feast.',
    offer: 'The lighthouse turns fifty this year. Dad built it with his own hands. I want to have a feast up there, like he did. Could you cook the Seafood Feast?',
    objectives: [
      bring('seafood_feast', 1, 'Bring Bob a Seafood Feast', 'Kitchen → Feasts → Seafood Feast (from level 10). Then talk to Bob → "Hand over".'),
      talkTo('bo', 'Feast at the lighthouse with Bob', [
        '*you sit with Bob at the top of the lighthouse, watching the sunset*',
        'Dad always said a builder\'s real work is the people who use what you make. I get it now.',
        { you: 'You\'ve built so much for this island.' },
        'And you\'ve helped. Here — my spare flannel. Makes you an honorary builder. Don\'t get sawdust on it. ...Actually, do.',
      ]),
    ],
    rewards: { gems: 30, xp: 450, cosmetics: ['plaid_flannel'], items: { decor_tiki: 2 } },
  },

  // ── Captain Jack ───────────────────────────────────
  f_reyes1: {
    title: 'Message in a Bottle', giver: 'reyes', hearts: 3, minLevel: 3,
    desc: 'Captain Jack is waiting for a letter that comes by bottle.',
    offer: 'Every year my sister on Coralia sends me a message in a bottle. It\'s late this year. If you find one washed up, bring it to me unopened?',
    objectives: [
      bring('bottle', 1, 'Bring Captain Jack a Message in a Bottle', 'Bottles wash up on beaches now and then — walk over one. Then talk to Jack → "Hand over".'),
      talkTo('reyes', 'Read the letter with Jack', [
        '*Jack carefully unrolls the note* ...Ha! She\'s getting married! To a SURFER!',
        'Probably that Kyle fellow\'s uncle. Well, well. I\'ll need a fancier hat for the wedding.',
        'Thanks, {name}. Here — some squid for your hook. Deep-sea fish love it.',
      ]),
    ],
    rewards: { coins: 150, xp: 110, items: { bait_squid: 4 } },
  },
  f_reyes2: {
    title: 'The Sea Lark', giver: 'reyes', hearts: 6, requires: 'f_reyes1', minLevel: 6,
    desc: 'Jack wants to find the wreck of Mayor Mike\'s old boat.',
    offer: 'Mike\'s old boat, the Sea Lark, sank off Coralia\'s reef. I want to find her bell and give it back to him. Fish the waters there with me — maybe your line will snag it.',
    objectives: [
      { type: 'visit', target: 'coralia', count: 1, text: 'Sail to Coralia Reef', hint: 'Use your boat at the dock and pick Coralia Reef.' },
      { type: 'catch', target: 'island:coralia', count: 5, text: 'Fish 5 times off Coralia', hint: 'Catch any 5 fish around Coralia Reef.' },
      talkTo('reyes', 'Bring Jack the old bell', [
        '*you hand Jack a barnacle-covered brass bell that came up with your last catch*',
        'The Sea Lark\'s bell. After thirty years. Mike\'s going to cry like a baby. ...So am I, probably.',
        'Here — lanterns from my old ship. Hang them where you can see them from the sea.',
      ]),
    ],
    rewards: { gems: 10, xp: 250, items: { decor_lantern: 2 } },
  },
  f_reyes3: {
    title: 'Captain\'s Honour', giver: 'reyes', hearts: 10, requires: 'f_reyes2', minLevel: 11,
    desc: 'Jack wants to test you the old sailors\' way.',
    offer: 'Where I\'m from, a sailor becomes a captain by landing a Swordfish. You\'ve got the boat and the nerve. Bring me one, and I\'ll make it official.',
    objectives: [
      bring('fish_swordfish', 1, 'Bring Jack a Swordfish', 'An epic fish around Ember Isle and Skull Cay — best from a boat. Then talk to Jack → "Hand over".'),
      talkTo('reyes', 'Become a captain', [
        '*Jack stands up straight and salutes* By the old law of the sea, I name you Captain {name}!',
        'Every captain needs a coat. This was mine when I first got my stripes.',
        { you: 'Aye aye, Captain Jack!' },
        'Ha! It\'s just "Jack" between captains.',
      ]),
    ],
    rewards: { gems: 25, xp: 450, cosmetics: ['captain_coat'] },
  },

  // ── Tommy ──────────────────────────────────────────
  f_pip1: {
    title: 'Beach Patrol', giver: 'pip', hearts: 3,
    desc: 'Tommy wants to be the island\'s best beachcomber.',
    offer: 'Let\'s have a beach race! Whoever picks up the most stuff wins! You go first — pick up 8 things!',
    objectives: [
      { type: 'collect', target: 'beach', count: 8, text: 'Pick up 8 beach items', hint: 'Shells, starfish, driftwood and more on any sandy beach.' },
      talkTo('pip', 'Tell Tommy your score', [
        'EIGHT?! No fair, your legs are longer!',
        'Okay okay, you win. Here — my best candy. I was saving it but you earned it.',
      ]),
    ],
    rewards: { xp: 80, items: { sugar_candy: 2 } },
  },
  f_pip2: {
    title: 'Tommy\'s Treasure Map', giver: 'pip', hearts: 6, requires: 'f_pip1', minLevel: 4,
    desc: 'Tommy drew a treasure map. He needs a real treasure hunter.',
    offer: 'I drew a treasure map! It\'s maybe real. Can you dig up a REAL treasure so I know they exist? Please please please?',
    objectives: [
      { type: 'collect', target: 'treasure', count: 1, text: 'Dig up a treasure', hint: 'Buy a shovel from Chloe, then dig at a red X mark on a beach (messages in bottles show where).' },
      talkTo('pip', 'Show Tommy the treasure', [
        'WHOA. It\'s REAL! Treasure is REAL!',
        'I\'m gonna be a treasure hunter. And a fisher. And a pirate hunter. All at once!',
        'Here, take these bottles I found. You\'re better at finding X marks than me.',
      ]),
    ],
    rewards: { gems: 8, xp: 180, items: { bottle: 2 } },
  },
  f_pip3: {
    title: 'Pirate Hunter Jr.', giver: 'pip', hearts: 10, requires: 'f_pip2', minLevel: 9,
    desc: 'Tommy wants to learn how to be brave.',
    offer: 'Pirates scare me at night. But you\'re not scared. Can you beat some pirates and tell me how you do it? Then maybe I won\'t be scared either.',
    objectives: [
      { type: 'defeat', target: 'pirate', count: 4, text: 'Defeat 4 pirates', hint: 'Pirates raid Palmora\'s east beach after 7 PM. Press F to attack, Space to dodge.' },
      talkTo('pip', 'Teach Tommy about being brave', [
        'Did you do it? Were you scared?',
        { you: 'A little. Being brave means doing it anyway.' },
        '...Doing it anyway. Okay. OKAY. I can do that!',
        'You\'re my hero. Take my adventure pack — heroes need one.',
      ]),
    ],
    rewards: { gems: 25, xp: 400, cosmetics: ['backpack'], items: { sugar_candy: 3 } },
  },

  // ── Grandma Rose ───────────────────────────────────
  f_nana1: {
    title: 'Grandma\'s Garden', giver: 'nana', hearts: 3, minLevel: 5,
    desc: 'Rose\'s secret sauce needs fresh tomatoes and garlic.',
    offer: 'Sweetie, my secret tomato sauce needs the freshest tomatoes and garlic. My knees don\'t like gardening any more. Would you grow some for me?',
    objectives: [
      bring('tomato', 3, 'Bring Rose 3 Tomatoes', 'Grow tomatoes at your farm (seeds from Chloe). Then talk to Rose → "Hand over".'),
      bring('garlic', 2, 'Bring Rose 2 Garlic', 'Grow garlic at your farm (seeds from Chloe). Then talk to Rose → "Hand over".'),
      talkTo('nana', 'Learn Rose\'s secret', [
        'Perfect, sweetie. Now, the secret... *whispers* ...a pinch of sugar and a whole lot of patience.',
        'Don\'t tell Bob. He thinks it\'s a magic spell. Here — basil seeds, for your own sauce.',
      ]),
    ],
    rewards: { coins: 80, xp: 100, items: { seed_basil: 5 } },
  },
  f_nana2: {
    title: 'Sunday Pancakes', giver: 'nana', hearts: 6, requires: 'f_nana1', minLevel: 7,
    desc: 'Rose\'s late husband made pancakes every Sunday.',
    offer: 'My Harold made pancakes every Sunday for forty years. I haven\'t had them since he passed. Would you make some for an old woman?',
    objectives: [
      bring('pancakes', 2, 'Bring Rose 2 Pancakes', 'Kitchen → Meals → Pancakes (from level 7): flour, egg and milk. Then talk to Rose → "Hand over".'),
      talkTo('nana', 'Eat pancakes with Rose', [
        '*Rose eats slowly, smiling* Too much butter. Just like Harold\'s.',
        'He used to say breakfast with someone you love is the best meal of the week.',
        { you: 'I\'ll make them again sometime.' },
        'You\'d better. Here — my good butter. You\'ll need it.',
      ]),
    ],
    rewards: { gems: 10, xp: 220, items: { butter: 3 } },
  },
  f_nana3: {
    title: 'The Recipe Book', giver: 'nana', hearts: 10, requires: 'f_nana2', minLevel: 10,
    desc: 'Rose wants to pass on her life\'s work.',
    offer: 'Sweetie, I\'m not getting younger. I want to give my recipe book to someone who\'ll keep cooking. Show me you\'re ready: a Pumpkin Pie and two Fish Tacos.',
    objectives: [
      bring('pumpkin_pie', 1, 'Bring Rose a Pumpkin Pie', 'Kitchen → Desserts → Pumpkin Pie (from level 10). Then talk to Rose → "Hand over".'),
      bring('fish_taco', 2, 'Bring Rose 2 Fish Tacos', 'Kitchen → Meals → Fish Taco. Then talk to Rose → "Hand over".'),
      talkTo('nana', 'Receive Grandma Rose\'s recipe book', [
        '*Rose takes a bite of pie and nods slowly* Yes. You\'re ready.',
        'This book has sixty years of recipes, notes and gravy stains. Keep it in your kitchen. Use it.',
        { you: 'I\'ll treasure it, Grandma.' },
        'Grandma? ...Oh, sweetie. Come here. *hug* And take my aloha shirt — the cook\'s uniform of Palmora.',
      ]),
    ],
    rewards: { gems: 30, xp: 450, cosmetics: ['hawaiian_red'], items: { decor_campfire: 1 } },
  },

  // ── Madison ───────────────────────────────────────
  f_moth1: {
    title: 'Moonlit Errand', giver: 'moth', hearts: 3,
    desc: 'Madison needs fish caught under the moon.',
    offer: 'Fish caught by moonlight hold a little of its glow. Bring me news of five night catches, traveller, and I\'ll share a secret.',
    objectives: [
      { type: 'catch', target: 'night', count: 5, text: 'Catch 5 fish at night', hint: 'Fish between 7 PM and 7 AM.' },
      talkTo('moth', 'Hear Madison\'s secret', [
        'Five, under the moon. Good.',
        'The secret? I\'m not a witch. I just really don\'t like sunburns. *she almost smiles*',
        'Take this glow bait. The night is kinder to those who light it.',
      ]),
    ],
    rewards: { xp: 100, items: { bait_glow: 10 } },
  },
  f_moth2: {
    title: 'Star Ink', giver: 'moth', hearts: 6, requires: 'f_moth1', minLevel: 7,
    desc: 'Madison draws star charts with squid ink.',
    offer: 'I map the stars with ink. Not any ink — ink from Moonlit Squid. Three of them, if you would.',
    objectives: [
      bring('fish_squid', 3, 'Bring Madison 3 Moonlit Squid', 'Moonlit Squid bite at night anywhere. Then talk to Madison → "Hand over" (at night).'),
      talkTo('moth', 'See Madison\'s star chart', [
        '*Madison unrolls a huge map of glittering constellations*',
        'Every night for ten years, I\'ve drawn the sky from this beach. This one is the Leviathan — see its tail?',
        { you: 'It\'s beautiful.' },
        'Few people ask to see it. Thank you for asking.',
      ]),
    ],
    rewards: { gems: 12, xp: 220 },
  },
  f_moth3: {
    title: 'Where Madison Goes', giver: 'moth', hearts: 10, requires: 'f_moth2', minLevel: 12,
    desc: 'Where does Madison go when the sun rises?',
    offer: 'You\'ve always wondered where I go at dawn. I\'ll tell you — if you bring me proof that you can see in the dark: an Abyssal Angler.',
    objectives: [
      { type: 'catch', target: 'anglerfish', count: 1, text: 'Catch an Abyssal Angler', hint: 'An epic fish that bites at night anywhere. Glow Bait helps.' },
      talkTo('moth', 'Learn Madison\'s secret', [
        'The angler carries its own light into the dark. So do I.',
        'At dawn I sail to a tiny island past the horizon. My family kept its lighthouse for a hundred years. I\'m the last keeper.',
        { you: 'You\'re not alone, Madison.' },
        '...No. Not any more. Take my hat, friend. Now the night knows your face too.',
      ]),
    ],
    rewards: { gems: 25, xp: 500, cosmetics: ['witch_hat'] },
  },

  // ── Sarah (Coralia) ───────────────────────────────
  f_shelly1: {
    title: 'Coral Nursery', giver: 'shelly', hearts: 3, minLevel: 3,
    desc: 'Sarah is replanting broken coral on the reef.',
    offer: 'Storms break the coral, and I replant the pieces in my nursery. Want to help? Bring me four coral pieces from the beach!',
    objectives: [
      bring('coral_piece', 4, 'Bring Sarah 4 Coral Pieces', 'Coral pieces wash up on Coralia Reef\'s beaches. Then talk to Sarah → "Hand over".'),
      talkTo('shelly', 'Plant coral with Sarah', [
        '*you help Sarah tie the coral onto little frames under the water*',
        'In a few years these will be home to hundreds of fish. You just built a city!',
      ]),
    ],
    rewards: { coins: 160, xp: 100 },
  },
  f_shelly2: {
    title: 'Night Dive', giver: 'shelly', hearts: 6, requires: 'f_shelly1', minLevel: 6,
    desc: 'Sarah wants to show you the reef at night.',
    offer: 'The reef glows at night and the octopuses come out to play. Catch one with me tonight — we\'ll let it go after!',
    objectives: [
      { type: 'catch', target: 'octopus', count: 1, text: 'Catch an Ink Octopus', hint: 'A rare fish around Coralia and Ember at night.' },
      talkTo('shelly', 'Watch the glowing reef with Sarah', [
        'See how the coral glows? That\'s the plankton. It\'s like the sea is full of stars.',
        'I came to Coralia for one summer, twelve years ago. Never left. Nights like this are why.',
      ]),
    ],
    rewards: { gems: 10, xp: 220, items: { bait_glow: 5 } },
  },
  f_shelly3: {
    title: 'Dragon of the Reef', giver: 'shelly', hearts: 10, requires: 'f_shelly2', minLevel: 10,
    desc: 'The Coral Dragon is real — Sarah has seen it once.',
    offer: 'Twelve years ago I saw the Coral Dragon in a rainstorm. Nobody believed me. Help me prove it\'s real?',
    objectives: [
      { type: 'catch', target: 'coral_dragon', count: 1, text: 'Catch the Coral Dragon', hint: 'A legendary fish on Coralia Reef — only in the rain. Use Rain Jigs.' },
      talkTo('shelly', 'Prove the dragon is real', [
        'YOU CAUGHT IT! I KNEW IT! Twelve years! KYLE! COME HERE! I TOLD YOU!',
        '*Kyle, from far away* "Dude, I always believed you!"',
        { you: 'It was beautiful.' },
        'This gown was for the day someone believed me. It\'s yours, reef guardian.',
      ]),
    ],
    rewards: { gems: 30, xp: 500, cosmetics: ['dress_mermaid'] },
  },

  // ── Coach LeBron (Coralia) ─────────────────────────
  f_mo1: {
    title: 'Training Day', giver: 'mo', hearts: 3, minLevel: 3,
    desc: 'Coach LeBron wants to see your training routine.',
    offer: 'CHAMPS TRAIN EVERY DAY! Show me ten fish — any kind — and I\'ll show you a winner\'s secret!',
    objectives: [
      { type: 'catch', target: '*', count: 10, text: 'Catch 10 fish', hint: 'Fish anywhere.' },
      talkTo('mo', 'Learn the winner\'s secret', [
        'TEN! Now here\'s the secret: have FUN. The day it stops being fun, you start losing.',
        'Also stretch. Your casting arm will thank me.',
      ]),
    ],
    rewards: { coins: 160, xp: 100 },
  },
  f_mo2: {
    title: 'Silver Spirit', giver: 'mo', hearts: 6, requires: 'f_mo1', minLevel: 7,
    desc: 'LeBron believes you can take silver.',
    offer: 'I\'ve watched you fish. You\'ve got SILVER in you! Finish second or better in a tournament!',
    objectives: [
      { type: 'compete', target: 2, count: 1, text: 'Finish 1st or 2nd in a tournament', hint: 'Talk to Coach LeBron → Tournament (7 AM–7 PM).' },
      talkTo('mo', 'Celebrate with the Coach', [
        'THAT\'S WHAT I\'M TALKING ABOUT!',
        'You know, I never won a tournament myself. Not once. So I made one where I could cheer for everyone else.',
      ]),
    ],
    rewards: { gems: 10, xp: 250 },
  },
  f_mo3: {
    title: 'Hall of Fame', giver: 'mo', hearts: 10, requires: 'f_mo2', minLevel: 10,
    desc: 'Two more wins and you join the Coralia Hall of Fame.',
    offer: 'Two tournament WINS and your name goes on the Hall of Fame! I\'ve already ordered the paint!',
    objectives: [
      { type: 'compete', target: 1, count: 2, text: 'Win 2 tournaments', hint: 'Score the most points: rare, heavy fish count most.' },
      talkTo('mo', 'Join the Hall of Fame', [
        '*the Coach paints your name on the pier in big gold letters*',
        'In ten years, kids will read this and say "who\'s THAT?" And I\'ll tell them!',
        'Here — my lucky cap and a trophy for your house. CHAMPION!',
      ]),
    ],
    rewards: { gems: 30, xp: 500, cosmetics: ['cap_red'], items: { decor_fish_trophy: 1 } },
  },

  // ── Kyle (Coralia) ────────────────────────────────
  f_kai1: {
    title: 'Surf Snacks', giver: 'kai', hearts: 3,
    desc: 'Kyle gets hungry after surfing.',
    offer: 'Duuude, surfing makes me SO hungry. Bananas and coconut juice — that\'s the surfer diet. Hook me up?',
    objectives: [
      bring('banana', 3, 'Bring Kyle 3 Bananas', 'Shake banana trees on Coralia or grow them at your farm. Then talk to Kyle → "Hand over".'),
      bring('coconut_juice', 1, 'Bring Kyle a Coconut Juice', 'Kitchen → Drinks → Coconut Juice. Then talk to Kyle → "Hand over".'),
      talkTo('kai', 'Hang out with Kyle', [
        'Radical. Totally radical. *munch*',
        'You\'re a good friend, bro. Here — spare board shorts. Every islander needs some.',
      ]),
    ],
    rewards: { xp: 90, cosmetics: ['board_shorts'] },
  },
  f_kai2: {
    title: 'The Shiny Thing', giver: 'kai', hearts: 6, requires: 'f_kai1', minLevel: 6,
    desc: 'Kyle saw something shiny and fast in the waves.',
    offer: 'Bro, something gold and green zoomed past my board. Like, SUPER fast. Catch it so I know I\'m not imagining things?',
    objectives: [
      { type: 'catch', target: 'mahi', count: 1, text: 'Catch a Mahi-Mahi', hint: 'A rare fish around Palmora and Coralia in the daytime.' },
      talkTo('kai', 'Show Kyle the shiny thing', [
        'THAT\'S IT! A Mahi-Mahi! I KNEW it was real!',
        'Everyone thinks I just make stuff up. But I see stuff, man. The ocean\'s full of wonders.',
      ]),
    ],
    rewards: { gems: 10, xp: 200, items: { melon_slush: 2 } },
  },
  f_kai3: {
    title: 'Believe It, Bro', giver: 'kai', hearts: 10, requires: 'f_kai2', minLevel: 11,
    desc: 'Kyle surfed next to a giant once. He wants you to see one.',
    offer: 'Okay, real talk. Once a fish as big as a car swam under my board. A Giant Sunfish. Catch one and nobody can ever call me a liar again.',
    objectives: [
      { type: 'catch', target: 'sunfish', count: 1, text: 'Catch a Giant Sunfish', hint: 'An epic fish around Coralia and Palmora in the daytime.' },
      talkTo('kai', 'Make Kyle a legend', [
        'IT\'S AS BIG AS A CAR! I TOLD EVERYONE!',
        'You believed me before you even saw it, bro. That means a lot.',
        { you: 'What about the rainbow whale?' },
        '...That one\'s real too. One day. Here — my lei. Surfer\'s honour.',
      ]),
    ],
    rewards: { gems: 25, xp: 450, cosmetics: ['lei'], items: { melon_slush: 2 } },
  },

  // ── Hank (Ember) ──────────────────────────────────
  f_ash1: {
    title: 'Fuel for the Forge', giver: 'ash', hearts: 3, minLevel: 8,
    desc: 'Hank\'s forge is running low on fuel and stone.',
    offer: 'The forge eats wood like I eat breakfast. Bring me driftwood and stone, and I\'ll show you how a real blade is made.',
    objectives: [
      bring('driftwood', 12, 'Bring Hank 12 Driftwood', 'Walk over driftwood on any beach. Then talk to Hank → "Hand over".'),
      bring('stone', 8, 'Bring Hank 8 Stone', 'Pick up stones near big rocks. Then talk to Hank → "Hand over".'),
      talkTo('ash', 'Watch Hank forge', [
        '*CLANG* *CLANG* *hiss* ...See that colour? That\'s when the steel\'s ready.',
        'My grandfather taught me that on this very anvil. Fire, patience, and a strong arm.',
      ]),
    ],
    rewards: { coins: 300, xp: 160 },
  },
  f_ash2: {
    title: 'Tempered in the Deep', giver: 'ash', hearts: 6, requires: 'f_ash1', minLevel: 10,
    desc: 'Hank wants to temper a blade the old way.',
    offer: 'Old blacksmiths tempered blades with hammerhead oil. Bring me news of a Hammerhead catch and I\'ll try the old way.',
    objectives: [
      { type: 'catch', target: 'hammerhead', count: 1, text: 'Catch a Hammerhead', hint: 'An epic shark around Skull Cay and Ember Isle.' },
      talkTo('ash', 'See the tempered blade', [
        '*Hank holds up a blade with a beautiful wavy pattern*',
        'Grandfather\'s method works! I always thought it was just a story.',
        'Some old stories are true. Remember that.',
      ]),
    ],
    rewards: { gems: 12, xp: 280 },
  },
  f_ash3: {
    title: 'Hank\'s Masterwork', giver: 'ash', hearts: 10, requires: 'f_ash2', minLevel: 11,
    desc: 'Hank wants to forge one perfect piece — for you.',
    offer: 'Every smith makes one masterwork. Mine needs a ruby and the darkest obsidian. And I want it to be for someone who earned it.',
    objectives: [
      bring('ruby', 1, 'Bring Hank a Ruby', 'Rubies turn up in buried treasure. Then talk to Hank → "Hand over".'),
      bring('obsidian', 8, 'Bring Hank 8 Obsidian', 'Obsidian washes up on Ember Isle\'s beaches. Then talk to Hank → "Hand over".'),
      talkTo('ash', 'Receive Hank\'s masterwork', [
        '*Hank works all night. At dawn he hands you a jacket with obsidian buttons and ruby thread*',
        'Not a sword. A jacket. Fire-proof. Because the best thing a smith can make is something that keeps a friend safe.',
        { you: 'Hank... thank you.' },
        'Don\'t get soft on me. Go fight some pirates in it.',
      ]),
    ],
    rewards: { gems: 25, xp: 500, cosmetics: ['ember_jacket'] },
  },

  // ── Grace (Ember) ─────────────────────────────────
  f_sage1: {
    title: 'Spring Offering', giver: 'sage', hearts: 3, minLevel: 8,
    desc: 'Grace leaves offerings for the volcano spirit.',
    offer: 'The mountain likes gifts, child. Mangoes, for their colour, and obsidian, for its heart. Will you make an offering with me?',
    objectives: [
      bring('mango', 3, 'Bring Grace 3 Mangoes', 'Shake the mango trees on Ember Isle (or Palmora). Then talk to Grace → "Hand over".'),
      bring('obsidian', 3, 'Bring Grace 3 Obsidian', 'Obsidian washes up on Ember Isle\'s beaches. Then talk to Grace → "Hand over".'),
      talkTo('sage', 'Make the offering', [
        '*the hot spring bubbles a little louder*',
        'The mountain is pleased. Or it\'s just a bubble. Honestly, I can never tell.',
      ]),
    ],
    rewards: { coins: 250, xp: 160 },
  },
  f_sage2: {
    title: 'The Mountain\'s Song', giver: 'sage', hearts: 6, requires: 'f_sage1', minLevel: 9,
    desc: 'Grace says the fish of Ember Isle can hear the volcano sing.',
    offer: 'The fish around Ember swim to the mountain\'s song. Catch eight of them, and you\'ll start to hear it too.',
    objectives: [
      { type: 'catch', target: 'island:ember', count: 8, text: 'Catch 8 fish around Ember Isle', hint: 'Fish anywhere around Ember Isle.' },
      talkTo('sage', 'Listen to the mountain', [
        'Close your eyes. Hear it? That low hum under the waves?',
        'I came here to escape a noisy city. The mountain taught me to listen. Now I teach others.',
      ]),
    ],
    rewards: { gems: 12, xp: 280, items: { health_tonic: 3 } },
  },
  f_sage3: {
    title: 'Phoenix Rising', giver: 'sage', hearts: 10, requires: 'f_sage2', minLevel: 12,
    desc: 'The Phoenix Fin appears to those the mountain trusts.',
    offer: 'The Phoenix Fin only rises for those the mountain trusts. I believe it trusts you. Go — on a quiet night, by Ember\'s shore.',
    objectives: [
      { type: 'catch', target: 'phoenix_fin', count: 1, text: 'Catch the Phoenix Fin', hint: 'A legendary fish around Ember Isle at night.' },
      talkTo('sage', 'Tell Grace about the Phoenix', [
        'It rose for you. Of course it did.',
        'I have waited thirty years to see it. Hearing you tell it is enough.',
        { you: 'Come fishing with me next time.' },
        '...Perhaps I will. Take this robe of stars. The mountain and I both want you to have it.',
      ]),
    ],
    rewards: { gems: 25, xp: 600, cosmetics: ['starry_robe'] },
  },

  // ── Pete (Skull Cay) ──────────────────────────────
  f_patch1: {
    title: 'Honest Trade', giver: 'patch', hearts: 3, minLevel: 12,
    desc: 'Pete wants to prove he\'s a real, honest trader now.',
    offer: 'Arr — I mean, hello. I want to open an honest shop. Bring me a Barracuda and some coconut juice, and I\'ll pay fair. Fair! Imagine that.',
    objectives: [
      bring('fish_barracuda', 1, 'Bring Pete a Barracuda', 'A rare fish around Skull Cay and Ember Isle. Then talk to Pete → "Hand over".'),
      bring('coconut_juice', 2, 'Bring Pete 2 Coconut Juice', 'Kitchen → Drinks → Coconut Juice. Then talk to Pete → "Hand over".'),
      talkTo('patch', 'Do business with Pete', [
        '*Pete counts out coins very carefully, twice*',
        'There. Exactly fair. No tricks. ...It feels weird. Good weird.',
      ]),
    ],
    rewards: { coins: 400, xp: 200 },
  },
  f_patch2: {
    title: 'Ghosts of Skull Cay', giver: 'patch', hearts: 6, requires: 'f_patch1', minLevel: 12,
    desc: 'Pete\'s old crew believed the Ghost Sharks were lost sailors.',
    offer: 'My old crew said Ghost Sharks are the spirits of lost sailors. I lost good friends here. Catch one, and I\'ll say goodbye to them proper.',
    objectives: [
      { type: 'catch', target: 'ghost_shark', count: 1, text: 'Catch a Ghost Shark', hint: 'An epic shark around Skull Cay at night.' },
      talkTo('patch', 'Say goodbye with Pete', [
        '*Pete stands quietly at the water\'s edge and raises a cup*',
        'To Salty, Barnacle Bill and Little Fin. Best crew a bad pirate ever had.',
        'Thanks, friend. I needed that.',
      ]),
    ],
    rewards: { gems: 15, xp: 300 },
  },
  f_patch3: {
    title: 'Pete\'s Pardon', giver: 'patch', hearts: 10, requires: 'f_patch2', minLevel: 13,
    desc: 'Pete wants to go home to Palmora — but he needs a pardon.',
    offer: 'I was born on Palmora, you know. I want to go home. But they\'ll never forgive an old pirate... unless someone they trust speaks for me.',
    objectives: [
      { type: 'defeat', target: 'pirate', count: 6, text: 'Defeat 6 pirates to show Pete has changed sides', hint: 'Pirates raid Palmora at night and camp on Skull Cay. Press F to attack.' },
      talkTo('mayor', 'Ask Mayor Mike to pardon Pete', [
        'Pete? Little Pete Patterson? He used to steal my apples when he was eight!',
        'If you vouch for him, {name}... then Palmora forgives him. Tell him he can come home whenever he likes.',
      ]),
      talkTo('patch', 'Tell Pete the good news', [
        '*Pete takes off his eyepatch and wipes his eye* ...Home. I can go home.',
        'Take my old vest. I won\'t be needing it. I\'m an honest man now. Mostly. Fairly. Completely!',
      ]),
    ],
    rewards: { gems: 30, xp: 600, cosmetics: ['pirate_vest'] },
  },
};

/** Friendship quest ids per islander, in story order. */
export const FRIEND_ARCS = {};
for (const [id, q] of Object.entries(FRIEND_QUESTS)) {
  q.friend = true;
  (FRIEND_ARCS[q.giver] ||= []).push(id);
}
