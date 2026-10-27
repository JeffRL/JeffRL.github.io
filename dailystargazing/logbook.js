// The logbook: saves each day's result in the browser and shows it in a book with three tabs
// (Collection, Daily and Graph). Uses getToday, emoteName, pickFortune, odds from luck.js.

const logKey = "dailystargazing-log";

// darker versions of the result colors so they show up on the paper pages
// (white, green, blue, purple, yellow; white turns into a slate gray ink)
const inkColors = ["#5b6474", "#2e8b4e", "#2a6fd0", "#b5359e", "#a86d00"];

const bookOverlay = document.getElementById("bookOverlay");
const book = document.getElementById("book");
const cover = document.getElementById("cover");
const leaf = document.getElementById("leaf");
const leafFront = document.getElementById("leafFront");
const leafBack = document.getElementById("leafBack");
const pageLeft = document.getElementById("pageLeft");
const pageRight = document.getElementById("pageRight");
const ribbonButtons = document.querySelectorAll("#ribbons .ribbon");
const bookClose = document.getElementById("bookClose");
const logButton = document.getElementById("logButton");
const bookTop = document.getElementById("bookTop");
const readingPopup = document.getElementById("readingPopup");
const readingBody = document.getElementById("readingBody");
const readingClose = document.getElementById("readingClose");
const resetPopup = document.getElementById("resetPopup");

let bookOpen = false;
let bookBusy = false;
let currentView = "collection";
let dayIndex = 0;
let graphRange = "week";
// the graph shows either luck over time or stardust earned per week
let graphMode = "luck";

/* ---------- saving ---------- */

function readLog() {
  try {
    const saved = JSON.parse(localStorage.getItem(logKey));
    if (Array.isArray(saved)) {
      return saved;
    }
  } catch (error) {
    // nothing saved yet, or storage is blocked
  }
  return [];
}

function saveLog(log) {
  // newest first
  log.sort(function (a, b) {
    return a.date < b.date ? 1 : -1;
  });
  try {
    localStorage.setItem(logKey, JSON.stringify(log));
  } catch (error) {
    // can't save, the logbook just won't remember this one
  }
}

// a reading is known by its rarity and emotes, so adding readings later doesn't mix them up
function fortuneId(fortune) {
  return fortune.rarity + "|" + fortune.emotes.join(",");
}

// saves today's result, once per day
function recordFortune(fortune) {
  const log = readLog();
  const today = getToday();
  for (let i = 0; i < log.length; i++) {
    if (log[i].date === today) {
      return;
    }
  }
  log.push({
    date: today,
    time: new Date(nowTime()).toISOString(),
    rarity: fortune.rarity,
    emotes: fortune.emotes,
    text: fortune.text
  });
  saveLog(log);
}

function logEntryFor(date) {
  const log = readLog();
  for (let i = 0; i < log.length; i++) {
    if (log[i].date === date) {
      return log[i];
    }
  }
  return null;
}

// the first day each reading was found
function firstFound() {
  const log = readLog();
  const found = {};
  for (let i = 0; i < log.length; i++) {
    const id = fortuneId(log[i]);
    if (!found[id] || log[i].date < found[id]) {
      found[id] = log[i].date;
    }
  }
  return found;
}

/* ---------- small helpers ---------- */

function dateKey(day) {
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const date = String(day.getDate()).padStart(2, "0");
  return day.getFullYear() + "-" + month + "-" + date;
}

