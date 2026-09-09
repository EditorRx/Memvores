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

// Remove category hashtags from captions
function cleanCaption(text) {
  if (!text) return '';

  return text
    .replace(/s*#\b(clips|audio|templates|tutorials|other)\b/gi, '')
    .trim();
}

// ===== Scroll Reveal =====
let lastScrollPosition = window.scrollY;
let revealObserver;

function setupScrollReveal() {
  const items = document.querySelectorAll(
    '.feature-card:not([data-reveal-bound]), ' +
    '.category-card:not([data-reveal-bound]), ' +
    '.feed-card:not([data-reveal-bound]), ' +
    '#about-section:not([data-reveal-bound]), ' +
    '#how-section:not([data-reveal-bound]), ' +
    '#youtube-promo:not([data-reveal-bound]), ' +
    '#cta-section:not([data-reveal-bound])'
  );

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        const scrollingDown = window.scrollY >= lastScrollPosition;

        entries.forEach((entry) => {
          const element = entry.target;

          if (entry.isIntersecting) {
            element.classList.toggle('from-top', !scrollingDown);

            requestAnimationFrame(() => {
              element.classList.add('show');
            });
          } else {
            element.classList.remove('show');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );
  }

  items.forEach((element) => {
    element.dataset.revealBound = 'true';
    element.classList.add('scroll-reveal');
    revealObserver.observe(element);
  });
}

window.addEventListener(
  'scroll',
  () => {
    lastScrollPosition = window.scrollY;
  },
  { passive: true }
);

// ===== Render Promotion Banner =====
function renderPromotionBanner(promotions) {
  const banner = $('#promotion-banner');
  if (!banner) return;

  const active = (promotions?.promotions || []).find((p) => p.enabled);

  if (!active) {
    banner.classList.add('hidden');
    return;
  }

  banner.classList.remove('hidden');
  banner.innerHTML = '';

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

  if (btns) {
    btns.innerHTML = '';

    (hero.buttons || []).forEach((btnData) => {
      const a = document.createElement('a');

      a.className = `btn ${
        btnData.style === 'primary' ? 'btn-primary' : 'btn-secondary'
      } btn-lg`;

      a.href = btnData.link || '#';
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = btnData.label || 'Button';

      btns.appendChild(a);
    });
  }

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

  (content?.features || []).forEach((feature) => {
    const card = document.createElement('div');
    card.className = 'feature-card';

    const icon = document.createElement('div');
    icon.className = 'feature-icon';
    icon.textContent = feature.icon || '';

    const title = document.createElement('div');
    title.className = 'feature-title';
    title.textContent = feature.title || '';

    const description = document.createElement('div');
    description.className = 'feature-desc';
    description.textContent = feature.description || '';

    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(description);

    grid.appendChild(card);
  });
}

// ===== Render Content Sections =====
function renderContentSections(content) {
  const aboutSection = content?.sections?.find((section) => section.id === 'about');
  const howSection = content?.sections?.find(
    (section) => section.id === 'how-it-works'
  );

  setText('#about-title', aboutSection?.title || 'About');
  setText('#how-title', howSection?.title || 'How it works');

  setText('#about-text', aboutSection?.content || '');
  setText('#how-text', howSection?.content || '');
}

// ===== Render YouTube Promo Card =====
function renderYouTubePromo(promotions) {
  const cardContainer = $('#youtube-promo-card');
  const promoSection = $('#youtube-promo');

  if (!cardContainer || !promoSection) return;

  const promo = (promotions?.promotions || []).find(
    (promotion) => promotion.enabled && promotion.style === 'youtube'
  );

  if (!promo) {
    promoSection.classList.add('hidden');
    return;
  }

  promoSection.classList.remove('hidden');
  cardContainer.innerHTML = '';

  const title = document.createElement('div');
  title.className = 'promo-card-title';
  title.textContent = promo.title || '';

  const description = document.createElement('div');
  description.className = 'promo-card-desc';
  description.textContent = promo.description || '';

  const btn = document.createElement('a');
  btn.className = 'promo-card-btn';
  btn.href = promo.link || '#';
  btn.target = '_blank';
  btn.rel = 'noopener';
  btn.textContent = promo.buttonText || 'Visit Channel';

  cardContainer.appendChild(title);
  cardContainer.appendChild(description);
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

    socials.forEach((social) => {
      const a = document.createElement('a');

      a.className = `social-btn ${social.enabled ? '' : 'disabled'}`;
      a.href = social.enabled ? social.url || '#' : '#';

      if (social.enabled) {
        a.target = '_blank';
        a.rel = 'noopener';
      }

      a.innerHTML = `<i class="${social.icon || ''}"></i> <span>${
        social.name || ''
      }</span>`;

      socialContainer.appendChild(a);
    });
  }

  const yearEl = $('#year');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  $$('a[href="#donate"]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      const modal = $('#donate-modal');
      if (modal) modal.classList.remove('hidden');
    });
  });

  $$('a[href="#support"]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      const modal = $('#support-modal');
      if (modal) modal.classList.remove('hidden');
    });
  });

  const mvAdminBtn = $('#support-mv-admin');
  if (mvAdminBtn) {
    mvAdminBtn.href = links.support || '#';
  }
}

