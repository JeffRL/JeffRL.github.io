// Daily Stargazing: one wish a day. The result comes from the visitor's IP and today's date,
// so clearing the cache gives the same result until tomorrow.
// (stars.js, content.js and sounds.js are loaded on this page too, so don't reuse their variable names)

// chance out of 100 for 1, 2, 3, 4 and 5 emotes
const odds = [5, 23.5, 50, 20, 1.5];
// the readings and their emotes are in fortunes.js

// colors for each kind of result: 1 white, 2 green, 3 blue, 4 purple, 5 yellow
const starWhite = [235, 240, 255];
const greenColor = [110, 230, 140];
const blueColor = [90, 160, 255];
const purpleColor = [190, 110, 255];
const yellowColor = [255, 210, 70];
const whiteColor = [255, 255, 255];
const resultColors = [starWhite, greenColor, blueColor, purpleColor, yellowColor];

// timeline of the wish, in milliseconds. Every star starts out white
const approachStart = 300;
const launchTime = 450;
// 3 stars: the second star joins
const mergeTime = 1300;
// 2 stars: the color change
const changeTime = 1900;
// 4 stars: the two circling stars join
const orbitMergeTimes = [1250, 1850];
// 5 stars: time slows down while the five stars arrive
const slowStart = 1750;
const slowEnd = 2050;
const burstTime = 2700;
// from the burst to the result showing
const revealDelay = 350;
// a fakeout adds this much time before the real burst
const stallTime = 1350;
// how often a wish of 2 stars or more is shown as a fakeout
const fakeoutChance = 0.04;

const wishCanvas = document.getElementById("wish");
const pen = wishCanvas.getContext("2d");
const wishButton = document.getElementById("wishButton");
const reading = document.getElementById("reading");
const soundButton = document.getElementById("soundButton");
const result = document.getElementById("result");
const plateStars = document.getElementById("plateStars");
const emotes = document.getElementById("emotes");
const countdown = document.getElementById("countdown");
const flash = document.getElementById("flash");
const wash = document.getElementById("wash");
const cloudBox = document.getElementById("clouds");
const nearCloudBox = document.getElementById("nearClouds");

let screenW = 0;
let screenH = 0;
let todaysFortune = null;
// whether today's real wish gets shown as a fakeout (decided with the same seed, so it's the same every time)
let todaysFakeout = false;
// the result on screen right now, which the copy buttons use
let shownFortune = null;

// everything about the wish that's playing right now
let wish = null;
let sparks = [];
let ribbons = [];
let twinkles = [];
let floaters = [];
let speedLines = [];
let animationRunning = false;

/* ---------- daily roll ---------- */

// the testing tools can move the clock forward, so everything that cares about the date or time uses this
function nowTime() {
  let shift = 0;
  try {
    shift = Number(localStorage.getItem("dailystargazing-timeshift")) || 0;
  } catch (error) {
    // no storage, no shift
  }
  return Date.now() + shift;
}

function getToday() {
  const now = new Date(nowTime());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

// turns text into a number (FNV-1a hash)
function hashText(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash = hash ^ text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// random numbers that always come out the same for the same seed (mulberry32)
function makeRandom(seed) {
  return function () {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// picks today's rarity with the odds above, then one reading with that rarity from fortunes.js
function rollFortune(visitorId) {
  const random = makeRandom(hashText(visitorId + "|" + getToday() + "|dailystargazing"));
  const roll = random() * 100;
  let rarity = 1;
  let total = 0;
  for (let i = 0; i < odds.length; i++) {
    total += odds[i];
    if (roll < total) {
      rarity = i + 1;
      break;
    }
  }
  const fortune = pickFortune(rarity, random());
  todaysFakeout = rarity > 1 && random() < fakeoutChance;
  return fortune;
}

// randomNumber is between 0 and 1 and picks which reading of that rarity to use
function pickFortune(rarity, randomNumber) {
  const matches = [];
  for (let i = 0; i < fortunes.length; i++) {
    if (fortunes[i].rarity === rarity) {
      matches.push(fortunes[i]);
    }
  }
  return matches[Math.floor(randomNumber * matches.length)];
}

// "people_hugging" becomes "people hugging"
function emoteName(file) {
  return file.replace(/_/g, " ");
}

function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(function () {
    controller.abort();
  }, 3000);
  return fetch(url, { signal: controller.signal, cache: "no-store" }).finally(function () {
    clearTimeout(timer);
  });
}

async function getVisitorId() {
  try {
    const response = await fetchWithTimeout("https://api.ipify.org?format=json");
    const data = await response.json();
    if (data.ip) {
      return data.ip;
    }
  } catch (error) {
    // try the next one
  }

  try {
    const response = await fetchWithTimeout("https://icanhazip.com");
    const text = (await response.text()).trim();
    if (text) {
      return text;
    }
  } catch (error) {
    // try the next one
  }

  // offline or both blocked: use a saved random id instead
  try {
    let id = localStorage.getItem("dailystargazing-id");
    if (!id) {
      id = String(Math.random()).slice(2);
      localStorage.setItem("dailystargazing-id", id);
    }
    return id;
  } catch (error) {
    return "guest";
  }
}

function alreadyWatched() {
  try {
    return localStorage.getItem("dailystargazing-watched") === getToday();
  } catch (error) {
    return false;
  }
}

function saveWatched() {
  try {
    localStorage.setItem("dailystargazing-watched", getToday());
  } catch (error) {
    // not a big deal, they'll just see the button again
  }
}

/* ---------- small helpers ---------- */

function clamp(value) {
  return Math.min(Math.max(value, 0), 1);
}

function easeOut(value) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInOut(value) {
  return value * value * (3 - 2 * value);
}

function mixColor(a, b, amount) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * amount),
    Math.round(a[1] + (b[1] - a[1]) * amount),
    Math.round(a[2] + (b[2] - a[2]) * amount)
  ];
}

function rgba(color, alpha) {
  return "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", " + alpha + ")";
}

function colorForCount(count) {
  return resultColors[count - 1];
}

function resizeWishCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  screenW = window.innerWidth;
  screenH = window.innerHeight;
  wishCanvas.width = screenW * ratio;
  wishCanvas.height = screenH * ratio;
  pen.setTransform(ratio, 0, 0, ratio, 0, 0);
}

// flash the whole screen in a color
function flashScreen(color, duration, frames) {
  flash.style.setProperty("--flash-color", rgba(color, 1));
  flash.animate(frames || [{ opacity: 1 }, { opacity: 0 }], { duration: duration, easing: "ease-out" });
}

/* ---------- clouds ---------- */

// each cloud is a few circles: [left, bottom, size] in pixels
const cloudShapes = [
  { side: "left", puffs: [[0, -60, 220], [140, -40, 200], [270, -70, 240], [90, 40, 170], [210, 60, 150], [360, -30, 170]] },
  { side: "right", puffs: [[40, -50, 200], [170, -30, 240], [300, 20, 210], [400, 110, 170], [250, 140, 150], [420, -40, 230], [120, 60, 160]] }
];

function makeCloud(puffs, className) {
  const cloud = document.createElement("div");
  cloud.className = className;
  for (let j = 0; j < puffs.length; j++) {
    const puff = document.createElement("div");
    puff.className = "puff";
    // the puffs fade out toward their edges, so draw them bigger (still centered on the
    // same spot) to keep the clouds about the same size as before
    const size = puffs[j][2] * 1.4;
    const grow = (size - puffs[j][2]) / 2;
    puff.style.left = puffs[j][0] - grow + "px";
    puff.style.bottom = puffs[j][1] - grow + "px";
    puff.style.width = size + "px";
    puff.style.height = size + "px";
    cloud.appendChild(puff);
  }
  return cloud;
}

function makeClouds() {
  // the cloud box is bigger than the screen on the right and bottom, so when it slides
  // up and left during a wish there's always more cloud coming in instead of an edge
  const left = makeCloud(cloudShapes[0].puffs, "cloud left");
  left.style.left = "-120px";
  cloudBox.appendChild(left);

  const right = makeCloud(cloudShapes[1].puffs, "cloud right");
  right.style.left = "calc(100vw - 440px)";
  cloudBox.appendChild(right);

  // starts off screen and drifts into view during the wish
  const extra = makeCloud(cloudShapes[0].puffs, "cloud right");
  extra.style.left = "calc(100vw + 180px)";
  cloudBox.appendChild(extra);

  // a low row of puffs along the bottom so there's never a hard bottom edge
  const floorPuffs = [];
  for (let x = -100; x < window.innerWidth * 1.5; x += 130) {
    floorPuffs.push([x, -90 + (x % 3) * 12, 200 + (x % 5) * 15]);
  }
  const floor = makeCloud(floorPuffs, "cloud-floor");
  cloudBox.appendChild(floor);

  // big close-up clouds that rush past in front of the star while wishing
  for (let i = 0; i < 3; i++) {
    const near = makeCloud(cloudShapes[i % 2].puffs, "near-cloud");
    near.style.bottom = -140 + i * 70 + "px";
    near.style.animationDelay = 0.25 + i * 0.22 + "s";
    near.style.animationDuration = 1.1 + i * 0.35 + "s";
    nearCloudBox.appendChild(near);
  }
}

