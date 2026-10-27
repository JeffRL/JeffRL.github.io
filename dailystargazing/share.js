// Copying today's result: as text, or as a picture. Uses shownFortune and colorForCount from luck.js,
// logEntryFor from logbook.js, and emoteEmoji from fortunes.js.

// where the page lives once it's on GitHub Pages. Change this if the address ever changes.
const shareUrl = "https://JeffRL.github.io/dailystargazing/";

const copyTextButton = document.getElementById("copyTextButton");
const copyImageButton = document.getElementById("copyImageButton");
const toast = document.getElementById("toast");
let toastTimer = null;

// the copy buttons only work while a result is on screen
function setShareReady(ready) {
  copyTextButton.disabled = !ready;
  copyImageButton.disabled = !ready;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 2200);
}

// when the result on screen was wished for: from the logbook if it's today's real one, otherwise now
function wishTime() {
  const entry = logEntryFor(getToday());
  if (entry && fortuneId(entry) === fortuneId(shownFortune)) {
    return new Date(entry.time);
  }
  return new Date(nowTime());
}

/* ---------- text ---------- */

function shareText() {
  let emojis = "";
  for (let i = 0; i < shownFortune.emotes.length; i++) {
    emojis += emoteEmoji[shownFortune.emotes[i]] || "";
  }
  const when = wishTime().toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
  return "Today's Daily Stargazing:\n" + emojis + "\n" + when + " | " + shareUrl;
}

// older way of copying, for browsers that block the clipboard API
function copyWithTextarea(text) {
  const box = document.createElement("textarea");
  box.value = text;
  box.style.position = "fixed";
  box.style.opacity = "0";
  document.body.appendChild(box);
  box.select();
  let worked = false;
  try {
    worked = document.execCommand("copy");
  } catch (error) {
    worked = false;
  }
  box.remove();
  return worked;
}

copyTextButton.addEventListener("click", function () {
  if (!shownFortune) {
    return;
  }
  const text = shareText();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      showToast("Copied!");
    }).catch(function () {
      showToast(copyWithTextarea(text) ? "Copied!" : "Couldn't copy, sorry");
    });
  } else {
    showToast(copyWithTextarea(text) ? "Copied!" : "Couldn't copy, sorry");
  }
});

/* ---------- picture ---------- */

// splits text into lines that fit a width
function wrapLines(context, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + " " + words[i] : words[i];
    if (context.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = words[i];
    } else {
      line = test;
    }
  }
  if (line) {
    lines.push(line);
  }
  return lines;
}

// a rectangle with rounded corners
function roundedBox(c, x, y, width, height, radius) {
  c.beginPath();
  c.moveTo(x + radius, y);
  c.arcTo(x + width, y, x + width, y + height, radius);
  c.arcTo(x + width, y + height, x, y + height, radius);
  c.arcTo(x, y + height, x, y, radius);
  c.arcTo(x, y, x + width, y, radius);
  c.closePath();
}

