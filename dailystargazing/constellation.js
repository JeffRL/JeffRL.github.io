// The Constellation: every wish can become a star you keep. Stars sit in your collection,
// and the ones you place in your constellation make stardust, level up each day, and use their skills.
// Nothing runs in the background: everything is worked out from saved times whenever the page looks.
// Uses things from luck.js (nowTime, colorForCount, getToday, ...), logbook.js (dateKey, firstFound, ...),
// skills.js (skillList), starnames.js (starNames) and share.js (showToast).

const skyKey = "dailystargazing-sky";

// what a star makes per full fill, rolled once for each star inside its rarity's range.
// The ranges overlap a little, so a lucky 4 star can beat an unlucky 5 star
const dustRanges = [[8, 12], [12, 20], [18, 32], [28, 50], [45, 80]];
const crystalRanges = [[0.25, 0.5], [0.4, 0.75], [0.6, 1.1], [1.0, 1.75], [1.5, 2.5]];
// every skill gets a strength roll too, higher on average for rarer stars
const skillRollRanges = [[0.7, 1.0], [0.85, 1.15], [1.0, 1.3], [1.15, 1.5], [1.3, 1.7]];
// once full, a star keeps making stardust at this share of its normal speed
const overflowSpeed = 0.25;
// stars this close together (as a share of the sky's width) connect
const linkReach = 0.22;
const maxLevel = 60;
const hourMs = 3600000;
const dayMs = 86400000;

let skyState = null;

/* ---------- saving ---------- */

function freshSky() {
  return {
    name: "My Constellation",
    // stardust is this week's score. It sets your rank and starts again every Monday
    stardust: 0,
    // crystals earned this week get paid out on Monday, times your rank's bonus
    crystalsThisWeek: 0,
    crystals: 0,
    // how last week went, for the logbook and the Monday message
    lastWeekResult: null,
    lastWeek: weekKey(nowTime()),
    milestone: 0,
    addedDate: "",
    // stardust earned each week (by the Monday it starts on), and the best week ever
    dustByWeek: {},
    maxStardust: 0,
    nextId: 1,
    stars: []
  };
}

function loadSky() {
  skyState = freshSky();
  try {
    const saved = JSON.parse(localStorage.getItem(skyKey));
    if (saved && Array.isArray(saved.stars)) {
      // anything missing from an older save falls back to the fresh value
      for (const key in saved) {
        skyState[key] = saved[key];
      }
    }
    // stars from before rolls existed get the middle of their rarity's ranges
    for (let i = 0; i < skyState.stars.length; i++) {
      fillInRolls(skyState.stars[i]);
    }
  } catch (error) {
    // nothing saved yet, or storage is blocked
  }
}

function saveSky() {
  try {
    localStorage.setItem(skyKey, JSON.stringify(skyState));
  } catch (error) {
    // can't save, it'll be lost on reload
  }
}

/* ---------- limits that grow with logbook completion ---------- */

// one milestone for every 2.5% of readings found, 40 in all. Rewards get bigger toward the end.
//   storage:  more room in the star collection
//   crystals: + % stellar crystals on Monday, added to the rank bonus
//   scrap:    + % crystals from scrapping stars
//   slot:     one more star in the constellation
//   stardust: + % stardust from every star (only late, once you're into the Universe ranks)
const rewardTable = [
  ["storage", 8], ["crystals", 2], ["storage", 8], ["scrap", 5], ["storage", 8],
  ["crystals", 2], ["storage", 12], ["slot", 1], ["scrap", 5], ["storage", 12],
  ["crystals", 3], ["storage", 12], ["scrap", 10], ["storage", 16], ["crystals", 3],
  ["slot", 1], ["storage", 16], ["scrap", 10], ["storage", 16], ["crystals", 4],
  ["storage", 20], ["scrap", 15], ["storage", 20], ["slot", 1], ["crystals", 4],
  ["stardust", 5], ["storage", 20], ["scrap", 15], ["storage", 24], ["stardust", 5],
  ["crystals", 6], ["slot", 1], ["storage", 24], ["stardust", 5], ["scrap", 20],
  ["storage", 24], ["crystals", 6], ["stardust", 5], ["scrap", 20], ["slot", 1]
];

// how much of one kind of reward you've unlocked so far
function rewardTotal(type) {
  let total = 0;
  for (let i = 0; i < skyState.milestone && i < rewardTable.length; i++) {
    if (rewardTable[i][0] === type) {
      total += rewardTable[i][1];
    }
  }
  return total;
}

function storageLimit() {
  return 60 + rewardTotal("storage");
}

function slotLimit() {
  return 5 + rewardTotal("slot");
}

function completionPercent() {
  const found = firstFound();
  let have = 0;
  for (let i = 0; i < fortunes.length; i++) {
    if (found[fortuneId(fortunes[i])]) {
      have++;
    }
  }
  return fortunes.length ? (have / fortunes.length) * 100 : 0;
}

// rewards are never taken back, even if new readings lower the percentage
function updateMilestone() {
  const reached = Math.min(rewardTable.length, Math.floor(completionPercent() / 2.5));
  if (reached > skyState.milestone) {
    skyState.milestone = reached;
    saveSky();
    return true;
  }
  return false;
}

// what a milestone (1 to 40) gives and the completion it needs
function rewardAt(step) {
  const type = rewardTable[step - 1][0];
  const amount = rewardTable[step - 1][1];
  let text = "+" + amount + " star storage";
  if (type === "crystals") {
    text = "+" + amount + "% stellar crystals on Monday";
  } else if (type === "scrap") {
    text = "+" + amount + "% crystals from scrapping";
  } else if (type === "slot") {
    text = "+1 constellation slot";
  } else if (type === "stardust") {
    text = "+" + amount + "% stardust from every star";
  }
  return { percent: step * 2.5, type: type, amount: amount, text: text };
}

// what the next milestone gives, for the logbook's reward track
function nextReward() {
  const next = skyState.milestone + 1;
  if (next > rewardTable.length) {
    return null;
  }
  return rewardAt(next);
}

/* ---------- making stars ---------- */

// a random real star name with a catalog number, like "Vega 125-X". Tries again if you already have that one
function pickStarName() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let name = "";
  let taken = true;
  while (taken) {
    name = starNames[Math.floor(Math.random() * starNames.length)] + " " +
      (1 + Math.floor(Math.random() * 655)) + "-" + letters[Math.floor(Math.random() * 26)];
    taken = false;
    for (let i = 0; i < skyState.stars.length; i++) {
      if (skyState.stars[i].name === name) {
        taken = true;
      }
    }
  }
  return name;
}

function rollBetween(range) {
  return range[0] + Math.random() * (range[1] - range[0]);
}

function middleOf(range) {
  return (range[0] + range[1]) / 2;
}

// where a rolled number sits in its range, from 0 (lowest possible) to 1 (highest possible)
function rollQuality(value, range) {
  return clamp((value - range[0]) / (range[1] - range[0]));
}

function fillInRolls(star) {
  if (star.fillBase === undefined) {
    star.fillBase = middleOf(dustRanges[star.rarity - 1]);
  }
  if (star.crystalBase === undefined) {
    star.crystalBase = middleOf(crystalRanges[star.rarity - 1]);
  }
  for (let i = 0; i < star.skills.length; i++) {
    if (star.skills[i].roll === undefined) {
      star.skills[i].roll = middleOf(skillRollRanges[star.rarity - 1]);
    }
  }
}

// how good a star's rolls are overall, from 0 to 1
function starQuality(star) {
  let total = rollQuality(star.fillBase, dustRanges[star.rarity - 1]) + rollQuality(star.crystalBase, crystalRanges[star.rarity - 1]);
  for (let i = 0; i < star.skills.length; i++) {
    total += rollQuality(star.skills[i].roll, skillRollRanges[star.rarity - 1]);
  }
  return total / (2 + star.skills.length);
}

// 6 different skills that this rarity is allowed to have
function rollSkills(rarity) {
  const pool = [];
  for (let i = 0; i < skillList.length; i++) {
    if (skillList[i].rarities.indexOf(rarity) !== -1) {
      pool.push(skillList[i].id);
    }
  }
  const picked = [];
  while (picked.length < 6 && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push({ id: pool[index], level: 1, roll: rollBetween(skillRollRanges[rarity - 1]) });
    pool.splice(index, 1);
  }
  return picked;
}

function makeStar(fortune, debug) {
  const now = nowTime();
  const star = {
    id: skyState.nextId,
    name: pickStarName(),
    rarity: fortune.rarity,
    fortuneId: fortuneId(fortune),
    text: fortune.text,
    emotes: fortune.emotes,
    created: now,
    debug: Boolean(debug),
    level: 1,
    exp: 0,
    expPaidUntil: dateKey(new Date(now)),
    skills: rollSkills(fortune.rarity),
    favorite: false,
    active: false,
    x: 0.5,
    y: 0.5,
    lastCollected: now,
    overflowPaidUntil: now,
    // about 30 hours, a little faster for rarer stars, and a bit different for every star
    fillHours: 30 - fortune.rarity * 0.4 + (Math.random() * 6 - 3),
    fillBase: rollBetween(dustRanges[fortune.rarity - 1]),
    crystalBase: rollBetween(crystalRanges[fortune.rarity - 1]),
    streak: 0,
    lastCollectDay: ""
  };
  skyState.nextId++;
  return star;
}

// returns the new star, or null if storage is full
function addStar(fortune, debug) {
  if (skyState.stars.length >= storageLimit()) {
    return null;
  }
  const star = makeStar(fortune, debug);
  skyState.stars.push(star);
  saveSky();
  return star;
}