// "2026-10-27" to a Date at midnight, in the visitor's time zone
function keyToDate(key) {
  const parts = key.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function longDate(key) {
  return keyToDate(key).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function shortDate(key) {
  return keyToDate(key).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function starText(count) {
  let stars = "";
  for (let i = 0; i < count; i++) {
    stars += "★";
  }
  return stars;
}

// keeps saved text from being read as HTML
function safeText(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function emoteImages(emoteList, className) {
  let html = "";
  for (let i = 0; i < emoteList.length; i++) {
    html += '<img class="' + className + '" src="resources/' + safeText(emoteList[i]) + '.png" alt="' + safeText(emoteName(emoteList[i])) + '" draggable="false">';
  }
  return html;
}

function isSpread() {
  return window.innerWidth >= 760;
}

/* ---------- opening, closing and flipping ---------- */

function openBook() {
  if (bookOpen || bookBusy) {
    return;
  }
  bookOpen = true;
  // clear out what's left over from the last time it closed
  const parts = [book, cover, pageLeft, bookOverlay];
  for (let i = 0; i < parts.length; i++) {
    const old = parts[i].getAnimations();
    for (let j = 0; j < old.length; j++) {
      old[j].cancel();
    }
  }
  renderView(currentView);
  showActiveRibbon();
  bookOverlay.hidden = false;
  bookOverlay.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: "forwards" });

  cover.style.visibility = "visible";

  bookBusy = true;
  const shift = isSpread() ? -book.offsetWidth / 4 : 0;
  const from = logButton.getBoundingClientRect();
  const to = book.getBoundingClientRect();
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);

  // closed: the cover is on top of the right page and there's no left page yet
  cover.style.zIndex = 4;
  pageLeft.style.opacity = 0;

  // 1. the closed book grows out of the button
  const grow = book.animate([
    { transform: "translate(" + dx + "px, " + dy + "px) scale(0.06)", opacity: 0 },
    { transform: "translateX(" + shift + "px) scale(1)", opacity: 1 }
  ], { duration: 500, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "forwards" });

  grow.finished.then(function () {
    // 2. the cover swings open while the book slides back to the middle
    const turn = { duration: 900, easing: "cubic-bezier(0.45, 0, 0.2, 1)", fill: "forwards" };
    book.animate([
      { transform: "translateX(" + shift + "px)" },
      { transform: "translateX(0)" }
    ], turn);
    cover.animate([{ transform: "rotateY(0deg)" }, { transform: "rotateY(-180deg)" }], turn);
    // once the cover is standing straight up, it goes under the pages, so it lands
    // beneath the left page like a real book instead of covering it
    setTimeout(function () {
      cover.style.zIndex = 0;
    }, turn.duration * 0.45);
    pageLeft.animate([
      { opacity: 0 },
      { opacity: 0, offset: 0.45 },
      { opacity: 1, offset: 0.8 },
      { opacity: 1 }
    ], turn).finished.then(function () {
      pageLeft.style.opacity = 1;
      bookBusy = false;
    });
  });
}

function closeBook() {
  if (!bookOpen || bookBusy) {
    return;
  }
  readingPopup.hidden = true;
  resetPopup.hidden = true;
  bookTop.hidden = true;
  bookBusy = true;
  const shift = isSpread() ? -book.offsetWidth / 4 : 0;
  const turn = { duration: 800, easing: "cubic-bezier(0.45, 0, 0.2, 1)", fill: "forwards" };

  // 1. the left page goes away as the cover lifts, then the cover comes back on top
  //    once it's standing straight up and swings shut over the right page
  cover.style.visibility = "visible";
  cover.animate([{ transform: "rotateY(-180deg)" }, { transform: "rotateY(0deg)" }], turn);
  setTimeout(function () {
    cover.style.zIndex = 4;
  }, turn.duration * 0.45);
  pageLeft.animate([
    { opacity: 1 },
    { opacity: 1, offset: 0.15 },
    { opacity: 0, offset: 0.45 },
    { opacity: 0 }
  ], turn);
  book.animate([
    { transform: "translateX(0)" },
    { transform: "translateX(" + shift + "px)" }
  ], turn).finished.then(function () {
    // 2. the closed book shrinks back into the button
    const from = book.getBoundingClientRect();
    const to = logButton.getBoundingClientRect();
    const dx = to.left + to.width / 2 - (from.left + from.width / 2) + shift;
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    book.animate([
      { transform: "translateX(" + shift + "px) scale(1)", opacity: 1 },
      { transform: "translate(" + dx + "px, " + dy + "px) scale(0.06)", opacity: 0 }
    ], { duration: 400, easing: "cubic-bezier(0.5, 0, 0.8, 0.4)", fill: "forwards" });
    return bookOverlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: "forwards" }).finished;
  }).then(function () {
    bookOverlay.hidden = true;
    bookOpen = false;
    bookBusy = false;
  });
}

