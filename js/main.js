// ==========================================================================
// Mobile navigation toggle
// ==========================================================================
const menuToggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');

if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ==========================================================================
// Sticky header shadow on scroll
// ==========================================================================
const siteHeader = document.getElementById('site-header');

if (siteHeader) {
  window.addEventListener('scroll', () => {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 8);
  });
}

// ==========================================================================
// Footer copyright year
// ==========================================================================
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// ==========================================================================
// Card sliders (Reviews, Video Testimonials)
// Native smooth-scroll (scroll-behavior:smooth / scrollBy({behavior:'smooth'}))
// was found unreliable for this kind of track on a sibling project, so the
// animation is driven by hand with requestAnimationFrame instead.
// ==========================================================================
function initCardSlider(track, prevBtn, nextBtn, cardSelector) {
  if (!track || !prevBtn || !nextBtn) return;
  let animId = null;

  const animateScrollTo = (targetLeft, duration) => {
    if (animId) cancelAnimationFrame(animId);
    const startLeft = track.scrollLeft;
    const distance = targetLeft - startLeft;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      track.scrollLeft = startLeft + distance * eased;
      animId = progress < 1 ? requestAnimationFrame(step) : null;
    };

    animId = requestAnimationFrame(step);
  };

  const scrollByCard = (direction) => {
    const card = track.querySelector(cardSelector);
    if (!card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const amount = (card.getBoundingClientRect().width + gap) * direction;
    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    const targetLeft = Math.max(0, Math.min(track.scrollLeft + amount, maxScrollLeft));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      track.scrollLeft = targetLeft;
    } else {
      animateScrollTo(targetLeft, 350);
    }
  };

  prevBtn.addEventListener('click', () => scrollByCard(-1));
  nextBtn.addEventListener('click', () => scrollByCard(1));

  // Hide the arrows when every card already fits (e.g. 2 videos on desktop)
  const controls = prevBtn.parentElement;
  const updateControls = () => {
    controls.hidden = track.scrollWidth <= track.clientWidth + 1;
  };
  updateControls();
  if ('ResizeObserver' in window) {
    new ResizeObserver(updateControls).observe(track);
  } else {
    window.addEventListener('resize', updateControls);
  }
}

initCardSlider(
  document.getElementById('reviews-track'),
  document.getElementById('reviews-prev'),
  document.getElementById('reviews-next'),
  '.review-card'
);

initCardSlider(
  document.getElementById('video-testimonials-track'),
  document.getElementById('video-testimonials-prev'),
  document.getElementById('video-testimonials-next'),
  '.video-testimonial-card'
);

// ==========================================================================
// YouTube videos: click-to-play popup
// Each .video-embed (intro video + video testimonials) is a plain link to
// the video on YouTube, so it works with JS off. With JS, a click opens the
// video in a native <dialog> popup (Esc, backdrop click, or the close button
// shut it) and closing it removes the iframe, which stops playback. Nothing
// from the YouTube player loads until a visitor presses play.
// YouTube refuses embeds with no referrer (Error 153), which is what a page
// opened straight from disk (file://) sends, so there the links are left to
// open the video on YouTube instead.
// ==========================================================================
const videoLinks = document.querySelectorAll('.video-embed[data-youtube-id]');
const canEmbedYouTube = location.protocol === 'http:' || location.protocol === 'https:';