/* ---------- drawing pieces ---------- */

function drawGlow(x, y, radius, color, alpha) {
  if (radius <= 0) {
    return;
  }
  const glow = pen.createRadialGradient(x, y, 0, x, y, radius);
  glow.addColorStop(0, rgba(whiteColor, alpha));
  glow.addColorStop(0.15, rgba(color, alpha * 0.8));
  glow.addColorStop(1, rgba(color, 0));
  pen.fillStyle = glow;
  pen.beginPath();
  pen.arc(x, y, radius, 0, Math.PI * 2);
  pen.fill();
}

// the long flat streak of light through a bright point, like a camera lens flare
function drawFlare(x, y, length, color, alpha) {
  const line = pen.createLinearGradient(x - length, y, x + length, y);
  line.addColorStop(0, rgba(color, 0));
  line.addColorStop(0.5, rgba(whiteColor, alpha));
  line.addColorStop(1, rgba(color, 0));
  pen.fillStyle = line;
  pen.fillRect(x - length, y - 1.5, length * 2, 3);

  const soft = pen.createLinearGradient(x - length * 0.7, y, x + length * 0.7, y);
  soft.addColorStop(0, rgba(color, 0));
  soft.addColorStop(0.5, rgba(color, alpha * 0.35));
  soft.addColorStop(1, rgba(color, 0));
  pen.fillStyle = soft;
  pen.fillRect(x - length * 0.7, y - 6, length * 1.4, 12);

  // short up and down spike
  const spike = length * 0.18;
  const up = pen.createLinearGradient(x, y - spike, x, y + spike);
  up.addColorStop(0, rgba(whiteColor, 0));
  up.addColorStop(0.5, rgba(whiteColor, alpha * 0.8));
  up.addColorStop(1, rgba(whiteColor, 0));
  pen.fillStyle = up;
  pen.fillRect(x - 1, y - spike, 2, spike * 2);
}

// a shape that starts narrow at (x, y) and gets wider toward (endX, endY), slightly puffed out in the middle
function fillTaper(x, y, endX, endY, startWidth, endWidth, startColor, endColor) {
  const length = Math.hypot(endX - x, endY - y);
  if (length < 1) {
    return;
  }
  const nx = -(endY - y) / length;
  const ny = (endX - x) / length;
  const midX = (x + endX) / 2;
  const midY = (y + endY) / 2;
  const bulge = endWidth * 0.62;

  const fill = pen.createLinearGradient(x, y, endX, endY);
  fill.addColorStop(0, startColor);
  fill.addColorStop(1, endColor);
  pen.fillStyle = fill;

  pen.beginPath();
  pen.moveTo(x + nx * startWidth / 2, y + ny * startWidth / 2);
  pen.quadraticCurveTo(midX + nx * bulge, midY + ny * bulge, endX + nx * endWidth / 2, endY + ny * endWidth / 2);
  pen.lineTo(endX - nx * endWidth / 2, endY - ny * endWidth / 2);
  pen.quadraticCurveTo(midX - nx * bulge, midY - ny * bulge, x - nx * startWidth / 2, y - ny * startWidth / 2);
  pen.closePath();
  pen.fill();
}

// a shooting star: wide glowing tail, bright core streaks, glowing head and a lens flare
// angle is the direction the tail points away from the head
function drawComet(x, y, angle, length, width, color, headSize, flareLength, alpha) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const nx = -dy;
  const ny = dx;
  const light = mixColor(color, whiteColor, 0.55);

  // wide soft sheet
  fillTaper(x, y, x + dx * length, y + dy * length, headSize * 2, width,
    rgba(color, 0.6 * alpha), rgba(color, 0));

  // brighter middle
  fillTaper(x, y, x + dx * length * 0.75, y + dy * length * 0.75, headSize * 1.2, width * 0.4,
    rgba(light, 0.75 * alpha), rgba(color, 0));

  // thin white streaks inside the tail
  const offsets = [-0.12, 0.05, 0.2];
  for (let i = 0; i < offsets.length; i++) {
    const endX = x + dx * length * (0.5 + i * 0.12) + nx * width * offsets[i];
    const endY = y + dy * length * (0.5 + i * 0.12) + ny * width * offsets[i];
    fillTaper(x, y, endX, endY, headSize * 0.5, 3, rgba(whiteColor, 0.85 * alpha), rgba(light, 0));
  }

  drawGlow(x, y, headSize * 6, color, alpha);
  drawFlare(x, y, flareLength, color, alpha);
  drawGlow(x, y, headSize * 1.2, whiteColor, alpha);
}

// a ring that spreads out
function drawRing(x, y, t, maxRadius, color) {
  if (t <= 0 || t >= 1) {
    return;
  }
  const eased = easeOut(t);
  pen.strokeStyle = rgba(color, (1 - t) * 0.9);
  pen.lineWidth = 2 + (1 - t) * 10;
  pen.beginPath();
  pen.arc(x, y, 8 + eased * maxRadius, 0, Math.PI * 2);
  pen.stroke();
}

// two rainbow arcs around a point, the sign of the best result
function drawRainbow(x, y, radius, alpha) {
  const bands = [[255, 80, 80], [255, 165, 60], [255, 240, 90], [100, 230, 120], [80, 180, 255], [150, 100, 255]];
  pen.lineCap = "round";
  for (let i = 0; i < bands.length; i++) {
    pen.strokeStyle = rgba(bands[i], alpha * 0.75);
    pen.lineWidth = 3.5;
    pen.beginPath();
    pen.arc(x, y, radius + i * 3.5, -1.75, -0.15);
    pen.stroke();
    pen.beginPath();
    pen.arc(x, y, radius + i * 3.5, 1.4, 3.0);
    pen.stroke();
  }
}

// light rays shooting out from a point (rays is a list from makeRays)
function drawRays(x, y, t, color, rays) {
  if (t <= 0 || t >= 1) {
    return;
  }
  const grow = easeOut(t);
  for (let i = 0; i < rays.length; i++) {
    const ray = rays[i];
    const endX = x + Math.cos(ray.angle) * ray.length * grow;
    const endY = y + Math.sin(ray.angle) * ray.length * grow;
    fillTaper(x, y, endX, endY, ray.width, 0.5, rgba(whiteColor, (1 - t) * 0.9), rgba(color, 0));
  }
}

// reach is how far the rays go, as a share of the screen
function makeRays(amount, reach) {
  const rays = [];
  for (let i = 0; i < amount; i++) {
    rays.push({
      angle: Math.random() * Math.PI * 2,
      length: Math.max(screenW, screenH) * reach * (0.3 + Math.random() * 0.7),
      width: 3 + Math.random() * 12
    });
  }
  return rays;
}

function addSparks(x, y, amount, color, speed) {
  for (let i = 0; i < amount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const power = speed * (0.3 + Math.random());
    sparks.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * power,
      vy: Math.sin(angle) * power,
      life: 35 + Math.random() * 40,
      age: 0,
      size: 1 + Math.random() * 2.5,
      color: Math.random() < 0.3 ? whiteColor : color
    });
  }
}

function drawSparks() {
  pen.lineCap = "round";
  for (let i = sparks.length - 1; i >= 0; i--) {
    const spark = sparks[i];
    spark.age++;
    if (spark.age > spark.life) {
      sparks.splice(i, 1);
      continue;
    }
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.vx *= 0.96;
    spark.vy *= 0.96;
    // drawn as little streaks pointing the way they move
    pen.strokeStyle = rgba(spark.color, 1 - spark.age / spark.life);
    pen.lineWidth = spark.size;
    pen.beginPath();
    pen.moveTo(spark.x, spark.y);
    pen.lineTo(spark.x - spark.vx * 3, spark.y - spark.vy * 3);
    pen.stroke();
  }
}

/* ---------- the wish, part by part ---------- */

// a bright beam sweeping across at the start, like diving through the clouds
function drawBeam(elapsed) {
  const t = clamp(elapsed / 650);
  if (t >= 1) {
    return;
  }
  pen.save();
  pen.translate(screenW / 2, screenH / 2);
  pen.rotate(-1.05);
  const span = Math.max(screenW, screenH) * 1.5;
  const x = -span / 2 + easeInOut(t) * span;
  const width = Math.max(screenW, screenH) * 0.18;
  const beam = pen.createLinearGradient(x - width, 0, x + width, 0);
  beam.addColorStop(0, rgba(blueColor, 0));
  beam.addColorStop(0.45, rgba([170, 240, 255], 0.7 * (1 - t)));
  beam.addColorStop(0.5, rgba(whiteColor, 0.95 * (1 - t)));
  beam.addColorStop(0.55, rgba([170, 240, 255], 0.7 * (1 - t)));
  beam.addColorStop(1, rgba(blueColor, 0));
  pen.fillStyle = beam;
  pen.fillRect(x - width, -span, width * 2, span * 2);
  pen.restore();
}

