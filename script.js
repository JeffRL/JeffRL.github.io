// Builds the projects part of the page from content.js and runs the scroll animations.
// (stars.js handles the background, so don't reuse its variable names here)


const nav = document.getElementById("nav");
const content = document.getElementById("content");
const hero = document.getElementById("hero");
const heroText = document.getElementById("heroText");
const scrollHint = document.getElementById("scrollHint");
const aboutText = document.getElementById("aboutText");

let projects = [];

// turns "Personal Projects" into "personal-projects" for the nav links
function makeId(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function clamp(value) {
  return Math.min(Math.max(value, 0), 1);
}

// starts slow, ends slow
function ease(value) {
  return value * value * (3 - 2 * value);
}

function buildCategory(category) {
  const id = makeId(category.title);

  // one section per category, with the title on top and its projects under it
  const section = document.createElement("section");
  section.className = "category";
  section.id = id;

  const header = document.createElement("div");
  header.className = "category-header reveal";

  const title = document.createElement("h2");
  title.textContent = category.title;
  header.appendChild(title);

  const count = document.createElement("p");
  count.textContent = category.projects.length + (category.projects.length === 1 ? " project" : " projects");
  header.appendChild(count);

  section.appendChild(header);
  content.appendChild(section);

  // add a link for it in the nav, before the GitHub link
  const link = document.createElement("a");
  link.className = "nav-link";
  link.href = "#" + id;
  link.textContent = category.title;
  nav.insertBefore(link, nav.lastElementChild);

  for (let i = 0; i < category.projects.length; i++) {
    buildProject(category.projects[i], section);
  }
}

function buildProject(info, parent) {
  const section = document.createElement("article");
  section.className = "project";

  const text = document.createElement("div");
  text.className = "project-text";

  const name = document.createElement("h3");
  name.textContent = info.name;
  text.appendChild(name);

  const description = document.createElement("p");
  description.textContent = info.description;
  text.appendChild(description);

  const button = document.createElement("a");
  button.className = "button";
  button.href = info.link;
  button.target = "_blank";
  button.rel = "noopener";
  button.textContent = "View on GitHub";
  text.appendChild(button);

  const carousel = document.createElement("div");
  carousel.className = "carousel";

  const track = document.createElement("div");
  track.className = "track";
  track.tabIndex = 0;
  track.setAttribute("aria-label", info.name + " screenshots");
  if (info.images.length === 1) {
    track.classList.add("single");
  }

  const project = {
    element: section,
    text: text,
    carousel: carousel,
    track: track,
    slides: [],
    images: [],
    dots: [],
    current: 0,
    onScreen: false,
    slideUpdateWaiting: false
  };

  for (let i = 0; i < info.images.length; i++) {
    const slide = document.createElement("div");
    slide.className = "slide";

    const img = document.createElement("img");
    img.src = info.images[i];
    img.alt = info.name + " screenshot " + (i + 1);
    img.loading = "lazy";
    img.decoding = "async";
    img.draggable = false;

    slide.appendChild(img);
    track.appendChild(slide);
    project.slides.push(slide);
    project.images.push(img);
  }

  carousel.appendChild(track);

  // arrows and dots, only if there's more than one image
  if (info.images.length > 1) {
    const controls = document.createElement("div");
    controls.className = "controls";

    const prev = document.createElement("button");
    prev.className = "arrow";
    prev.setAttribute("aria-label", "Previous image");
    prev.innerHTML = "&#8249;";
    prev.addEventListener("click", function () {
      goToSlide(project, project.current - 1);
    });

    const dots = document.createElement("div");
    dots.className = "dots";
    for (let i = 0; i < info.images.length; i++) {
      const dot = document.createElement("button");
      dot.className = i === 0 ? "dot active" : "dot";
      dot.setAttribute("aria-label", "Show image " + (i + 1));
      dot.addEventListener("click", function () {
        goToSlide(project, i);
      });
      dots.appendChild(dot);
      project.dots.push(dot);
    }

    const next = document.createElement("button");
    next.className = "arrow";
    next.setAttribute("aria-label", "Next image");
    next.innerHTML = "&#8250;";
    next.addEventListener("click", function () {
      goToSlide(project, project.current + 1);
    });

    controls.appendChild(prev);
    controls.appendChild(dots);
    controls.appendChild(next);
    carousel.appendChild(controls);

    setUpDragging(project);
  }

  track.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToSlide(project, project.current - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goToSlide(project, project.current + 1);
    }
  });

  track.addEventListener("scroll", function () {
    if (project.slideUpdateWaiting) {
      return;
    }
    project.slideUpdateWaiting = true;
    requestAnimationFrame(function () {
      updateSlides(project);
      project.slideUpdateWaiting = false;
    });
  }, { passive: true });

  // start hidden, the scroll animation fades them in
  text.style.opacity = 0;
  carousel.style.opacity = 0;

  section.appendChild(text);
  section.appendChild(carousel);
  parent.appendChild(section);
  projects.push(project);
}