function findStar(id) {
  for (let i = 0; i < skyState.stars.length; i++) {
    if (skyState.stars[i].id === id) {
      return skyState.stars[i];
    }
  }
  return null;
}

function activeStars() {
  const list = [];
  for (let i = 0; i < skyState.stars.length; i++) {
    if (skyState.stars[i].active) {
      list.push(skyState.stars[i]);
    }
  }
  return list;
}

/* ---------- skills ---------- */

function skillInfo(id) {
  for (let i = 0; i < skillList.length; i++) {
    if (skillList[i].id === id) {
      return skillList[i];
    }
  }
  return null;
}

function skillValue(skill) {
  const info = skillInfo(skill.id);
  if (!info) {
    return 0;
  }
  let value = (info.base + info.perLevel * (skill.level - 1)) * (skill.roll || 1);
  if (info.max !== undefined) {
    value = Math.min(value, info.max);
  }
  return Math.round(value * 10) / 10;
}

function skillUnlockLevel(index) {
  return index * 10 + 1;
}

// how much of a skill a star has, counting only skills it has unlocked
function skillTotal(star, id) {
  let total = 0;
  for (let i = 0; i < star.skills.length; i++) {
    if (star.skills[i].id === id && star.level >= skillUnlockLevel(i)) {
      total += skillValue(star.skills[i]);
    }
  }
  return total;
}

function skillDescription(skill) {
  const info = skillInfo(skill.id);
  return info ? info.text.replace("{value}", skillValue(skill)) : "";
}

/* ---------- connections ---------- */

// the sky's size on screen, for working out which stars are close enough to connect
let skyPixelW = 1000;
let skyPixelH = 600;

function linkedStars(star) {
  const list = [];
  if (!star.active) {
    return list;
  }
  const actives = activeStars();
  for (let i = 0; i < actives.length; i++) {
    const other = actives[i];
    if (other.id === star.id) {
      continue;
    }
    const dx = (star.x - other.x) * skyPixelW;
    const dy = (star.y - other.y) * skyPixelH;
    if (Math.sqrt(dx * dx + dy * dy) <= linkReach * skyPixelW) {
      list.push(other);
    }
  }
  return list;
}

function sharesEmote(a, b) {
  for (let i = 0; i < a.emotes.length; i++) {
    if (b.emotes.indexOf(a.emotes[i]) !== -1) {
      return true;
    }
  }
  return false;
}

/* ---------- stardust ---------- */

// the % bonus from skills that depend on where the star is and who it's next to
function outputPercent(star) {
  const links = linkedStars(star);
  const actives = activeStars();
  let percent = 0;
  let higher = 0;
  let lower = 0;
  let same = 0;
  let kindred = 0;
  for (let i = 0; i < links.length; i++) {
    if (links[i].rarity > star.rarity) {
      higher++;
    } else if (links[i].rarity < star.rarity) {
      lower++;
    } else {
      same++;
    }
    if (sharesEmote(star, links[i])) {
      kindred++;
    }
  }
  percent += skillTotal(star, "brightCompany") * higher;
  percent += skillTotal(star, "humbleLight") * lower;
  percent += skillTotal(star, "twinGlow") * same;
  percent += skillTotal(star, "hub") * links.length;
  percent += skillTotal(star, "kindredFortune") * kindred;
  if (links.length === 1) {
    percent += skillTotal(star, "loneStar");
  }
  percent += skillTotal(star, "nightSky") * actives.length;
  let highest = true;
  for (let i = 0; i < actives.length; i++) {
    if (actives[i].rarity > star.rarity) {
      highest = false;
    }
  }
  if (highest) {
    percent += skillTotal(star, "supergiant");
  }
  percent += skillTotal(star, "elder") * Math.floor(star.level / 10);
  percent += skillTotal(star, "underdog");
  return percent;
}

// how much stardust the star holds when full
function fillAmount(star) {
  const levelBonus = 1 + 0.04 * (star.level - 1);
  const rewardBonus = 1 + rewardTotal("stardust") / 100;
  return star.fillBase * levelBonus * (1 + outputPercent(star) / 100) * (1 + skillTotal(star, "deepWell") / 100) * rewardBonus;
}

// the % bonus to crystals from crystal skills
function crystalPercent(star) {
  let percent = skillTotal(star, "shardSeeker");
  percent += skillTotal(star, "shardWeb") * linkedStars(star).length;
  const actives = activeStars();
  let topLevel = true;
  for (let i = 0; i < actives.length; i++) {
    if (actives[i].level > star.level) {
      topLevel = false;
    }
  }
  if (topLevel) {
    percent += skillTotal(star, "geode");
  }
  return percent;
}

// stellar crystals the star gives for a full fill (paid out on Monday)
function crystalAmount(star) {
  const levelBonus = 1 + 0.04 * (star.level - 1);
  return star.crystalBase * levelBonus * (1 + crystalPercent(star) / 100);
}

// how long it takes to fill, in milliseconds
function fillMs(star) {
  let hours = star.fillHours * (1 - skillTotal(star, "quickFill") / 100);
  if (skillTotal(star, "deepWell") > 0) {
    hours *= 1.05;
  }
  return hours * hourMs;
}

function fillFraction(star, now) {
  return clamp((now - star.lastCollected) / fillMs(star));
}

// once full, the extra goes straight into your stardust. This pays out everything up to now
function settleOverflow(star, now) {
  if (!star.active) {
    return 0;
  }
  const fullAt = star.lastCollected + fillMs(star);
  const from = Math.max(fullAt, star.overflowPaidUntil);
  if (now <= from) {
    return 0;
  }
  const speed = overflowSpeed * (1 + skillTotal(star, "overflow") / 100);
  const amount = fillAmount(star) * speed * (now - from) / fillMs(star);
  earnDust(amount, now);
  // crystals keep coming slowly too, faster with Crystal Overflow
  const crystalSpeed = overflowSpeed * (1 + skillTotal(star, "shardOverflow") / 100);
  skyState.crystalsThisWeek += crystalAmount(star) * crystalSpeed * (now - from) / fillMs(star);
  star.overflowPaidUntil = now;
  return amount;
}

// clicking a star: collects what it has built up, with any bonuses for when you collected it
function collectStar(star, now) {
  settleOverflow(star, now);
  let amount = fillAmount(star) * fillFraction(star, now);
  let weekCrystals = crystalAmount(star) * fillFraction(star, now);
  let prism = false;
  if (Math.random() * 100 < skillTotal(star, "prism")) {
    weekCrystals *= 3;
    prism = true;
  }

  const hour = new Date(now).getHours();
  let bonus = 0;
  if (hour >= 20 || hour < 6) {
    bonus += skillTotal(star, "moonlit");
  }
  if (hour >= 5 && hour < 12) {
    bonus += skillTotal(star, "earlyRiser");
  }
  if (alreadyWatched()) {
    bonus += skillTotal(star, "wishful");
  }

  // days in a row this star has been collected
  const today = dateKey(new Date(now));
  const yesterday = dateKey(new Date(now - dayMs));
  if (star.lastCollectDay !== today) {
    star.streak = star.lastCollectDay === yesterday ? Math.min(7, star.streak + 1) : 1;
    star.lastCollectDay = today;
  }
  bonus += skillTotal(star, "steadyHands") * star.streak;
  amount *= 1 + bonus / 100;

  let doubled = false;
  if (Math.random() * 100 < skillTotal(star, "lucky")) {
    amount *= 2;
    doubled = true;
  }
  let crystal = false;
  if (Math.random() * 100 < skillTotal(star, "crystalline")) {
    skyState.crystals += 1;
    crystal = true;
  }

  // Echo tops up the stars it's connected to, but never past full
  const echo = skillTotal(star, "echo");
  if (echo > 0) {
    const links = linkedStars(star);
    for (let i = 0; i < links.length; i++) {
      const other = links[i];
      settleOverflow(other, now);
      const pushBack = fillMs(other) * echo / 100;
      other.lastCollected = Math.max(other.lastCollected - pushBack, now - fillMs(other));
    }
  }

  earnDust(amount, now);
  skyState.crystalsThisWeek += weekCrystals;
  star.lastCollected = now;
  star.overflowPaidUntil = now;
  saveSky();
  return { amount: amount, weekCrystals: weekCrystals, doubled: doubled, prism: prism, crystal: crystal };
}

// adds stardust and keeps the history the logbook's graph uses
function earnDust(amount, now) {
  skyState.stardust += amount;
  const week = weekKey(now);
  skyState.dustByWeek[week] = (skyState.dustByWeek[week] || 0) + amount;
  noteDustPeak();
}

// the best week ever, by stardust
// the best rank from the weeks before this one, or -1 if there aren't any yet
function recordRank() {
  const thisWeek = weekKey(nowTime());
  let best = 0;
  for (const week in skyState.dustByWeek) {
    if (week !== thisWeek) {
      best = Math.max(best, skyState.dustByWeek[week]);
    }
  }
  return best > 0 ? rankIndexFor(best) : -1;
}

function noteDustPeak() {
  if (skyState.stardust > skyState.maxStardust) {
    skyState.maxStardust = skyState.stardust;
  }
}

/* ---------- weekly ranks ---------- */

// each rank: which tier, its number, the stardust needed this week, and the crystal bonus it gives.
// Tune the numbers here
const rankList = makeRankList();

