const groupPhotos = [
  "imgs/imggrupo1.jpeg",
  "imgs/imggrupo2.jpeg",
  "imgs/imggrupo3.PNG",
  "imgs/imggrupo4.PNG",
  "imgs/imggrupo5.PNG",
  "imgs/imggrupo6.jpeg",
  "imgs/imggrupo7.jpeg",
  "imgs/imggrupo8.jpeg",
  "imgs/imggrupo9.jpeg",
  "imgs/imggrupo10.jpeg",
  "imgs/imggrupo11.jpeg",
  "imgs/imggrupo12.jpeg",
  "imgs/imggrupo13.jpeg",
  "imgs/imggrupo14.jpeg",
];

const music = document.querySelector("#birthdayMusic");
const musicButton = document.querySelector("#musicButton");
const musicButtonText = document.querySelector(".music-button__text");
const groupCarouselTrack = document.querySelector("#groupCarouselTrack");
const lightbox = document.querySelector("#imageLightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxClose = document.querySelector("#lightboxClose");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let musicFadeFrame;

function updateMusicButton(isPlaying) {
  musicButton.setAttribute("aria-pressed", String(isPlaying));
  musicButton.classList.toggle("is-playing", isPlaying);
  musicButtonText.textContent = isPlaying ? "Pausar musica" : "Tocar musica";
}

function fadeMusic(targetVolume, onComplete) {
  cancelAnimationFrame(musicFadeFrame);

  if (prefersReducedMotion) {
    music.volume = targetVolume;
    onComplete?.();
    return;
  }

  const startVolume = music.volume;
  const duration = 650;
  const startedAt = performance.now();

  function tick(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    music.volume = startVolume + (targetVolume - startVolume) * progress;

    if (progress < 1) {
      musicFadeFrame = requestAnimationFrame(tick);
      return;
    }

    onComplete?.();
  }

  musicFadeFrame = requestAnimationFrame(tick);
}

musicButton.addEventListener("click", async () => {
  if (music.paused) {
    try {
      music.volume = 0;
      await music.play();
      updateMusicButton(true);
      fadeMusic(1);
    } catch {
      updateMusicButton(false);
    }

    return;
  }

  updateMusicButton(false);
  fadeMusic(0, () => {
    music.pause();
  });
});

music.addEventListener("ended", () => updateMusicButton(false));

function createElement(tagName, className, textContent) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
}

function buildGroupCarousel() {
  if (!groupCarouselTrack) {
    return;
  }

  groupPhotos.forEach((photo, index) => {
    const slide = createElement("div", "friend-carousel__slide");
    const image = document.createElement("img");

    image.src = photo;
    image.alt = `Momento do grupo - foto ${index + 1}`;
    image.loading = "lazy";
    slide.append(image);
    groupCarouselTrack.append(slide);
  });
}

function setupCarousel(carousel, index) {
  const track = carousel.querySelector(".friend-carousel__track");
  const slides = Array.from(carousel.querySelectorAll(".friend-carousel__slide"));
  const friendName = carousel.closest(".friend-message")?.querySelector("strong")?.textContent || "grupo";
  const shouldAutoplay = carousel.id === "groupCarousel" && !prefersReducedMotion;
  let currentSlide = 0;
  let autoplayTimer;

  if (!track || slides.length <= 1) {
    carousel.dataset.carousel = String(index);
    return;
  }

  const previousButton = createElement("button", "friend-carousel__button", "<");
  const nextButton = createElement("button", "friend-carousel__button", ">");
  const counter = createElement("span", "friend-carousel__counter");
  const controls = createElement("div", "friend-carousel__controls");
  const dots = createElement("div", "friend-carousel__dots");
  const dotButtons = slides.map((_, slideIndex) => {
    const dot = createElement("button", "friend-carousel__dot");
    dot.type = "button";
    dot.setAttribute("aria-label", `Ir para foto ${slideIndex + 1} de ${friendName}`);
    dot.addEventListener("click", () => {
      currentSlide = slideIndex;
      updateCarousel();
      restartAutoplay();
    });
    return dot;
  });

  previousButton.type = "button";
  previousButton.setAttribute("aria-label", `Foto anterior de ${friendName}`);
  nextButton.type = "button";
  nextButton.setAttribute("aria-label", `Proxima foto de ${friendName}`);

  function updateCarousel() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    counter.textContent = `${currentSlide + 1} / ${slides.length}`;
    dotButtons.forEach((dot, slideIndex) => {
      dot.classList.toggle("is-active", slideIndex === currentSlide);
      dot.setAttribute("aria-current", slideIndex === currentSlide ? "true" : "false");
    });
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = undefined;
    }
  }

  function startAutoplay() {
    if (!shouldAutoplay || autoplayTimer) {
      return;
    }

    autoplayTimer = setInterval(() => {
      currentSlide = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
      updateCarousel();
    }, 4200);
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  previousButton.addEventListener("click", () => {
    currentSlide = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    updateCarousel();
    restartAutoplay();
  });

  nextButton.addEventListener("click", () => {
    currentSlide = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
    updateCarousel();
    restartAutoplay();
  });

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("focusout", startAutoplay);

  dots.append(...dotButtons);
  controls.append(previousButton, counter, nextButton, dots);
  carousel.append(controls);
  carousel.dataset.carousel = String(index);
  updateCarousel();
  startAutoplay();
}

function openLightbox(image) {
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-lightbox-open");
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  lightboxImage.alt = "";
  document.body.classList.remove("is-lightbox-open");
}

function setupLightbox() {
  document.querySelectorAll(".friend-carousel__slide img").forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");

    image.addEventListener("click", () => openLightbox(image));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(image);
      }
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });
}

function createFloatingParticles() {
  if (prefersReducedMotion) {
    return;
  }

  const particleLayer = createElement("div", "floating-particles");
  const particleCount = window.innerWidth < 768 ? 8 : 16;

  for (let index = 0; index < particleCount; index += 1) {
    const particle = createElement("span", "floating-particles__item");
    particle.style.setProperty("--particle-x", `${Math.random() * 100}%`);
    particle.style.setProperty("--particle-y", `${Math.random() * 100}%`);
    particle.style.setProperty("--particle-size", `${6 + Math.random() * 12}px`);
    particle.style.setProperty("--particle-delay", `${Math.random() * -12}s`);
    particle.style.setProperty("--particle-duration", `${14 + Math.random() * 12}s`);
    particleLayer.append(particle);
  }

  document.body.append(particleLayer);
}

function setupRevealAnimations() {
  const revealElements = [
    document.querySelector(".site-header .eyebrow"),
    document.querySelector(".site-header h1"),
    document.querySelector(".site-header > p:not(.eyebrow)"),
    document.querySelector(".music-player"),
    ...document.querySelectorAll(".messages-section, .group-section, .friend-message"),
  ].filter(Boolean);

  revealElements.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${Math.min(index * 45, 280)}ms`);
  });

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function setupHeroParallax() {
  if (prefersReducedMotion) {
    return;
  }

  let ticking = false;

  function updateParallax() {
    const shift = Math.min(window.scrollY * 0.08, 28);
    document.documentElement.style.setProperty("--hero-shift", `${shift}px`);
    document.documentElement.style.setProperty("--hero-shift-soft", `${shift * 0.14}px`);
    document.documentElement.style.setProperty("--hero-shift-inverse", `${shift * -0.45}px`);
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateParallax();
}

buildGroupCarousel();
createFloatingParticles();
document.querySelectorAll(".friend-carousel").forEach(setupCarousel);
setupLightbox();
setupRevealAnimations();
setupHeroParallax();
