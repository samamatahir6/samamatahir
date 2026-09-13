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
// Reviews slider
// Native smooth-scroll (scroll-behavior:smooth / scrollBy({behavior:'smooth'}))
// was found unreliable for this kind of track on a sibling project, so the
// animation is driven by hand with requestAnimationFrame instead.
// ==========================================================================
const reviewsTrack = document.getElementById('reviews-track');
const reviewsPrev = document.getElementById('reviews-prev');
const reviewsNext = document.getElementById('reviews-next');

if (reviewsTrack && reviewsPrev && reviewsNext) {
  let reviewsAnimId = null;

  const animateReviewsScrollTo = (targetLeft, duration) => {
    if (reviewsAnimId) cancelAnimationFrame(reviewsAnimId);
    const startLeft = reviewsTrack.scrollLeft;
    const distance = targetLeft - startLeft;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      reviewsTrack.scrollLeft = startLeft + distance * eased;
      reviewsAnimId = progress < 1 ? requestAnimationFrame(step) : null;
    };

    reviewsAnimId = requestAnimationFrame(step);
  };

  const scrollReviewsByCard = (direction) => {
    const card = reviewsTrack.querySelector('.review-card');
    if (!card) return;
    const gap = parseFloat(getComputedStyle(reviewsTrack).columnGap) || 0;
    const amount = (card.getBoundingClientRect().width + gap) * direction;
    const maxScrollLeft = reviewsTrack.scrollWidth - reviewsTrack.clientWidth;
    const targetLeft = Math.max(0, Math.min(reviewsTrack.scrollLeft + amount, maxScrollLeft));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      reviewsTrack.scrollLeft = targetLeft;
    } else {
      animateReviewsScrollTo(targetLeft, 350);
    }
  };

  reviewsPrev.addEventListener('click', () => scrollReviewsByCard(-1));
  reviewsNext.addEventListener('click', () => scrollReviewsByCard(1));
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
  '.card, .work-card, .review-card, .process-step, .hero-diagram'
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