function makeRankList() {
  const list = [];
  // roughly: one new star sits in Constellation, a full set of 3 stars reaches Nebula,
  // 4 star lineups reach Galaxy, and Universe takes 10 strong 5 stars
  const constellation = [0, 150, 400, 750, 1150];
  const nebula = [1600, 2200, 2900, 3700, 4700];
  const galaxy = [6000, 7500, 9200, 11000, 13200];
  for (let i = 0; i < 5; i++) {
    list.push({ tier: "Constellation", number: i + 1, need: constellation[i], bonus: 80 + i * 5 });
  }
  for (let i = 0; i < 5; i++) {
    list.push({ tier: "Nebula", number: i + 1, need: nebula[i], bonus: 103 + i * 3 });
  }
  for (let i = 0; i < 5; i++) {
    list.push({ tier: "Galaxy", number: i + 1, need: galaxy[i], bonus: 118 + i * 3 });
  }
  // each Universe rank needs about 9.5% more than the one before, from 21,600 up to about 121,000.
  // The late stardust rewards (+20%) balance this out
  for (let i = 0; i < 20; i++) {
    list.push({ tier: "Universe", number: i + 1, need: Math.round(18000 * 1.2 * Math.pow(1.095, i) / 100) * 100, bonus: 132 + i * 2 });
  }
  return list;
}

// the highest rank this much stardust reaches
function rankIndexFor(stardust) {
  let index = 0;
  for (let i = 0; i < rankList.length; i++) {
    if (stardust >= rankList[i].need) {
      index = i;
    }
  }
  return index;
}

function rankName(index) {
  return rankList[index].tier + " " + rankList[index].number;
}

// the % crystals pay out at on Monday for a rank: the rank's bonus plus the logbook rewards
function payoutPercent(rankIndex) {
  return rankList[rankIndex].bonus + rewardTotal("crystals");
}

// what this week's crystals would pay out on Monday at a rank (this week's rank if left out)
function crystalPreview(rankIndex) {
  if (rankIndex === undefined) {
    rankIndex = rankIndexFor(skyState.stardust);
  }
  return Math.floor(skyState.crystalsThisWeek * payoutPercent(rankIndex) / 100);
}

/* ---------- levels ---------- */

// gentle curve: early levels come fast, level 60 takes about a year of daily work
function expToNext(level) {
  return Math.round(15 + 7 * Math.pow(level, 1.3));
}

function dailyExp(star) {
  let percent = skillTotal(star, "fastLearner");
  const links = linkedStars(star);
  for (let i = 0; i < links.length; i++) {
    percent += skillTotal(links[i], "mentor");
  }
  return 100 * (1 + percent / 100);
}

function giveExp(star, amount) {
  star.exp += amount;
  while (star.level < maxLevel && star.exp >= expToNext(star.level)) {
    star.exp -= expToNext(star.level);
    star.level++;
  }
  if (star.level >= maxLevel) {
    star.exp = 0;
  }
}

function daysBetween(fromKey, toKey) {
  return Math.round((keyToDate(toKey) - keyToDate(fromKey)) / dayMs);
}

// every midnight a star spends in the constellation gives it a day of experience
function payDailyExp(now) {
  const today = dateKey(new Date(now));
  const actives = activeStars();
  for (let i = 0; i < actives.length; i++) {
    const star = actives[i];
    const days = daysBetween(star.expPaidUntil, today);
    if (days > 0) {
      giveExp(star, dailyExp(star) * days);
    }
    star.expPaidUntil = today;
  }
}

function levelUpCost(star) {
  return Math.ceil(2 * Math.pow(1.07, star.level));
}

function skillUpgradeCost(skill) {
  return Math.ceil(3 * Math.pow(1.8, skill.level - 1));
}

function buyLevel(star) {
  const cost = levelUpCost(star);
  if (star.level >= maxLevel || skyState.crystals < cost) {
    return false;
  }
  skyState.crystals -= cost;
  star.level++;
  star.exp = 0;
  saveSky();
  return true;
}

function buySkillLevel(star, index) {
  const skill = star.skills[index];
  const cost = skillUpgradeCost(skill);
  if (star.level < skillUnlockLevel(index) || skyState.crystals < cost) {
    return false;
  }
  skyState.crystals -= cost;
  skill.level++;
  saveSky();
  return true;
}

/* ---------- weekly crystals ---------- */

// the Monday that starts the week a time is in
function weekKey(now) {
  const day = new Date(now);
  const sinceMonday = (day.getDay() + 6) % 7;
  return dateKey(new Date(day.getFullYear(), day.getMonth(), day.getDate() - sinceMonday));
}

function nextWeekStart(now) {
  const monday = keyToDate(weekKey(now));
  return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 7).getTime();
}

// once a new week starts, the crystals earned that week get paid out times your rank's bonus,
// and stardust starts again from zero. Returns how the week went, or null
function convertWeekly(now) {
  const current = weekKey(now);
  if (current === skyState.lastWeek) {
    return null;
  }
  const actives = activeStars();
  for (let i = 0; i < actives.length; i++) {
    settleOverflow(actives[i], now);
  }
  const rank = rankIndexFor(skyState.stardust);
  const percent = payoutPercent(rank);
  const made = Math.floor(skyState.crystalsThisWeek * percent / 100);
  skyState.crystals += made;
  skyState.lastWeekResult = {
    week: skyState.lastWeek,
    rank: rank,
    percent: percent,
    stardust: skyState.stardust,
    earned: skyState.crystalsThisWeek,
    crystals: made
  };
  skyState.stardust = 0;
  skyState.crystalsThisWeek = 0;
  skyState.lastWeek = current;
  return skyState.lastWeekResult;
}

// catches everything up to now: daily experience, overflow, weekly crystals and rewards
function refreshSky() {
  const now = nowTime();
  payDailyExp(now);
  const actives = activeStars();
  for (let i = 0; i < actives.length; i++) {
    settleOverflow(actives[i], now);
  }
  const week = convertWeekly(now);
  updateMilestone();
  saveSky();
  return week;
}

/* ---------- placing, removing and scrapping ---------- */

// puts a star in the constellation at an open spot. Returns false if there's no room
function setActive(star, on) {
  const now = nowTime();
  if (on) {
    if (star.active || activeStars().length >= slotLimit()) {
      return false;
    }
    const spot = openSpot();
    star.x = spot.x;
    star.y = spot.y;
    star.active = true;
    // starts empty and starts earning experience from today
    star.lastCollected = now;
    star.overflowPaidUntil = now;
    star.expPaidUntil = dateKey(new Date(now));
  } else {
    payDailyExp(now);
    settleOverflow(star, now);
    star.active = false;
  }
  saveSky();
  return true;
}

// tries a few random spots and keeps the one furthest from the other stars
function openSpot() {
  const actives = activeStars();
  let best = { x: 0.5, y: 0.5 };
  let bestGap = -1;
  for (let tries = 0; tries < 40; tries++) {
    const x = 0.12 + Math.random() * 0.76;
    const y = 0.18 + Math.random() * 0.64;
    let gap = Infinity;
    for (let i = 0; i < actives.length; i++) {
      gap = Math.min(gap, Math.hypot((x - actives[i].x) * skyPixelW, (y - actives[i].y) * skyPixelH));
    }
    // close enough to connect to something is nice, but not on top of it
    const score = actives.length === 0 ? 1 : (gap > 60 && gap < linkReach * skyPixelW ? 1000 + gap : gap);
    if (score > bestGap) {
      bestGap = score;
      best = { x: x, y: y };
    }
  }
  return best;
}

// a few crystals, more for rarer stars with better rolls. These go straight to you,
// not through the weekly rank bonus
function scrapValue(star) {
  const rewardBonus = 1 + rewardTotal("scrap") / 100;
  return Math.round(star.rarity * star.rarity * (0.5 + starQuality(star)) / 2 * rewardBonus);
}

function scrapStar(star) {
  if (star.favorite || star.active) {
    return false;
  }
  const kept = [];
  for (let i = 0; i < skyState.stars.length; i++) {
    if (skyState.stars[i].id !== star.id) {
      kept.push(skyState.stars[i]);
    }
  }
  skyState.stars = kept;
  skyState.crystals += scrapValue(star);
  saveSky();
  return true;
}

/* ---------- small text helpers ---------- */

function formatWait(ms) {
  if (ms <= 0) {
    return "now";
  }
  const hours = Math.floor(ms / hourMs);
  const minutes = Math.floor((ms % hourMs) / 60000);
  if (hours >= 24) {
    return Math.floor(hours / 24) + "d " + (hours % 24) + "h";
  }
  if (hours > 0) {
    return hours + "h " + minutes + "m";
  }
  return Math.max(1, minutes) + "m";
}

function wholeNumber(value) {
  return Math.floor(value).toLocaleString();
}

function starMadeText(star) {
  const date = new Date(star.created).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return star.debug ? "Debug star · " + date : "Made " + date;
}

/* ============================================================
   The constellation section of the page
   ============================================================ */

const skySection = document.getElementById("constellation");
const skyArea = document.getElementById("skyArea");
const skyCanvas = document.getElementById("skyCanvas");
const skyPen = skyCanvas.getContext("2d");
const skyNameText = document.getElementById("skyName");
const dustCount = document.getElementById("dustCount");
const crystalCount = document.getElementById("crystalCount");
const crystalTimer = document.getElementById("crystalTimer");
const rankRecord = document.getElementById("rankRecord");
const rankCard = document.getElementById("rankCard");
const rankIcon = document.getElementById("rankIcon");
const rankNameText = document.getElementById("rankName");
const rankBonus = document.getElementById("rankBonus");
const rankFill = document.getElementById("rankFill");
const rankNext = document.getElementById("rankNext");
const rankBar = document.getElementById("rankBar");
const rankShine = document.getElementById("rankShine");
const rankFlash = document.getElementById("rankFlash");
const rankLabel = document.getElementById("rankLabel");