function goToSlide(project, index) {
  if (index < 0) {
    index = 0;
  }
  if (index > project.slides.length - 1) {
    index = project.slides.length - 1;
  }
  const slide = project.slides[index];
  const left = slide.offsetLeft - (project.track.clientWidth - slide.offsetWidth) / 2;
  project.track.scrollTo({ left: left, behavior: "smooth" });
}

// shrink and dim slides the further they are from the middle, and update the dots
function updateSlides(project) {
  const track = project.track;
  const middle = track.scrollLeft + track.clientWidth / 2;
  let closest = 0;
  let closestDistance = Infinity;

  for (let i = 0; i < project.slides.length; i++) {
    const slide = project.slides[i];
    const slideMiddle = slide.offsetLeft + slide.offsetWidth / 2;
    const distance = Math.abs(slideMiddle - middle);
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = i;
    }
    const away = clamp(distance / slide.offsetWidth);
    project.images[i].style.transform = "scale(" + (1 - away * 0.1) + ")";
    project.images[i].style.opacity = 1 - away * 0.6;
  }

  if (closest !== project.current && project.dots.length > 0) {
    project.dots[project.current].classList.remove("active");
    project.dots[closest].classList.add("active");
  }
  project.current = closest;
}

// lets you drag the images with a mouse. Touch screens and trackpads already swipe on their own.
function setUpDragging(project) {
  const track = project.track;
  let drag = null;
  let snapTimer = null;

  track.addEventListener("pointerdown", function (event) {
    if (event.pointerType !== "mouse" || event.button !== 0) {
      return;
    }
    clearTimeout(snapTimer);
    drag = {
      startX: event.clientX,
      startScroll: track.scrollLeft,
      startIndex: project.current,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      speed: 0
    };
    track.setPointerCapture(event.pointerId);
    track.classList.add("dragging");
  });

  track.addEventListener("pointermove", function (event) {
    if (!drag) {
      return;
    }
    track.scrollLeft = drag.startScroll - (event.clientX - drag.startX);

    // remember how fast it's moving so a quick flick goes to the next image
    const timePassed = event.timeStamp - drag.lastTime;
    if (timePassed > 0) {
      drag.speed = (event.clientX - drag.lastX) / timePassed;
    }
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
  });

  function endDrag() {
    if (!drag) {
      return;
    }
    const moved = drag.lastX - drag.startX;
    let index = drag.startIndex;
    if (moved < -60 || drag.speed < -0.4) {
      index = drag.startIndex + 1;
    } else if (moved > 60 || drag.speed > 0.4) {
      index = drag.startIndex - 1;
    }
    drag = null;
    goToSlide(project, index);

    // turn snapping back on after the slide has finished moving, or it would jump
    snapTimer = setTimeout(function () {
      track.classList.remove("dragging");
    }, 500);
  }

  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  // if the browser takes the mouse away some other way (like letting go outside the window), the drag still ends
  track.addEventListener("lostpointercapture", endDrag);
}

// smoothY follows the real scroll position but eases toward it, which makes mouse wheels feel smooth
let smoothY = window.scrollY;
let animating = false;