// which way the star is flying (down and to the right), and so which way the world streams past
function travelAngle() {
  return Math.atan2(screenH * 0.7, screenW * 0.84);
}

// for a 5 star wish, time nearly stops while the five stars arrive, then catches back up by the burst
function warpedTime(elapsed) {
  if (wish.tier < 5 || elapsed < slowStart) {
    return elapsed;
  }
  if (elapsed < slowEnd) {
    return slowStart + (elapsed - slowStart) * 0.15;
  }
  const caughtUp = slowStart + (slowEnd - slowStart) * 0.15;
  return Math.min(burstTime, caughtUp + (elapsed - slowEnd) * (burstTime - caughtUp) / (burstTime - slowEnd));
}

// how fast the camera is moving, from 0 to 1, used for the streaks flying past
function worldSpeed(elapsed) {
  const time = warpedTime(elapsed);
  const speedUp = clamp((time - approachStart) / 300);
  const slowDown = clamp((time - changeTime) / (burstTime - changeTime));
  let speed = speedUp * (1 - slowDown * 0.4);
  if (wish.tier === 5 && elapsed > slowStart && elapsed < slowEnd) {
    speed *= 0.15;
  }
  // a fakeout stalls everything
  if (elapsed > burstTime) {
    speed *= 1 - clamp((elapsed - burstTime) / 400);
  }
  return speed;
}

// the star's color eases from one color to the next over a moment
function starColorAt(elapsed) {
  return mixColor(wish.fromColor, wish.toColor, clamp((elapsed - wish.colorAt) / 150));
}

function setStarColor(color, elapsed) {
  wish.fromColor = starColorAt(elapsed);
  wish.toColor = color;
  wish.colorAt = elapsed;
}

// a ring that spreads out. Without an x and y it follows the star
function addRing(at, color, maxRadius, duration, x, y) {
  wish.rings.push({
    at: at,
    color: color,
    maxRadius: maxRadius,
    duration: duration,
    x: x === undefined ? null : x,
    y: y === undefined ? null : y
  });
}

function drawAllRings(elapsed) {
  for (let i = 0; i < wish.rings.length; i++) {
    const ring = wish.rings[i];
    const x = ring.x === null ? wish.headX : ring.x;
    const y = ring.y === null ? wish.headY : ring.y;
    drawRing(x, y, (elapsed - ring.at) / ring.duration, ring.maxRadius, ring.color);
  }
}

function drawRayBursts(elapsed) {
  for (let i = 0; i < wish.rayBursts.length; i++) {
    const burst = wish.rayBursts[i];
    drawRays(burst.x, burst.y, (elapsed - burst.at) / burst.duration, burst.color, burst.rays);
  }
}

// the star rips in past the middle, then the camera catches up and it slides back to the center
function drawApproach(elapsed) {
  const time = warpedTime(Math.min(elapsed, burstTime));
  const sinceStart = time - approachStart;
  const launch = clamp(sinceStart / launchTime);
  const catchUp = clamp((sinceStart - launchTime) / (burstTime - approachStart - launchTime));
  const size = Math.min(screenW, screenH);

  const startX = -screenW * 0.1;
  const startY = -screenH * 0.08;
  const leadX = screenW * 0.74;
  const leadY = screenH * 0.62;
  const endX = screenW * 0.58;
  const endY = screenH * 0.46;

  let x = 0;
  let y = 0;
  if (launch < 1) {
    // hard brake at the end of the launch
    const travel = 1 - Math.pow(1 - launch, 4);
    x = startX + (leadX - startX) * travel;
    y = startY + (leadY - startY) * travel;
  } else {
    const travel = easeInOut(catchUp);
    x = leadX + (endX - leadX) * travel;
    y = leadY + (endY - leadY) * travel;
  }
  const angle = travelAngle() + Math.PI;

  const color = starColorAt(elapsed);
  wish.headColor = color;

  // the flare after a color change fades back down
  wish.boost *= 0.94;
  const headSize = size * (0.008 + wish.boost * 0.02);
  let flareLength = screenW * (0.1 + wish.boost * 0.35 + catchUp * 0.06);
  let alpha = 1;

  // during a fakeout stall the star dims, apart from its heartbeats
  if (wish.stallAt !== null) {
    const dim = clamp((elapsed - wish.stallAt) / 500);
    alpha = Math.min(1, 1 - dim * 0.5 + wish.boost * 0.5);
    flareLength *= 1 - dim * 0.6;
  }

  // the tail stretches out behind the star instead of showing up all at once
  const tailLength = Math.max(screenW, screenH) * (0.15 + 0.85 * easeOut(clamp(sinceStart / 900)));

  drawComet(x, y, angle, tailLength, size * 0.22, color, headSize, flareLength, alpha);
  wish.headX = x;
  wish.headY = y;

  // shards breaking off and getting left behind along the tail
  if (wish.stallAt === null && Math.random() < 0.8) {
    const spread = (Math.random() - 0.5) * 0.5;
    const speed = 5 + Math.random() * 8;
    sparks.push({
      x: x,
      y: y,
      vx: Math.cos(angle + spread) * speed,
      vy: Math.sin(angle + spread) * speed,
      life: 30 + Math.random() * 30,
      age: 0,
      size: 1.5 + Math.random() * 2,
      color: mixColor(color, whiteColor, 0.3)
    });
  }

  // rainbow arcs that open up around a 5 star
  if (wish.rainbowAt !== null) {
    const open = easeOut(clamp((elapsed - wish.rainbowAt) / 500));
    drawRainbow(x, y, size * (0.07 + open * 0.05), open);
  }
}

// 3 stars: a smaller star flies alongside and swings in to join the main one at mergeTime
function drawCompanion(elapsed) {
  const size = Math.min(screenW, screenH);
  // stays out to the side during the launch, then closes the gap
  const closing = easeInOut(clamp((elapsed - approachStart - launchTime) / (mergeTime - approachStart - launchTime)));
  const gap = (1 - closing) * (1 + 0.15 * Math.sin(elapsed / 90));
  const angle = travelAngle();
  // to the side of the main star and a little behind it
  const sideX = -Math.sin(angle);
  const sideY = Math.cos(angle);
  const x = wish.headX + sideX * size * 0.1 * gap - Math.cos(angle) * size * 0.06 * gap;
  const y = wish.headY + sideY * size * 0.1 * gap - Math.sin(angle) * size * 0.06 * gap;
  const tailLength = Math.max(screenW, screenH) * 0.5 * easeOut(clamp((elapsed - approachStart) / 900));
  drawComet(x, y, angle + Math.PI, tailLength, size * 0.08, wish.headColor, size * 0.005, screenW * 0.05, 0.75);
}

// 4 stars: two smaller stars circle the main one in a tightening spiral and join it one after the other
function drawOrbiters(elapsed) {
  const size = Math.min(screenW, screenH);
  const tailLength = Math.max(screenW, screenH) * 0.35 * easeOut(clamp((elapsed - approachStart) / 900));
  for (let i = 0; i < orbitMergeTimes.length; i++) {
    const joinAt = orbitMergeTimes[i];
    if (elapsed >= joinAt) {
      continue;
    }
    const closing = easeInOut(clamp((elapsed - approachStart - launchTime) / (joinAt - approachStart - launchTime)));
    const radius = size * 0.13 * (1 - closing);
    // they spin faster as they get closer, like water going down a drain
    const spin = i * Math.PI + (elapsed / 1000) * (4 + closing * 10);
    const x = wish.headX + Math.cos(spin) * radius;
    const y = wish.headY + Math.sin(spin) * radius * 0.6;
    drawComet(x, y, travelAngle() + Math.PI, tailLength, size * 0.06, wish.headColor, size * 0.005, screenW * 0.04, 0.8);
  }
}

// 5 stars: five stars fly in from the edges of the screen and all meet the main one
function makeConvergers() {
  const list = [];
  for (let i = 0; i < 5; i++) {
    const side = i % 4;
    let x = Math.random() * screenW;
    let y = Math.random() * screenH;
    if (side === 0) {
      y = -screenH * 0.1;
    } else if (side === 1) {
      x = screenW * 1.1;
    } else if (side === 2) {
      y = screenH * 1.1;
    } else {
      x = -screenW * 0.1;
    }
    list.push({ startX: x, startY: y, leaveAt: 700 + i * 90, arriveAt: slowStart + 40 + i * 50 });
  }
  return list;
}