// each tier has its own little icon and color
const tierLooks = {
  Constellation: { icon: "\u2726", color: "#cfe0ff" },
  Nebula: { icon: "\u2601", color: "#e6a8ff" },
  Galaxy: { icon: "\u25C9", color: "#8fd0ff" },
  Universe: { icon: "\u273A", color: "#ffd25a" }
};

// the rank the card is showing, which can be behind the real one while it animates up
let shownRank = null;
let rankTarget = 0;
let rankClimbing = false;
const slotCount = document.getElementById("slotCount");
const editSkyButton = document.getElementById("editSkyButton");
const addSlotButton = document.getElementById("addSlotButton");
const skyTip = document.getElementById("skyTip");
const skyEmpty = document.getElementById("skyEmpty");
const addStarButton = document.getElementById("addStarButton");

let skyEditing = false;
let skyVisible = false;
let skyLooping = false;
let dragStar = null;
let hoverStar = null;
// the star a finger or mouse went down on, and when. A quick tap collects it when let go,
// holding it just shows its info
let pressedStar = null;
let pressedAt = 0;
const holdTime = 400;
// the info only pops up once a press has lasted holdTime, so quick taps don't flash it
let holdTimer = null;
let skyParticles = [];

// a star that's flying to the sky isn't drawn there until it lands
let arrivingStarId = null;
let showLinkRange = false;

function sizeSkyCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const box = skyArea.getBoundingClientRect();
  skyPixelW = Math.max(300, box.width);
  skyPixelH = Math.max(240, box.height);
  skyCanvas.width = skyPixelW * ratio;
  skyCanvas.height = skyPixelH * ratio;
  skyPen.setTransform(ratio, 0, 0, ratio, 0, 0);
}

// how big a star is in the sky, used for drawing it, its ring and clicking on it
function starRadius(star) {
  return 7 + star.rarity * 2;
}

function updateSkyHeader() {
  const now = nowTime();
  skyNameText.textContent = skyState.name;
  crystalCount.textContent = wholeNumber(skyState.crystals);
  crystalTimer.textContent = "The week ends in " + formatWait(nextWeekStart(now) - now);
  updateRankCard(true);
  const actives = activeStars();
  slotCount.textContent = actives.length + " / " + slotLimit() + " stars";
  addSlotButton.hidden = actives.length >= slotLimit();
  skyEditing = skyEditing && actives.length > 0;
  editSkyButton.textContent = skyEditing ? "Done" : "Move stars";
  editSkyButton.hidden = actives.length === 0;
  skySection.classList.toggle("editing", skyEditing);
  skyEmpty.hidden = actives.length > 0;
}

/* ---------- the rank card ---------- */

// shows a rank on the card. fresh empties the bar first so it can fill up again
function paintRank(index, fresh) {
  const rank = rankList[index];
  const next = rankList[index + 1];
  const look = tierLooks[rank.tier];
  rankCard.style.setProperty("--tier", look.color);
  rankIcon.textContent = look.icon;
  rankNameText.textContent = rankName(index);
  rankBonus.textContent = "+" + wholeNumber(crystalPreview(index)) + " crystals on Monday";
  rankBonus.title = "Crystals earned this week \u00D7 " + payoutPercent(index) + "% (" + rank.bonus + "% from your rank" +
    (rewardTotal("crystals") > 0 ? " + " + rewardTotal("crystals") + "% from logbook rewards" : "") + ")";
  const record = recordRank();
  rankRecord.textContent = record >= 0 ? "Best: " + rankName(record) : "";
  dustCount.textContent = wholeNumber(skyState.stardust);
  let progress = 1;
  if (next) {
    progress = clamp((skyState.stardust - rank.need) / (next.need - rank.need));
    rankNext.textContent = "/ " + next.need.toLocaleString() + " stardust this week";
  } else {
    rankNext.textContent = "stardust this week, the highest rank there is";
  }
  if (fresh) {
    rankFill.style.transition = "none";
    rankFill.style.width = "0%";
    void rankFill.offsetWidth;
    rankFill.style.transition = "";
  }
  rankFill.style.width = progress * 100 + "%";
}

// when stardust passes a rank, the card climbs one rank at a time with a glow for each
function updateRankCard(animate) {
  const index = rankIndexFor(skyState.stardust);
  if (shownRank === null || !animate || index < shownRank) {
    shownRank = index;
    paintRank(index, false);
    return;
  }
  rankTarget = index;
  if (index === shownRank) {
    if (!rankClimbing) {
      paintRank(index, false);
    }
    return;
  }
  if (!rankClimbing) {
    rankClimbing = true;
    climbRank();
  }
}

// how many ranks in a row the current climb has gone, so each step can come a bit quicker
let climbStep = 0;
let nameLeaving = null;

function climbRank() {
  if (shownRank >= rankTarget) {
    rankClimbing = false;
    climbStep = 0;
    paintRank(shownRank, false);
    return;
  }
  if (calmMode) {
    shownRank++;
    paintRank(shownRank, true);
    playRankUp(shownRank, climbStep);
    climbStep++;
    setTimeout(climbRank, 50);
    return;
  }
  // the bar fills to the end, a shine runs along it, and the old name lifts away
  rankFill.style.width = "100%";
  setTimeout(function () {
    rankBar.classList.remove("shine");
    void rankBar.offsetWidth;
    rankBar.classList.add("shine");
    rankBar.animate([
      { transform: "scaleY(1)" },
      { transform: "scaleY(1.8)", offset: 0.4 },
      { transform: "scaleY(1)" }
    ], { duration: 350, easing: "ease-out" });
    nameLeaving = rankNameText.animate([
      { transform: "none", opacity: 1, filter: "blur(0)" },
      { transform: "translateY(-10px)", opacity: 0, filter: "blur(6px)" }
    ], { duration: 200, easing: "ease-in", fill: "forwards" });
  }, 400);
  setTimeout(function () {
    // the old name stays hidden until this, then the new one takes over
    if (nameLeaving) {
      nameLeaving.cancel();
      nameLeaving = null;
    }
    const oldPayout = crystalPreview(shownRank);
    shownRank++;
    paintRank(shownRank, true);
    const newTier = rankList[shownRank].tier !== rankList[shownRank - 1].tier;
    celebrateRank(shownRank, climbStep, oldPayout, newTier);
    climbStep++;
    let pause = Math.max(650, 1000 - (climbStep - 1) * 150);
    if (newTier) {
      pause = 1800;
    }
    setTimeout(climbRank, pause);
  }, 600);
}

// the big moment: the card pulses and glows, a light sweeps across it, a ring grows out of it,
// the icon spins, the new name comes in from a blur, the bonus counts up, and sparkles fly out.
// the first rank of a new tier also gets a white flash and a label
function celebrateRank(index, step, oldPayout, newTier) {
  playRankUp(index, step);

  rankCard.animate([
    { boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)", transform: "scale(1)" },
    { boxShadow: "0 0 " + (newTier ? 60 : 40) + "px 8px var(--tier)", transform: "scale(" + (newTier ? 1.07 : 1.04) + ")", offset: 0.25 },
    { boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)", transform: "scale(1)" }
  ], { duration: newTier ? 1400 : 1000, easing: "ease-out" });

  rankShine.animate([
    { transform: "translateX(-120%) skewX(-20deg)" },
    { transform: "translateX(320%) skewX(-20deg)" }
  ], { duration: 700, easing: "cubic-bezier(0.4, 0, 0.2, 1)" });

  const ring = document.createElement("span");
  ring.className = "rank-ring";
  rankCard.appendChild(ring);
  ring.animate([
    { transform: "scale(1)", opacity: 0.9 },
    { transform: "scale(" + (newTier ? 1.35 : 1.18) + ", " + (newTier ? 1.9 : 1.5) + ")", opacity: 0 }
  ], { duration: newTier ? 1100 : 800, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }).finished.then(function () {
    ring.remove();
  });

  rankIcon.animate([
    { transform: "rotate(0) scale(1)", textShadow: "0 0 12px var(--tier)" },
    { transform: "rotate(200deg) scale(1.6)", textShadow: "0 0 24px #fff", offset: 0.45 },
    { transform: "rotate(360deg) scale(1)", textShadow: "0 0 12px var(--tier)" }
  ], { duration: 800, easing: "cubic-bezier(0.3, 0.7, 0.3, 1)" });

  rankNameText.animate([
    { transform: "translateY(12px)", opacity: 0, filter: "blur(6px)", letterSpacing: "0.3em" },
    { transform: "none", opacity: 1, filter: "blur(0)", letterSpacing: "0em" }
  ], { duration: 550, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });

  countBonus(oldPayout, crystalPreview(index));

  // passing the best rank from earlier weeks is a new record
  const record = recordRank();
  const newRecord = record >= 0 && index > record && index - 1 <= record;
  let badge = "";
  if (newTier) {
    badge = rankList[index].tier + " reached";
  }
  if (newRecord) {
    badge = badge ? badge + " \u00B7 New record!" : "New record!";
  }
  if (newTier) {
    rankFlash.animate([
      { opacity: 0.9 },
      { opacity: 0 }
    ], { duration: 600, easing: "ease-out" });
  }
  if (badge) {
    rankLabel.textContent = badge;
    rankLabel.animate([
      { transform: "translate(-50%, 6px) scale(0.8)", opacity: 0 },
      { transform: "translate(-50%, 0) scale(1.05)", opacity: 1, offset: 0.15 },
      { transform: "translate(-50%, 0) scale(1)", opacity: 1, offset: 0.75 },
      { transform: "translate(-50%, -6px) scale(1)", opacity: 0 }
    ], { duration: 1800, easing: "ease-out" });
  }

  const sparkCount = newTier ? 36 : 20;
  for (let i = 0; i < sparkCount; i++) {
    rankSpark(i / sparkCount, newTier ? 1.5 : 1);
  }
}