// a page turns over the spread, like a real book: the turning page has the old right page
// printed on its front and the new left page on its back. So the text turns over with the page,
// and when it lands it looks exactly like the page underneath, which is swapped in at that moment.
// forward turns right to left (like going to the next page), backward the other way.
function flipPage(forward, change) {
  if (bookBusy) {
    change();
    return;
  }

  // phones show one page at a time, so a quick fade is cleaner than a half-width turn
  if (!isSpread()) {
    bookBusy = true;
    const pages = pageLeft.parentNode;
    pages.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: "forwards" }).finished.then(function () {
      change();
      pages.scrollTop = 0;
      return pages.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, fill: "forwards" }).finished;
    }).then(function () {
      bookBusy = false;
    });
    return;
  }

  bookBusy = true;

  // render the new pages, grab them, then put the old ones back until the turn is done
  const oldLeft = pageLeft.innerHTML;
  const oldRight = pageRight.innerHTML;
  const oldLeftScroll = pageLeft.scrollTop;
  const oldRightScroll = pageRight.scrollTop;
  const oldPoints = pageLeft.graphPoints;
  change();
  const newLeft = pageLeft.innerHTML;
  const newRight = pageRight.innerHTML;
  const newPoints = pageLeft.graphPoints;
  pageLeft.innerHTML = oldLeft;
  pageRight.innerHTML = oldRight;
  pageLeft.scrollTop = oldLeftScroll;
  pageRight.scrollTop = oldRightScroll;
  pageLeft.graphPoints = oldPoints;

  let frames = null;
  if (forward) {
    // lifts the old right page off, the new right page is already underneath it
    leafFront.innerHTML = oldRight;
    leafFront.scrollTop = oldRightScroll;
    leafBack.innerHTML = newLeft;
    leafBack.scrollTop = 0;
    pageRight.innerHTML = newRight;
    pageRight.scrollTop = 0;
    frames = [{ transform: "rotateY(0deg)" }, { transform: "rotateY(-180deg)" }];
  } else {
    // lifts the old left page off, the new left page is already underneath it
    leafBack.innerHTML = oldLeft;
    leafBack.scrollTop = oldLeftScroll;
    leafFront.innerHTML = newRight;
    leafFront.scrollTop = 0;
    pageLeft.innerHTML = newLeft;
    pageLeft.scrollTop = 0;
    pageLeft.graphPoints = newPoints;
    frames = [{ transform: "rotateY(-180deg)" }, { transform: "rotateY(0deg)" }];
  }

  leaf.style.visibility = "visible";
  const turn = leaf.animate(frames, { duration: 750, easing: "cubic-bezier(0.45, 0, 0.3, 1)" });
  turn.finished.then(function () {
    // the page has landed, so the page under it can take its content
    if (forward) {
      pageLeft.innerHTML = newLeft;
      pageLeft.scrollTop = 0;
    } else {
      pageRight.innerHTML = newRight;
      pageRight.scrollTop = 0;
    }
    pageLeft.graphPoints = newPoints;
    leaf.style.visibility = "hidden";
    leafFront.innerHTML = "";
    leafBack.innerHTML = "";
    bookBusy = false;
  });
}

function showActiveRibbon() {
  for (let i = 0; i < ribbonButtons.length; i++) {
    ribbonButtons[i].classList.toggle("active", ribbonButtons[i].getAttribute("data-view") === currentView);
  }
}

/* ---------- the three views ---------- */

function renderView(view) {
  bookTop.hidden = true;
  lastScrolled = null;
  readingPopup.hidden = true;
  resetPopup.hidden = true;
  if (view === "collection") {
    renderCollection();
  } else if (view === "daily") {
    renderDaily();
  } else {
    renderGraph();
  }
}

function renderCollection() {
  const found = firstFound();
  let total = 0;
  let foundTotal = 0;
  let index = "";
  let sections = "";

  for (let rarity = 1; rarity <= 5; rarity++) {
    let have = 0;
    let all = 0;
    let tiles = "";
    for (let i = 0; i < fortunes.length; i++) {
      const fortune = fortunes[i];
      if (fortune.rarity !== rarity) {
        continue;
      }
      all++;
      const id = fortuneId(fortune);
      if (found[id]) {
        have++;
        tiles += '<button class="tile found" data-id="' + safeText(id) + '">' +
          '<span class="tile-emotes">' + emoteImages(fortune.emotes, "tile-emote") + '</span>' +
          '<span class="tile-label">' + shortDate(found[id]) + '</span></button>';
      } else {
        tiles += '<button class="tile missing" data-id="' + safeText(id) + '">' +
          '<span class="tile-emotes">' + emoteImages(fortune.emotes, "tile-emote") + '</span>' +
          '<span class="tile-label">???</span></button>';
      }
    }
    total += all;
    foundTotal += have;

    const percent = all ? Math.round((have / all) * 100) : 0;
    const done = have === all && all > 0;
    index += '<button class="rarity-row' + (done ? " complete" : "") + '" data-rarity="' + rarity + '">' +
      '<span class="row-stars" style="color: ' + inkColors[rarity - 1] + '">' + starText(rarity) + '</span>' +
      '<span class="row-count">' + have + " / " + all + " &middot; " + percent + "%" + (done ? " &#10003;" : "") + '</span>' +
      '<span class="bar"><span style="width: ' + percent + '%; background: ' + (done ? "#c9961a" : inkColors[rarity - 1]) + '"></span></span>' +
      '</button>';

    sections += '<section class="rarity-section" id="raritySection' + rarity + '">' +
      '<h3 style="color: ' + inkColors[rarity - 1] + '">' + starText(rarity) + '</h3>' +
      '<div class="tiles">' + tiles + '</div></section>';
  }

  pageLeft.innerHTML =
    '<h2 class="book-title">Collection</h2>' +
    '<p class="book-sub">' + foundTotal + " / " + total + ' readings found. Tap a reading to open it.</p>' +
    '<div class="rarity-index">' + index + '</div>' +
    rewardTrack();
  pageRight.innerHTML = '<div class="tile-list">' + sections + '</div>';
}

