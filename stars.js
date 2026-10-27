// Draws the star background on a canvas behind the whole page.
// Stars twinkle when you're still and turn into falling streaks while you scroll.
// Past the top section, shooting stars fly by every few seconds.

const sky = document.getElementById("sky");
const ctx = sky.getContext("2d");
const nebula = document.getElementById("nebula");
const heroSection = document.getElementById("hero");
const stillSky = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// white, blue-ish and warm stars
const starColors = ["255, 255, 255", "200, 225, 255", "255, 236, 205"];
const glows = [];

let skyWidth = 0;
let skyHeight = 0;
let stars = [];
let meteors = [];

let lastScroll = window.scrollY;
let scrollSpeed = 0;
let brightness = 1;
let nextMeteorTime = 0;
let burstDone = false;
let lastDrawTime = 0;
// how far the nebula has drifted, so its style is only changed when it actually moves
let nebulaShift = -1;

// a small blurry dot drawn once, then copied for every star (much faster than drawing gradients each time)
function makeGlow(color) {
  const glow = document.createElement("canvas");
  glow.width = 32;
  glow.height = 32;
  const g = glow.getContext("2d");
  const gradient = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(" + color + ", 1)");
  gradient.addColorStop(0.2, "rgba(" + color + ", 0.8)");
  gradient.addColorStop(0.5, "rgba(" + color + ", 0.15)");
  gradient.addColorStop(1, "rgba(" + color + ", 0)");
  g.fillStyle = gradient;
  g.fillRect(0, 0, 32, 32);
  return glow;
}

function setupSky() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  skyWidth = window.innerWidth;
  skyHeight = window.innerHeight;
  sky.width = skyWidth * ratio;
  sky.height = skyHeight * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  // fewer stars on small screens
  const count = Math.min(300, Math.round((skyWidth * skyHeight) / 5000));
  const depths = [0.25, 0.55, 1];
  stars = [];
  for (let i = 0; i < count; i++) {
    const depth = depths[Math.floor(Math.random() * depths.length)];
    let color = 0;
    if (Math.random() < 0.25) {
      color = 1;
    } else if (Math.random() < 0.15) {
      color = 2;
    }
    stars.push({
      x: Math.random() * skyWidth,
      y: Math.random() * skyHeight,
      depth: depth,
      size: 0.5 + depth * 1.4 + Math.random() * 0.5,
      twinkleSpeed: 0.0005 + Math.random() * 0.0015,
      phase: Math.random() * Math.PI * 2,
      color: color
    });
  }
}

function addMeteor(delay) {
  const speed = 9 + Math.random() * 6;
  // 20 to 40 degrees below flat, heading left
  const angle = (20 + Math.random() * 20) * Math.PI / 180;
  meteors.push({
    x: skyWidth * (0.3 + Math.random() * 0.8),
    y: skyHeight * Math.random() * 0.4,
    vx: -Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    age: -delay,
    life: 60 + Math.random() * 40,
    length: 12 + Math.random() * 10
  });
}

function drawMeteors() {
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    m.age++;
    if (m.age < 0) {
      continue;
    }
    m.x += m.vx;
    m.y += m.vy;

    // fade in fast, fade out slow
    let alpha = Math.min(m.age / 8, 1) * (1 - m.age / m.life);
    if (alpha <= 0 || m.age > m.life) {
      meteors.splice(i, 1);
      continue;
    }
    alpha = alpha * Math.max(brightness, 0.7);

    const tailX = m.x - m.vx * m.length;
    const tailY = m.y - m.vy * m.length;
    const tail = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
    tail.addColorStop(0, "rgba(255, 255, 255, " + alpha + ")");
    tail.addColorStop(1, "rgba(160, 200, 255, 0)");
    ctx.strokeStyle = tail;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();

    ctx.globalAlpha = alpha;
    ctx.drawImage(glows[0], m.x - 8, m.y - 8, 16, 16);
    ctx.globalAlpha = 1;
  }
}