function drawShareImage() {
  const size = 1200;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const c = canvas.getContext("2d");
  const color = colorForCount(shownFortune.rarity);
  const font = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

  // night sky
  const sky = c.createLinearGradient(0, 0, 0, size);
  sky.addColorStop(0, "#0b0920");
  sky.addColorStop(0.55, "#17194d");
  sky.addColorStop(1, "#2a3f8f");
  c.fillStyle = sky;
  c.fillRect(0, 0, size, size);

  // stars
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 0.6 + Math.random() * 1.8;
    const glow = c.createRadialGradient(x, y, 0, x, y, r * 3);
    glow.addColorStop(0, "rgba(255, 255, 255, " + (0.5 + Math.random() * 0.5) + ")");
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    c.fillStyle = glow;
    c.beginPath();
    c.arc(x, y, r * 3, 0, Math.PI * 2);
    c.fill();
  }

  // soft glow in the result's color behind the emotes
  const glow = c.createRadialGradient(size / 2, 520, 0, size / 2, 520, 520);
  glow.addColorStop(0, rgba(color, 0.45));
  glow.addColorStop(1, rgba(color, 0));
  c.fillStyle = glow;
  c.fillRect(0, 0, size, size);

  // the same glowing swirls as the result screen, fully grown, plus a sprinkle of sparkles
  const swirls = makeRibbonList(shownFortune.rarity, 1.35);
  c.globalCompositeOperation = "lighter";
  for (let i = 0; i < swirls.length; i++) {
    const swirlColor = swirls[i].whiter ? mixColor(color, whiteColor, 0.55) : color;
    drawRibbon(swirls[i], swirlColor, 3000, c, size / 2, 520);
  }
  const sparkleColor = shownFortune.rarity === 5 ? mixColor(yellowColor, whiteColor, 0.4) : whiteColor;
  for (let i = 0; i < 14 + shownFortune.rarity * 4; i++) {
    drawTwinkle(size * (0.08 + Math.random() * 0.84), size * (0.08 + Math.random() * 0.84), 5 + Math.random() * 12, 0.3 + Math.random() * 0.6, sparkleColor, c);
  }
  c.globalCompositeOperation = "source-over";

  // title and stars
  c.textAlign = "center";
  c.fillStyle = "#ffffff";
  c.font = "700 64px " + font;
  c.fillText("Today's Luck", size / 2, 230);
  let stars = "";
  for (let i = 0; i < shownFortune.rarity; i++) {
    stars += "★";
  }
  c.fillStyle = "#ffcc4d";
  c.font = "46px " + font;
  c.shadowColor = "rgba(255, 190, 60, 0.8)";
  c.shadowBlur = 16;
  c.fillText(stars, size / 2, 300);

  // the emotes, using the images already loaded on the page
  const images = document.querySelectorAll("#emotes img");
  const emoteSize = 150;
  const gap = 24;
  const rowWidth = images.length * emoteSize + (images.length - 1) * gap;
  let x = (size - rowWidth) / 2;
  c.shadowColor = rgba(color, 0.9);
  c.shadowBlur = 40;
  for (let i = 0; i < images.length; i++) {
    c.drawImage(images[i], x, 520 - emoteSize / 2, emoteSize, emoteSize);
    x += emoteSize + gap;
  }

  // the reading, in a see-through black box like the one on the page
  c.shadowBlur = 0;
  c.font = "32px " + font;
  const lines = wrapLines(c, shownFortune.text, 860);
  let widest = 0;
  for (let i = 0; i < lines.length; i++) {
    widest = Math.max(widest, c.measureText(lines[i]).width);
  }
  const boxWidth = Math.max(560, widest + 96);
  const boxHeight = 40 + lines.length * 48 + 30 + 40 + 30;
  const boxLeft = (size - boxWidth) / 2;
  const boxTop = 660;
  c.fillStyle = "rgba(0, 0, 0, 0.55)";
  roundedBox(c, boxLeft, boxTop, boxWidth, boxHeight, 20);
  c.fill();

  c.fillStyle = "#f5f5f7";
  let y = boxTop + 40 + 30;
  for (let i = 0; i < lines.length; i++) {
    c.fillText(lines[i], size / 2, y);
    y += 48;
  }
  // thin line between the reading and the date, like the line above the countdown on the page
  const lineY = y - 48 + 30;
  c.fillStyle = "rgba(255, 255, 255, 0.15)";
  c.fillRect(boxLeft + 28, lineY, boxWidth - 56, 1);
  c.fillStyle = "#d2d2d7";
  c.font = "22px " + font;
  c.fillText(wishTime().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }), size / 2, lineY + 38);

  // dark edges
  const vignette = c.createRadialGradient(size / 2, size / 2, size * 0.35, size / 2, size / 2, size * 0.75);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.85)");
  c.fillStyle = vignette;
  c.fillRect(0, 0, size, size);

  // the link, small in the corner
  c.textAlign = "right";
  c.fillStyle = "rgba(255, 255, 255, 0.6)";
  c.font = "22px " + font;
  c.fillText("★ Daily Stargazing at " + shareUrl.replace("https://", "").replace(/\/$/, ""), size - 44, size - 44);

  return canvas;
}

function downloadImage(blob) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "daily-luck-" + getToday() + ".png";
  link.click();
  setTimeout(function () {
    URL.revokeObjectURL(link.href);
  }, 1000);
}

copyImageButton.addEventListener("click", function () {
  if (!shownFortune) {
    return;
  }
  let canvas = null;
  try {
    canvas = drawShareImage();
    // throws right away if the browser won't let the picture be saved
    canvas.toDataURL();
  } catch (error) {
    showToast("Copying pictures works once the site is online");
    return;
  }
  canvas.toBlob(function (blob) {
    if (!blob) {
      showToast("Couldn't make the picture, sorry");
      return;
    }
    if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
      navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]).then(function () {
        showToast("Image copied!");
      }).catch(function () {
        downloadImage(blob);
        showToast("Saved as a picture instead");
      });
    } else {
      downloadImage(blob);
      showToast("Saved as a picture instead");
    }
  }, "image/png");
});
