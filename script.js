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
  btn.href = active.link || '#';
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

  setText('#logo-text', settings?.brand?.name || 'MEMEVORES');
  setText('#footer-logo', settings?.brand?.name || 'MEMEVORES');
  setText('#footer-tagline', settings?.brand?.tagline || '');

  const socialContainer = $('#social-buttons');
  if (socialContainer) {
    socialContainer.innerHTML = '';
    socials.forEach(s => {
      const a = document.createElement('a');
      a.className = `social-btn ${s.enabled ? '' : 'disabled'}`;
      a.href = s.enabled ? (s.url || '#') : '#';
      a.target = s.enabled ? '_blank' : undefined;
      a.rel = 'noopener';
      a.innerHTML = `<i class="${s.icon || ''}"></i> <span>${s.name || ''}</span>`;
      socialContainer.appendChild(a);
    });
  }

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Donate buttons (header + footer) → open Donate modal
  $$('a[href="#donate"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = document.getElementById('donate-modal');
      if (modal) modal.classList.remove('hidden');
    });
  });

  // Support buttons (header + footer) → open Support modal
  $$('a[href="#support"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = document.getElementById('support-modal');
      if (modal) modal.classList.remove('hidden');
    });
  });

  // Set MV Admin link inside Support modal
  const mvAdminBtn = document.getElementById('support-mv-admin');
  if (mvAdminBtn) {
    mvAdminBtn.href = links.support || '#';
  }
}

// ===== Modals: close handlers =====
function setupModalClose(modalId, closeBtnId, backdropSelector) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const closeBtn = document.getElementById(closeBtnId);
  closeBtn?.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  const backdrop = modal.querySelector(backdropSelector);
  backdrop?.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
}

// ===== Render Feed =====
function renderFeed(posts) {
  const grid = $('#feed-grid');
  if (!grid) return;
  grid.innerHTML = '';

  (posts || []).forEach(post => {
    const card = document.createElement('div');
    card.className = 'feed-card';

    const hasMedia = !!post.file;
    if (!hasMedia) {
      card.classList.add('text-only');
    }

    // Media container
    const mediaDiv = document.createElement('div');
    mediaDiv.className = 'feed-media';

    if (hasMedia) {
      if (post.type === 'video') {
        const video = document.createElement('video');
        video.src = post.file;
        video.controls = true;
        video.playsInline = true;
        mediaDiv.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = post.file;
        img.alt = post.caption || 'Post image';
        mediaDiv.appendChild(img);
      }
    }

    // Content
    const content = document.createElement('div');
    content.className = 'feed-content';

    const caption = document.createElement('p');
    caption.className = 'feed-caption';
    caption.textContent = post.caption || '';

    const btn = document.createElement('a');
    btn.className = 'feed-telegram-btn';
    btn.href = post.telegramLink || 'https://t.me/Memevores';
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.textContent = 'View on Telegram';

    content.appendChild(caption);
    content.appendChild(btn);

    card.appendChild(mediaDiv);
    card.appendChild(content);
    grid.appendChild(card);
  });
}

// ===== Category Modal =====
function normalizeCategory(cat) {
  if (!cat) return 'other';
  const c = String(cat).toLowerCase();
  if (['clips', 'audio', 'templates', 'tutorials'].includes(c)) return c;
  return 'other';
}

function renderCategoryPosts(posts, category, query) {
  const grid = $('#category-posts-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const q = (query || '').toLowerCase().trim();

  const filtered = posts.filter(post => {
    const cat = normalizeCategory(post.category);
    const matchesCategory = cat === category;
    const text = (post.caption || '').toLowerCase();
    const matchesQuery = !q || text.includes(q);
    return matchesCategory && matchesQuery;
  });

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.style.color = 'var(--muted)';
    empty.style.gridColumn = '1 / -1';
    empty.style.padding = '2rem';
    empty.style.textAlign = 'center';
    empty.textContent = 'No posts in this category yet.';
    grid.appendChild(empty);
    return;
  }

  filtered.forEach(post => {
    const card = document.createElement('div');
    card.className = 'feed-card';

    const hasMedia = !!post.file;
    if (!hasMedia) {
      card.classList.add('text-only');
    }

    const mediaDiv = document.createElement('div');
    mediaDiv.className = 'feed-media';

    if (hasMedia) {
      if (post.type === 'video') {
        const video = document.createElement('video');
        video.src = post.file;
        video.controls = true;
        video.playsInline = true;
        mediaDiv.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = post.file;
        img.alt = post.caption || 'Post image';
        mediaDiv.appendChild(img);
      }
    }

    const content = document.createElement('div');
    content.className = 'feed-content';

    const caption = document.createElement('p');
    caption.className = 'feed-caption';
    caption.textContent = post.caption || '';

    const btn = document.createElement('a');
    btn.className = 'feed-telegram-btn';
    btn.href = post.telegramLink || 'https://t.me/Memevores';
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.textContent = 'View on Telegram';

    content.appendChild(caption);
    content.appendChild(btn);

    card.appendChild(mediaDiv);
    card.appendChild(content);
    grid.appendChild(card);
  });
}

function openCategoryModal(posts, category) {
  const modal = document.getElementById('category-modal');
  const title = document.getElementById('category-modal-title');
  const searchInput = document.getElementById('category-search');
  if (!modal || !title || !searchInput) return;

  const label = category.charAt(0).toUpperCase() + category.slice(1);
  title.textContent = `Browse • ${label}`;

  searchInput.value = '';
  renderCategoryPosts(posts, category, '');

  modal.classList.remove('hidden');

  const onClose = () => {
    modal.classList.add('hidden');
    searchInput.removeEventListener('input', onSearch);
    modal.querySelector('.modal-backdrop')?.removeEventListener('click', onClose);
    document.getElementById('category-close')?.removeEventListener('click', onClose);
  };

  const onSearch = () => {
    renderCategoryPosts(posts, category, searchInput.value);
  };

  searchInput.addEventListener('input', onSearch);
  modal.querySelector('.modal-backdrop')?.addEventListener('click', onClose);
  document.getElementById('category-close')?.addEventListener('click', onClose);
}

// ===== Init =====
(async function init() {
  try {
    const [settings, content, promotions, posts] = await Promise.all([
      loadJSON('data/settings.json'),
      loadJSON('data/content.json'),
      loadJSON('data/promotions.json'),
      loadJSON('data/posts.json')
    ]);

    renderPromotionBanner(promotions);
    renderHero(content, settings);
    renderFeatures(content);
    renderContentSections(content);
    renderYouTubePromo(promotions);
    renderCTA(content);
    renderFooter(settings);
    renderFeed(posts);

    setupModalClose('donate-modal', 'donate-close', '.modal-backdrop');
    setupModalClose('support-modal', 'support-close', '.modal-backdrop');
    setupModalClose('category-modal', 'category-close', '.modal-backdrop');

    // Category boxes
    const categoryCards = $$('.category-card');
    categoryCards.forEach(card => {
      card.addEventListener('click', () => {
        const category = card.dataset.category;
        openCategoryModal(posts, category);
      });
    });
  } catch (err) {
    console.error('Error loading MEMEVORES data:', err);
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div style="padding:20px;color:#ffb3b3;text-align:center;">Failed to load site data. Check data/*.json files.</div>'
    );
  }
})();