function drawConvergers(elapsed) {
  const size = Math.min(screenW, screenH);
  const color = mixColor(starWhite, yellowColor, 0.5);
  for (let i = 0; i < wish.convergers.length; i++) {
    const star = wish.convergers[i];
    if (elapsed < star.leaveAt || elapsed >= star.arriveAt) {
      continue;
    }
    // speeds up as it gets close
    const t = Math.pow(clamp((elapsed - star.leaveAt) / (star.arriveAt - star.leaveAt)), 2);
    const x = star.startX + (wish.headX - star.startX) * t;
    const y = star.startY + (wish.headY - star.startY) * t;
    const angle = Math.atan2(star.startY - wish.headY, star.startX - wish.headX);
    drawComet(x, y, angle, Math.max(screenW, screenH) * 0.3, size * 0.05, color, size * 0.005, screenW * 0.05, 0.85);
  }
}

// a smaller star joins the main one
function mergePulse(elapsed) {
  wish.boost = 0.7;
  wish.shake = 0.6;
  addSparks(wish.headX, wish.headY, 40, mixColor(wish.headColor, whiteColor, 0.5), 5);
  addRing(elapsed, whiteColor, Math.min(screenW, screenH) * 0.18, 500);
  playMerge();
}

// a color change made into a big moment: flare, ring, sparks and a wash over the sky.
// strength goes up with rarity so the bigger changes feel bigger
function colorPop(color, elapsed, strength) {
  setStarColor(color, elapsed);
  wish.boost = 1;
  addSparks(wish.headX, wish.headY, 40 + strength * 20, color, 6);
  addRing(elapsed, color, Math.min(screenW, screenH) * (0.25 + strength * 0.05), 650);
  wash.style.setProperty("--wash-color", rgba(color, 0.4 + strength * 0.08));
  wash.animate([{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 0 }], { duration: 900, easing: "ease-out" });
}

// the 5 star moment: everything arrives, then a yellow supernova with rainbow arcs and long rays
function supernova(elapsed) {
  colorPop(yellowColor, elapsed, 3);
  wish.rainbowAt = elapsed;
  wish.rayBursts.push({ at: elapsed, x: wish.headX, y: wish.headY, rays: makeRays(40, 1), color: yellowColor, duration: 700 });
  wish.shake = 1.2;
  flashScreen(mixColor(yellowColor, whiteColor, 0.5), 600, [{ opacity: 0.7 }, { opacity: 0 }]);
  playChange(5);
}

// what each rarity does on the way in. Each one builds on the one below it
function runTierEvents(elapsed) {
  const tier = wish.tier;
  if (tier === 2) {
    atTime("green", elapsed, changeTime, function () {
      colorPop(greenColor, elapsed, 1);
      playChange(2);
    });
  }
  if (tier === 3) {
    atTime("merge", elapsed, mergeTime, function () {
      mergePulse(elapsed);
      colorPop(blueColor, elapsed, 1);
      playChange(3);
    });
  }
  if (tier === 4) {
    atTime("orbit1", elapsed, orbitMergeTimes[0], function () {
      mergePulse(elapsed);
      colorPop(blueColor, elapsed, 1);
      playChange(3);
    });
    atTime("orbit2", elapsed, orbitMergeTimes[1], function () {
      mergePulse(elapsed);
      colorPop(purpleColor, elapsed, 2);
      addRing(elapsed + 150, mixColor(purpleColor, whiteColor, 0.4), Math.min(screenW, screenH) * 0.45, 800);
      playChange(4);
    });
  }
  if (tier === 5) {
    for (let i = 0; i < wish.convergers.length; i++) {
      atTime("arrive" + i, elapsed, wish.convergers[i].arriveAt, function () {
        wish.boost = 0.6;
        addSparks(wish.headX, wish.headY, 15, mixColor(yellowColor, whiteColor, 0.4), 4);
        playArrive(i);
      });
    }
    atTime("supernova", elapsed, slowEnd, function () {
      supernova(elapsed);
    });
  }
}

/* ---------- fakeouts: the star stalls, the sky cracks like glass, then blows apart into the next color up ---------- */

// one crack: a jagged line out from the star, wide at the start and thin at the tip.
// wobble is how much it can bend at each step
function makeFracture(x, y, angle, length, width, segments, wobble) {
  const points = [{ x: x, y: y, w: width }];
  for (let s = 1; s <= segments; s++) {
    angle += (Math.random() - 0.5) * wobble;
    const step = (length / segments) * (0.7 + Math.random() * 0.6);
    x += Math.cos(angle) * step;
    y += Math.sin(angle) * step;
    points.push({ x: x, y: y, w: width * (1 - s / segments) + 0.5 });
  }
  return points;
}

// the cracks are planned as soon as the star stalls, but only show up when the sky actually cracks
function startStall(elapsed) {
  wish.stallAt = elapsed;
  wish.cracks = [];
  wish.shards = [];
  // long enough to run off every edge of the screen, so the broken pieces cover the whole sky
  const reach = Math.hypot(screenW, screenH);
  const count = 8;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
    const main = makeFracture(0, 0, angle, reach * (0.9 + Math.random() * 0.3), 3.4, 9, 0.35);
    wish.cracks.push({ points: main, main: true });
    for (let b = 0; b < 2; b++) {
      const from = main[2 + Math.floor(Math.random() * 4)];
      const side = Math.random() < 0.5 ? -1 : 1;
      const branch = makeFracture(from.x, from.y, angle + side * (0.5 + Math.random() * 0.4), reach * 0.15, from.w * 0.6, 4, 0.6);
      wish.cracks.push({ points: branch, main: false });
    }
  }
  playStall();
}

function heartbeat(elapsed) {
  wish.boost = 0.9;
  wish.shake = 0.5;
  addRing(elapsed, whiteColor, Math.min(screenW, screenH) * 0.12, 450);
  playHeartbeat();
}

function crackSnap(strength) {
  wish.shake = strength;
  playCrack(strength);
}

// how far the main cracks reach (0 to 1): most of the way in one quick crack, then a slow creep until it breaks
function mainCrackGrowth(since) {
  const creep = clamp((since - 660) / 440);
  return 0.65 * easeOut(clamp((since - 500) / 160)) + 0.35 * creep * creep;
}

// sparks rush in toward the star from all around it
function implode() {
  const size = Math.min(screenW, screenH);
  for (let i = 0; i < 70; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = size * (0.25 + Math.random() * 0.3);
    // sparks slow down a little every frame, so this gets them to the middle in about 12 frames
    const speed = distance / 10.3;
    sparks.push({
      x: wish.headX + Math.cos(angle) * distance,
      y: wish.headY + Math.sin(angle) * distance,
      vx: -Math.cos(angle) * speed,
      vy: -Math.sin(angle) * speed,
      life: 12,
      age: 0,
      size: 1.5 + Math.random() * 2,
      color: whiteColor
    });
  }
  playImplode();
}

// the pieces of broken sky: the space between each pair of neighboring cracks is cut into pieces
// at matching points along both cracks, so together they cover the whole screen like broken glass
function makeShards() {
  const mains = [];
  for (let i = 0; i < wish.cracks.length; i++) {
    if (wish.cracks[i].main) {
      mains.push(wish.cracks[i].points);
    }
  }
  const pieces = [];
  for (let i = 0; i < mains.length; i++) {
    const a = mains[i];
    const b = mains[(i + 1) % mains.length];
    for (let k = 0; k < a.length - 1; k++) {
      const corners = [[a[k].x, a[k].y], [a[k + 1].x, a[k + 1].y], [b[k + 1].x, b[k + 1].y], [b[k].x, b[k].y]];
      let centerX = 0;
      let centerY = 0;
      for (let c = 0; c < corners.length; c++) {
        centerX += corners[c][0] / corners.length;
        centerY += corners[c][1] / corners.length;
      }
      // corners are kept relative to the piece's middle so it can spin around it
      for (let c = 0; c < corners.length; c++) {
        corners[c][0] -= centerX;
        corners[c][1] -= centerY;
      }
      const distance = Math.hypot(centerX, centerY) || 1;
      // pieces further out fly faster
      const speed = 6 + distance * 0.025 + Math.random() * 4;
      pieces.push({
        x: centerX,
        y: centerY,
        vx: (centerX / distance) * speed,
        vy: (centerY / distance) * speed,
        turn: 0,
        spin: (Math.random() - 0.5) * 0.12,
        corners: corners
      });
    }
  }
  return pieces;
}

// the sky blows apart and the star shows its real color
function shatter(elapsed) {
  const color = colorForCount(wish.count);
  const size = Math.min(screenW, screenH);
  wish.shards = makeShards();
  wish.explodeAt = elapsed;
  wish.cracks = [];
  wish.stallAt = null;
  clearWash();
  colorPop(color, elapsed, wish.count);
  addRing(elapsed + 100, mixColor(color, whiteColor, 0.4), size * 0.6, 800);
  wish.rayBursts.push({ at: elapsed, x: wish.headX, y: wish.headY, rays: makeRays(30, 0.8), color: color, duration: 500 });
  if (wish.count === 5) {
    wish.rainbowAt = elapsed;
  }
  wish.shake = 1.4;
  playShatter(wish.count);
}

function clearWash() {
  const old = wash.getAnimations();
  for (let i = 0; i < old.length; i++) {
    old[i].cancel();
  }
}