function update() {
  const screen = window.innerHeight;
  // how far behind the real scroll position the animation is
  const behind = window.scrollY - smoothY;

  // read all the positions first, then change styles after, so the browser
  // doesn't have to redo the layout in the middle
  const heroRect = hero.getBoundingClientRect();
  const projectRects = [];
  for (let i = 0; i < projects.length; i++) {
    if (projects[i].onScreen) {
      projectRects[i] = projects[i].element.getBoundingClientRect();
    }
  }

  // hero, in three parts: name leaves, blurb comes in and stays a while, blurb leaves
  const heroProgress = clamp(-(heroRect.top + behind) / (heroRect.height - screen));

  const nameOut = ease(clamp(heroProgress / 0.25));
  heroText.style.transform = "translateY(" + (-nameOut * 80) + "px) scale(" + (1 - nameOut * 0.2) + ")";
  heroText.style.opacity = 1 - nameOut;
  scrollHint.style.opacity = clamp(1 - heroProgress * 10);

  const blurbIn = ease(clamp((heroProgress - 0.2) / 0.2));
  const blurbOut = ease(clamp((heroProgress - 0.8) / 0.2));
  const blurbY = (1 - blurbIn) * 60 - blurbOut * 60;
  const blurbScale = 0.94 + blurbIn * 0.06 + blurbOut * 0.04;
  aboutText.style.opacity = blurbIn * (1 - blurbOut);
  aboutText.style.transform = "translate(-50%, -50%) translateY(" + blurbY + "px) scale(" + blurbScale + ")";

  // projects: slide in from below, drift up and fade on the way out
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const rect = projectRects[i];
    if (!rect) {
      continue;
    }

    // 0 when the project is in the middle of the screen, positive below, negative above
    const fromMiddle = (rect.top + behind + rect.height / 2 - screen / 2) / screen;

    if (fromMiddle >= 0) {
      const amount = ease(clamp(1 - fromMiddle * 1.3));
      project.text.style.opacity = amount;
      project.text.style.transform = "translateY(" + (1 - amount) * 80 + "px)";
      project.carousel.style.opacity = amount;
      project.carousel.style.transform = "translateY(" + (1 - amount) * 120 + "px) scale(" + (0.85 + amount * 0.15) + ")";
    } else {
      const amount = ease(clamp(1 + fromMiddle * 1.3));
      project.text.style.opacity = amount;
      project.text.style.transform = "translateY(" + -(1 - amount) * 60 + "px)";
      project.carousel.style.opacity = amount;
      project.carousel.style.transform = "scale(" + (0.92 + amount * 0.08) + ")";
    }
  }
}

function tick() {
  const target = window.scrollY;
  smoothY += (target - smoothY) * 0.12;
  if (Math.abs(target - smoothY) < 0.5) {
    smoothY = target;
  }
  update();

  // keep going until it catches up, then stop so nothing runs while the page is still
  if (smoothY !== target) {
    requestAnimationFrame(tick);
  } else {
    animating = false;
  }
}

function onScroll() {
  if (!animating) {
    animating = true;
    requestAnimationFrame(tick);
  }
}

function watchProjects() {
  // only projects on screen get animated
  const visibleWatcher = new IntersectionObserver(function (entries) {
    for (let i = 0; i < entries.length; i++) {
      for (let j = 0; j < projects.length; j++) {
        if (projects[j].element === entries[i].target) {
          projects[j].onScreen = entries[i].isIntersecting;
        }
      }
    }
    onScroll();
  });

  for (let i = 0; i < projects.length; i++) {
    visibleWatcher.observe(projects[i].element);
  }
}

function watchForPreload() {
  // start loading a project's images when it's about one screen away
  const preloadWatcher = new IntersectionObserver(function (entries) {
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        const imgs = entries[i].target.querySelectorAll("img");
        for (let j = 0; j < imgs.length; j++) {
          imgs[j].loading = "eager";
        }
        preloadWatcher.unobserve(entries[i].target);
      }
    }
  }, { rootMargin: "100% 0px" });

  for (let i = 0; i < projects.length; i++) {
    preloadWatcher.observe(projects[i].element);
  }
}

