/* ==========================================================================
   Investera Interior Designing - Meta Ads & Multi-Pixel JavaScript Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initFormHandler();
  initBudgetCalculator();
  initFaqAccordion();
  initSmoothScroll();
  initPixelEventTrackers();
});

/* --------------------------------------------------------------------------
   1. Multi-Pixel Engine (Google Tag, Meta Pixel & Conversion API (CAPI))
   -------------------------------------------------------------------------- */

function fireMetaCapiEvent(eventName, userData = {}, customData = {}) {
  const capiPayload = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: window.location.href,
    action_source: 'website',
    user_data: {
      client_user_agent: navigator.userAgent,
      ...userData
    },
    custom_data: customData
  };

  console.log(`[Meta Conversion API Logged] Event: ${eventName}`, capiPayload);

  if (navigator.sendBeacon) {
    try {
      const blob = new Blob([JSON.stringify(capiPayload)], { type: 'application/json' });
      navigator.sendBeacon('/api/meta-capi', blob);
    } catch (e) {
      // Beacon fallback
    }
  }
}

function trackUserAction(actionName, payload = {}) {
  console.log(`[Pixel Event Fired] ${actionName}`, payload);

  // 1. Meta Pixel (Client-Side)
  if (typeof fbq === 'function') {
    if (['Lead', 'PageView', 'Contact'].includes(actionName)) {
      fbq('track', actionName, payload);
    } else {
      fbq('trackCustom', actionName, payload);
    }
  }

  // 2. Google Tag (gtag.js)
  if (typeof gtag === 'function') {
    gtag('event', actionName.toLowerCase(), payload);
  }

  // 3. Meta Conversion API (CAPI)
  fireMetaCapiEvent(actionName, {}, payload);
}

/* --------------------------------------------------------------------------
   2. Interactive Event Trackers for WhatsApp & Actions
   -------------------------------------------------------------------------- */
function initPixelEventTrackers() {
  // WhatsApp Button Tracker (Meta Pixel & Conversion API: ClickWhatsApp)
  const waButtons = document.querySelectorAll('a[href*="wa.me"], .tracking-wa-btn, .btn-whatsapp-fasttrack, .btn-mobile-whatsapp');
  waButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      trackUserAction('ClickWhatsApp', {
        destination: '+201064844344',
        page: window.location.pathname
      });
    });
  });
}

/* --------------------------------------------------------------------------
   3. Lead Form Handler & Embedded Thank-You View
   -------------------------------------------------------------------------- */
function initFormHandler() {
  const mainForm = document.getElementById('mainLeadForm');
  const thankYouView = document.getElementById('formThankYouView');
  const formHeader = document.querySelector('.form-header');

  if (!mainForm) return;

  mainForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = mainForm.querySelector('.btn-form-cta');
    const originalBtnText = submitBtn.innerHTML;

    const fullName = mainForm.querySelector('[name="fullName"]')?.value || 'Valued Client';
    const phone = mainForm.querySelector('[name="phone"]')?.value || '';
    const businessName = mainForm.querySelector('[name="businessName"]')?.value || '';
    const location = mainForm.querySelector('[name="location"]')?.value || '';

    if (!phone || phone.trim().length < 8) {
      alert('Please provide a valid Egyptian phone number so our senior consultant can reach you.');
      return;
    }

    // Show Loading Spinner
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="10"></circle>
      </svg>
      Processing Consultation Request...
    `;

    setTimeout(() => {
      const refId = 'INV-' + Math.floor(100000 + Math.random() * 900000);

      // 1. Fire Lead Event across Google Tag, Meta Pixel, and Meta CAPI
      trackUserAction('Lead', {
        content_name: 'Commercial & Medical Fit-Out Consultation',
        value: 1.00,
        currency: 'EGP',
        lead_id: refId,
        user_name: fullName,
        user_phone: phone,
        business_name: businessName,
        location: location
      });

      // 2. Hide form inputs and show Thank You View directly on index.html
      mainForm.style.display = 'none';
      if (formHeader) formHeader.style.display = 'none';

      if (thankYouView) {
        thankYouView.classList.add('active');

        const refSpan = document.getElementById('thankYouRefId');
        if (refSpan) refSpan.textContent = refId;

        // Configure WhatsApp API Link with new phone number
        const waLink = document.getElementById('thankYouWaBtn');
        if (waLink) {
          const waMsg = encodeURIComponent(
            `Hello Investera Interior Designing,\nMy name is ${fullName} (${businessName}).\nI submitted a consultation request for our project in ${location}.\nLead Ref ID: ${refId}.`
          );
          waLink.href = `https://wa.me/201064844344?text=${waMsg}`;
        }
      }

    }, 800);
  });
}

/* --------------------------------------------------------------------------
   4. Scope Simulator Logic (Money and Weeks Removed as Requested)
   -------------------------------------------------------------------------- */
function initBudgetCalculator() {
  const spaceButtons = document.querySelectorAll('.calc-space-btn');
  const finishButtons = document.querySelectorAll('.calc-finish-btn');
  const areaSlider = document.getElementById('areaSlider');
  const areaValueDisplay = document.getElementById('areaValue');
  const summaryTitleDisplay = document.getElementById('calcSummaryTitle');

  let currentSpace = 'medical'; // 'medical' or 'office'
  let currentFinish = 'executive'; // 'executive' or 'luxury'
  let currentArea = 150; // sqm

  if (!areaSlider) return;

  function recalculate() {
    areaValueDisplay.textContent = `${currentArea} m²`;

    const spaceLabel = currentSpace === 'medical' ? 'Medical Clinic' : 'Administrative Office';
    const finishLabel = currentFinish === 'executive' ? 'Executive Premium' : 'Ultra Luxury Fit-Out';

    if (summaryTitleDisplay) {
      summaryTitleDisplay.textContent = `${spaceLabel} (${currentArea} m²) - ${finishLabel}`;
    }
  }

  spaceButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      spaceButtons.forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentSpace = btn.dataset.space;
      recalculate();
    });
  });

  finishButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      finishButtons.forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentFinish = btn.dataset.finish;
      recalculate();
    });
  });

  areaSlider.addEventListener('input', (e) => {
    currentArea = parseInt(e.target.value, 10);
    recalculate();
  });

  recalculate();
}

/* --------------------------------------------------------------------------
   5. FAQ Accordion Toggle
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach((question) => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      const isActive = faqItem.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach((item) => {
        item.classList.remove('active');
      });

      if (!isActive) {
        faqItem.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   6. Smooth Anchor Scrolling & Sticky Header
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  const ctaTriggers = document.querySelectorAll('a[href^="#"], button[data-scroll-to]');

  ctaTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      const targetId = trigger.getAttribute('href') || trigger.dataset.scrollTo;
      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.background = 'rgba(10, 25, 38, 0.96)';
      header.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)';
    } else {
      header.style.background = 'rgba(10, 25, 38, 0.9)';
      header.style.boxShadow = 'none';
    }
  });
}
