(function () {
  const postsUrl = "data/posts.json";

  const postsGrid = document.getElementById("posts-grid");
  const categoryFilter = document.getElementById("category-filter");
  const searchInput = document.getElementById("search-input");
  const browseTitle = document.getElementById("browse-title");

  let allPosts = [];

  function normalizeCategory(cat) {
    if (!cat) return "other";
    const c = String(cat).toLowerCase();
    if (["clips", "audio", "templates", "tutorials"].includes(c)) return c;
    return "other";
  }

  function renderPost(post) {
    const card = document.createElement("a");
    card.className = "post-card";
    card.href = post.telegramLink || "#";
    card.target = "_blank";
    card.rel = "noopener";

    const mediaDiv = document.createElement("div");
    mediaDiv.className = "post-media";

    if (post.file) {
      const type = (post.type || "").toLowerCase();

      if (type === "photo") {
        const img = document.createElement("img");
        img.src = post.file;
        img.alt = post.caption || "Post image";
        img.loading = "lazy";
        mediaDiv.appendChild(img);
      } else if (type === "video") {
        const video = document.createElement("video");
        video.src = post.file;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.controls = false;
        mediaDiv.appendChild(video);
      } else if (type === "audio") {
        const placeholder = document.createElement("div");
        placeholder.className = "placeholder";
        placeholder.textContent = "🎧 Audio post";
        mediaDiv.appendChild(placeholder);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "placeholder";
        placeholder.textContent = "Media";
        mediaDiv.appendChild(placeholder);
      }
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "placeholder";
      placeholder.textContent = post.type === "text" ? "Text post" : "No media";
      mediaDiv.appendChild(placeholder);
    }

    const contentDiv = document.createElement("div");
    contentDiv.className = "post-content";

    const caption = document.createElement("div");
    caption.className = "post-caption";
    caption.textContent = post.caption || "";

    const meta = document.createElement("div");
    meta.className = "post-meta";

    const category = normalizeCategory(post.category);
    const catBadge = document.createElement("span");
    catBadge.className = "category-badge";
    catBadge.textContent = category;

    const linkText = document.createElement("span");
    linkText.className = "post-link";
    linkText.textContent = "Open on Telegram";

    meta.appendChild(catBadge);
    meta.appendChild(linkText);

    contentDiv.appendChild(caption);
    contentDiv.appendChild(meta);

    card.appendChild(mediaDiv);
    card.appendChild(contentDiv);

    return card;
  }

  function filterPosts(posts, category, query) {
    const q = (query || "").toLowerCase().trim();

    return posts.filter((post) => {
      const cat = normalizeCategory(post.category);
      const matchesCategory = category === "all" || cat === category;

      const text = (post.caption || "").toLowerCase();
      const matchesQuery = !q || text.includes(q);

      return matchesCategory && matchesQuery;
    });
  }

  function renderAll(posts) {
    postsGrid.innerHTML = "";

    const category = categoryFilter.value;
    const query = searchInput.value;

    const filtered = filterPosts(posts, category, query);

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.style.color = "var(--muted)";
      empty.style.gridColumn = "1 / -1";
      empty.style.padding = "2rem";
      empty.style.textAlign = "center";
      empty.textContent = "No posts match your filters.";
      postsGrid.appendChild(empty);
      return;
    }

    filtered.forEach((post) => {
      postsGrid.appendChild(renderPost(post));
    });
  }

  categoryFilter.addEventListener("change", () => {
    renderAll(allPosts);
  });

  searchInput.addEventListener("input", () => {
    renderAll(allPosts);
  });

  (async function init() {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category");

    if (categoryParam) {
      const normalized = normalizeCategory(categoryParam);
      categoryFilter.value = normalized;
      const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);
      if (browseTitle) {
        browseTitle.textContent = `Browse • ${label}`;
      }
    }

    try {
      const res = await fetch(postsUrl);
      if (!res.ok) throw new Error("Failed to load posts");
      allPosts = await res.json();

      renderAll(allPosts);
    } catch (err) {
      console.error(err);
      postsGrid.innerHTML =
        '<div style="color:var(--muted); grid-column: 1 / -1; padding: 2rem; text-align: center;">Could not load posts. Make sure data/posts.json exists.</div>';
    }
  })();
})();