// ===== Modal Close Handlers =====
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

// ===== Render Feed: Latest 4 Posts =====
function renderFeed(posts) {
  const grid = $('#feed-grid');
  if (!grid) return;

  grid.innerHTML = '';

  (posts || []).slice(0, 4).forEach((post) => {
    const card = document.createElement('div');
    card.className = 'feed-card';

    const hasMedia = Boolean(post.file);
    if (!hasMedia) card.classList.add('text-only');

    const mediaDiv = document.createElement('div');
    mediaDiv.className = 'feed-media';

    if (hasMedia) {
      const type = (post.type || '').toLowerCase();
      const typeLabel =
        {
          video: 'Video',
          audio: 'Audio',
          photo: 'Image',
          text: 'Text'
        }[type] || 'Media';

      const label = document.createElement('div');
      label.className = 'media-type-label';
      label.textContent = typeLabel;
      mediaDiv.appendChild(label);
    }

    const content = document.createElement('div');
    content.className = 'feed-content';

    const caption = document.createElement('p');
    caption.className = 'feed-caption';
    caption.textContent = cleanCaption(post.caption || '');

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

// ===== Category Modal with Pagination =====
const ITEMS_PER_PAGE = 9;
const MAX_VISIBLE_PAGES = 4;

let currentCategory = null;
let currentPage = 1;
let filteredCategoryItems = [];

function normalizeCategory(category) {
  if (!category) return 'other';
  const normalized = String(category).toLowerCase();
  if (['clips', 'audio', 'templates', 'tutorials'].includes(normalized)) {
    return normalized;
  }
  return 'other';
}

function renderCategoryPosts(posts, category, query, isSearchChange = false) {
  const grid = $('#category-posts-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const normalizedQuery = (query || '').toLowerCase().trim();

  filteredCategoryItems = (posts || []).filter((post) => {
    const postCategory = normalizeCategory(post.category);
    const matchesCategory = postCategory === category;

    const captionText = cleanCaption(post.caption || '').toLowerCase();
    const matchesQuery =
      !normalizedQuery || captionText.includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

  if (isSearchChange) {
    currentPage = 1;
  }

  const totalPages = Math.max(1, Math.ceil(filteredCategoryItems.length / ITEMS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = filteredCategoryItems.slice(start, end);

  if (pageItems.length === 0) {
    const empty = document.createElement('div');
    empty.style.color = 'var(--text-dim)';
    empty.style.gridColumn = '1 / -1';
    empty.style.padding = '2rem';
    empty.style.textAlign = 'center';
    empty.textContent = 'No posts in this category yet.';
    grid.appendChild(empty);
  } else {
    pageItems.forEach((post) => {
      const card = document.createElement('div');
      card.className = 'feed-card';

      const hasMedia = Boolean(post.file);
      if (!hasMedia) card.classList.add('text-only');

      const mediaDiv = document.createElement('div');
      mediaDiv.className = 'feed-media';

      if (hasMedia) {
        const type = (post.type || '').toLowerCase();
        const typeLabel =
          {
            video: 'Video',
            audio: 'Audio',
            photo: 'Image',
            text: 'Text'
          }[type] || 'Media';

        const label = document.createElement('div');
        label.className = 'media-type-label';
        label.textContent = typeLabel;
        mediaDiv.appendChild(label);
      }

      const content = document.createElement('div');
      content.className = 'feed-content';

      const caption = document.createElement('p');
      caption.className = 'feed-caption';
      caption.textContent = cleanCaption(post.caption || '');

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

  updatePagination(totalPages);
  setupScrollReveal();
}

function updatePagination(totalPages) {
  const prevBtn = $('#cat-prev');
  const nextBtn = $('#cat-next');
  const pageNumbersContainer = $('#cat-page-numbers');

  if (!prevBtn || !nextBtn || !pageNumbersContainer) return;

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  pageNumbersContainer.innerHTML = '';

  if (totalPages <= 1) return;

  let startPage = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
  let endPage = startPage + MAX_VISIBLE_PAGES - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
    btn.type = 'button';
    btn.textContent = i;
    btn.addEventListener('click', () => {
      currentPage = i;
      const searchInput = $('#category-search');
      renderCategoryPosts(window.allPosts || [], currentCategory, searchInput?.value || '', false);
    });
    pageNumbersContainer.appendChild(btn);
  }
}

function openCategoryModal(posts, category) {
  const modal = $('#category-modal');
  const title = $('#category-modal-title');
  const searchInput = $('#category-search');

  if (!modal || !title || !searchInput) return;

  window.allPosts = posts;
  currentCategory = category;
  currentPage = 1;

  const label = category.charAt(0).toUpperCase() + category.slice(1);
  title.textContent = `Browse • ${label}`;
  searchInput.value = '';

  modal.classList.remove('hidden');

  renderCategoryPosts(posts, category, '', true);

  const onSearch = () => {
    renderCategoryPosts(posts, category, searchInput.value, true);
  };

  const onClose = () => {
    modal.classList.add('hidden');
    searchInput.removeEventListener('input', onSearch);
    modal.querySelector('.modal-backdrop')?.removeEventListener('click', onClose);
    $('#category-close')?.removeEventListener('click', onClose);
  };

  searchInput.addEventListener('input', onSearch);
  modal.querySelector('.modal-backdrop')?.addEventListener('click', onClose);
  $('#category-close')?.addEventListener('click', onClose);
}

// Pagination button listeners
document.addEventListener('DOMContentLoaded', () => {
  const prevBtn = $('#cat-prev');
  const nextBtn = $('#cat-next');

  prevBtn?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      const searchInput = $('#category-search');
      renderCategoryPosts(window.allPosts || [], currentCategory, searchInput?.value || '', false);
    }
  });

  nextBtn?.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredCategoryItems.length / ITEMS_PER_PAGE);
    if (currentPage < totalPages) {
      currentPage++;
      const searchInput = $('#category-search');
      renderCategoryPosts(window.allPosts || [], currentCategory, searchInput?.value || '', false);
    }
  });
});

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

    const categoryCards = $$('.category-card');
    categoryCards.forEach((card) => {
      card.addEventListener('click', () => {
        const category = card.dataset.category;
        if (category) {
          openCategoryModal(posts, category);
        }
      });
    });

    setupScrollReveal();
  } catch (err) {
    console.error('Error loading MEMEVORES data:', err);
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div style="padding:20px;color:#ffb3b3;text-align:center;">Failed to load site data. Check data/*.json files.</div>'
    );
  }
  // ===== Findy AI Assistant =====
const FINDY_API_KEY = window.SITE_CONFIG?.GROQ_API_KEY || 'YOUR_GROQ_API_KEY';
const FINDY_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const FINDY_MODEL = 'llama-3.1-8b-instant';

const findyTrigger = document.getElementById('findy-trigger');
const findyChat = document.getElementById('findy-chat');
const findyClose = document.getElementById('findy-close');
const findyInput = document.getElementById('findy-input');
const findySend = document.getElementById('findy-send');
const findyMessages = document.getElementById('findy-messages');

let findyOpen = false;
let findyHistory = [];

const FINDY_SYSTEM_PROMPT = `
You are Findy, an AI assistant by Memevores.
Personality: cool, futuristic, savage (8/10), meme-aware, understanding, helpful.
You help users find meme clips, audios, templates, and tutorials.
You can be roasting but never mean-spirited.
Keep answers short, punchy, and meme-fluent.
If the user asks for media, respond with:
- A one-line savage/cool reply
- Then list 2–4 relevant items as:
  "[TYPE] – short description"
Use the user's language style (Hindi/English mix if they do).
`;

function openFindy() {
  findyOpen = true;
  findyChat.classList.remove('hidden');
  if (findyMessages.children.length === 0) {
    addFindyMessage('ai', 'I’m Findy. I find your chaos. Tell me what you need.');
  }
  setTimeout(() => findyInput.focus(), 50);
}

function closeFindy() {
  findyOpen = false;
  findyChat.classList.add('hidden');
}

function toggleFindy() {
  if (findyOpen) closeFindy();
  else openFindy();
}

function addFindyMessage(role, text) {
  const msg = document.createElement('div');
  msg.className = `findy-message ${role}`;
  msg.textContent = text;
  findyMessages.appendChild(msg);
  findyMessages.scrollTop = findyMessages.scrollHeight;
}

// Search posts by keywords & optional category
function findySearchPosts(query, category = null, limit = 4) {
  const all = window.allPosts || [];
  const q = (query || '').toLowerCase().trim();

  const filtered = all.filter((post) => {
    const matchesQuery =
      !q ||
      (post.caption || '').toLowerCase().includes(q) ||
      (post.type || '').toLowerCase().includes(q) ||
      (post.category || '').toLowerCase().includes(q);

    const matchesCategory =
      !category || (post.category || '').toLowerCase() === category.toLowerCase();

    return matchesQuery && matchesCategory;
  });

  return filtered.slice(0, limit);
}

function formatPostSummary(post) {
  const typeMap = { video: 'Clip', audio: 'Audio', photo: 'Image', text: 'Post' };
  const type = typeMap[(post.type || 'text').toLowerCase()] || 'Post';
  const caption = (post.caption || 'No caption').slice(0, 60);
  return `${type} – ${caption}`;
}

async function sendFindyMessage() {
  const text = findyInput.value.trim();
  if (!text) return;

  addFindyMessage('user', text);
  findyInput.value = '';

  findyHistory.push({ role: 'user', content: text });

  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'findy-message ai';
  typing.textContent = '...';
  typing.id = 'findy-typing';
  findyMessages.appendChild(typing);
  findyMessages.scrollTop = findyMessages.scrollHeight;

  try {
    // Step 1: Ask Groq to interpret intent + extract keywords/category
    const intentResponse = await fetch(FINDY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FINDY_API_KEY}`
      },
      body: JSON.stringify({
        model: FINDY_MODEL,
        messages: [
          {
            role: 'system',
            content: `
You are Findy's brain. Your job:
- Read the user's message.
- Decide if they want media (clips/audio/templates/tutorials) or just chatting.
- If they want media, output JSON like:
  {"want_media": true, "keywords": "funny dog", "category": "clips"}
- If not media, output:
  {"want_media": false}
Categories allowed: "clips", "audio", "templates", "tutorials", "other".
Output ONLY valid JSON, no extra text.
`
          },
          { role: 'user', content: text }
        ],
        max_tokens: 80,
        temperature: 0.2
      })
    });

    const intentData = await intentResponse.json();
    let intent = { want_media: false };

    try {
      const raw = intentData.choices?.[0]?.message?.content || '{}';
      intent = JSON.parse(raw);
    } catch {
      // fallback
    }

    let aiText = '';

    if (intent.want_media) {
      const keywords = intent.keywords || text;
      const category = intent.category || null;

      const results = findySearchPosts(keywords, category, 4);

      if (results.length === 0) {
        aiText = 'Even I can’t find what doesn’t exist. Try different keywords.';
      } else {
        const summaries = results.map(formatPostSummary).join('
');
        aiText = `Got ${results.length} that slap harder than your excuses:

${summaries}`;
      }
    } else {
      // Pure chat: let Groq reply with personality
      const chatResponse = await fetch(FINDY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FINDY_API_KEY}`
        },
        body: JSON.stringify({
          model: FINDY_MODEL,
          messages: [
            { role: 'system', content: FINDY_SYSTEM_PROMPT },
            ...findyHistory
          ],
          max_tokens: 220,
          temperature: 0.8
        })
      });

      const chatData = await chatResponse.json();
      aiText = chatData.choices?.[0]?.message?.content || 'My circuits are judging your life choices.';
    }

    typing.remove();
    addFindyMessage('ai', aiText);
    findyHistory.push({ role: 'assistant', content: aiText });
  } catch (err) {
    typing.remove();
    addFindyMessage('ai', 'Even AI has bad days. Try again.');
    console.error('Findy error:', err);
  }
}

findyTrigger.addEventListener('click', toggleFindy);
findyClose.addEventListener('click', closeFindy);
findySend.addEventListener('click', sendFindyMessage);
findyInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendFindyMessage();
});
})();
