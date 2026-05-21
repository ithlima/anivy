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

function updateMusicButton(isPlaying) {
  musicButton.setAttribute("aria-pressed", String(isPlaying));
  musicButton.classList.toggle("is-playing", isPlaying);
  musicButtonText.textContent = isPlaying ? "Pausar musica" : "Tocar musica";
}

musicButton.addEventListener("click", async () => {
  if (music.paused) {
    try {
      await music.play();
      updateMusicButton(true);
    } catch {
      updateMusicButton(false);
    }

    return;
  }

  music.pause();
  updateMusicButton(false);
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
  let currentSlide = 0;

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

  previousButton.addEventListener("click", () => {
    currentSlide = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    updateCarousel();
  });

  nextButton.addEventListener("click", () => {
    currentSlide = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
    updateCarousel();
  });

  dots.append(...dotButtons);
  controls.append(previousButton, counter, nextButton, dots);
  carousel.append(controls);
  carousel.dataset.carousel = String(index);
  updateCarousel();
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

buildGroupCarousel();
document.querySelectorAll(".friend-carousel").forEach(setupCarousel);
setupLightbox();