// one sparkle flying out from the middle of the card on a curve, twinkling as it goes
function rankSpark(turn, reach) {
  const spark = document.createElement("span");
  spark.className = "rank-spark";
  if (Math.random() < 0.6) {
    spark.textContent = "\u2726";
    spark.style.fontSize = 9 + Math.random() * 10 + "px";
  } else {
    spark.classList.add("dot");
  }
  rankCard.appendChild(spark);
  const angle = (turn + Math.random() * 0.04) * Math.PI * 2;
  const distance = (70 + Math.random() * 70) * reach;
  const midX = Math.cos(angle) * distance * 0.6;
  const midY = Math.sin(angle) * distance * 0.35 - 10;
  const endX = Math.cos(angle) * distance;
  const endY = Math.sin(angle) * distance * 0.5 + 25;
  const spin = Math.random() * 180 - 90;
  spark.animate([
    { transform: "translate(-50%, -50%) scale(0.3)", opacity: 1 },
    { transform: "translate(calc(-50% + " + midX + "px), calc(-50% + " + midY + "px)) scale(1.1) rotate(" + spin / 2 + "deg)", opacity: 1, offset: 0.4 },
    { transform: "translate(calc(-50% + " + (midX + endX) / 2 + "px), calc(-50% + " + (midY + endY) / 2 + "px)) scale(0.8) rotate(" + spin * 0.75 + "deg)", opacity: 0.4, offset: 0.65 },
    { transform: "translate(calc(-50% + " + (midX + endX) / 2 + "px), calc(-50% + " + (midY + endY) / 2 + "px)) scale(0.9) rotate(" + spin * 0.8 + "deg)", opacity: 0.9, offset: 0.72 },
    { transform: "translate(calc(-50% + " + endX + "px), calc(-50% + " + endY + "px)) scale(0.5) rotate(" + spin + "deg)", opacity: 0 }
  ], {
    duration: 900 + Math.random() * 500,
    delay: Math.random() * 120,
    easing: "cubic-bezier(0.2, 0.8, 0.3, 1)",
    fill: "backwards"
  }).finished.then(function () {
    spark.remove();
  });
}

// Monday's crystals tick up from the old rank's amount to the new one, then pop
function countBonus(from, to) {
  const started = performance.now();
  function tick(time) {
    const amount = Math.min(1, (time - started) / 500);
    rankBonus.textContent = "+" + wholeNumber(from + (to - from) * amount) + " crystals on Monday";
    if (amount < 1) {
      requestAnimationFrame(tick);
    } else {
      rankBonus.animate([
        { transform: "scale(1)" },
        { transform: "scale(1.25)", color: "#fff" },
        { transform: "scale(1)" }
      ], { duration: 300, easing: "ease-out" });
    }
  }
  requestAnimationFrame(tick);
}

/* ---------- drawing the sky ---------- */

// pictures of each emote, loaded once and reused for the orbits
const emoteImageCache = {};

function emotePicture(name) {
  if (!emoteImageCache[name]) {
    const picture = new Image();
    picture.src = "resources/" + name + ".png";
    emoteImageCache[name] = picture;
  }
  return emoteImageCache[name];
}

// a thin ray of light out of the middle of a star, fading out at the tip
function drawSpike(c, x, y, angle, length, width, color, alpha) {
  const tipX = x + Math.cos(angle) * length;
  const tipY = y + Math.sin(angle) * length;
  const sideX = -Math.sin(angle) * width / 2;
  const sideY = Math.cos(angle) * width / 2;
  const ray = c.createLinearGradient(x, y, tipX, tipY);
  ray.addColorStop(0, rgba(whiteColor, alpha));
  ray.addColorStop(0.3, rgba(color, alpha * 0.6));
  ray.addColorStop(1, rgba(color, 0));
  c.fillStyle = ray;
  c.beginPath();
  c.moveTo(x + sideX, y + sideY);
  c.lineTo(tipX, tipY);
  c.lineTo(x - sideX, y - sideY);
  c.closePath();
  c.fill();
}

// a glowing star: a soft halo, long thin light spikes, a pointed body and a bright middle.
// Rarer stars get more points and longer spikes. size is how far the points reach
function drawStarShape(c, x, y, size, rarity, glow, spin) {
  const color = colorForCount(rarity);

  const halo = c.createRadialGradient(x, y, 0, x, y, size * 4.5);
  halo.addColorStop(0, rgba(color, 0.45 * glow));
  halo.addColorStop(0.4, rgba(color, 0.12 * glow));
  halo.addColorStop(1, rgba(color, 0));
  c.fillStyle = halo;
  c.beginPath();
  c.arc(x, y, size * 4.5, 0, Math.PI * 2);
  c.fill();

  // long spikes up, down and to the sides, shorter ones on the diagonals, like a star in a telescope photo
  const spike = size * (2.4 + rarity * 0.5) * (0.85 + glow * 0.15);
  for (let i = 0; i < 4; i++) {
    drawSpike(c, x, y, i * Math.PI / 2, spike, size * 0.3, color, 0.8 * glow);
    drawSpike(c, x, y, i * Math.PI / 2 + Math.PI / 4, spike * 0.45, size * 0.2, color, 0.45 * glow);
  }

  // the body: points with curved sides that pinch in toward the middle
  const points = [4, 4, 5, 6, 8][rarity - 1];
  const inner = size * (points > 5 ? 0.45 : 0.36);
  c.save();
  c.translate(x, y);
  c.rotate(spin);
  const body = c.createRadialGradient(0, 0, 0, 0, 0, size);
  body.addColorStop(0, "rgba(255, 255, 255, 1)");
  body.addColorStop(0.35, rgba(mixColor(color, whiteColor, 0.6), 1));
  body.addColorStop(1, rgba(color, 0.95));
  c.fillStyle = body;
  c.beginPath();
  for (let i = 0; i < points; i++) {
    const tip = (i / points) * Math.PI * 2 - Math.PI / 2;
    const next = ((i + 1) / points) * Math.PI * 2 - Math.PI / 2;
    const middle = (tip + next) / 2;
    if (i === 0) {
      c.moveTo(Math.cos(tip) * size, Math.sin(tip) * size);
    }
    c.quadraticCurveTo(Math.cos(middle) * inner, Math.sin(middle) * inner, Math.cos(next) * size, Math.sin(next) * size);
  }
  c.closePath();
  c.fill();
  c.restore();

  const core = c.createRadialGradient(x, y, 0, x, y, size * 0.4);
  core.addColorStop(0, "rgba(255, 255, 255, 1)");
  core.addColorStop(1, "rgba(255, 255, 255, 0)");
  c.fillStyle = core;
  c.beginPath();
  c.arc(x, y, size * 0.4, 0, Math.PI * 2);
  c.fill();
}

// the star's fortune emotes circling it on a tilted ring. Drawn in two passes,
// the far side behind the star and the near side in front of it. emoteSize is optional (18 if left out)
function drawOrbit(c, star, x, y, radius, time, front, emoteSize) {
  const fullSize = emoteSize || 18;
  const count = star.emotes.length;
  const ringX = radius * 2.6 + 12;
  const ringY = ringX * 0.38;
  const tilt = -0.35;
  const turn = calmMode ? 0.6 : time / 6000 + star.id;
  for (let i = 0; i < count; i++) {
    const angle = turn + (i / count) * Math.PI * 2;
    // sin is positive on the near half of the ring
    const depth = Math.sin(angle);
    if ((depth >= 0) !== front) {
      continue;
    }
    const picture = emotePicture(star.emotes[i]);
    if (!picture.complete || !picture.naturalWidth) {
      continue;
    }
    const ox = Math.cos(angle) * ringX;
    const oy = Math.sin(angle) * ringY;
    const px = x + ox * Math.cos(tilt) - oy * Math.sin(tilt);
    const py = y + ox * Math.sin(tilt) + oy * Math.cos(tilt);
    const iconSize = fullSize * (0.85 + depth * 0.15);
    c.globalAlpha = 0.6 + depth * 0.3;
    c.drawImage(picture, px - iconSize / 2, py - iconSize / 2, iconSize, iconSize);
  }
  c.globalAlpha = 1;
}

// a connection: a soft wide glow, a thin bright line, and little motes of light drifting along it.
// It fades out near each star so the line seems to come out of the star's glow
function drawLink(c, a, b, time) {
  const ax = a.x * skyPixelW;
  const ay = a.y * skyPixelH;
  const bx = b.x * skyPixelW;
  const by = b.y * skyPixelH;
  const colorA = colorForCount(a.rarity);
  const colorB = colorForCount(b.rarity);

  const glowLine = c.createLinearGradient(ax, ay, bx, by);
  glowLine.addColorStop(0, rgba(colorA, 0));
  glowLine.addColorStop(0.18, rgba(colorA, 0.22));
  glowLine.addColorStop(0.82, rgba(colorB, 0.22));
  glowLine.addColorStop(1, rgba(colorB, 0));
  c.strokeStyle = glowLine;
  c.lineWidth = 6;
  c.beginPath();
  c.moveTo(ax, ay);
  c.lineTo(bx, by);
  c.stroke();

  const coreLine = c.createLinearGradient(ax, ay, bx, by);
  coreLine.addColorStop(0, rgba(whiteColor, 0));
  coreLine.addColorStop(0.18, rgba(mixColor(colorA, whiteColor, 0.6), 0.75));
  coreLine.addColorStop(0.82, rgba(mixColor(colorB, whiteColor, 0.6), 0.75));
  coreLine.addColorStop(1, rgba(whiteColor, 0));
  c.strokeStyle = coreLine;
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(ax, ay);
  c.lineTo(bx, by);
  c.stroke();

  if (calmMode) {
    return;
  }
  // one mote drifts each way, at different speeds
  for (let k = 0; k < 2; k++) {
    let t = (time / (2600 + k * 900) + a.id * 0.13 + b.id * 0.07 + k * 0.5) % 1;
    if (k === 1) {
      t = 1 - t;
    }
    const mx = ax + (bx - ax) * t;
    const my = ay + (by - ay) * t;
    const fade = Math.sin(Math.PI * t);
    const mote = c.createRadialGradient(mx, my, 0, mx, my, 5);
    mote.addColorStop(0, rgba(whiteColor, 0.9 * fade));
    mote.addColorStop(1, rgba(mixColor(colorA, colorB, t), 0));
    c.fillStyle = mote;
    c.beginPath();
    c.arc(mx, my, 5, 0, Math.PI * 2);
    c.fill();
  }
}

