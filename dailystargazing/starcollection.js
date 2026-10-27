// The star collection drawer: every star you've kept, with a detail view for renaming, favoriting,
// placing in the constellation, leveling up, upgrading skills and scrapping.
// Uses constellation.js for all the rules, this file is just the screens.

const starDrawer = document.getElementById("starDrawer");
const drawerTitle = document.getElementById("drawerTitle");
const drawerCount = document.getElementById("drawerCount");
const drawerDust = document.getElementById("drawerDust");
const drawerCrystals = document.getElementById("drawerCrystals");
const drawerList = document.getElementById("drawerList");
const drawerDetail = document.getElementById("drawerDetail");
const starGrid = document.getElementById("starGrid");
const starSort = document.getElementById("starSort");
const starFilter = document.getElementById("starFilter");
const starsButton = document.getElementById("starsButton");

// "browse" to look around, "pick" when choosing a star for an empty spot in the constellation
let drawerMode = "browse";
let detailStarId = null;
let scrapArmed = false;

function openStarDrawer(mode) {
  drawerMode = mode || "browse";
  detailStarId = null;
  refreshSky();
  starDrawer.hidden = false;
  starDrawer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
  starDrawer.querySelector(".drawer-panel").animate([
    { transform: "translateX(40px)", opacity: 0 },
    { transform: "none", opacity: 1 }
  ], { duration: 280, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
  refreshStarDrawer();
}

function closeStarDrawer() {
  starDrawer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180 }).finished.then(function () {
    starDrawer.hidden = true;
  });
}

// redraws whatever the drawer is showing right now
function refreshStarDrawer() {
  if (starDrawer.hidden) {
    return;
  }
  drawerCount.textContent = skyState.stars.length + " / " + storageLimit();
  drawerDust.textContent = wholeNumber(skyState.stardust);
  drawerCrystals.textContent = wholeNumber(skyState.crystals);
  if (detailStarId !== null && findStar(detailStarId)) {
    renderStarDetail(findStar(detailStarId));
  } else {
    detailStarId = null;
    renderStarGrid();
  }
}

// a little canvas that gets the same star drawing as the sky (see paintStarIcons)
function starIcon(star, size, className) {
  return '<canvas class="' + className + '" data-id="' + star.id + '" data-size="' + size + '" width="' + size * 2 + '" height="' + size * 2 + '"></canvas>';
}

// draws each star icon inside a box with its emotes circling it, at double size so it stays sharp.
// time turns the ring (0 if left out)
function paintStarIcons(box, time) {
  const icons = box.querySelectorAll("canvas[data-id]");
  for (let i = 0; i < icons.length; i++) {
    paintStarIcon(icons[i], time || 0);
  }
}

function paintStarIcon(icon, time) {
  const star = findStar(Number(icon.getAttribute("data-id")));
  if (!star) {
    return;
  }
  const size = Number(icon.getAttribute("data-size"));
  const middle = size / 2;
  const emoteSize = size * 0.16;
  // the ring reaches about a third of the way out, which drawOrbit works out from this radius
  const ringRadius = (size * 0.34 - 12) / 2.6;
  const c = icon.getContext("2d");
  c.setTransform(2, 0, 0, 2, 0, 0);
  c.clearRect(0, 0, size, size);
  drawOrbit(c, star, middle, middle, ringRadius, time, false, emoteSize);
  c.globalCompositeOperation = "lighter";
  drawStarShape(c, middle, middle, size * 0.09, star.rarity, 1, 0);
  c.globalCompositeOperation = "source-over";
  drawOrbit(c, star, middle, middle, ringRadius, time, true, emoteSize);
  // emote pictures that are still loading get drawn once they arrive
  for (let j = 0; j < star.emotes.length; j++) {
    const picture = emotePicture(star.emotes[j]);
    if (!picture.complete) {
      picture.addEventListener("load", function () {
        paintStarIcon(icon, time);
      }, { once: true });
    }
  }
}

// the big star in a star's details turns its ring slowly while it's open
let detailSpinning = false;

function spinDetailStar(time) {
  if (starDrawer.hidden || drawerDetail.hidden) {
    detailSpinning = false;
    return;
  }
  paintStarIcons(drawerDetail, time);
  requestAnimationFrame(spinDetailStar);
}

/* ---------- the grid ---------- */

function sortedStars() {
  let list = skyState.stars.slice();
  const filter = drawerMode === "pick" ? "free" : starFilter.value;
  list = list.filter(function (star) {
    if (filter === "free") {
      return !star.active;
    }
    if (filter === "active") {
      return star.active;
    }
    if (filter === "favorite") {
      return star.favorite;
    }
    if (filter === "debug") {
      return star.debug;
    }
    if (filter !== "all") {
      return star.rarity === Number(filter);
    }
    return true;
  });
  const sort = starSort.value;
  list.sort(function (a, b) {
    if (sort === "rarity") {
      return b.rarity - a.rarity || b.level - a.level;
    }
    if (sort === "level") {
      return b.level - a.level || b.rarity - a.rarity;
    }
    if (sort === "name") {
      return a.name.localeCompare(b.name);
    }
    return b.created - a.created;
  });
  return list;
}

