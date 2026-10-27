// Every skill a star can roll. Each star gets 6 different ones when it's made, and they unlock
// one by one as the star levels up (at levels 1, 11, 21, 31, 41 and 51).
//
// To add a skill, copy a { } block and change it, then add what it does to skillValue's users
// in constellation.js (search for the id).
//   id:       short name used in saves. Don't change it after people have stars with it.
//   name:     what it's called.
//   text:     what it does. {value} is swapped for the current number.
//   base:     how strong it is at skill level 1.
//   perLevel: how much each upgrade with crystals adds.
//   max:      the most it can ever reach (leave it out for no limit).
//   rarities: which star rarities can roll it.
//
// Skills that are always on are the baseline (about +12% at level 1). The harder a skill's
// condition is to set up, the more it pays when it's met.

const skillList = [
  /* ---------- based on the stars it's connected to ---------- */
  {
    id: "brightCompany",
    name: "Bright Company",
    text: "+{value}% stardust for each connected star of a higher rarity",
    // hard: rarer stars are scarce
    base: 16, perLevel: 5, rarities: [1, 2, 3, 4]
  },
  {
    id: "humbleLight",
    name: "Humble Light",
    text: "+{value}% stardust for each connected star of a lower rarity",
    base: 10, perLevel: 3.5, rarities: [2, 3, 4, 5]
  },
  {
    id: "twinGlow",
    name: "Twin Glow",
    text: "+{value}% stardust for each connected star of the same rarity",
    base: 14, perLevel: 4, rarities: [1, 2, 3, 4, 5]
  },
  {
    id: "hub",
    name: "Hub",
    text: "+{value}% stardust for each star it's connected to",
    base: 5, perLevel: 2, rarities: [1, 2, 3, 4, 5]
  },
  {
    id: "loneStar",
    name: "Lone Star",
    text: "+{value}% stardust while it's connected to exactly one star",
    // it limits how you lay out the rest of the sky
    base: 35, perLevel: 8, rarities: [1, 2, 3, 4, 5]
  },
  {
    id: "kindredFortune",
    name: "Kindred Fortune",
    text: "+{value}% stardust for each connected star whose fortune shares an emote with this one",
    // very hard: two fortunes only share an emote about 6% of the time
    base: 40, perLevel: 10, rarities: [1, 2, 3, 4, 5]
  },
  {
    id: "mentor",
    name: "Mentor",
    text: "Connected stars get +{value}% more experience each day",
    base: 15, perLevel: 5, rarities: [2, 3, 4, 5]
  },

  /* ---------- based on the whole constellation ---------- */
  {
    id: "nightSky",
    name: "Night Sky",
    text: "+{value}% stardust for each star in your constellation",
    base: 3, perLevel: 1, rarities: [1, 2, 3, 4, 5]
  },
  {
    id: "supergiant",
    name: "Supergiant",
    text: "+{value}% stardust while no star in your constellation has a higher rarity",
    // hard: it means leaving your 5 stars out. Not on 5 stars, where it would be free
    base: 30, perLevel: 7, rarities: [3, 4]
  },

  /* ---------- based on the star itself ---------- */
  {
    id: "elder",
    name: "Elder",
    text: "+{value}% stardust for every 10 levels this star has",
    base: 4, perLevel: 1.5, rarities: [1, 2, 3, 4, 5]
  },
  {
    id: "underdog",
    name: "Underdog",
    text: "+{value}% stardust. Only humble stars can have this",
    base: 30, perLevel: 6, rarities: [1, 2]
  },
  {
    id: "deepWell",
    name: "Deep Well",
    text: "Holds +{value}% more stardust when full, but takes a little longer to fill",
    base: 20, perLevel: 5, rarities: [1, 2, 3, 4, 5]
  },
  {
    id: "quickFill",
    name: "Quick Fill",
    text: "Fills up {value}% faster",
    base: 6, perLevel: 2, max: 60, rarities: [1, 2, 3, 4, 5]
  },
  {
    id: "overflow",
    name: "Overflow",
    text: "While full, keeps making stardust {value}% faster than usual",
    base: 40, perLevel: 10, rarities: [1, 2, 3, 4, 5]
  },
  {
    id: "fastLearner",
    name: "Fast Learner",
    text: "+{value}% experience each day",
    base: 20, perLevel: 5, rarities: [1, 2, 3, 4, 5]
  },

  /* ---------- based on when you collect ---------- */
  {
    id: "moonlit",
    name: "Moonlit",
    text: "+{value}% stardust when collected between 8pm and 6am",
    base: 25, perLevel: 6, rarities: [1, 2, 3, 4, 5]
  },
  {
    id: "earlyRiser",
    name: "Early Riser",
    text: "+{value}% stardust when collected between 5am and noon",
    base: 25, perLevel: 6, rarities: [1, 2, 3, 4, 5]
  },
  {
    id: "wishful",
    name: "Wishful",
    text: "+{value}% stardust when collected after you've made today's wish",
    base: 12, perLevel: 3, rarities: [1, 2, 3, 4, 5]
  },
  {
    id: "steadyHands",
    name: "Steady Hands",
    text: "+{value}% stardust for each day in a row you've collected it (up to 7 days)",
    // one missed day starts it over
    base: 6, perLevel: 2, rarities: [1, 2, 3, 4, 5]
  },

  /* ---------- chances when you collect ---------- */
  {
    id: "lucky",
    name: "Lucky",
    text: "{value}% chance to double a collection",
    base: 5, perLevel: 1.5, max: 50, rarities: [1, 2, 3, 4, 5]
  },
  {
    id: "echo",
    name: "Echo",
    text: "Collecting it tops up each connected star by {value}% of a full fill",
    base: 5, perLevel: 1.5, max: 40, rarities: [2, 3, 4, 5]
  },
  {
    id: "crystalline",
    name: "Crystalline",
    text: "{value}% chance to find a stellar crystal when collected",
    base: 4, perLevel: 1, max: 50, rarities: [3, 4, 5]
  },

  /* ---------- stellar crystals ---------- */
  {
    id: "shardSeeker",
    name: "Crystal Seeker",
    text: "+{value}% stellar crystals from collecting",
    base: 12, perLevel: 4, rarities: [1, 2, 3, 4, 5]
  },
  {
    id: "prism",
    name: "Prism",
    text: "{value}% chance to triple the crystals from a collection",
    base: 5, perLevel: 1.5, max: 40, rarities: [2, 3, 4, 5]
  },
  {
    id: "shardWeb",
    name: "Crystal Web",
    text: "+{value}% crystals for each star it's connected to",
    base: 5, perLevel: 2, rarities: [1, 2, 3, 4, 5]
  },
  {
    id: "shardOverflow",
    name: "Crystal Overflow",
    text: "While full, keeps making crystals {value}% faster than usual",
    base: 40, perLevel: 10, rarities: [2, 3, 4, 5]
  },
  {
    id: "geode",
    name: "Geode",
    text: "+{value}% crystals while no star in your constellation is a higher level",
    base: 28, perLevel: 7, rarities: [4, 5]
  }
];