function watchReveals() {
  const revealWatcher = new IntersectionObserver(function (entries) {
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        entries[i].target.classList.add("visible");
        revealWatcher.unobserve(entries[i].target);
      }
    }
  }, { threshold: 0.2 });

  const items = document.querySelectorAll(".reveal");
  for (let i = 0; i < items.length; i++) {
    revealWatcher.observe(items[i]);
  }
}

for (let i = 0; i < categories.length; i++) {
  buildCategory(categories[i]);
}

for (let i = 0; i < projects.length; i++) {
  updateSlides(projects[i]);
}

watchForPreload();

/* ---------- swipes on phones ---------- */

// every place the page can rest, from top to bottom: the name, the blurb, each project in the middle
// of the screen (or its top if it's taller than the screen), and the very bottom
function restingPoints() {
  const points = [];
  const stops = document.querySelectorAll(".hero-stop");
  for (let i = 0; i < stops.length; i++) {
    points.push(stops[i].getBoundingClientRect().top + window.scrollY);
  }
  for (let i = 0; i < projects.length; i++) {
    const box = projects[i].element.getBoundingClientRect();
    const top = box.top + window.scrollY;
    if (box.height > window.innerHeight) {
      points.push(top);
    } else {
      points.push(top + box.height / 2 - window.innerHeight / 2);
    }
  }
  points.push(document.documentElement.scrollHeight - window.innerHeight);
  return points.sort(function (a, b) {
    return a - b;
  });
}

// a quick flick up or down glides to the next resting point instead of coasting past a few.
// Slow drags are left alone, so you can stop anywhere
function setUpSwipes() {
  let touch = null;

  window.addEventListener("touchstart", function (event) {
    if (event.touches.length !== 1) {
      touch = null;
      return;
    }
    const point = event.touches[0];
    touch = { startX: point.clientX, startY: point.clientY, samples: [{ y: point.clientY, time: event.timeStamp }] };
  }, { passive: true });

  window.addEventListener("touchmove", function (event) {
    if (!touch || event.touches.length !== 1) {
      return;
    }
    touch.lastX = event.touches[0].clientX;
    touch.samples.push({ y: event.touches[0].clientY, time: event.timeStamp });
    // only the last few are needed to tell how fast the finger was going
    if (touch.samples.length > 6) {
      touch.samples.shift();
    }
  }, { passive: true });

  window.addEventListener("touchend", function (event) {
    if (!touch || touch.samples.length < 2) {
      touch = null;
      return;
    }
    const last = touch.samples[touch.samples.length - 1];
    // the finger's speed over roughly the last tenth of a second
    let first = touch.samples[0];
    for (let i = touch.samples.length - 1; i >= 0; i--) {
      if (event.timeStamp - touch.samples[i].time <= 100) {
        first = touch.samples[i];
      }
    }
    const time = Math.max(1, last.time - first.time);
    const speed = (last.y - first.y) / time;
    const sideways = Math.abs((touch.lastX || touch.startX) - touch.startX);
    const upDown = Math.abs(last.y - touch.startY);
    const stillMoving = event.timeStamp - last.time < 100;
    touch = null;

    // a slow or short drag, a sideways swipe on the images, or a finger that stopped before letting go
    if (Math.abs(speed) < 0.7 || upDown < 40 || sideways > upDown || !stillMoving) {
      return;
    }

    // finger going up scrolls the page down, and the other way around
    const goingDown = speed < 0;
    const now = window.scrollY;
    const points = restingPoints();
    let target = null;
    if (goingDown) {
      for (let i = 0; i < points.length; i++) {
        if (points[i] > now + 20) {
          target = points[i];
          break;
        }
      }
    } else {
      for (let i = points.length - 1; i >= 0; i--) {
        if (points[i] < now - 20) {
          target = points[i];
          break;
        }
      }
    }
    if (target !== null) {
      window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    }
  }, { passive: true });
}

watchProjects();
watchReveals();
setUpSwipes();
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
update();

window.addEventListener("resize", function () {
  for (let i = 0; i < projects.length; i++) {
    goToSlide(projects[i], projects[i].current);
  }
});

// cache the site so the next visit loads instantly (doesn't work when opening the file directly)
if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js");
  });
}
