# Seaborne — a cozy 3D island life game

A cozy island-life adventure built with **Three.js**: fish, farm, build, sail, make friends and fight pirates across a hand-drawn, cel-shaded archipelago.

## Run it

```bash
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173). `npm run build` produces a static site in `dist/` you can host anywhere.

## Controls

| Key | Action |
| --- | --- |
| WASD / Arrows | Move (Shift to run) |
| Space | Jump (also dodges attacks) |
| E | Talk, fish, plant, pick, interact |
| F / click near enemies | Attack |
| Mouse drag / wheel | Rotate / zoom camera |
| I or Tab · J · M · C | Bag · Quests · Map · Wardrobe |
| Esc | Menu / close |

Touch devices get an on-screen joystick and action buttons.

## Features

- **A castaway's start** — a short cutscene shows you washing up on Palmora after a storm (skippable). Mayor Mike gives you a tent, and you earn the rest — kitchen, hut, farm buildings — through quests.
- **Your character** — male or female, 6 skin tones, 9 hairstyles, 11 hair colours and 5 eye colours, plus a wardrobe of 44 tops, bottoms, hats and accessories.
- **Day & night** — night runs 7 PM to 7 AM. Use game time (24-minute days) or your real-world clock. Night brings stars, lit lanterns, fireflies, night-only fish, Madison the night merchant and pirate raids.
- **Fishing** — 52 species (including 8 kinds of junk) in 7 rarity tiers, with time, weather, island and deep-water fish. Cast, wait for the bite, then tap to reel — but ease off when the fish thrashes. Fish can slip the hook, snap the line or swim away, and you only see what you caught once it's landed. Better rods land bigger fish, better lures bring rarer ones, and you can fish from your boat. Perfect-catch bonuses, treasure chests, records and a Fishdex.
- **Gear** — 5 rods (one for boats only), 8 lures you can see flying through the air, 6 weapons, 3 boats and 4 pets with perks.
- **Farming** — 17 crops and 11 fruit trees. Drag across the field FarmVille-style to plant, water, fertilise and harvest. Soil patches unlock as you level up (up to 50); sprinklers and drip irrigation come later.
- **Farm animals** — chickens, cows, goats, bee hives, sheep and truffle pigs. Bob repairs or builds their homes and a feeder; turn your crops into feed, collect eggs, milk, honey, wool and truffles, and later some fertiliser too.
- **Kitchen** — a recipe book with 68 recipes across six categories (basics, drinks, snacks, meals, desserts, feasts) that unlock as you level up. You choose exactly which fish goes into each dish. Cooked food sells for far more and heals you.
- **Building** — upgrade from tent to Seaside Manor (more max health each time) and place decorations.
- **Palmora Aquarium** — from level 5, help Megan build an aquarium on the dock road and donate one of each of the 44 fish species. Tap the building (or press E at its door) to look inside: three tanks (Lagoon, Reef Hall and The Abyss) where your donated fish swim — tap any fish for its details. The glass front shows some of them from outside, visitors pay daily ticket money, and Megan has rewards at 12, 20, 30 and all 44 species.
- **Village restoration** — the Great Storm wrecked half of Palmora. On the Project Board by the Town Hall, fund five buildings with coins, materials and food; Bob builds each one overnight. Each one has a perk: the Fountain (level 4) doubles friendship from chatting, the Windmill (6) doubles Kitchen Basics, the Market Hall (9) adds 10% to every sale, the Observatory (11) forecasts the weather 3 days ahead, and the Festival Stage (14) turns every 7th day into Festival Day (+50% for cooked food).
- **Economy** — sell fish, fruit, food and treasure for coins; earn gems from rare catches, quests, tournaments, digging and bounties. Levelling starts quick (200 XP for level 2) and slows down later.
- **4 islands** — Palmora (home), Coralia Reef (fishing tournaments), Ember Isle (volcano, blacksmith, hot spring) and Skull Cay (pirate lair and boss).
- **16 islanders** with lots of non-repeating dialogue, friendship hearts and gifts; a 17-part main story and 42 side quests that introduce every feature; daily bounties, a daily login streak, and weather (rain & storms).
- **Friendship stories** — every islander has a three-chapter personal story (48 quests), offered at 3, 6 and 10 hearts. Islanders with one to share show a ♥, and the quest log's Friends tab tracks everyone's hearts and chapters.
- **Plays anywhere** — keyboard & mouse, or touch with an on-screen joystick (phone landscape supported). Details pop up only when you tap something.
- **Accessible UI** — keyboard navigable, text-size options, high-contrast mode, reduced motion, rarity shown with icons + text (not colour alone), screen-reader announcements.

## Project layout

Code is grouped by feature: everything about fishing lives in `fishing/`, everything about the farm in `farm/`, and so on.

```
src/
  main.js, game.js   boot, game loop, camera, saving, coins/XP, buying & selling
  shared/    item catalogue, input, events, helpers, audio, save files, game clock
  world/     islands, terrain, ocean, sky, weather, trees & buildings, critters, foraging
  fishing/   fish, rods & lures, boats, fishing minigame, boat fishing, tournaments, aquarium
  farm/      crops, fruit trees, animals, farm buildings, the field, farm tools, feeder
  kitchen/   recipes, cooking, the recipe book, kitchen models
  home/      your house & upgrades, tent, decorations, home menu
  people/    your character, islanders, dialogue, shops, outfits, pets
  combat/    weapons, pirates, fighting
  village/   Palmora restoration: the Project Board, five projects, their models and perks
  story/     main & side quests, friendship stories, quest log, waypoint guide, opening cutscene
  ui/        HUD, menus, title & character creator, icons
```

All art and audio are generated in code — no external assets.