function drawConstellation(now) {
  const time = performance.now();
  skyPen.clearRect(0, 0, skyPixelW, skyPixelH);
  const actives = activeStars().filter(function (star) {
    return star.id !== arrivingStarId;
  });

  // lines between connected stars
  skyPen.save();
  skyPen.globalCompositeOperation = "lighter";
  skyPen.lineCap = "round";
  for (let i = 0; i < actives.length; i++) {
    const links = linkedStars(actives[i]);
    for (let j = 0; j < links.length; j++) {
      if (links[j].id > actives[i].id && links[j].id !== arrivingStarId) {
        drawLink(skyPen, actives[i], links[j], time);
      }
    }
  }
  skyPen.restore();

  for (let i = 0; i < actives.length; i++) {
    const star = actives[i];
    const x = star.x * skyPixelW;
    const y = star.y * skyPixelH;
    const radius = starRadius(star);
    const color = colorForCount(star.rarity);
    const fill = fillFraction(star, now);
    const twinkle = calmMode ? 1 : 0.8 + 0.2 * Math.sin(time / 700 + star.id * 1.7);

    if (showLinkRange && skyEditing) {
      skyPen.strokeStyle = "rgba(255, 255, 255, 0.12)";
      skyPen.setLineDash([4, 6]);
      skyPen.beginPath();
      skyPen.arc(x, y, linkReach * skyPixelW, 0, Math.PI * 2);
      skyPen.stroke();
      skyPen.setLineDash([]);
    }

    // emotes on the far side of the ring, then the star, then emotes on the near side
    drawOrbit(skyPen, star, x, y, radius, time, false);
    skyPen.save();
    skyPen.globalCompositeOperation = "lighter";
    const spin = calmMode ? 0 : time / 9000 + star.id;
    drawStarShape(skyPen, x, y, radius * 0.95, star.rarity, twinkle + (fill >= 1 ? 0.3 : 0), spin);
    skyPen.restore();
    drawOrbit(skyPen, star, x, y, radius, time, true);

    // a thin ring shows how full it is
    skyPen.lineWidth = 2;
    skyPen.strokeStyle = "rgba(255, 255, 255, 0.12)";
    skyPen.beginPath();
    skyPen.arc(x, y, radius + 7, 0, Math.PI * 2);
    skyPen.stroke();
    skyPen.strokeStyle = rgba(mixColor(color, whiteColor, 0.3), fill >= 1 ? 1 : 0.8);
    skyPen.beginPath();
    skyPen.arc(x, y, radius + 7, -Math.PI / 2, -Math.PI / 2 + fill * Math.PI * 2);
    skyPen.stroke();

    // full stars get a softly pulsing glow on their ring
    if (fill >= 1) {
      const pulse = calmMode ? 0.6 : 0.5 + 0.5 * Math.sin(time / 400);
      skyPen.save();
      skyPen.globalCompositeOperation = "lighter";
      skyPen.strokeStyle = rgba(mixColor(color, whiteColor, 0.5), 0.35 + pulse * 0.4);
      skyPen.lineWidth = 3 + pulse * 2;
      skyPen.shadowColor = rgba(color, 0.9);
      skyPen.shadowBlur = 12;
      skyPen.beginPath();
      skyPen.arc(x, y, radius + 7, 0, Math.PI * 2);
      skyPen.stroke();
      skyPen.restore();
    }

    skyPen.fillStyle = "rgba(255, 255, 255, 0.8)";
    skyPen.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
    skyPen.textAlign = "center";
    skyPen.fillText(star.name, x, y + radius + 24);

    // in edit mode, a small x to take the star out
    if (skyEditing) {
      const bx = x + radius + 10;
      const by = y - radius - 10;
      skyPen.fillStyle = "rgba(0, 0, 0, 0.7)";
      skyPen.beginPath();
      skyPen.arc(bx, by, 9, 0, Math.PI * 2);
      skyPen.fill();
      skyPen.strokeStyle = "rgba(255, 255, 255, 0.85)";
      skyPen.lineWidth = 1.6;
      skyPen.beginPath();
      skyPen.moveTo(bx - 3.5, by - 3.5);
      skyPen.lineTo(bx + 3.5, by + 3.5);
      skyPen.moveTo(bx + 3.5, by - 3.5);
      skyPen.lineTo(bx - 3.5, by + 3.5);
      skyPen.stroke();
    }
  }

  // sparks from collecting, flying up toward the stardust count
  skyPen.save();
  skyPen.globalCompositeOperation = "lighter";
  for (let i = skyParticles.length - 1; i >= 0; i--) {
    const bit = skyParticles[i];
    bit.age++;
    if (bit.age > bit.life) {
      skyParticles.splice(i, 1);
      continue;
    }
    bit.vy -= 0.12;
    bit.x += bit.vx;
    bit.y += bit.vy;
    skyPen.fillStyle = rgba(bit.color, 1 - bit.age / bit.life);
    skyPen.beginPath();
    skyPen.arc(bit.x, bit.y, bit.size, 0, Math.PI * 2);
    skyPen.fill();
  }
  skyPen.restore();
}

function skyLoop() {
  if (!skyVisible) {
    skyLooping = false;
    return;
  }
  drawConstellation(nowTime());
  requestAnimationFrame(skyLoop);
}

function startSkyLoop() {
  if (!skyLooping) {
    skyLooping = true;
    requestAnimationFrame(skyLoop);
  }
}

function renderSky() {
  sizeSkyCanvas();
  updateSkyHeader();
  drawConstellation(nowTime());
}

/* ---------- clicking, hovering and dragging ---------- */

function pointerSpot(event) {
  const box = skyCanvas.getBoundingClientRect();
  return { x: event.clientX - box.left, y: event.clientY - box.top };
}

function starAt(spot) {
  const actives = activeStars();
  for (let i = actives.length - 1; i >= 0; i--) {
    const star = actives[i];
    const dx = spot.x - star.x * skyPixelW;
    const dy = spot.y - star.y * skyPixelH;
    if (dx * dx + dy * dy <= Math.pow(starRadius(star) + 14, 2)) {
      return star;
    }
  }
  return null;
}

function removeButtonAt(spot) {
  const actives = activeStars();
  for (let i = 0; i < actives.length; i++) {
    const star = actives[i];
    const radius = starRadius(star);
    const dx = spot.x - (star.x * skyPixelW + radius + 10);
    const dy = spot.y - (star.y * skyPixelH - radius - 10);
    if (dx * dx + dy * dy <= 144) {
      return star;
    }
  }
  return null;
}

function floatText(text, x, y) {
  const label = document.createElement("span");
  label.className = "float-text";
  label.textContent = text;
  label.style.left = x + "px";
  label.style.top = y + "px";
  skyArea.appendChild(label);
  label.animate([
    { transform: "translate(-50%, 0)", opacity: 1 },
    { transform: "translate(-50%, -60px)", opacity: 0 }
  ], { duration: 1400, easing: "ease-out" }).finished.then(function () {
    label.remove();
  });
}

function showSkyTip(star, spot) {
  if (!star) {
    skyTip.classList.remove("show");
    return;
  }
  const now = nowTime();
  const left = star.lastCollected + fillMs(star) - now;
  let state = left <= 0 ? "Full, click to collect" : "Full in " + formatWait(left);
  if (skyEditing) {
    state = "Drag to move";
  }
  skyTip.innerHTML = "<strong>" + safeText(star.name) + "</strong> · Lv " + star.level + "<br>" +
    wholeNumber(fillAmount(star) * fillFraction(star, now)) + " / " + wholeNumber(fillAmount(star)) + " stardust<br>" + state;
  skyTip.style.left = spot.x + "px";
  skyTip.style.top = spot.y + "px";
  skyTip.classList.add("show");
}

// holding a finger on the map shows a star's info, so the browser's own menu shouldn't pop up
skyCanvas.addEventListener("contextmenu", function (event) {
  event.preventDefault();
});

skyCanvas.addEventListener("pointerdown", function (event) {
  const spot = pointerSpot(event);
  if (skyEditing) {
    const removing = removeButtonAt(spot);
    if (removing) {
      setActive(removing, false);
      renderSky();
      return;
    }
    dragStar = starAt(spot);
    if (dragStar) {
      skyCanvas.setPointerCapture(event.pointerId);
    }
    return;
  }
  // nothing happens until it's let go, so holding shows the info without collecting
  pressedStar = starAt(spot);
  pressedAt = performance.now();
  if (pressedStar) {
    skyCanvas.setPointerCapture(event.pointerId);
    clearTimeout(holdTimer);
    holdTimer = setTimeout(function () {
      if (pressedStar) {
        showSkyTip(pressedStar, spot);
      }
    }, holdTime);
  }
});