if (videoLinks.length && canEmbedYouTube && typeof HTMLDialogElement === 'function') {
  const closeLabel = document.documentElement.lang.startsWith('pt') ? 'Fechar vídeo' : 'Close video';
  const modal = document.createElement('dialog');
  modal.className = 'video-modal';
  modal.innerHTML = `
    <button type="button" class="video-modal-close" aria-label="${closeLabel}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
    <div class="video-modal-frame"></div>`;
  document.body.append(modal);

  const frame = modal.querySelector('.video-modal-frame');
  let lastTrigger = null;

  // Removing the iframe is what stops the video. Runs directly on our own
  // close actions, and again (harmlessly) from the 'close' event, which is
  // what fires when Esc closes the dialog.
  const cleanUp = () => {
    frame.replaceChildren();
    document.documentElement.classList.remove('has-video-modal');
  };
  const closeModal = () => {
    modal.close();
    cleanUp();
    if (lastTrigger) lastTrigger.focus();
  };

  modal.querySelector('.video-modal-close').addEventListener('click', closeModal);
  // A click that lands on the <dialog> itself (not its contents) is the backdrop
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  modal.addEventListener('close', cleanUp);

  videoLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${link.dataset.youtubeId}?autoplay=1&rel=0`;
      iframe.title = link.querySelector('.sr-only').textContent;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      frame.replaceChildren(iframe);
      lastTrigger = link;
      modal.setAttribute('aria-label', iframe.title);
      modal.showModal();
      document.documentElement.classList.add('has-video-modal');
    });
  });
}

// ==========================================================================
// Work page: featured case screenshot sliders
// Each .work-slide is self-contained (its own prev/next/dots), so this just
// wires up every instance found on the page the same way. Clicking a
// screenshot opens it full size in the .image-modal popup below.
// ==========================================================================
const workSliders = document.querySelectorAll('.work-slide');
let openImageModal = null;

workSliders.forEach((slider) => {
  const items = slider.querySelectorAll('.work-slide-item');
  const dots = slider.querySelectorAll('.work-slide-dot');
  const prevBtn = slider.querySelector('.work-slide-arrow--prev');
  const nextBtn = slider.querySelector('.work-slide-arrow--next');
  if (!items.length) return;
  let active = 0;

  const show = (index) => {
    items[active].classList.remove('is-active');
    dots[active] && dots[active].classList.remove('is-active');
    active = (index + items.length) % items.length;
    items[active].classList.add('is-active');
    dots[active] && dots[active].classList.add('is-active');
  };

  if (prevBtn) prevBtn.addEventListener('click', () => show(active - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => show(active + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => show(index)));

  const images = [...items].map((item) => item.querySelector('img'));
  images.forEach((img, index) => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    const open = () => openImageModal && openImageModal(images, index, show);
    img.addEventListener('click', open);
    img.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  });
});

// Full-size screenshot popup. One native <dialog> shared by every slider:
// Esc closes it for free, arrow keys and the on-screen arrows step through
// the screenshots of the slider it was opened from, and closing leaves that
// slider on the screenshot that was last viewed.
if (workSliders.length && typeof HTMLDialogElement === 'function') {
  const isPt = document.documentElement.lang.startsWith('pt');
  const labels = isPt
    ? { close: 'Fechar imagem', prev: 'Imagem anterior', next: 'Próxima imagem' }
    : { close: 'Close image', prev: 'Previous image', next: 'Next image' };

  const modal = document.createElement('dialog');
  modal.className = 'image-modal';
  modal.innerHTML = `
    <button type="button" class="image-modal-close" aria-label="${labels.close}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
    <figure class="image-modal-figure">
      <img class="image-modal-img" alt="">
      <figcaption class="image-modal-caption"></figcaption>
    </figure>
    <button type="button" class="image-modal-arrow image-modal-arrow--prev" aria-label="${labels.prev}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <button type="button" class="image-modal-arrow image-modal-arrow--next" aria-label="${labels.next}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
    </button>`;
  document.body.append(modal);

  const modalImg = modal.querySelector('.image-modal-img');
  const caption = modal.querySelector('.image-modal-caption');
  let set = [];
  let current = 0;
  let syncSlider = null;
  const render = () => {
    const source = set[current];
    modalImg.src = source.currentSrc || source.src;
    modalImg.alt = source.alt;
    caption.textContent = `${current + 1} / ${set.length}`;
    modal.classList.toggle('is-single', set.length < 2);
  };
  const step = (delta) => {
    current = (current + delta + set.length) % set.length;
    render();
  };
  // Cleanup runs directly from our own close paths rather than only from the
  // dialog's 'close' event, which isn't reliable enough to depend on.
  const finish = () => {
    if (!document.documentElement.classList.contains('has-image-modal')) return;
    document.documentElement.classList.remove('has-image-modal');
    if (syncSlider) syncSlider(current);
    // Return focus to the screenshot now showing in the slider.
    if (set[current]) set[current].focus();
  };
  const closeModal = () => {
    modal.close();
    finish();
  };

  modal.querySelector('.image-modal-close').addEventListener('click', closeModal);
  modal.querySelector('.image-modal-arrow--prev').addEventListener('click', () => step(-1));
  modal.querySelector('.image-modal-arrow--next').addEventListener('click', () => step(1));
  // Clicks on the dark area around the picture (the dialog or the figure
  // padding, not the image or buttons) close the popup.
  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.classList.contains('image-modal-figure')) closeModal();
  });
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  });
  // Esc: take over from the browser so it goes through the same cleanup.
  modal.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeModal();
  });
  modal.addEventListener('close', finish);

  openImageModal = (images, index, show) => {
    set = images;
    current = index;
    syncSlider = show;
    render();
    modal.showModal();
    document.documentElement.classList.add('has-image-modal');
  };
}

// ==========================================================================
// Contact form (Web3Forms)
// Progressive enhancement: the plain POST to Web3Forms still works with JS
// off. With JS, submit over fetch and show an inline status instead of
// leaving the page. Success/error/sending strings come from data- attributes
// on the form so the EN and PT pages stay in their own language.
// ==========================================================================
const contactForm = document.getElementById('contact-form');

if (contactForm) {
  const statusEl = document.getElementById('contact-form-status');
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const botcheck = contactForm.querySelector('[name="botcheck"]');
  const msgSending = contactForm.dataset.sending || 'Sending...';
  const msgSuccess = contactForm.dataset.success || 'Thanks, your message has been sent.';
  const msgError = contactForm.dataset.error || 'Something went wrong. Please email hello@samamatahir.com instead.';

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (botcheck && botcheck.checked) return;

    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = msgSending;
    statusEl.textContent = '';
    statusEl.classList.remove('is-success', 'is-error');

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(contactForm),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        statusEl.textContent = msgSuccess;
        statusEl.classList.add('is-success');
        contactForm.reset();
      } else {
        statusEl.textContent = data && data.message ? data.message : msgError;
        statusEl.classList.add('is-error');
      }
    } catch (error) {
      statusEl.textContent = msgError;
      statusEl.classList.add('is-error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
}

// ==========================================================================
// Scroll reveal
// Progressive enhancement: the .reveal class (and its initial hidden state)
// is only ever added here, by JS. With JS off, or if IntersectionObserver
// isn't supported, nothing is touched and every element stays visible as
// plain HTML. Only applied to supplementary elements (cards, review cards,
// process steps, diagram panels), never to primary body copy.
// ==========================================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls = document.querySelectorAll(
  '.card, .work-case, .review-card, .video-testimonial-card, .process-step, .hero-diagram'
);

if (revealEls.length && 'IntersectionObserver' in window) {
  revealEls.forEach((el, index) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(index % 4) * 70}ms`;
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
}

// ==========================================================================
// Hero diagram peek-label cycling
// Static fallback (first label always shown) is set in CSS; this just
// takes over and rotates through the rest when JS and motion are available.
// ==========================================================================
if (!prefersReducedMotion) {
  document.querySelectorAll('.diagram-peeks').forEach((group) => {
    const peeks = group.querySelectorAll('.diagram-peek');
    if (peeks.length < 2) return;

    group.classList.add('is-cycling');
    let active = 0;
    peeks[active].classList.add('is-active');

    setInterval(() => {
      peeks[active].classList.remove('is-active');
      active = (active + 1) % peeks.length;
      peeks[active].classList.add('is-active');
    }, 2600);
  });
}