// opens a reading in a popup over the book, so the list underneath stays where it was
function showDetail(id) {
  const found = firstFound();
  let fortune = null;
  for (let i = 0; i < fortunes.length; i++) {
    if (fortuneId(fortunes[i]) === id) {
      fortune = fortunes[i];
    }
  }
  if (!fortune) {
    return;
  }
  const stars = '<p class="detail-stars" style="color: ' + inkColors[fortune.rarity - 1] + '">' + starText(fortune.rarity) + "</p>";
  if (!found[id]) {
    readingBody.innerHTML = stars + '<div class="detail-emotes missing">' + emoteImages(fortune.emotes, "detail-emote") + '</div>' +
      '<p class="hint">Not found yet. Keep wishing.</p>';
  } else {
    readingBody.innerHTML = stars + '<div class="detail-emotes">' + emoteImages(fortune.emotes, "detail-emote") + '</div>' +
      '<p class="detail-date">First found on ' + longDate(found[id]) + '</p>' +
      '<p class="detail-text">' + safeText(fortune.text) + '</p>';
  }
  readingPopup.hidden = false;
  readingPopup.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
  readingPopup.querySelector(".reading-card").animate([
    { transform: "scale(0.92)", opacity: 0 },
    { transform: "none", opacity: 1 }
  ], { duration: 200, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
}

function closeReading() {
  if (readingPopup.hidden) {
    return;
  }
  readingPopup.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150 }).finished.then(function () {
    readingPopup.hidden = true;
  });
}

readingClose.addEventListener("click", closeReading);

/* ---------- resetting everything ---------- */