// a quick tap or click on a star collects it
// withMouse is true for a mouse, which keeps showing the info while it hovers. Fingers have no hover
function tapStar(star, spot, withMouse) {
  // nothing to collect yet, so leave its timer alone
  if (fillAmount(star) * fillFraction(star, nowTime()) < 1) {
    floatText("Not ready yet", star.x * skyPixelW, star.y * skyPixelH - starRadius(star) - 20);
    showSkyTip(withMouse ? star : null, spot);
    return;
  }
  const got = collectStar(star, nowTime());
  const x = star.x * skyPixelW;
  const y = star.y * skyPixelH;
  let text = "+" + wholeNumber(got.amount) + " ✦";
  if (got.weekCrystals >= 0.05) {
    text += "  +" + (Math.round(got.weekCrystals * 10) / 10) + " ◆";
  }
  if (got.doubled) {
    text += " Lucky!";
  }
  if (got.prism) {
    text += " Prism!";
  }
  if (got.crystal) {
    text += " Found a crystal!";
  }
  floatText(text, x, y - starRadius(star) - 20);
  for (let i = 0; i < 24; i++) {
    skyParticles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 3,
      vy: -1 - Math.random() * 2,
      life: 40 + Math.random() * 30,
      age: 0,
      size: 1 + Math.random() * 2,
      color: mixColor(colorForCount(star.rarity), whiteColor, 0.4)
    });
  }
  playCollect(star.rarity);
  updateSkyHeader();
  showSkyTip(withMouse ? star : null, spot);
}

skyCanvas.addEventListener("pointermove", function (event) {
  const spot = pointerSpot(event);
  if (dragStar) {
    dragStar.x = Math.min(0.95, Math.max(0.05, spot.x / skyPixelW));
    dragStar.y = Math.min(0.92, Math.max(0.08, spot.y / skyPixelH));
    if (!skyLooping) {
      drawConstellation(nowTime());
    }
    return;
  }
  // fingers only show the info by holding, not while sliding around
  if (event.pointerType !== "mouse") {
    return;
  }
  hoverStar = starAt(spot);
  skyCanvas.style.cursor = hoverStar ? (skyEditing ? "grab" : "pointer") : "default";
  showSkyTip(hoverStar, spot);
});

function endSkyDrag() {
  if (dragStar) {
    dragStar = null;
    saveSky();
    updateSkyHeader();
  }
}

skyCanvas.addEventListener("pointerup", function (event) {
  endSkyDrag();
  clearTimeout(holdTimer);
  if (!pressedStar) {
    return;
  }
  const star = pressedStar;
  const spot = pointerSpot(event);
  pressedStar = null;
  // only a quick tap that ends on the same star collects. A long hold was just for looking
  if (performance.now() - pressedAt < holdTime && starAt(spot) === star) {
    tapStar(star, spot, event.pointerType === "mouse");
  }
});

skyCanvas.addEventListener("pointercancel", function () {
  endSkyDrag();
  clearTimeout(holdTimer);
  pressedStar = null;
});

// if the browser takes the pointer away some other way (like letting go outside the window), nothing stays held
skyCanvas.addEventListener("lostpointercapture", function () {
  endSkyDrag();
  clearTimeout(holdTimer);
  pressedStar = null;
});
skyCanvas.addEventListener("pointerleave", function () {
  showSkyTip(null);
});

editSkyButton.addEventListener("click", function () {
  skyEditing = !skyEditing;
  updateSkyHeader();
  drawConstellation(nowTime());
});

addSlotButton.addEventListener("click", function () {
  openStarDrawer("pick");
});

// click the name to rename the constellation
skyNameText.addEventListener("click", function () {
  skyNameText.contentEditable = "true";
  skyNameText.focus();
  document.getSelection().selectAllChildren(skyNameText);
});

skyNameText.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    skyNameText.blur();
  }
});

skyNameText.addEventListener("blur", function () {
  skyNameText.contentEditable = "false";
  const name = skyNameText.textContent.trim().slice(0, 40);
  skyState.name = name || "My Constellation";
  saveSky();
  updateSkyHeader();
});

/* ---------- Add to Constellation (under today's reading) ---------- */

// shows the button only for today's real wish, and only until it's been added
function updateAddButton() {
  const today = shownFortune && todaysFortune && shownFortune === todaysFortune && alreadyWatched();
  addStarButton.hidden = !today;
  if (!today) {
    return;
  }
  const added = skyState.addedDate === getToday();
  addStarButton.disabled = added;
  addStarButton.textContent = added ? "Added to your collection ✓" : "✦ Add to Constellation";
}

addStarButton.addEventListener("click", function () {
  if (skyState.addedDate === getToday() || !shownFortune) {
    return;
  }
  addShownStar(false);
});

// turns the reading on screen into a star, with the whole animation.
// debug stars (from the debug panel) don't use up today's add
function addShownStar(debug) {
  if (skyState.stars.length >= storageLimit()) {
    showToast("Your star storage is full. Scrap a star to make room.");
    openStarDrawer("browse");
    return;
  }
  const star = addStar(shownFortune, debug);
  if (!debug) {
    skyState.addedDate = getToday();
  }
  // it equips itself when there's a free slot. The canvas is measured first so its spot fits the real size
  sizeSkyCanvas();
  if (activeStars().length < slotLimit()) {
    setActive(star, true);
    arrivingStarId = star.id;
  }
  saveSky();
  addStarButton.disabled = true;
  playOrb(star.rarity);
  if (calmMode) {
    arrivingStarId = null;
    showToast(star.name + (star.active ? " joined your constellation" : " joined your collection"));
    updateAddButton();
    renderSky();
    return;
  }
  starToOrb(star);
}

// the debug panel's "Add with animation": the reading on screen becomes a debug star, as many times as you like
function debugAddShownStar() {
  if (!shownFortune || result.hidden || document.body.classList.contains("adding")) {
    showToast("Make or fake a wish first, so there's a reading to turn into a star");
    return;
  }
  window.scrollTo(0, 0);
  addShownStar(true);
}

// The new star forms in the middle of the fortune while the fortune fades out. It hovers for a moment,
// then flies to its place in the constellation (or into the star bag at the top if the sky is full)
function starToOrb(star) {
  const color = colorForCount(star.rarity);
  const toSky = star.active;

  // the page can't be scrolled while this plays. This goes first so the measuring below sees the final layout
  document.body.classList.add("adding");

  // the middle of the area under the nav bar, which is where the layout centers the fortune
  const resultBox = result.getBoundingClientRect();
  const navSpace = parseFloat(getComputedStyle(result).paddingTop) || 0;
  const centerX = resultBox.left + resultBox.width / 2;
  const centerY = resultBox.top + navSpace + (resultBox.height - navSpace) / 2;

  // everything on the fortune fades out while the star forms
  const parts = [document.querySelector(".plate"), emotes, document.querySelector(".after"), addStarButton, document.querySelector(".to-sky")];
  for (let i = 0; i < parts.length; i++) {
    parts[i].animate([
      { opacity: 1, filter: "blur(0)" },
      { opacity: 0, filter: "blur(6px)" }
    ], { duration: 700, easing: "ease-in", fill: "forwards" });
  }

  // sparks rushing inward on the wish canvas
  const orbBox = wishCanvas.getBoundingClientRect();
  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 120 + Math.random() * 160;
    sparks.push({
      x: centerX - orbBox.left + Math.cos(angle) * distance,
      y: centerY - orbBox.top + Math.sin(angle) * distance,
      vx: -Math.cos(angle) * distance / 22,
      vy: -Math.sin(angle) * distance / 22,
      life: 26,
      age: 0,
      size: 1.5 + Math.random() * 2,
      color: mixColor(color, whiteColor, 0.4)
    });
  }

  const orb = document.createElement("div");
  orb.className = "star-orb";
  const canvas = document.createElement("canvas");
  const boxSize = 360;
  const scale = window.devicePixelRatio || 1;
  canvas.width = boxSize * scale;
  canvas.height = boxSize * scale;
  orb.appendChild(canvas);
  const label = document.createElement("p");
  label.className = "star-orb-label";
  label.textContent = "✦ " + star.name + " joined your " + (toSky ? "constellation" : "collection");
  orb.appendChild(label);
  document.body.appendChild(orb);
  label.animate([{ opacity: 0, transform: "translate(-50%, 10px)" }, { opacity: 1, transform: "translate(-50%, 0)" }], { duration: 500, delay: 1300, fill: "both" });

  const pen = canvas.getContext("2d");
  const started = performance.now();
  const flightAt = 2600;
  const flightLength = 1200;
  // how big the star is where it ends up, compared to the big one drawn here
  const endScale = toSky ? starRadius(star) * 0.95 / 30.8 : 0.3;
  let flying = false;
  let startX = centerX;
  let startY = centerY;
  let lastX = centerX;
  let lastY = centerY;
  let backAngle = Math.PI / 2;
  let scrollFrom = 0;
  let scrollTo = 0;
  let bulge = 0;

  // where the star is headed right now. It's measured every frame, so it stays right while the page scrolls
  function targetSpot() {
    if (toSky) {
      const box = skyCanvas.getBoundingClientRect();
      return { x: box.left + star.x * skyPixelW, y: box.top + star.y * skyPixelH };
    }
    const box = starsButton.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  }

  // where to scroll so the star's spot is well on screen, preferring the top of the constellation
  function scrollForSky() {
    const top = window.scrollY;
    const sectionTop = skySection.getBoundingClientRect().top + top;
    const spotTop = skyCanvas.getBoundingClientRect().top + top + star.y * skyPixelH;
    const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-height")) || 48;
    const lowest = spotTop - window.innerHeight + 100;
    const highest = spotTop - navHeight - 100;
    const wanted =Math.min(Math.max(sectionTop, lowest), Math.max(lowest, highest));
    const most = document.documentElement.scrollHeight - window.innerHeight;
    return Math.max(0, Math.min(wanted, most));
  }

  function frame(time) {
    if (!orb.isConnected) {
      return;
    }
    const age = time - started;
    let flightAge = 0;
    let moveX = centerX;
    let moveY = centerY;
    let size = 1;

    if (age >= flightAt) {
      if (!flying) {
        flying = true;
        scrollFrom = window.scrollY;
        scrollTo = toSky ? scrollForSky() : scrollFrom;
        label.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" });
        const aim = targetSpot();
        // the path bows a little to the side
        bulge = (aim.x < startX ? -1 : 1) * Math.min(90, Math.hypot(aim.x - startX, aim.y - startY) * 0.18);
      }
      flightAge = age - flightAt;
      const t = clamp(flightAge / flightLength);
      const e = easeInOut(t);
      window.scrollTo({ top: scrollFrom + (scrollTo - scrollFrom) * e, left: 0, behavior: "instant" });
      const aim = targetSpot();
      moveX = startX + (aim.x - startX) * e + Math.sin(Math.PI * e) * bulge;
      moveY = startY + (aim.y - startY) * e;
      size = 1 + (endScale - 1) * e;
      if (Math.hypot(moveX - lastX, moveY - lastY) > 0.5) {
        backAngle = Math.atan2(lastY - moveY, lastX - moveX);
      }
      lastX = moveX;
      lastY = moveY;
    }

    orb.style.transform = "translate(" + moveX + "px, " + moveY + "px) translate(-50%, -50%) scale(" + size + ")";
    const trail = flying ? { angle: backAngle, length: Math.min(110, flightAge * 0.25) * (1 - clamp(flightAge / flightLength) * 0.7) } : null;
    drawNewStar(pen, star, color, age, trail, boxSize, scale);

    if (flying && flightAge >= flightLength) {
      land();
      return;
    }
    requestAnimationFrame(frame);
  }

  function land() {
    orb.remove();
    arrivingStarId = null;
    document.body.classList.remove("adding");
    // the fortune comes back: instantly if the page has scrolled away, with a fade if it's still on screen
    for (let i = 0; i < parts.length; i++) {
      const old = parts[i].getAnimations();
      for (let j = 0; j < old.length; j++) {
        old[j].cancel();
      }
      if (!toSky) {
        parts[i].animate([
          { opacity: 0, filter: "blur(6px)" },
          { opacity: 1, filter: "blur(0)" }
        ], { duration: 700, easing: "ease-out" });
      }
    }
    updateAddButton();
    renderSky();
    if (toSky) {
      // a burst of light where the star lands
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        skyParticles.push({
          x: star.x * skyPixelW,
          y: star.y * skyPixelH,
          vx: Math.cos(angle) * 3,
          vy: Math.sin(angle) * 3,
          life: 50,
          age: 0,
          size: 1.5,
          color: mixColor(color, whiteColor, 0.4)
        });
      }
      startSkyLoop();
    } else {
      starsButton.animate([
        { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)" },
        { transform: "scale(1.35)", boxShadow: "0 0 20px 6px rgba(255, 255, 255, 0.6)", offset: 0.4 },
        { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)" }
      ], { duration: 800, easing: "ease-out" });
      showToast(star.name + " is in your collection. Add it to your constellation from there.");
    }
  }

  requestAnimationFrame(frame);
}

