// ===== Helpers =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

function setHref(id, href) {
  const el = $(id);
  if (el) el.href = href;
}

function setHtml(id, html) {
  const el = $(id);
  if (el) el.innerHTML = html;
}

// ===== Render Promotion Banner =====
function renderPromotionBanner(promotions) {
  const banner = $('#promotion-banner');
  if (!banner) return;

  const active = (promotions?.promotions || []).find(p => p.enabled);
  if (!active) {
    banner.classList.add('hidden');
    return;
  }

  banner.classList.remove('hidden');
  const inner = document.createElement('div');
  inner.className = 'container promo-inner';

  const text = document.createElement('div');
  text.className = 'promo-text';
  text.innerHTML = `<strong>Promotion:</strong> ${active.title}`;

  const btn = document.createElement('a');
  btn.className = 'promo-btn';
  btn.href = active.link;
  btn.target = '_blank';
  btn.rel = 'noopener';
  btn.textContent = active.buttonText || 'Learn more';

  inner.appendChild(text);
  inner.appendChild(btn);
  banner.appendChild(inner);
}

// ===== Render Hero =====
function renderHero(content, settings) {
  const hero = content?.hero || {};
  setText('#hero-title', hero.title || 'MEMEVORES');
  setText('#hero-subtitle', hero.subtitle || '');
  setText('#hero-description', hero.description || '');

  const btns = $('#hero-buttons');
  if (btns) btns.innerHTML = '';

  (hero.buttons || []).forEach(btnData => {
    const a = document.createElement('a');
    a.className = `btn ${btnData.style === 'primary' ? 'btn-primary' : 'btn-secondary'} btn-lg`;
    a.href = btnData.link || '#';
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = btnData.label || 'Button';
    btns.appendChild(a);
  });

  // Header Telegram button
  const headerBtn = $('#telegram-header-btn');
  if (headerBtn) {
    headerBtn.href = settings?.links?.telegram || '#';
  }
}

// ===== Render Features =====
function renderFeatures(content) {
  const grid = $('#features-grid');
  if (!grid) return;
  grid.innerHTML = '';

  (content?.features || []).forEach(f => {
    const card = document.createElement('div');
    card.className = 'feature-card';

    const icon = document.createElement('div');
    icon.className = 'feature-icon';
    icon.textContent = f.icon || '';

    const title = document.createElement('div');
    title.className = 'feature-title';
    title.textContent = f.title || '';

    const desc = document.createElement('div');
    desc.className = 'feature-desc';
    desc.textContent = f.description || '';

    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(desc);
    grid.appendChild(card);
  });
}

// ===== Render Content Sections =====
function renderContentSections(content) {
  const aboutText = content?.sections?.find(s => s.id === 'about')?.content || '';
  const howText = content?.sections?.find(s => s.id === 'how-it-works')?.content || '';

  setText('#about-title', content?.sections?.find(s => s.id === 'about')?.title || 'About');
  setText('#how-title', content?.sections?.find(s => s.id === 'how-it-works')?.title || 'How it works');

  setText('#about-text', aboutText);
  setText('#how-text', howText);
}

// ===== Render YouTube Promo Card =====
function renderYouTubePromo(promotions) {
  const cardContainer = $('#youtube-promo-card');
  if (!cardContainer) return;

  const promo = (promotions?.promotions || []).find(p => p.enabled && p.style === 'youtube');
  if (!promo) {
    $('#youtube-promo').classList.add('hidden');
    return;
  }

  cardContainer.innerHTML = '';

  const title = document.createElement('div');
  title.className = 'promo-card-title';
  title.textContent = promo.title;

  const desc = document.createElement('div');
  desc.className = 'promo-card-desc';
  desc.textContent = promo.description || '';

  const btn = document.createElement('a');
  btn.className = 'promo-card-btn';
  btn.href = promo.link || '#';
  btn.target = '_blank';
  btn.rel = 'noopener';
  btn.textContent = promo.buttonText || 'Visit Channel';

  cardContainer.appendChild(title);
  cardContainer.appendChild(desc);
  cardContainer.appendChild(btn);
}

// ===== Render CTA =====
function renderCTA(content) {
  const cta = content?.cta || {};
  setText('#cta-title', cta.title || '');
  setText('#cta-description', cta.description || '');

  const btn = $('#cta-button');
  if (btn) {
    btn.textContent = cta.button?.label || 'Join Telegram';
    btn.href = cta.button?.link || '#';
  }
}

// ===== Render Footer & Socials =====
function renderFooter(settings) {
  const links = settings?.links || {};
  const socials = settings?.socials || [];

  setHref('#footer-telegram', links.telegram || '#');
  setHref('#footer-youtube', links.youtube || '#');
  setHref('#footer-collab', links.collab || '#');
  setHref('#footer-support', links.support || '#');

  // Logo & tagline
  setText('#logo-text', settings?.brand?.name || 'MEMEVORES');
  setText('#footer-logo', settings?.brand?.name || 'MEMEVORES');
  setText('#footer-tagline', settings?.brand?.tagline || '');

  // Social buttons
  const socialContainer = $('#social-buttons');
  if (socialContainer) {
    socialContainer.innerHTML = '';
    socials.forEach(s => {
      const a = document.createElement('a');
      a.className = `social-btn ${s.enabled ? '' : 'disabled'}`;
      a.href = s.enabled ? (s.url || '#') : '#';
      a.target = s.enabled ? '_blank' : undefined;
      a.rel = 'noopener';
      a.textContent = `${s.icon || ''} ${s.name || ''}`;
      socialContainer.appendChild(a);
    });
  }

  // Copyright year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// ===== Render Donate Modal =====
function renderDonateModal(settings) {
  const donate = settings?.donation || {};
  const modal = $('#donate-modal');
  const openLinks = ['a[href="#donate"]', '#footer-support']; // simplified; real open via footer "Donate"

  setText('#donate-title', donate.title || 'Support Memevores');
  setText('#donate-description', donate.description || '');

  const qrBox = $('#donate-qr');
  const qrImg = $('#donate-qr-img');
  const directBox = $('#donate-direct');
  const directLink = $('#donate-direct-link');
  const supportLink = $('#donate-support-link');

  if (donate.qrEnabled && donate.qrImage) {
    qrBox.classList.remove('hidden');
    qrImg.src = donate.qrImage;
  } else {
    qrBox.classList.add('hidden');
  }

  if (donate.directEnabled && donate.directPayLink) {
    directBox.classList.remove('hidden');
    directLink.href = donate.directPayLink;
  } else {
    directBox.classList.add('hidden');
  }

  supportLink.href = donate.supportLink || '#';

  // Open modal when clicking any "Donate" link
  $$('#footer-col a[href="#donate"], a[href="#donate"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.remove('hidden');
    });
  });

  // Close modal
  $('#donate-close')?.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  $('.modal-backdrop')?.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
}

// ===== Init =====
(async function init() {
  try {
    const [settings, content, promotions] = await Promise.all([
      loadJSON('data/settings.json'),
      loadJSON('data/content.json'),
      loadJSON('data/promotions.json')
    ]);

    renderPromotionBanner(promotions);
    renderHero(content, settings);
    renderFeatures(content);
    renderContentSections(content);
    renderYouTubePromo(promotions);
    renderCTA(content);
    renderFooter(settings);
    renderDonateModal(settings);
  } catch (err) {
    console.error('Error loading MEMEVORES data:', err);
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div style="padding:20px;color:#ffb3b3;text-align:center;">Failed to load site data. Check data/*.json files.</div>'
    );
  }
})();