// the dark veil over the sky while the star stalls. The shards are drawn in the same color,
// so when it breaks it looks like this veil is what shatters
const veilColor = [3, 4, 18];
const veilStrength = 0.72;

function drawVeil(elapsed) {
  if (wish.stallAt === null) {
    return;
  }
  pen.save();
  pen.globalCompositeOperation = "source-over";
  pen.fillStyle = rgba(veilColor, veilStrength * clamp((elapsed - wish.stallAt) / 400));
  pen.fillRect(-20, -20, screenW + 40, screenH + 40);
  pen.restore();
}

// a crack's outline as one shape: up one side and back down the other, so it fills in one go
// with no overlapping pieces. own is how much of it has grown so far
function crackShape(points, own, widthScale) {
  const reach = own * (points.length - 1);
  const line = [points[0]];
  for (let s = 1; s < points.length; s++) {
    const part = Math.min(1, reach - (s - 1));
    if (part <= 0) {
      break;
    }
    const a = points[s - 1];
    const b = points[s];
    line.push({ x: a.x + (b.x - a.x) * part, y: a.y + (b.y - a.y) * part, w: b.w });
  }
  if (line.length < 2) {
    return null;
  }
  const leftSide = [];
  const rightSide = [];
  for (let i = 0; i < line.length; i++) {
    // the direction here, averaged across bends so the edges stay smooth
    const before = line[Math.max(0, i - 1)];
    const after = line[Math.min(line.length - 1, i + 1)];
    const dx = after.x - before.x;
    const dy = after.y - before.y;
    const length = Math.hypot(dx, dy) || 1;
    // the very tip comes to a point
    const half = i === line.length - 1 ? 0 : (line[i].w * widthScale) / 2;
    leftSide.push([line[i].x - (dy / length) * half, line[i].y + (dx / length) * half]);
    rightSide.push([line[i].x + (dy / length) * half, line[i].y - (dx / length) * half]);
  }
  return leftSide.concat(rightSide.reverse());
}

function fillShape(corners) {
  pen.beginPath();
  pen.moveTo(corners[0][0], corners[0][1]);
  for (let i = 1; i < corners.length; i++) {
    pen.lineTo(corners[i][0], corners[i][1]);
  }
  pen.closePath();
  pen.fill();
}

// the cracks: a dark broken edge, then a bright line with the star's real color glowing through it
function drawCracks(elapsed) {
  if (wish.stallAt === null || wish.cracks.length === 0) {
    return;
  }
  const since = elapsed - wish.stallAt;
  const mainGrow = mainCrackGrowth(since);
  const branchGrow = clamp((since - 700) / 380);
  if (mainGrow <= 0) {
    return;
  }
  // light pushes through harder right before the sky breaks
  const glow = 1 + clamp((since - 900) / 200) * 1.5;
  const color = colorForCount(wish.count);
  pen.save();
  pen.translate(wish.headX, wish.headY);
  for (let i = 0; i < wish.cracks.length; i++) {
    const crack = wish.cracks[i];
    const own = crack.main ? mainGrow : branchGrow;
    if (own <= 0) {
      continue;
    }
    const edge = crackShape(crack.points, own, 1.9);
    const core = crackShape(crack.points, own, 1);
    if (!edge || !core) {
      continue;
    }
    pen.globalCompositeOperation = "source-over";
    pen.shadowBlur = 0;
    pen.fillStyle = "rgba(0, 0, 10, 0.65)";
    pen.save();
    pen.translate(1.2, 1.2);
    fillShape(edge);
    pen.restore();

    pen.globalCompositeOperation = "lighter";
    pen.shadowColor = rgba(color, 0.9);
    pen.shadowBlur = 10 * glow;
    pen.fillStyle = rgba(mixColor(color, whiteColor, 0.75), 0.95);
    fillShape(core);
  }
  pen.restore();
}

// the broken pieces of sky flying away, spinning and fading
function drawShards(elapsed) {
  if (wish.shards.length === 0 || wish.explodeAt === null) {
    return;
  }
  const t = (elapsed - wish.explodeAt) / 450;
  if (t >= 1) {
    wish.shards = [];
    return;
  }
  const color = colorForCount(wish.count);
  pen.save();
  pen.translate(wish.headX, wish.headY);
  pen.lineJoin = "round";
  for (let i = 0; i < wish.shards.length; i++) {
    const piece = wish.shards[i];
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.vx *= 1.04;
    piece.vy *= 1.04;
    piece.turn += piece.spin;
    pen.save();
    pen.translate(piece.x, piece.y);
    pen.rotate(piece.turn);
    pen.scale(1 - t * 0.3, 1 - t * 0.3);
    pen.globalCompositeOperation = "source-over";
    pen.fillStyle = rgba(veilColor, veilStrength * (1 - t));
    fillShape(piece.corners);
    pen.globalCompositeOperation = "lighter";
    pen.strokeStyle = rgba(mixColor(color, whiteColor, 0.5), 0.8 * (1 - t));
    pen.lineWidth = 1.2;
    pen.stroke();
    pen.restore();
  }
  pen.restore();
}

// the star bursts into light and the screen flashes white, which hides the switch to the result
function finalBurst(elapsed) {
  const color = colorForCount(wish.count);
  const size = Math.min(screenW, screenH);
  setStarColor(color, elapsed);
  wish.rayBursts.push({ at: elapsed, x: wish.headX, y: wish.headY, rays: makeRays(28 + wish.count * 6, 1), color: color, duration: 500 });
  addRing(elapsed, color, size * 0.5, 600, wish.headX, wish.headY);
  if (wish.count >= 4) {
    addRing(elapsed + 150, mixColor(color, whiteColor, 0.4), size * 0.8, 700, wish.headX, wish.headY);
  }
  wish.shake = 1.6;
  addSparks(wish.headX, wish.headY, 50 + wish.count * 15, color, 9);
  // white in the middle with a bit of the result's color around the edges,
  // and it stays bright long enough to hide the switch to the result
  flashScreen(mixColor(color, whiteColor, 0.35), 1300, [
    { opacity: 0 },
    { opacity: 1, offset: 0.18 },
    { opacity: 1, offset: 0.4 },
    { opacity: 0 }
  ]);
  playImpact(wish.count);
  if (wish.fakeout) {
    playBigReveal(wish.count);
  }
}


/* ---------- result screen ---------- */

function makeRibbons(count) {
  ribbons = makeRibbonList(count, Math.min(screenW, screenH) / 800);
  makeSparkles(count);
}

// the swirls for a result. size scales them, 1 is for an 800 pixel tall area
function makeRibbonList(count, size) {
  const list = [];
  for (let i = 0; i < 2 + count; i++) {
    list.push({
      radiusX: (250 + i * 55 + Math.random() * 50) * size,
      radiusY: (100 + i * 28 + Math.random() * 30) * size,
      tilt: -0.5 + Math.random() * 1,
      startAngle: Math.random() * Math.PI * 2,
      sweep: Math.PI * (1.1 + Math.random() * 0.6),
      width: (22 + Math.random() * 20) * size,
      spin: (i % 2 === 0 ? 1 : -1) * (0.00005 + Math.random() * 0.00005),
      delay: i * 110,
      // 4 and 5 stars get some whiter ribbons mixed in so it shimmers more
      whiter: count >= 4 && i % 2 === 1
    });
  }
  return list;
}

function makeSparkles(count) {
  twinkles = [];
  const twinkleCount = 14 + count * 4 + (count === 5 ? 8 : 0);
  for (let i = 0; i < twinkleCount; i++) {
    twinkles.push({
      x: screenW * (0.1 + Math.random() * 0.8),
      y: screenH * (0.12 + Math.random() * 0.76),
      size: 4 + Math.random() * 10,
      speed: 0.002 + Math.random() * 0.003,
      phase: Math.random() * Math.PI * 2
    });
  }

  floaters = [];
  for (let i = 0; i < 30 + count * 6; i++) {
    floaters.push({
      x: Math.random() * screenW,
      y: Math.random() * screenH,
      speed: 0.2 + Math.random() * 0.5,
      size: 1 + Math.random() * 2.5,
      alpha: 0.2 + Math.random() * 0.5
    });
  }
}