// one frame of a new star being made: it grows in with a spin, flashes a ring and a burst of light,
// then its emotes spin out around it. While it flies, trail has the direction the light streaks out behind it
function drawNewStar(pen, star, color, age, trail, boxSize, scale) {
  pen.setTransform(scale, 0, 0, scale, 0, 0);
  pen.clearRect(0, 0, boxSize, boxSize);
  const grow = clamp((age - 400) / 700);
  if (grow <= 0) {
    return;
  }
  const middle = boxSize / 2;
  pen.save();
  pen.translate(middle, middle);
  pen.scale(1.4, 1.4);
  pen.globalCompositeOperation = "lighter";

  // the trail while it flies
  if (trail && trail.length > 0) {
    const backX = Math.cos(trail.angle);
    const backY = Math.sin(trail.angle);
    const streak = pen.createLinearGradient(0, 0, backX * trail.length, backY * trail.length);
    streak.addColorStop(0, rgba(mixColor(color, whiteColor, 0.5), 0.8));
    streak.addColorStop(1, rgba(color, 0));
    pen.fillStyle = streak;
    pen.beginPath();
    pen.moveTo(-backY * 9, backX * 9);
    pen.lineTo(backX * trail.length, backY * trail.length);
    pen.lineTo(backY * 9, -backX * 9);
    pen.closePath();
    pen.fill();
  }

  // grows a little past full size and settles back, spinning fast and slowing down
  const overshoot = 1 + 1.7 * Math.pow(grow - 1, 3) + 0.7 * Math.pow(grow - 1, 2);
  const size = 22 * overshoot;
  const spin = Math.pow(1 - grow, 2) * 6 + age / 9000;
  const twinkle = 1 + 0.15 * Math.sin(age / 300);

  // when it settles: a ring of light going out and a burst of long spikes
  const flash = clamp((age - 850) / 650);
  if (flash > 0 && flash < 1) {
    pen.strokeStyle = rgba(mixColor(color, whiteColor, 0.4), 1 - flash);
    pen.lineWidth = 2 * (1 - flash) + 0.5;
    pen.beginPath();
    pen.arc(0, 0, 18 + flash * 100, 0, Math.PI * 2);
    pen.stroke();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + 0.2;
      drawSpike(pen, 0, 0, angle, 40 + flash * 80, 3, color, 0.7 * (1 - flash));
    }
  }

  // the emotes start at the star and spin out to their ring
  const showOrbit = age > 1000;
  const ring = 18 * easeOut(clamp((age - 1000) / 700));
  pen.globalCompositeOperation = "source-over";
  if (showOrbit) {
    drawOrbit(pen, star, 0, 0, ring, age * 3, false);
  }
  pen.globalCompositeOperation = "lighter";
  drawStarShape(pen, 0, 0, size, star.rarity, twinkle + (1 - flash) * 0.4, spin);
  pen.globalCompositeOperation = "source-over";
  if (showOrbit) {
    drawOrbit(pen, star, 0, 0, ring, age * 3, true);
  }
  pen.restore();
}

/* ---------- testing tools (called from the debug panel in luck.js) ---------- */

function debugAddStars(rarity, amount) {
  let added = 0;
  for (let i = 0; i < amount; i++) {
    let pick = rarity;
    if (!pick) {
      // random rarity with the normal odds
      let roll = Math.random() * 100;
      pick = 5;
      for (let r = 0; r < odds.length; r++) {
        if (roll < odds[r]) {
          pick = r + 1;
          break;
        }
        roll -= odds[r];
      }
    }
    if (addStar(pickFortune(pick, Math.random()), true)) {
      added++;
    }
  }
  renderSky();
  refreshStarDrawer();
  showToast(added ? "Added " + added + " debug star" + (added === 1 ? "" : "s") : "Star storage is full");
}

// jumps this week's stardust up to a later rank, so the climb animation plays
function debugRankUp(steps) {
  const target = Math.min(rankList.length - 1, rankIndexFor(skyState.stardust) + steps);
  const needed = rankList[target].need - skyState.stardust;
  if (needed > 0) {
    earnDust(needed, nowTime());
  }
  saveSky();
  updateSkyHeader();
}

// jumps to the first rank of the next tier, to see the bigger version
function debugNextTier() {
  let target = rankIndexFor(skyState.stardust) + 1;
  while (target < rankList.length - 1 && rankList[target].tier === rankList[target - 1].tier) {
    target++;
  }
  debugRankUp(target - rankIndexFor(skyState.stardust));
}

function debugResetRank() {
  skyState.stardust = 0;
  shownRank = null;
  saveSky();
  updateSkyHeader();
}

function debugEachActive(action) {
  const actives = activeStars();
  for (let i = 0; i < actives.length; i++) {
    action(actives[i]);
  }
  saveSky();
  renderSky();
  refreshStarDrawer();
}

function shiftTime(ms) {
  let shift = 0;
  try {
    shift = Number(localStorage.getItem("dailystargazing-timeshift")) || 0;
    localStorage.setItem("dailystargazing-timeshift", String(shift + ms));
  } catch (error) {
    // can't move the clock without storage
  }
}

/* ---------- start up ---------- */

loadSky();

document.addEventListener("DOMContentLoaded", function () {
  const week = refreshSky();
  renderSky();
  if (week) {
    showToast("Last week you reached " + rankName(week.rank) + ": " + (Math.floor((week.earned || 0) * 10) / 10) + " crystals \u00D7 " +
      (week.percent || rankList[week.rank].bonus) + "% = " + week.crystals + " stellar crystal" + (week.crystals === 1 ? "" : "s"));
  }

  // only animate the sky while it's on screen
  const watcher = new IntersectionObserver(function (entries) {
    skyVisible = entries[0].isIntersecting;
    if (skyVisible) {
      sizeSkyCanvas();
      startSkyLoop();
    }
  });
  watcher.observe(skySection);

  // catch up every half minute, so overflow and timers stay current
  setInterval(function () {
    refreshSky();
    updateSkyHeader();
  }, 30000);
});

window.addEventListener("resize", function () {
  sizeSkyCanvas();
  drawConstellation(nowTime());
});