function renderStarGrid() {
  drawerList.hidden = false;
  drawerDetail.hidden = true;
  drawerTitle.textContent = drawerMode === "pick" ? "Pick a star for your constellation" : "Star Collection";
  starFilter.disabled = drawerMode === "pick";

  const list = sortedStars();
  if (list.length === 0) {
    starGrid.innerHTML = '<p class="drawer-empty">' + (skyState.stars.length === 0
      ? "No stars yet. Make today's wish, then press Add to Constellation under your reading."
      : drawerMode === "pick" ? "Every star you have is already in your constellation." : "No stars match that filter.") + "</p>";
    return;
  }

  let html = "";
  for (let i = 0; i < list.length; i++) {
    const star = list[i];
    let badges = "";
    if (star.favorite) {
      badges += '<span class="badge fav" title="Favorite">★</span>';
    }
    if (star.active) {
      badges += '<span class="badge in-sky">In sky</span>';
    }
    if (star.debug) {
      badges += '<span class="badge debug">DEBUG</span>';
    }
    html += '<button class="star-card" data-id="' + star.id + '">' +
      starIcon(star, 72, "mini-star") +
      '<span class="card-name">' + safeText(star.name) + "</span>" +
      '<span class="card-stars" style="color: rgb(' + colorForCount(star.rarity).join(", ") + ')">' + starText(star.rarity) + "</span>" +
      '<span class="card-level">Lv ' + star.level + "</span>" +
      '<span class="card-badges">' + badges + "</span></button>";
  }
  starGrid.innerHTML = html;
  paintStarIcons(starGrid);
}

/* ---------- one star ---------- */

function renderStarDetail(star) {
  drawerList.hidden = true;
  drawerDetail.hidden = false;
  drawerTitle.textContent = "Star Collection";
  const now = nowTime();
  const atMax = star.level >= maxLevel;
  const need = expToNext(star.level);
  const levelCost = levelUpCost(star);

  let fillLine = "Holds " + wholeNumber(fillAmount(star)) + " stardust and " + (Math.round(crystalAmount(star) * 100) / 100) +
    " crystals · fills in about " + Math.round(fillMs(star) / hourMs) + " hours";
  if (star.active) {
    fillLine += "<br>Right now: " + wholeNumber(fillAmount(star) * fillFraction(star, now)) + " stardust ready";
  }

  // how lucky this star's rolls were, compared to everything its rarity could have rolled
  const dustRoll = rollQuality(star.fillBase, dustRanges[star.rarity - 1]);
  const crystalRoll = rollQuality(star.crystalBase, crystalRanges[star.rarity - 1]);
  const rolls =
    '<div class="roll-row"><span>Stardust roll</span><div class="roll-bar"><span style="width: ' + Math.round(dustRoll * 100) + '%"></span></div><b>' + Math.round(dustRoll * 100) + "%</b></div>" +
    '<div class="roll-row"><span>Crystal roll</span><div class="roll-bar"><span style="width: ' + Math.round(crystalRoll * 100) + '%"></span></div><b>' + Math.round(crystalRoll * 100) + "%</b></div>" +
    '<p class="muted">Overall quality: ' + Math.round(starQuality(star) * 100) + "% of the best this rarity can roll</p>";

  let skills = "";
  for (let i = 0; i < star.skills.length; i++) {
    const skill = star.skills[i];
    const info = skillInfo(skill.id);
    const unlockAt = skillUnlockLevel(i);
    if (!info) {
      continue;
    }
    if (star.level < unlockAt) {
      skills += '<li class="skill locked"><div><strong>' + safeText(info.name) + ' <small>' + rollLabel(star, skill) + '</small></strong><span>' +
        safeText(skillDescription(skill)) + '</span></div><em>Unlocks at level ' + unlockAt + "</em></li>";
    } else {
      const cost = skillUpgradeCost(skill);
      skills += '<li class="skill"><div><strong>' + safeText(info.name) + ' <small>Lv ' + skill.level + " · " + rollLabel(star, skill) + "</small></strong><span>" +
        safeText(skillDescription(skill)) + '</span></div><button class="skill-up" data-skill="' + i + '"' +
        (skyState.crystals < cost ? " disabled" : "") + ">Upgrade · ◆ " + cost + "</button></li>";
    }
  }

  const canPlace = star.active || activeStars().length < slotLimit();
  drawerDetail.innerHTML =
    '<button class="detail-back">‹ All stars</button>' +
    '<div class="detail-top">' +
      starIcon(star, 132, "big-star") +
      "<div>" +
        '<input class="star-name" maxlength="30" value="' + safeText(star.name) + '" aria-label="Star name">' +
        '<p class="star-made">' + starMadeText(star) + "</p>" +
        '<p class="star-rarity" style="color: rgb(' + colorForCount(star.rarity).join(", ") + ')">' + starText(star.rarity) + "</p>" +
      "</div>" +
    "</div>" +
    '<div class="detail-fortune">' +
      '<div class="detail-fortune-emotes">' + emoteImages(star.emotes, "fortune-emote") + "</div>" +
      "<p>" + safeText(star.text) + "</p>" +
    "</div>" +
    '<div class="detail-stats">' +
      "<p><strong>Level " + star.level + "</strong> / " + maxLevel + (atMax ? " (max)" : "") + "</p>" +
      '<div class="exp-bar"><span style="width: ' + (atMax ? 100 : Math.min(100, (star.exp / need) * 100)) + '%"></span></div>' +
      '<p class="muted">' + (atMax ? "Fully grown" : wholeNumber(star.exp) + " / " + need + " exp · +" + wholeNumber(dailyExp(star)) + " exp per day in the constellation") + "</p>" +
      '<p class="muted">' + fillLine + "</p>" +
      rolls +
    "</div>" +
    '<div class="detail-actions">' +
      '<button data-act="favorite">' + (star.favorite ? "★ Favorited" : "☆ Favorite") + "</button>" +
      '<button data-act="toggle"' + (canPlace ? "" : " disabled") + ">" +
        (star.active ? "Take out of constellation" : canPlace ? "Add to constellation" : "Constellation is full") + "</button>" +
      '<button data-act="level"' + (atMax || skyState.crystals < levelCost ? " disabled" : "") + ">" +
        (atMax ? "Max level" : "Level up · ◆ " + levelCost) + "</button>" +
      '<button data-act="scrap" class="danger"' + (star.favorite || star.active ? " disabled" : "") + ">" +
        (star.favorite ? "Favorites can't be scrapped" : star.active ? "Take it out to scrap it" : "Scrap for ◆ " + scrapValue(star)) + "</button>" +
    "</div>" +
    '<h3 class="skills-title">Skills</h3>' +
    '<ul class="skill-list">' + skills + "</ul>";
  paintStarIcons(drawerDetail);
  if (!detailSpinning) {
    detailSpinning = true;
    requestAnimationFrame(spinDetailStar);
  }
}