function drawSky(time) {
  const scroll = window.scrollY;

  // how fast the page is scrolling, smoothed so the streaks grow and shrink gently
  scrollSpeed += (scroll - lastScroll - scrollSpeed) * 0.15;
  lastScroll = scroll;

  // full brightness on the top section, dimmer behind the projects
  // (pages without a #hero, like Daily Stargazing, just stay bright)
  let heroEnd = 0;
  if (heroSection) {
    heroEnd = heroSection.offsetHeight - skyHeight;
    const dimProgress = Math.min(Math.max((scroll - heroEnd * 0.85) / (skyHeight * 0.8), 0), 1);
    brightness = 1 - dimProgress * 0.6;
    nebula.style.opacity = 1 - dimProgress * 0.5;
  }

  // the sky reacts to scrolling: stars light up while the page is moving,
  // and the nebula drifts up and slowly changes color further down the page
  let rush = 0;
  if (heroSection && !stillSky) {
    rush = Math.min(Math.abs(scrollSpeed) / 25, 0.7);
    const pageProgress = Math.min(1, scroll / Math.max(1, document.documentElement.scrollHeight - skyHeight));
    const shift = Math.round(pageProgress * 80) / 10;
    if (shift !== nebulaShift) {
      nebulaShift = shift;
      nebula.style.transform = "translateY(" + -shift + "%)";
      nebula.style.filter = "hue-rotate(" + Math.round(pageProgress * 40) + "deg)";
    }
  }

  // a burst of shooting stars right as the top section ends
  if (!stillSky && heroSection) {
    if (!burstDone && scroll > heroEnd * 0.9) {
      for (let i = 0; i < 5; i++) {
        addMeteor(i * 12 + Math.random() * 10);
      }
      burstDone = true;
      nextMeteorTime = time + 3000;
    }
    if (scroll < heroEnd * 0.5) {
      burstDone = false;
    }
    if (scroll > heroEnd && time > nextMeteorTime) {
      addMeteor(0);
      nextMeteorTime = time + 2500 + Math.random() * 4000;
    }
  }

  ctx.clearRect(0, 0, skyWidth, skyHeight);
  ctx.lineCap = "round";

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];

    // stars fall down and a little sideways as you scroll, closer ones move faster
    let x = (star.x + scroll * star.depth * 0.12) % skyWidth;
    let y = (star.y + scroll * star.depth * 0.45) % skyHeight;
    if (x < 0) {
      x += skyWidth;
    }
    if (y < 0) {
      y += skyHeight;
    }

    const twinkle = 0.6 + 0.4 * Math.sin(time * star.twinkleSpeed + star.phase);
    const alpha = Math.min(1, twinkle * brightness * (0.4 + star.depth * 0.6) * (1 + rush));

    // longer streaks the faster you scroll
    const streak = Math.min(Math.abs(scrollSpeed) * star.depth * (heroSection ? 2 : 1.5), 140);
    if (streak > 2) {
      const direction = scrollSpeed > 0 ? -1 : 1;
      ctx.strokeStyle = "rgba(" + starColors[star.color] + ", " + alpha * 0.8 + ")";
      ctx.lineWidth = star.size * 0.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + streak * 0.27 * direction, y + streak * direction);
      ctx.stroke();
    }

    const glowSize = star.size * 4;
    ctx.globalAlpha = alpha;
    ctx.drawImage(glows[star.color], x - glowSize / 2, y - glowSize / 2, glowSize, glowSize);
  }
  ctx.globalAlpha = 1;

  drawMeteors();
}

function loop(time) {
  // when nothing is moving, only redraw about 30 times a second for the twinkling
  const busy = Math.abs(scrollSpeed) > 0.3 || meteors.length > 0 || window.scrollY !== lastScroll;
  if (busy || time - lastDrawTime > 33) {
    drawSky(time);
    lastDrawTime = time;
  }
  requestAnimationFrame(loop);
}

for (let i = 0; i < starColors.length; i++) {
  glows.push(makeGlow(starColors[i]));
}
setupSky();

let resizeTimer = null;
window.addEventListener("resize", function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function () {
    setupSky();
    if (stillSky) {
      drawSky(0);
    }
  }, 150);
});

if (stillSky) {
  drawSky(0);
} else {
  requestAnimationFrame(loop);
}