// one smooth swirl: a single filled shape around an ellipse, thin at the tail and pointed at the head.
// Draws on the wish canvas by default; share.js passes its own canvas and center for the picture.
function drawRibbon(ribbon, color, sinceReveal, context, centerX, centerY) {
  const grow = easeOut(clamp((sinceReveal - ribbon.delay) / 1000));
  if (grow <= 0) {
    return;
  }
  const pen = context || wishCanvas.getContext("2d");
  const steps = 120;
  const sweep = ribbon.sweep * grow;
  const radius = ribbon.radiusX;

  pen.save();
  pen.translate(centerX === undefined ? screenW / 2 : centerX, centerY === undefined ? screenH / 2 : centerY);
  pen.rotate(ribbon.tilt + sinceReveal * ribbon.spin);
  // squash a circle into an ellipse, so the gradient below can follow it around
  pen.scale(1, ribbon.radiusY / ribbon.radiusX);

  pen.beginPath();
  for (let s = 0; s <= steps; s++) {
    const along = s / steps;
    const angle = ribbon.startAngle + sweep * along;
    const half = ribbon.width * Math.pow(Math.sin(Math.PI * Math.pow(along, 0.75)), 0.9) / 2;
    const x = Math.cos(angle) * (radius + half);
    const y = Math.sin(angle) * (radius + half);
    if (s === 0) {
      pen.moveTo(x, y);
    } else {
      pen.lineTo(x, y);
    }
  }
  for (let s = steps; s >= 0; s--) {
    const along = s / steps;
    const angle = ribbon.startAngle + sweep * along;
    const half = ribbon.width * Math.pow(Math.sin(Math.PI * Math.pow(along, 0.75)), 0.9) / 2;
    pen.lineTo(Math.cos(angle) * (radius - half), Math.sin(angle) * (radius - half));
  }
  pen.closePath();

  // fades in from the tail, brightest near the head
  if (pen.createConicGradient) {
    const part = sweep / (Math.PI * 2);
    const fill = pen.createConicGradient(ribbon.startAngle, 0, 0);
    fill.addColorStop(0, rgba(color, 0));
    fill.addColorStop(part * 0.55, rgba(color, 0.55));
    fill.addColorStop(part * 0.92, rgba(mixColor(color, whiteColor, 0.6), 0.9));
    fill.addColorStop(Math.min(part, 1), rgba(whiteColor, 0.9));
    pen.fillStyle = fill;
  } else {
    pen.fillStyle = rgba(color, 0.55);
  }
  pen.shadowColor = rgba(color, 0.9);
  pen.shadowBlur = 24;
  pen.fill();
  pen.restore();
}

// a four pointed sparkle (on the wish canvas unless another one is given)
function drawTwinkle(x, y, size, alpha, color, context) {
  const pen = context || wishCanvas.getContext("2d");
  pen.fillStyle = rgba(color, alpha);
  pen.beginPath();
  pen.moveTo(x, y - size);
  pen.quadraticCurveTo(x, y, x + size, y);
  pen.quadraticCurveTo(x, y, x, y + size);
  pen.quadraticCurveTo(x, y, x - size, y);
  pen.quadraticCurveTo(x, y, x, y - size);
  pen.fill();
}

function drawReveal(now) {
  const sinceReveal = now - wish.revealStart;
  const color = colorForCount(wish.count);
  const sparkleColor = wish.count === 5 ? mixColor(yellowColor, whiteColor, 0.4) : whiteColor;

  for (let i = 0; i < ribbons.length; i++) {
    drawRibbon(ribbons[i], ribbons[i].whiter ? mixColor(color, whiteColor, 0.55) : color, sinceReveal);
  }

  const fadeIn = clamp(sinceReveal / 800);
  for (let i = 0; i < twinkles.length; i++) {
    const twinkle = twinkles[i];
    const alpha = (0.5 + 0.5 * Math.sin(now * twinkle.speed + twinkle.phase)) * fadeIn;
    drawTwinkle(twinkle.x, twinkle.y, twinkle.size, alpha, sparkleColor);
  }

  for (let i = 0; i < floaters.length; i++) {
    const floater = floaters[i];
    floater.y -= floater.speed;
    if (floater.y < -10) {
      floater.y = screenH + 10;
      floater.x = Math.random() * screenW;
    }
    pen.fillStyle = rgba(color, floater.alpha * fadeIn);
    pen.beginPath();
    pen.arc(floater.x, floater.y, floater.size, 0, Math.PI * 2);
    pen.fill();
  }
}

function showResult(fortune) {
  // the constellation below can be scrolled to now
  document.body.classList.remove("before-wish");
  const count = fortune.rarity;
  const color = colorForCount(count);
  reading.textContent = fortune.text;
  shownFortune = fortune;
  setShareReady(true);
  updateAddButton();

  plateStars.textContent = "";
  for (let i = 0; i < count; i++) {
    const star = document.createElement("span");
    star.textContent = "★";
    star.style.animationDelay = 0.6 + i * 0.12 + "s";
    plateStars.appendChild(star);
  }

  emotes.textContent = "";
  for (let i = 0; i < fortune.emotes.length; i++) {
    const emote = document.createElement("div");
    emote.className = "emote";
    emote.style.animationDelay = 0.2 + i * 0.2 + "s";
    const img = document.createElement("img");
    img.src = "resources/" + fortune.emotes[i] + ".png";
    img.alt = emoteName(fortune.emotes[i]);
    img.draggable = false;
    emote.appendChild(img);
    emotes.appendChild(emote);
  }
  result.style.setProperty("--glow", color.join(", "));
  result.style.setProperty("--glow-strength", 0.12 + count * 0.07);
  result.style.setProperty("--after-delay", 1 + count * 0.2 + "s");

  result.hidden = false;
  document.body.classList.remove("wishing");
  document.body.classList.add("revealing");

  if (!wish) {
    wish = { count: count, tier: count, start: performance.now(), done: { all: true }, finished: true };
  }
  wish.finished = true;
  wish.revealStart = performance.now();
  makeRibbons(count);
  startAnimating();
}

function hideResult() {
  result.hidden = true;
  setShareReady(false);
}

/* ---------- running the wish ---------- */

// real is true for the actual daily wish, which gets saved to the logbook (testing pulls pass false).
// fakeout plays the animation one rarity lower, then upgrades it partway through.
function playWish(fortune, real, fakeout) {
  const count = fortune.rarity;
  hideResult();
  document.body.classList.remove("revealing");
  startSound();

  // the wish happens at the top of the page, and the page can't scroll while it plays
  window.scrollTo(0, 0);

  // take the class off and put it back so the cloud animations start over
  document.body.classList.remove("wishing");
  void document.body.offsetWidth;
  document.body.classList.add("wishing");

  const showFakeout = Boolean(fakeout) && count > 1;
  const tier = showFakeout ? count - 1 : count;
  wish = {
    count: count,
    tier: tier,
    fakeout: showFakeout,
    fortune: fortune,
    real: real,
    start: performance.now(),
    done: {},
    fromColor: starWhite,
    toColor: starWhite,
    colorAt: 0,
    headColor: starWhite,
    boost: 0,
    shake: 0,
    headX: screenW * 0.58,
    headY: screenH * 0.46,
    rings: [],
    rayBursts: [],
    rainbowAt: null,
    stallAt: null,
    cracks: [],
    shards: [],
    explodeAt: null,
    convergers: tier === 5 ? makeConvergers() : [],
    burstAt: burstTime + (showFakeout ? stallTime : 0),
    finished: false
  };
  sparks = [];
  ribbons = [];
  twinkles = [];
  floaters = [];
  makeSpeedLines();
  startAnimating();
}

// stars at three depths that stream past while the camera flies with the star
function makeSpeedLines() {
  speedLines = [];
  const depths = [0.25, 0.55, 1];
  for (let i = 0; i < 120; i++) {
    speedLines.push({
      x: Math.random() * screenW,
      y: Math.random() * screenH,
      depth: depths[i % 3]
    });
  }
}

function drawSpeedLines(elapsed) {
  const speed = worldSpeed(elapsed);
  if (speed <= 0) {
    return;
  }
  const angle = travelAngle();
  // the world moves the opposite way to the star
  const moveX = -Math.cos(angle);
  const moveY = -Math.sin(angle);
  pen.lineCap = "round";
  for (let i = 0; i < speedLines.length; i++) {
    const line = speedLines[i];
    const step = speed * line.depth * 38;
    line.x += moveX * step;
    line.y += moveY * step;
    // wrap around to the other side of the screen
    if (line.x < -100) {
      line.x += screenW + 200;
    }
    if (line.y < -100) {
      line.y += screenH + 200;
    }
    const length = step * 2.5 + 1;
    pen.strokeStyle = rgba([200, 225, 255], line.depth * 0.6 * speed);
    pen.lineWidth = line.depth * 2;
    pen.beginPath();
    pen.moveTo(line.x, line.y);
    pen.lineTo(line.x - moveX * length, line.y - moveY * length);
    pen.stroke();
  }
}

// runs something once when the timeline reaches its time
function atTime(name, elapsed, time, action) {
  if (elapsed >= time && !wish.done[name]) {
    wish.done[name] = true;
    action();
  }
}

