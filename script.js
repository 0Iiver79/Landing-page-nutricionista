// Interacoes da landing page da Dra. Ana Beatriz

(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const API_BASE = document.body.dataset.apiBase || '';
  const googleApiEnabled = document.body.dataset.googleApi === 'true';
  const PLACE_ID = 'ChIJS1n4d75ZzpQRinLG5WPTb_M';

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Cache indisponivel, seguimos com conteudo estatico.
    }
  }

  function debounceFrame(callback) {
    let frameId = null;

    return (...args) => {
      if (frameId) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        callback(...args);
      });
    };
  }

  function setPressed(items, activeIndex) {
    items.forEach((item, index) => {
      const isActive = index === activeIndex;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
  }

  function initNavbar() {
    const navbar = qs('.custom-navbar');
    const navbarCollapse = qs('#navbarMobile');
    const navbarToggler = qs('.navbar-toggler');

    if (navbarCollapse && navbarToggler && window.bootstrap) {
      navbarCollapse.addEventListener('show.bs.collapse', () => {
        navbarToggler.classList.add('is-active');
      });

      navbarCollapse.addEventListener('hide.bs.collapse', () => {
        navbarToggler.classList.remove('is-active');
      });

      qsa('.nav-link', navbarCollapse).forEach(link => {
        link.addEventListener('click', () => {
          const bsCollapse = window.bootstrap.Collapse.getInstance(navbarCollapse);
          bsCollapse?.hide();
        });
      });
    }

    if (navbar) {
      const handleNavbarScroll = debounceFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
      });

      window.addEventListener('scroll', handleNavbarScroll, { passive: true });
      handleNavbarScroll();
    }
  }

  function initSmoothAnchors() {
    qsa('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', event => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId.length <= 1) return;

        const target = qs(targetId);
        if (!target) return;

        event.preventDefault();

        const navbarHeight = qs('.custom-navbar')?.offsetHeight || 0;
        const top = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

        window.scrollTo({
          top,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      });
    });
  }

  function initFadeUp() {
    const fadeElements = qsa('.fade-up');
    if (!fadeElements.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      fadeElements.forEach(element => element.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('visible');
        currentObserver.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.12
    });

    fadeElements.forEach(element => observer.observe(element));
  }

  function createCarousel({
    root,
    slideSelector,
    dotSelector,
    nextSelector,
    prevSelector,
    intervalMs = 6000
  }) {
    if (!root) return null;

    let index = 0;
    let intervalId = null;

    const getSlides = () => qsa(slideSelector, root);
    const getDots = () => qsa(dotSelector, root);

    function update(nextIndex) {
      const slides = getSlides();
      const dots = getDots();
      if (!slides.length) return;

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === index;
        slide.classList.toggle('active', isActive);
        slide.toggleAttribute('inert', !isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
      });

      setPressed(dots, index);
    }

    function next() {
      update(index + 1);
    }

    function prev() {
      update(index - 1);
    }

    function stop() {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    }

    function start() {
      stop();
      if (prefersReducedMotion || getSlides().length <= 1) return;
      intervalId = window.setInterval(next, intervalMs);
    }

    function reset() {
      stop();
      start();
    }

    root.addEventListener('click', event => {
      const nextButton = event.target.closest(nextSelector);
      const prevButton = event.target.closest(prevSelector);
      const dot = event.target.closest(dotSelector);

      if (nextButton) {
        next();
        reset();
        return;
      }

      if (prevButton) {
        prev();
        reset();
        return;
      }

      if (dot) {
        const dots = getDots();
        const dotIndex = dots.indexOf(dot);
        if (dotIndex >= 0) {
          update(dotIndex);
          reset();
        }
      }
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    root.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
        reset();
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prev();
        reset();
      }
    });

    update(0);
    start();

    return { update, start, stop, reset };
  }

  function initSobreCarousel() {
    return createCarousel({
      root: qs('.sobre-img-frame'),
      slideSelector: '.sobre-slide',
      dotSelector: '.sobre-dot',
      nextSelector: '[data-carousel-next]',
      prevSelector: '[data-carousel-prev]',
      intervalMs: 5000
    });
  }

  function initDepoimentosCarousel() {
    const root = qs('.depoimentos-carousel');
    if (root) {
      root.setAttribute('tabindex', '0');
    }

    return createCarousel({
      root,
      slideSelector: '.depoimento-card',
      dotSelector: '.carousel-dots .dot',
      nextSelector: '.carousel-btn.next',
      prevSelector: '.carousel-btn.prev',
      intervalMs: 7000
    });
  }

  function initialsFromName(name = 'Paciente') {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase() || 'P';
  }

  function createStar(isFilled) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

    svg.classList.add('star');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');

    polygon.setAttribute('points', '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2');
    polygon.setAttribute('fill', isFilled ? '#C8A45A' : '#e8f2e8');

    svg.appendChild(polygon);
    return svg;
  }

  function createGoogleReviewCard(review, position) {
    const article = document.createElement('article');
    const text = String(review.text || '').trim();
    const authorName = String(review.author_name || 'Paciente');
    const relativeTime = String(review.relative_time_description || 'Google Maps');
    const rating = Math.max(0, Math.min(5, Number(review.rating) || 5));
    const maxLength = 280;
    const isLong = text.length > maxLength;
    const shortText = isLong ? `${text.slice(0, maxLength).trim()}...` : text;

    article.className = 'depoimento-card';
    article.setAttribute('role', 'group');
    article.setAttribute('aria-roledescription', 'slide');
    article.setAttribute('aria-label', `Avaliação ${position}`);

    const quote = document.createElement('div');
    quote.className = 'quote-icon';
    quote.setAttribute('aria-hidden', 'true');
    quote.textContent = '"';

    const paragraph = document.createElement('p');
    paragraph.className = 'depoimento-text';

    const shortSpan = document.createElement('span');
    shortSpan.className = 'review-text-short';
    shortSpan.textContent = shortText;
    paragraph.appendChild(shortSpan);

    let fullSpan = null;
    let readMoreButton = null;

    if (isLong) {
      fullSpan = document.createElement('span');
      fullSpan.className = 'review-text-full';
      fullSpan.hidden = true;
      fullSpan.textContent = text;
      paragraph.appendChild(fullSpan);

      readMoreButton = document.createElement('button');
      readMoreButton.type = 'button';
      readMoreButton.className = 'review-read-more';
      readMoreButton.setAttribute('aria-expanded', 'false');
      readMoreButton.textContent = 'Ler mais';

      readMoreButton.addEventListener('click', event => {
        event.stopPropagation();
        const expanded = readMoreButton.getAttribute('aria-expanded') === 'true';

        shortSpan.hidden = !expanded;
        fullSpan.hidden = expanded;
        readMoreButton.textContent = expanded ? 'Ler mais' : 'Ler menos';
        readMoreButton.setAttribute('aria-expanded', String(!expanded));
      });
    }

    const stars = document.createElement('div');
    stars.className = 'stars';
    stars.setAttribute('aria-label', `Avaliação: ${rating} de 5 estrelas`);

    for (let starIndex = 0; starIndex < 5; starIndex += 1) {
      stars.appendChild(createStar(starIndex < rating));
    }

    const author = document.createElement('div');
    author.className = 'depoimento-author';

    const avatar = document.createElement('div');
    avatar.className = 'author-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = initialsFromName(authorName);

    const authorInfo = document.createElement('div');
    authorInfo.className = 'author-info';

    const name = document.createElement('span');
    name.className = 'author-name';
    name.textContent = authorName;

    const detail = document.createElement('span');
    detail.className = 'author-detail';
    detail.textContent = `Google Maps • ${relativeTime}`;

    authorInfo.append(name, detail);
    author.append(avatar, authorInfo);
    article.append(quote, paragraph);

    if (readMoreButton) {
      article.appendChild(readMoreButton);
    }

    article.append(stars, author);
    return article;
  }

  function appendGoogleReviews(reviews, carousel) {
    const container = qs('.carousel-container');
    const dotsContainer = qs('.carousel-dots');
    if (!container || !dotsContainer || !Array.isArray(reviews) || !reviews.length) return;

    reviews.slice(0, 4).forEach((review, index) => {
      container.appendChild(createGoogleReviewCard(review, index + 4));
    });

    const cards = qsa('.depoimento-card', container);
    const currentDots = qsa('.dot', dotsContainer);

    for (let index = currentDots.length; index < cards.length; index += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot';
      dot.setAttribute('aria-label', `Ir para depoimento ${index + 1}`);
      dot.setAttribute('aria-pressed', 'false');
      dotsContainer.appendChild(dot);
    }

    carousel?.update(0);
    carousel?.reset();
  }

  async function loadGoogleMapReviews(carousel) {
    if (!googleApiEnabled) return;

    const cacheKey = 'gmaps_reviews_cache';
    const cacheTime = 'gmaps_reviews_time';
    const cacheDuration = 12 * 60 * 60 * 1000;

    try {
      const now = Date.now();
      const lastCache = Number(safeStorageGet(cacheTime));
      const cached = safeStorageGet(cacheKey);

      if (cached && lastCache && now - lastCache < cacheDuration) {
        appendGoogleReviews(JSON.parse(cached), carousel);
        return;
      }

      const response = await fetch(`${API_BASE}/api/reviews`, {
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error('Erro ao buscar reviews');

      const { data: reviews } = await response.json();
      if (!Array.isArray(reviews)) return;

      safeStorageSet(cacheKey, JSON.stringify(reviews));
      safeStorageSet(cacheTime, String(now));
      appendGoogleReviews(reviews, carousel);
    } catch (error) {
      console.warn('Reviews do Google Maps não disponíveis:', error.message);
    }
  }

  function updatePlaceCard(place) {
    const credCard = qs('.cred-card');
    const credText = qs('.cred-text', credCard);
    if (!credCard || !credText || !place?.formatted_address) return;

    const addressParts = place.formatted_address.split(', ');
    const street = addressParts[0] || place.formatted_address;
    const city = addressParts.slice(1, 3).join(', ');
    const mapsUrl = place.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.formatted_address)}`;

    credCard.href = mapsUrl;
    credCard.setAttribute('aria-label', `Ver localização no Google Maps: ${place.formatted_address}`);

    const streetNode = document.createElement('strong');
    streetNode.textContent = street;

    const cityNode = document.createElement('span');
    cityNode.textContent = city;

    const hintNode = document.createElement('em');
    hintNode.className = 'maps-hint';
    hintNode.textContent = '↗ Ver no Maps';

    credText.replaceChildren(streetNode, cityNode, hintNode);
  }

  function updatePlacePhotos(photos) {
    const slides = qsa('.sobre-slide');
    if (!Array.isArray(photos) || !photos.length || !slides.length) return;

    photos.slice(0, slides.length).forEach((photo, index) => {
      if (!photo.reference || !slides[index]) return;

      const img = document.createElement('img');
      img.src = `${API_BASE}/api/place/photo/${encodeURIComponent(photo.reference)}`;
      img.alt = `Consultório Dra. Ana Beatriz - foto ${index + 1}`;
      img.className = 'sobre-real-image';
      img.loading = index === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';

      slides[index].replaceChildren(img);
    });
  }

  async function loadGooglePlaceData() {
    if (!googleApiEnabled) return;

    try {
      const response = await fetch(`${API_BASE}/api/place?placeId=${encodeURIComponent(PLACE_ID)}`, {
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error('Erro ao buscar dados do local');

      const { data } = await response.json();
      updatePlaceCard(data);
      updatePlacePhotos(data?.photos);
    } catch (error) {
      console.warn('Dados do Google Places não disponíveis:', error.message);
    }
  }

  function initFaq() {
    const faqItems = qsa('.faq-item');

    faqItems.forEach((item, index) => {
      const trigger = qs('.faq-trigger', item);
      const answer = qs('.faq-answer', item);
      if (!trigger || !answer) return;

      if (!answer.getAttribute('aria-labelledby')) {
        const triggerId = trigger.id || `faq-trigger-${index + 1}`;
        trigger.id = triggerId;
        answer.setAttribute('aria-labelledby', triggerId);
      }

      trigger.addEventListener('click', () => {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';

        faqItems.forEach(otherItem => {
          const otherTrigger = qs('.faq-trigger', otherItem);
          const otherAnswer = qs('.faq-answer', otherItem);

          otherTrigger?.setAttribute('aria-expanded', 'false');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
          otherItem.classList.remove('active', 'open');
        });

        if (!isOpen) {
          trigger.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = `${answer.scrollHeight}px`;
          item.classList.add('active', 'open');
        }
      });
    });
  }

  function initFab() {
    const fab = qs('#fab');
    if (!fab) return;

    const toggleFab = debounceFrame(() => {
      const shouldShow = window.scrollY > 500;

      if (shouldShow) {
        fab.hidden = false;
        window.requestAnimationFrame(() => fab.classList.add('is-visible'));
        return;
      }

      fab.classList.remove('is-visible');
      window.setTimeout(() => {
        if (!fab.classList.contains('is-visible')) {
          fab.hidden = true;
        }
      }, 250);
    });

    window.addEventListener('scroll', toggleFab, { passive: true });
    fab.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });

    toggleFab();
  }

  function markLoadedImages() {
    qsa('img').forEach(img => {
      if (img.complete) {
        img.classList.add('loaded');
        return;
      }

      img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initSmoothAnchors();
    initFadeUp();
    initSobreCarousel();
    const depoimentosCarousel = initDepoimentosCarousel();
    initFaq();
    initFab();
    markLoadedImages();
    loadGoogleMapReviews(depoimentosCarousel);
    loadGooglePlaceData();
  });
})();
