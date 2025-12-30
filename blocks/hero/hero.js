// Hero block: supports single-image hero and multi-slide hero (carousel-like)

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.hero-slide');
  if (!slides.length) return;
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;

  block.dataset.activeSlide = realSlideIndex;

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== realSlideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== realSlideIndex) link.setAttribute('tabindex', '-1');
      else link.removeAttribute('tabindex');
    });
  });

  const indicators = block.querySelectorAll('.tns-nav > button');
  indicators.forEach((indicator, idx) => {
    if (idx !== realSlideIndex) {
      indicator.classList.remove('tns-nav-active');
      indicator.removeAttribute('disabled');
    } else {
      indicator.classList.add('tns-nav-active');
      indicator.setAttribute('disabled', 'true');
    }
  });

  const track = block.querySelector('.hero-slides');
  if (track) track.style.transform = `translate3d(-${realSlideIndex * 100}%, 0, 0)`;
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.tns-nav');
  if (slideIndicators) {
    slideIndicators.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', (e) => {
        showSlide(block, parseInt(e.currentTarget.dataset.targetSlide, 10));
      });
    });
  }

  const prev = block.querySelector('#js-carouselIndexNav .prev');
  const next = block.querySelector('#js-carouselIndexNav .next');
  if (prev) prev.addEventListener('click', () => {
    const current = parseInt(block.dataset.activeSlide || '0', 10);
    showSlide(block, current - 1);
  });
  if (next) next.addEventListener('click', () => {
    const current = parseInt(block.dataset.activeSlide || '0', 10);
    showSlide(block, current + 1);
  });
}

function startAutoplay(block, interval = 6000) {
  const slides = block.querySelectorAll('.hero-slide');
  if (slides.length < 2) return;
  setInterval(() => {
    const currentIndex = parseInt(block.dataset.activeSlide || '0', 10);
    const nextIndex = (currentIndex + 1) % slides.length;
    showSlide(block, nextIndex);
  }, interval);
}

function cloneImgFrom(el) {
  if (!el) return null;
  const img = el.tagName === 'IMG' ? el : el.querySelector('img');
  if (!img) return null;
  const cloned = img.cloneNode(true);
  cloned.removeAttribute('width');
  cloned.removeAttribute('height');
  return cloned;
}

function createSlide(row, slideIndex) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.classList.add('hero-slide');

  const cols = row.querySelectorAll(':scope > div');
  const imageCol = cols[0];
  const contentCol = cols[1];

  const images = imageCol ? [...imageCol.querySelectorAll('picture, img')] : [];
  const desktopImg = cloneImgFrom(images[0]);
  const mobileImg = cloneImgFrom(images[1]);

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  card.setAttribute('id', `js-carouselIndex-item${slideIndex}`);

  if (desktopImg) {
    desktopImg.classList.add('card-bg', 'hidden-xs', 'hidden-sm');
    card.append(desktopImg);
  }

  if (mobileImg) {
    const mobileWrap = document.createElement('div');
    mobileWrap.classList.add('card-bg', 'is-mobile', 'visible-xs', 'visible-sm');
    mobileWrap.append(mobileImg);
    card.append(mobileWrap);
  }

  const overlay = document.createElement('div');
  overlay.classList.add('card-overlay');
  const body = document.createElement('div');
  body.classList.add('card-body');
  const rowEl = document.createElement('div');
  rowEl.classList.add('row');
  const colEl = document.createElement('div');
  colEl.classList.add('col-xs-12', 'text-center');

  if (contentCol) {
    const cta = contentCol.querySelector('a');
    if (cta) {
      cta.classList.add('btn', 'btn-white');
      colEl.append(cta);
    } else {
      const text = contentCol.textContent ? contentCol.textContent.trim() : '';
      if (text) {
        const fauxCta = document.createElement('span');
        fauxCta.classList.add('btn', 'btn-white');
        fauxCta.textContent = text;
        colEl.append(fauxCta);
      } else {
        while (contentCol.firstChild) colEl.append(contentCol.firstChild);
      }
    }
  }

  rowEl.append(colEl);
  body.append(rowEl);
  overlay.append(body);
  card.append(overlay);
  slide.append(card);

  if (contentCol) {
    const labeledBy = contentCol.querySelector('h1, h2, h3, h4, h5, h6');
    if (labeledBy && labeledBy.getAttribute('id')) {
      slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
    }
  }

  return slide;
}

export default function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div'));

  // Single hero fallback: keep existing picture + heading layout
  if (rows.length === 1) return;

  const container = document.createElement('div');
  container.classList.add('carousel-container', 'carousel-index');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('hero-slides');
  block.prepend(slidesWrapper);

  // Indicators
  const slideIndicatorsNav = document.createElement('div');
  slideIndicatorsNav.classList.add('tns-nav');
  slideIndicatorsNav.setAttribute('aria-label', 'Carousel Pagination');
  block.append(slideIndicatorsNav);

  // Prev/Next controls
  const controls = document.createElement('div');
  controls.setAttribute('id', 'js-carouselIndexNav');
  controls.classList.add('carousel-controls', 'carousel-arrows-lr');
  controls.setAttribute('aria-label', 'Carousel Navigation');
  const prev = document.createElement('div');
  prev.classList.add('prev');
  prev.setAttribute('data-controls', 'prev');
  const prevIcon = document.createElement('div');
  prevIcon.classList.add('icon-carousel-left');
  prev.append(prevIcon);
  const next = document.createElement('div');
  next.classList.add('next');
  next.setAttribute('data-controls', 'next');
  const nextIcon = document.createElement('div');
  nextIcon.classList.add('icon-carousel-right');
  next.append(nextIcon);
  controls.append(prev, next);
  block.append(controls);

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx);
    slidesWrapper.append(slide);

    const indicator = document.createElement('button');
    indicator.type = 'button';
    indicator.dataset.targetSlide = idx;
    indicator.setAttribute('aria-label', `Carousel Page ${idx + 1}`);
    slideIndicatorsNav.append(indicator);

    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);
  bindEvents(block);
  showSlide(block, 0);
  startAutoplay(block);
}