function frame(now) {
  if (!wish) {
    animationRunning = false;
    return;
  }
  const elapsed = now - wish.start;

  pen.clearRect(0, 0, screenW, screenH);
  pen.save();
  pen.globalCompositeOperation = "lighter";

  if (!wish.finished) {
    atTime("start", elapsed, 0, function () {
      flashScreen(whiteColor, 700);
      playWishStart();
    });
    atTime("launch", elapsed, approachStart, function () {
      playLaunch((burstTime - approachStart) / 1000);
    });
    atTime("landed", elapsed, approachStart + launchTime, function () {
      wish.shake = 1;
    });
    runTierEvents(elapsed);
    if (wish.fakeout) {
      atTime("stall", elapsed, burstTime, function () {
        startStall(elapsed);
      });
      atTime("beat1", elapsed, burstTime + 200, function () {
        heartbeat(elapsed);
      });
      atTime("crack1", elapsed, burstTime + 500, function () {
        crackSnap(1);
        playCrackle(0.6);
      });
      // while the cracks creep, the screen trembles a little now and then
      const sinceStall = elapsed - burstTime;
      if (sinceStall > 680 && sinceStall < 1100 && Math.random() < 0.12) {
        wish.shake = Math.max(wish.shake, 0.15);
      }
      atTime("implode", elapsed, burstTime + 900, implode);
      atTime("shatter", elapsed, burstTime + 1100, function () {
        shatter(elapsed);
      });
    }
    atTime("burst", elapsed, wish.burstAt, function () {
      finalBurst(elapsed);
    });
    atTime("reveal", elapsed, wish.burstAt + revealDelay, function () {
      if (wish.real) {
        saveWatched();
        recordFortune(wish.fortune);
      }
      showResult(wish.fortune);
      playReveal(wish.count);
    });
  }

  // camera shake, a few pixels that die down quickly
  if (wish.shake > 0.02) {
    pen.translate((Math.random() - 0.5) * wish.shake * 10, (Math.random() - 0.5) * wish.shake * 10);
    wish.shake *= 0.85;
  }

  if (wish.finished) {
    drawReveal(now);
  } else {
    if (elapsed < wish.burstAt) {
      drawSpeedLines(elapsed);
    }
    if (elapsed < 650) {
      drawBeam(elapsed);
    }
    drawVeil(elapsed);
    if (elapsed >= approachStart && elapsed < wish.burstAt) {
      drawApproach(elapsed);
      if (wish.tier === 3 && elapsed < mergeTime) {
        drawCompanion(elapsed);
      }
      if (wish.tier === 4) {
        drawOrbiters(elapsed);
      }
      if (wish.tier === 5) {
        drawConvergers(elapsed);
      }
    }
    drawCracks(elapsed);
    drawShards(elapsed);
    drawAllRings(elapsed);
    drawRayBursts(elapsed);
  }
  drawSparks();

  pen.restore();
  requestAnimationFrame(frame);
}

function startAnimating() {
  if (!animationRunning) {
    animationRunning = true;
    requestAnimationFrame(frame);
  }
}

// tap anywhere during the wish to skip to the end
document.addEventListener("pointerdown", function (event) {
  if (!wish || wish.finished || wish.done.burst) {
    return;
  }
  if (event.target.closest("nav") || event.target.closest("#toolbar") || event.target.closest("#debug")) {
    return;
  }
  // mark everything before the burst as done so it doesn't all fire at once
  const skipped = ["start", "launch", "landed", "green", "merge", "orbit1", "orbit2", "supernova",
    "arrive0", "arrive1", "arrive2", "arrive3", "arrive4", "stall", "beat1", "crack1", "implode", "shatter"];
  for (let i = 0; i < skipped.length; i++) {
    wish.done[skipped[i]] = true;
  }
  const color = colorForCount(wish.count);
  wish.fromColor = color;
  wish.toColor = color;
  wish.stallAt = null;
  wish.cracks = [];
  wish.shards = [];
  clearWash();
  // burst where the star would have stopped
  wish.headX = screenW * 0.58;
  wish.headY = screenH * 0.46;
  sparks = [];
  newSoundGroup();
  wish.start = performance.now() - wish.burstAt;
});


/* ---------- countdown ---------- */

function updateCountdown() {
  const now = new Date(nowTime());
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  let left = Math.floor((midnight - now) / 1000);
  if (left <= 0) {
    location.reload();
    return;
  }
  const hours = Math.floor(left / 3600);
  left = left % 3600;
  const minutes = Math.floor(left / 60);
  const seconds = left % 60;
  countdown.textContent = String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

/* ---------- nav and sound button ---------- */

function addNavLinks() {
  const nav = document.getElementById("nav");
  for (let i = 0; i < categories.length; i++) {
    const link = document.createElement("a");
    link.className = "nav-link";
    link.href = "../index.html#" + categories[i].title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    link.textContent = categories[i].title;
    nav.insertBefore(link, nav.lastElementChild);
  }
}

function showSoundState() {
  soundButton.textContent = soundOn ? "🔊" : "🔇";
  soundButton.setAttribute("aria-label", soundOn ? "Mute sound" : "Turn sound on");
}

/* ---------- testing tools, turned on from the browser console ---------- */

// type debugLuck() in the console to show the testing buttons, and debugLuck(false) to hide them.
// It's remembered, so the buttons stay until they're turned off.
function debugLuck(on) {
  const show = on !== false;
  try {
    if (show) {
      localStorage.setItem("dailystargazing-debug", "on");
    } else {
      localStorage.removeItem("dailystargazing-debug");
    }
  } catch (error) {
    // can't remember it, it'll just be off after a reload
  }
  const old = document.getElementById("debug");
  if (old) {
    old.remove();
  }
  if (show) {
    buildDebugPanel();
  }
  return show ? "Debug buttons on" : "Debug buttons off";
}

function addDebugButton(row, label, action) {
  const button = document.createElement("button");
  button.textContent = label;
  button.addEventListener("click", action);
  row.appendChild(button);
}

// a labeled row of testing buttons
function addDebugRow(panel, label) {
  const row = document.createElement("div");
  row.className = "debug-row";
  const name = document.createElement("span");
  name.className = "debug-label";
  name.textContent = label;
  row.appendChild(name);
  panel.appendChild(row);
  return row;
}

// moving the clock reloads the page, so the wish, logbook and sky all see the new time
function moveClock(ms) {
  shiftTime(ms);
  location.reload();
}

// adds made-up logbook entries (marked as debug) on past days until about half the readings are found
function fillDebugLogbook() {
  const log = readLog();
  const taken = {};
  const found = {};
  for (let i = 0; i < log.length; i++) {
    taken[log[i].date] = true;
    found[fortuneId(log[i])] = true;
  }
  const missing = [];
  for (let i = 0; i < fortunes.length; i++) {
    if (!found[fortuneId(fortunes[i])]) {
      missing.push(fortunes[i]);
    }
  }
  let toAdd = Math.max(0, Math.ceil(fortunes.length / 2) - (fortunes.length - missing.length));
  const now = new Date(nowTime());
  let daysBack = 1;
  while (toAdd > 0 && missing.length > 0) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysBack);
    daysBack++;
    const date = dateKey(day);
    if (taken[date]) {
      continue;
    }
    const pick = missing.splice(Math.floor(Math.random() * missing.length), 1)[0];
    day.setHours(9);
    log.push({ date: date, time: day.toISOString(), rarity: pick.rarity, emotes: pick.emotes, text: pick.text, debug: true });
    toAdd--;
  }
  saveLog(log);
  refreshSky();
  renderSky();
  showToast("Logbook filled to about half with debug entries");
}