// a word for how strong a skill's roll was
function rollLabel(star, skill) {
  const quality = rollQuality(skill.roll, skillRollRanges[star.rarity - 1]);
  if (quality >= 0.67) {
    return "strong roll";
  }
  if (quality < 0.33) {
    return "weak roll";
  }
  return "average roll";
}

/* ---------- clicks ---------- */

starsButton.addEventListener("click", function () {
  openStarDrawer("browse");
});

document.getElementById("drawerClose").addEventListener("click", closeStarDrawer);

starDrawer.addEventListener("click", function (event) {
  if (event.target === starDrawer) {
    closeStarDrawer();
    return;
  }

  const card = event.target.closest(".star-card");
  if (card) {
    const star = findStar(Number(card.getAttribute("data-id")));
    if (!star) {
      return;
    }
    if (drawerMode === "pick") {
      setActive(star, true);
      renderSky();
      closeStarDrawer();
      return;
    }
    detailStarId = star.id;
    scrapArmed = false;
    renderStarDetail(star);
    drawerDetail.scrollTop = 0;
    return;
  }

  if (event.target.closest(".detail-back")) {
    detailStarId = null;
    renderStarGrid();
    return;
  }

  const star = findStar(detailStarId);
  if (!star) {
    return;
  }

  const skillButton = event.target.closest(".skill-up");
  if (skillButton) {
    if (buySkillLevel(star, Number(skillButton.getAttribute("data-skill")))) {
      playCollect(star.rarity);
    }
    refreshStarDrawer();
    renderSky();
    return;
  }

  const action = event.target.closest("[data-act]");
  if (!action) {
    return;
  }
  const act = action.getAttribute("data-act");
  if (act === "favorite") {
    star.favorite = !star.favorite;
    saveSky();
  } else if (act === "toggle") {
    setActive(star, !star.active);
    renderSky();
  } else if (act === "level") {
    if (buyLevel(star)) {
      playCollect(star.rarity);
    }
    renderSky();
  } else if (act === "scrap") {
    // asks once more before scrapping
    if (!scrapArmed) {
      scrapArmed = true;
      action.textContent = "Tap again to scrap " + star.name;
      return;
    }
    scrapArmed = false;
    const value = scrapValue(star);
    if (scrapStar(star)) {
      showToast(star.name + " became " + value + " stellar crystal" + (value === 1 ? "" : "s"));
      detailStarId = null;
      renderSky();
    }
  }
  refreshStarDrawer();
});

// renaming a star
starDrawer.addEventListener("change", function (event) {
  if (event.target.classList.contains("star-name")) {
    const star = findStar(detailStarId);
    if (star) {
      star.name = event.target.value.trim().slice(0, 30) || star.name;
      saveSky();
      renderSky();
    }
  }
});

starSort.addEventListener("change", renderStarGrid);
starFilter.addEventListener("change", renderStarGrid);

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && !starDrawer.hidden) {
    closeStarDrawer();
  }
});