function openResetWarning() {
  resetPopup.hidden = false;
  resetPopup.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
  resetPopup.querySelector(".reading-card").animate([
    { transform: "scale(0.92)", opacity: 0 },
    { transform: "none", opacity: 1 }
  ], { duration: 200, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
  document.getElementById("resetCancel").focus();
}

function closeResetWarning() {
  resetPopup.hidden = true;
}

document.getElementById("resetCancel").addEventListener("click", closeResetWarning);
document.getElementById("resetConfirm").addEventListener("click", wipeAllData);
resetPopup.addEventListener("click", function (event) {
  if (event.target === resetPopup) {
    closeResetWarning();
  }
});

// tapping the dim area around the card closes it too
readingPopup.addEventListener("click", function (event) {
  if (event.target === readingPopup) {
    closeReading();
  }
});

/* ---------- back to the top ---------- */

// the part of the book being scrolled right now: the whole book on phones, or one of the two pages
let lastScrolled = null;

// scroll events don't bubble, so this listens on the way down instead
book.addEventListener("scroll", function (event) {
  const part = event.target;
  if (part !== pageLeft && part !== pageRight && !part.classList.contains("book-pages")) {
    return;
  }
  lastScrolled = part;
  bookTop.hidden = part.scrollTop <= 300;
}, true);

bookTop.addEventListener("click", function () {
  if (lastScrolled) {
    lastScrolled.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// finding readings unlocks more star storage and constellation slots (rules are in constellation.js)
function rewardTrack() {
  updateMilestone();
  const percent = completionPercent();
  const next = nextReward();
  let nextLine = "Every reward unlocked. Well done!";
  let progress = 100;
  if (next) {
    const from = next.percent - 2.5;
    progress = Math.min(100, Math.max(0, ((percent - from) / 2.5) * 100));
    nextLine = "Next at " + next.percent + "%: " + next.text;
  }
  return '<div class="reward-track">' +
    '<h3>Rewards</h3>' +
    '<p class="reward-now">' + percent.toFixed(1) + "% found</p>" +
    '<p class="reward-now">Storage ' + storageLimit() + " / 300 · Slots " + slotLimit() + " / 10 · Crystals +" + rewardTotal("crystals") + "% / 30% · " +
      "Scrapping +" + rewardTotal("scrap") + "% / 100% · Stardust +" + rewardTotal("stardust") + "% / 20%</p>" +
    '<div class="bar"><span style="width: ' + progress + '%; background: #c9961a"></span></div>' +
    '<p class="reward-next">' + nextLine + "</p>" +
    rewardList() +
    '<button class="reset-button" data-act="reset">Reset everything</button>' +
    "</div>";
}

// every reward, with the completion and number of readings each one needs
function rewardList() {
  const found = firstFound();
  let have = 0;
  for (let i = 0; i < fortunes.length; i++) {
    if (found[fortuneId(fortunes[i])]) {
      have++;
    }
  }
  let rows = "";
  for (let step = 1; step <= rewardTable.length; step++) {
    const reward = rewardAt(step);
    const needed = Math.ceil(reward.percent / 100 * fortunes.length);
    let state = "";
    let note = needed + " readings";
    if (step <= skyState.milestone) {
      state = "got";
      note = "&#10003;";
    } else if (step === skyState.milestone + 1) {
      state = "next";
      const left = Math.max(0, needed - have);
      note = left + " more reading" + (left === 1 ? "" : "s");
    }
    rows += '<li class="' + state + " " + reward.type + '"><span>' + reward.percent + "%</span><span>" + reward.text + "</span><span>" + note + "</span></li>";
  }
  return '<h4 class="reward-list-title">All rewards</h4><ol class="reward-list">' + rows + "</ol>";
}

function dayPage(entry) {
  if (!entry) {
    return '<div class="day-empty"><span>&#9733;</span><p>The rest of these pages are waiting for more wishes.</p></div>';
  }
  const time = new Date(entry.time).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return '<p class="day-date">' + longDate(entry.date) + '</p>' +
    '<p class="day-stars" style="color: ' + inkColors[entry.rarity - 1] + '">' + starText(entry.rarity) + '</p>' +
    '<div class="day-emotes">' + emoteImages(entry.emotes, "day-emote") + '</div>' +
    '<p class="day-text">' + safeText(entry.text) + '</p>' +
    '<p class="day-time">' + (entry.debug ? "Debug entry" : "Wished at " + time) + '</p>';
}

function renderDaily() {
  const log = readLog();
  if (log.length === 0) {
    pageLeft.innerHTML = '<h2 class="book-title">Daily</h2><p class="hint">No wishes yet. Your first one will show up here.</p>';
    pageRight.innerHTML = dayPage(null);
    return;
  }
  if (dayIndex > log.length - 1) {
    dayIndex = 0;
  }
  const newer = dayIndex > 0 ? '<button class="corner corner-left" data-step="-1">&#8249; Newer</button>' : "";
  const older = dayIndex + 2 < log.length ? '<button class="corner corner-right" data-step="1">Older &#8250;</button>' : "";
  pageLeft.innerHTML = dayPage(log[dayIndex]) + newer;
  pageRight.innerHTML = dayPage(log[dayIndex + 1]) + older;
}

/* ---------- graph ---------- */

// one point per day for week and month, one per month (the average) for year
function graphPoints(range) {
  const log = readLog();
  const byDate = {};
  for (let i = 0; i < log.length; i++) {
    byDate[log[i].date] = log[i];
  }
  const now = new Date(nowTime());
  const points = [];

  if (range === "year") {
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const prefix = dateKey(month).slice(0, 7);
      let sum = 0;
      let days = 0;
      for (let j = 0; j < log.length; j++) {
        if (log[j].date.slice(0, 7) === prefix) {
          sum += log[j].rarity;
          days++;
        }
      }
      points.push({
        value: days ? sum / days : null,
        label: month.toLocaleDateString(undefined, { month: "short" }),
        title: month.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
        detail: days ? days + (days === 1 ? " wish" : " wishes") : "No wishes"
      });
    }
    return points;
  }

  const length = range === "week" ? 7 : 30;
  for (let i = length - 1; i >= 0; i--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = dateKey(day);
    const entry = byDate[key];
    points.push({
      value: entry ? entry.rarity : null,
      label: range === "week" ? day.toLocaleDateString(undefined, { weekday: "short" }) : String(day.getDate()),
      title: shortDate(key),
      detail: entry ? entry.emotes.map(function (e) { return emoteEmoji[e] || ""; }).join("") : "No wish"
    });
  }
  return points;
}

function graphSvg(points, range) {
  const width = 560;
  const height = 300;
  const left = 74;
  const right = 16;
  const top = 16;
  const bottom = 40;
  const plotW = width - left - right;
  const plotH = height - top - bottom;

  function xFor(i) {
    return left + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  }
  function yFor(value) {
    return top + ((5 - value) / 4) * plotH;
  }

  let svg = '<svg class="graph" viewBox="0 0 ' + width + " " + height + '" role="img" aria-label="Luck over time">';

  // light grid lines with star labels
  for (let r = 1; r <= 5; r++) {
    svg += '<line class="grid" x1="' + left + '" x2="' + (width - right) + '" y1="' + yFor(r) + '" y2="' + yFor(r) + '"></line>';
    svg += '<text class="axis" x="' + (left - 10) + '" y="' + (yFor(r) + 4) + '" text-anchor="end">' + starText(r) + '</text>';
  }

  // which x labels to show so they don't crowd
  for (let i = 0; i < points.length; i++) {
    const show = range !== "month" || i % 5 === 0 || i === points.length - 1;
    if (show) {
      svg += '<text class="axis" x="' + xFor(i) + '" y="' + (height - 14) + '" text-anchor="middle">' + safeText(points[i].label) + '</text>';
    }
  }

  // average line
  let sum = 0;
  let count = 0;
  for (let i = 0; i < points.length; i++) {
    if (points[i].value !== null) {
      sum += points[i].value;
      count++;
    }
  }
  if (count > 1) {
    const avgY = yFor(sum / count);
    svg += '<line class="average" x1="' + left + '" x2="' + (width - right) + '" y1="' + avgY + '" y2="' + avgY + '"></line>';
    svg += '<text class="axis average-label" x="' + (width - right) + '" y="' + (avgY - 6) + '" text-anchor="end">average</text>';
  }

  // the line, broken wherever a day was skipped
  let path = "";
  let drawing = false;
  for (let i = 0; i < points.length; i++) {
    if (points[i].value === null) {
      drawing = false;
      continue;
    }
    path += (drawing ? " L" : " M") + xFor(i).toFixed(1) + " " + yFor(points[i].value).toFixed(1);
    drawing = true;
  }
  if (path) {
    svg += '<path class="line" d="' + path + '"></path>';
  }

  // dots, colored by how lucky the day was, with bigger invisible circles to make hovering easy
  for (let i = 0; i < points.length; i++) {
    if (points[i].value === null) {
      continue;
    }
    const color = inkColors[Math.round(points[i].value) - 1];
    svg += '<circle class="dot" cx="' + xFor(i) + '" cy="' + yFor(points[i].value) + '" r="5" fill="' + color + '"></circle>';
    svg += '<circle class="hit" data-point="' + i + '" cx="' + xFor(i) + '" cy="' + yFor(points[i].value) + '" r="13"></circle>';
  }

  svg += "</svg>";
  return svg;
}

// stardust earned each week for the last 12 weeks (weeks start on Monday)
function dustPoints() {
  const history = skyState.dustByWeek || {};
  const thisWeek = keyToDate(weekKey(nowTime()));
  const points = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date(thisWeek.getFullYear(), thisWeek.getMonth(), thisWeek.getDate() - i * 7);
    const value = history[dateKey(start)] || 0;
    points.push({
      value: value,
      label: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      title: "Week of " + start.toLocaleDateString(undefined, { month: "long", day: "numeric" }),
      tipText: wholeNumber(value) + " stardust"
    });
  }
  return points;
}

// rounds a number up to something tidy for the top of the graph, like 50, 200 or 1,000
function niceTop(value) {
  const power = Math.pow(10, Math.floor(Math.log10(value)));
  const steps = [1, 2, 5, 10];
  for (let i = 0; i < steps.length; i++) {
    if (steps[i] * power >= value) {
      return steps[i] * power;
    }
  }
  return 10 * power;
}

// bars for stardust per week, with rounded tops sitting on the bottom line
function dustSvg(points) {
  const width = 560;
  const height = 300;
  const left = 58;
  const right = 16;
  const top = 16;
  const bottom = 40;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  let most = 10;
  for (let i = 0; i < points.length; i++) {
    most = Math.max(most, points[i].value);
  }
  const ceiling = niceTop(most);
  const base = top + plotH;

  let svg = '<svg class="graph" viewBox="0 0 ' + width + " " + height + '" role="img" aria-label="Stardust earned per week">';
  const lines = [0, 0.5, 1];
  for (let i = 0; i < lines.length; i++) {
    const y = base - lines[i] * plotH;
    svg += '<line class="grid" x1="' + left + '" x2="' + (width - right) + '" y1="' + y + '" y2="' + y + '"></line>';
    svg += '<text class="axis" x="' + (left - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + wholeNumber(ceiling * lines[i]) + "</text>";
  }

  const slot = plotW / points.length;
  const barW = slot * 0.55;
  for (let i = 0; i < points.length; i++) {
    const x = left + slot * i + (slot - barW) / 2;
    const h = (points[i].value / ceiling) * plotH;
    if (h > 0.5) {
      const r = Math.min(4, h, barW / 2);
      svg += '<path class="bar" d="M' + x + " " + base + " L" + x + " " + (base - h + r) + " Q" + x + " " + (base - h) + " " + (x + r) + " " + (base - h) +
        " L" + (x + barW - r) + " " + (base - h) + " Q" + (x + barW) + " " + (base - h) + " " + (x + barW) + " " + (base - h + r) +
        " L" + (x + barW) + " " + base + ' Z"></path>';
    }
    // the whole column can be hovered, not just the bar
    svg += '<rect class="hit" data-point="' + i + '" x="' + (left + slot * i) + '" y="' + top + '" width="' + slot + '" height="' + plotH + '"></rect>';
    if (i % 2 === 1 || i === points.length - 1) {
      svg += '<text class="axis" x="' + (x + barW / 2) + '" y="' + (height - 14) + '" text-anchor="middle">' + safeText(points[i].label) + "</text>";
    }
  }
  svg += "</svg>";
  return svg;
}

function modeButtons() {
  return '<div class="ranges">' +
    '<button class="mode' + (graphMode === "luck" ? " active" : "") + '" data-mode="luck">Luck</button>' +
    '<button class="mode' + (graphMode === "dust" ? " active" : "") + '" data-mode="dust">Stardust</button>' +
    "</div>";
}

function renderDustGraph() {
  refreshSky();
  const points = dustPoints();
  const rank = rankIndexFor(skyState.stardust);
  pageLeft.innerHTML = '<h2 class="book-title">Graph</h2>' + modeButtons() +
    '<p class="hint">Stardust collected each week. Your weekly total sets your rank.</p>' +
    '<div class="graph-box">' + dustSvg(points) + '<div class="graph-tip" id="graphTip"></div></div>';
  pageLeft.graphPoints = points;

  let total = 0;
  let best = points[0];
  for (let i = 0; i < points.length; i++) {
    total += points[i].value;
    if (points[i].value > best.value) {
      best = points[i];
    }
  }
  const last = skyState.lastWeekResult;
  pageRight.innerHTML =
    '<h2 class="book-title">Stardust</h2>' +
    '<p class="stat-big">' + wholeNumber(skyState.stardust) + ' <span>&#10022;</span></p>' +
    '<p class="stat-label">this week \u00B7 ' + rankName(rank) + " (\u00D7" + payoutPercent(rank) + "% crystals)</p>" +
    '<p class="stat-line">Crystals earned this week: <strong>' + (Math.floor(skyState.crystalsThisWeek * 10) / 10) + " &#9670;</strong>, about <strong>" + crystalPreview() + " &#9670;</strong> on Monday</p>" +
    (last ? '<p class="stat-line">Last week: <strong>' + rankName(last.rank) + "</strong>, " + wholeNumber(last.stardust) + " &#10022; and " + last.crystals + " &#9670;</p>" : "") +
    '<p class="stat-line">Best week ever: <strong>' + wholeNumber(skyState.maxStardust) + " &#10022;</strong> (" + rankName(rankIndexFor(skyState.maxStardust)) + ")</p>" +
    (best.value > 0 ? '<p class="stat-line">Best of these 12: <strong>' + wholeNumber(best.value) + " &#10022;</strong> (" + safeText(best.title.toLowerCase()) + ")</p>" : "") +
    '<p class="stat-line">Total over 12 weeks: <strong>' + wholeNumber(total) + " &#10022;</strong></p>" +
    '<p class="stat-line">Stellar crystals: <strong>' + wholeNumber(skyState.crystals) + " &#9670;</strong></p>";
}

function renderGraph() {
  if (graphMode === "dust") {
    renderDustGraph();
    return;
  }
  const points = graphPoints(graphRange);
  const log = readLog();
  const names = { week: "This week", month: "Last 30 days", year: "Last 12 months" };

  let buttons = "";
  const ranges = ["week", "month", "year"];
  for (let i = 0; i < ranges.length; i++) {
    buttons += '<button class="range' + (ranges[i] === graphRange ? " active" : "") + '" data-range="' + ranges[i] + '">' +
      ranges[i].charAt(0).toUpperCase() + ranges[i].slice(1) + "</button>";
  }

  let chart = '<p class="hint">No wishes logged yet. Come back after a few days to see your luck over time.</p>';
  if (log.length > 0) {
    chart = '<div class="graph-box">' + graphSvg(points, graphRange) + '<div class="graph-tip" id="graphTip"></div></div>';
  }
  pageLeft.innerHTML = '<h2 class="book-title">Graph</h2>' + modeButtons() + '<div class="ranges">' + buttons + "</div>" + chart;
  pageLeft.graphPoints = points;

  // the right page sums up the same days in words and numbers
  const firstDay = new Date(nowTime());
  if (graphRange === "week") {
    firstDay.setDate(firstDay.getDate() - 6);
  } else if (graphRange === "month") {
    firstDay.setDate(firstDay.getDate() - 29);
  } else {
    firstDay.setMonth(firstDay.getMonth() - 11, 1);
  }
  const startKey = dateKey(firstDay);
  const counts = [0, 0, 0, 0, 0];
  let best = null;
  let total = 0;
  let days = 0;
  for (let i = 0; i < log.length; i++) {
    if (log[i].date < startKey) {
      continue;
    }
    counts[log[i].rarity - 1]++;
    total += log[i].rarity;
    days++;
    if (!best || log[i].rarity > best.rarity) {
      best = log[i];
    }
  }
  const possible = Math.round((new Date(nowTime()) - firstDay) / 86400000) + 1;

  let bars = "";
  const most = Math.max(1, Math.max.apply(null, counts));
  for (let r = 5; r >= 1; r--) {
    bars += '<div class="count-row"><span class="count-stars" style="color: ' + inkColors[r - 1] + '">' + starText(r) + '</span>' +
      '<span class="count-bar"><span style="width: ' + (counts[r - 1] / most) * 100 + "%; background: " + inkColors[r - 1] + '"></span></span>' +
      '<span class="count-number">' + counts[r - 1] + "</span></div>";
  }

  pageRight.innerHTML =
    '<h2 class="book-title">' + names[graphRange] + "</h2>" +
    '<p class="stat-big">' + (days ? (total / days).toFixed(1) : "-") + ' <span>&#9733;</span></p>' +
    '<p class="stat-label">average luck</p>' +
    '<p class="stat-line">Wished on <strong>' + days + "</strong> of " + possible + " days</p>" +
    (best ? '<p class="stat-line">Best: <strong style="color: ' + inkColors[best.rarity - 1] + '">' + starText(best.rarity) + "</strong> on " + shortDate(best.date) + "</p>" : "") +
    '<h3 class="counts-title">Results</h3>' + bars;
}

/* ---------- clicks inside the book ---------- */

logButton.addEventListener("click", openBook);
bookClose.addEventListener("click", closeBook);

bookOverlay.addEventListener("click", function (event) {
  // clicking the dark area outside the book closes it
  if (event.target === bookOverlay) {
    closeBook();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && bookOpen) {
    // a reading that's open closes first, then the book
    if (!resetPopup.hidden) {
      closeResetWarning();
    } else if (!readingPopup.hidden) {
      closeReading();
    } else {
      closeBook();
    }
  }
});

for (let i = 0; i < ribbonButtons.length; i++) {
  ribbonButtons[i].addEventListener("click", function () {
    const view = ribbonButtons[i].getAttribute("data-view");
    if (view === currentView || bookBusy) {
      return;
    }
    const order = ["collection", "daily", "graph"];
    const forward = order.indexOf(view) > order.indexOf(currentView);
    currentView = view;
    showActiveRibbon();
    flipPage(forward, function () {
      renderView(view);
    });
  });
}

book.addEventListener("click", function (event) {
  if (event.target.closest(".reading-popup")) {
    return;
  }
  if (event.target.closest('[data-act="reset"]')) {
    openResetWarning();
    return;
  }
  const tile = event.target.closest(".tile");
  if (tile) {
    showDetail(tile.getAttribute("data-id"));
    return;
  }

  const row = event.target.closest(".rarity-row");
  if (row) {
    const section = document.getElementById("raritySection" + row.getAttribute("data-rarity"));
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  const corner = event.target.closest(".corner");
  if (corner && !bookBusy) {
    const step = Number(corner.getAttribute("data-step"));
    flipPage(step > 0, function () {
      dayIndex = Math.max(0, dayIndex + step * 2);
      renderDaily();
    });
    return;
  }

  const range = event.target.closest(".range");
  if (range) {
    graphRange = range.getAttribute("data-range");
    renderGraph();
    return;
  }

  const mode = event.target.closest(".mode");
  if (mode) {
    graphMode = mode.getAttribute("data-mode");
    renderGraph();
  }
});

// hovering a dot on the graph shows what that day was
book.addEventListener("pointerover", function (event) {
  const hit = event.target.closest(".hit");
  const tip = document.getElementById("graphTip");
  if (!tip) {
    return;
  }
  if (!hit) {
    tip.classList.remove("show");
    return;
  }
  const point = pageLeft.graphPoints[Number(hit.getAttribute("data-point"))];
  if (point.tipText) {
    tip.innerHTML = "<strong>" + safeText(point.title) + "</strong><br>" + safeText(point.tipText);
  } else {
    const value = graphRange === "year" ? point.value.toFixed(1) + " ★ average" : starText(point.value);
    tip.innerHTML = "<strong>" + safeText(point.title) + "</strong><br>" + value + "<br>" + safeText(point.detail);
  }
  const box = tip.parentNode.getBoundingClientRect();
  const spot = hit.getBoundingClientRect();
  tip.style.left = spot.left + spot.width / 2 - box.left + "px";
  tip.style.top = spot.top - box.top + "px";
  tip.classList.add("show");
});