function buildDebugPanel() {
  const panel = document.createElement("div");
  panel.id = "debug";

  // a title bar with a button that folds the panel down to just itself (remembered after a reload)
  const head = document.createElement("div");
  head.className = "debug-head";
  const title = document.createElement("span");
  title.textContent = "Debug";
  const fold = document.createElement("button");
  head.appendChild(title);
  head.appendChild(fold);
  panel.appendChild(head);
  function showFolded(folded) {
    panel.classList.toggle("collapsed", folded);
    fold.textContent = folded ? "Show" : "Hide";
  }
  let startFolded = false;
  try {
    startFolded = localStorage.getItem("dailystargazing-debug-collapsed") === "yes";
  } catch (error) {
    // starts open
  }
  showFolded(startFolded);
  fold.addEventListener("click", function () {
    const folded = !panel.classList.contains("collapsed");
    showFolded(folded);
    try {
      if (folded) {
        localStorage.setItem("dailystargazing-debug-collapsed", "yes");
      } else {
        localStorage.removeItem("dailystargazing-debug-collapsed");
      }
    } catch (error) {
      // it just won't be remembered
    }
  });

  // fake pulls play the whole wish with a random reading of that rarity, and are never saved
  let row = addDebugRow(panel, "Wish");
  for (let r = 1; r <= 5; r++) {
    addDebugButton(row, "Fake " + r + "★", function () {
      playWish(pickFortune(r, Math.random()), false, false);
    });
  }
  row = addDebugRow(panel, "Fakeout");
  for (let r = 2; r <= 5; r++) {
    addDebugButton(row, (r - 1) + "★→" + r + "★", function () {
      playWish(pickFortune(r, Math.random()), false, true);
    });
  }
  addDebugButton(row, "Replay today", function () {
    if (todaysFortune) {
      playWish(todaysFortune, false, todaysFakeout);
    }
  });

  row = addDebugRow(panel, "Days");
  // lets today's real wish be made again (it'll be the same result, since that comes from the IP and date)
  addDebugButton(row, "Reset today", function () {
    const log = readLog();
    const kept = [];
    for (let i = 0; i < log.length; i++) {
      if (log[i].date !== getToday()) {
        kept.push(log[i]);
      }
    }
    saveLog(kept);
    try {
      localStorage.removeItem("dailystargazing-watched");
    } catch (error) {
      // nothing saved
    }
    if (skyState.addedDate === getToday()) {
      skyState.addedDate = "";
      saveSky();
    }
    location.reload();
  });
  addDebugButton(row, "Clear log", function () {
    try {
      localStorage.removeItem("dailystargazing-log");
      localStorage.removeItem("dailystargazing-watched");
    } catch (error) {
      // nothing saved
    }
    location.reload();
  });
  addDebugButton(row, "Fill logbook", fillDebugLogbook);

  row = addDebugRow(panel, "Stars");
  for (let r = 1; r <= 5; r++) {
    addDebugButton(row, "Add " + r + "★", function () {
      debugAddStars(r, 1);
    });
  }
  addDebugButton(row, "Add with animation", debugAddShownStar);
  addDebugButton(row, "Add 20", function () {
    debugAddStars(0, 20);
  });
  addDebugButton(row, "Clear stars", function () {
    skyState.stars = [];
    saveSky();
    renderSky();
    refreshStarDrawer();
  });

  row = addDebugRow(panel, "Skills");
  addDebugButton(row, "Reroll skills", function () {
    for (let i = 0; i < skyState.stars.length; i++) {
      skyState.stars[i].skills = rollSkills(skyState.stars[i].rarity);
    }
    saveSky();
    renderSky();
    refreshStarDrawer();
  });
  addDebugButton(row, "+10 levels (sky)", function () {
    debugEachActive(function (star) {
      star.level = Math.min(maxLevel, star.level + 10);
    });
  });
  addDebugButton(row, "Unlock all", function () {
    for (let i = 0; i < skyState.stars.length; i++) {
      skyState.stars[i].level = maxLevel;
    }
    saveSky();
    renderSky();
    refreshStarDrawer();
  });

  row = addDebugRow(panel, "Dust");
  addDebugButton(row, "Fill all", function () {
    const now = nowTime();
    debugEachActive(function (star) {
      star.lastCollected = now - fillMs(star);
      star.overflowPaidUntil = now;
    });
  });
  addDebugButton(row, "Overfill 48h", function () {
    const now = nowTime();
    debugEachActive(function (star) {
      star.lastCollected = now - fillMs(star) - 48 * hourMs;
      star.overflowPaidUntil = star.lastCollected;
    });
    refreshSky();
    renderSky();
  });
  addDebugButton(row, "+1000 ✦", function () {
    // counts toward this week's rank, so it can trigger rank-ups
    earnDust(1000, nowTime());
    saveSky();
    updateSkyHeader();
    refreshStarDrawer();
  });
  addDebugButton(row, "+50 ◆", function () {
    skyState.crystals += 50;
    saveSky();
    renderSky();
    refreshStarDrawer();
  });

  row = addDebugRow(panel, "Ranks");
  addDebugButton(row, "Rank up", function () {
    debugRankUp(1);
  });
  addDebugButton(row, "+5 ranks", function () {
    debugRankUp(5);
  });
  addDebugButton(row, "Next tier", debugNextTier);
  addDebugButton(row, "Reset rank", debugResetRank);
  addDebugButton(row, "+10 \u25C6 this week", function () {
    skyState.crystalsThisWeek += 10;
    saveSky();
    updateSkyHeader();
  });
  addDebugButton(row, "End week now", function () {
    const now = nowTime();
    moveClock(nextWeekStart(now) - now + 60000);
  });

  row = addDebugRow(panel, "Time");
  addDebugButton(row, "+1 hour", function () {
    moveClock(hourMs);
  });
  addDebugButton(row, "+1 day", function () {
    moveClock(dayMs);
  });
  addDebugButton(row, "+1 week", function () {
    moveClock(7 * dayMs);
  });
  addDebugButton(row, "Next week", function () {
    const now = nowTime();
    moveClock(nextWeekStart(now) - now + 60000);
  });
  addDebugButton(row, "Reset time", function () {
    try {
      localStorage.removeItem("dailystargazing-timeshift");
    } catch (error) {
      // nothing saved
    }
    location.reload();
  });

  row = addDebugRow(panel, "Rewards");
  addDebugButton(row, "Milestone +1", function () {
    skyState.milestone = Math.min(25, skyState.milestone + 1);
    saveSky();
    renderSky();
    refreshStarDrawer();
    showToast("Milestone " + skyState.milestone + ": storage " + storageLimit() + ", slots " + slotLimit());
  });
  addDebugButton(row, "Reset milestones", function () {
    skyState.milestone = 0;
    saveSky();
    renderSky();
    refreshStarDrawer();
  });
  addDebugButton(row, "Link range", function () {
    showLinkRange = !showLinkRange;
    drawConstellation(nowTime());
  });

  row = addDebugRow(panel, "Save");
  addDebugButton(row, "Export", function () {
    const save = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.indexOf("dailystargazing-") === 0) {
        save[key] = localStorage.getItem(key);
      }
    }
    const text = JSON.stringify(save);
    navigator.clipboard.writeText(text).then(function () {
      showToast("Save copied to the clipboard");
    }).catch(function () {
      window.prompt("Copy your save:", text);
    });
  });
  addDebugButton(row, "Import", function () {
    const text = window.prompt("Paste a save to load it (this replaces your current one):");
    if (!text) {
      return;
    }
    try {
      const save = JSON.parse(text);
      for (const key in save) {
        if (key.indexOf("dailystargazing-") === 0) {
          localStorage.setItem(key, save[key]);
        }
      }
      location.reload();
    } catch (error) {
      showToast("That doesn't look like a save");
    }
  });
  addDebugButton(row, "Wipe everything", function () {
    if (window.confirm("Wipe all Daily Stargazing data on this browser? This can't be undone.")) {
      wipeAllData();
    }
  });
  // turns the debug panel off completely (run debugLuck() in the console to get it back)
  addDebugButton(row, "Close debug", function () {
    debugLuck(false);
  });

  document.body.appendChild(panel);
}


// removes everything this page has saved in the browser and starts over,
// fading to black first (the fresh page fades back in, see the top of index.html)
function wipeAllData() {
  const black = document.createElement("div");
  black.style.cssText = "position: fixed; inset: 0; z-index: 100; background: #000;";
  document.body.appendChild(black);
  black.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 800, easing: "ease-in", fill: "forwards" }).finished.then(function () {
    clearSavedData();
    try {
      sessionStorage.setItem("dailystargazing-fade-in", "yes");
    } catch (error) {
      // no fade back in then, it just shows up
    }
    window.scrollTo(0, 0);
    location.reload();
  });
}

function clearSavedData() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i).indexOf("dailystargazing-") === 0) {
        keys.push(localStorage.key(i));
      }
    }
    for (let i = 0; i < keys.length; i++) {
      localStorage.removeItem(keys[i]);
    }
  } catch (error) {
    // storage is blocked, so there's nothing saved to remove
  }
}

/* ---------- start up ---------- */

addNavLinks();
makeClouds();
resizeWishCanvas();
showSoundState();

try {
  if (localStorage.getItem("dailystargazing-debug") === "on") {
    buildDebugPanel();
  }
} catch (error) {
  // storage blocked, so no testing buttons
}
updateCountdown();
setInterval(updateCountdown, 1000);

window.addEventListener("resize", function () {
  resizeWishCanvas();
  if (wish && wish.finished) {
    makeRibbons(wish.count);
  }
});

// the IP lookup starts right away, and the button is ready before it finishes.
// If someone clicks really fast, the wish just waits for the lookup
const visitorIdReady = getVisitorId();

if (alreadyWatched()) {
  // their reading is about to show, so there's nothing to click
  wishButton.disabled = true;
  wishButton.textContent = "Reading the stars...";
}

wishButton.addEventListener("click", function () {
  wishButton.disabled = true;
  // sound has to be started straight from the click, before waiting on anything
  startSound();
  visitorIdReady.then(function (visitorId) {
    todaysFortune = rollFortune(visitorId);
    playWish(todaysFortune, true, todaysFakeout);
  });
});

soundButton.addEventListener("click", function () {
  toggleSound();
  showSoundState();
});

// waits until logbook.js and share.js have loaded too, since a returning visitor's result uses them
document.addEventListener("DOMContentLoaded", function () {
  visitorIdReady.then(function (visitorId) {
    todaysFortune = rollFortune(visitorId);
    if (alreadyWatched()) {
      recordFortune(todaysFortune);
      showResult(todaysFortune);
    }
  });
});

// cache the site so the next visit loads instantly (doesn't work when opening the file directly)
if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("../sw.js");
  });
}
