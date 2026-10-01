(() => {
  "use strict";

  const CURRENT_USER = "bhav-ux";
  const STORAGE_KEY = "gridcards-posts-v6";
  const USER_KEY = "gridcards-user-v1";
  const FONT_KEY = "gridcards-font-size-v1";
  const CONTRAST_KEY = "gridcards-contrast-v1";

  const LANGUAGES = [
    ["hi", "Hindi"],
    ["en", "English"],
    ["es", "Spanish"],
    ["fr", "French"],
    ["de", "German"],
    ["it", "Italian"],
    ["pt", "Portuguese"],
    ["zh", "Chinese (Simplified)"],
    ["zh-TW", "Chinese (Traditional)"],
    ["ja", "Japanese"],
    ["ko", "Korean"],
    ["ru", "Russian"],
    ["bn", "Bengali"],
    ["ur", "Urdu"],
    ["ta", "Tamil"],
    ["te", "Telugu"],
    ["gu", "Gujarati"],
    ["kn", "Kannada"],
    ["pa", "Punjabi"],
    ["vi", "Vietnamese"],
    ["id", "Indonesian"],
    ["sa", "Sanskrit"]
  ];

  const DEFAULT_POSTS = [
    {
      id: "p1",
      title: "Community meeting — 10AM",
      description:
        "Join the project owners for the monthly update and Q&A.",
      img: "",
      lang: "en",
      comments: [],
      creator: "system",
      translations: {}
    },
    {
      id: "p2",
      title: "Maintenance window",
      description:
        "Services will be degraded for one hour during maintenance.",
      img: "",
      lang: "en",
      comments: [],
      creator: "ops-team",
      translations: {}
    },
    {
      id: "p3",
      title: "New feature: Dark mode",
      description:
        "Try the experimental dark mode and give feedback.",
      img: "",
      lang: "en",
      comments: [],
      creator: "system",
      translations: {}
    },
    {
      id: "p4",
      title: "Volunteer call",
      description:
        "We need volunteers for the outreach program next weekend.",
      img: "",
      lang: "en",
      comments: [],
      creator: "alice",
      translations: {}
    }
  ];

  let posts = loadPosts();
  let activePost = null;
  let quickActivePost = null;
  let broadcastChannel = null;
  let currentFontSize =
    Number(localStorage.getItem(FONT_KEY)) || 15;
  let toastTimer = null;

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  const els = {
    authWrapper: $("#authWrapper"),
    authForm: $("#authForm"),
    authName: $("#authName"),
    authAge: $("#authAge"),
    authError: $("#authError"),
    captchaText: $("#captchaText"),
    captchaInput: $("#captchaInput"),
    refreshCaptcha: $("#refreshCaptcha"),

    phoneScreen: $("#phoneScreen"),
    homeBtn: $("#homeBtn"),
    search: $("#search"),
    profileBtn: $("#profileBtn"),
    grid: $("#grid"),
    emptyState: $("#emptyState"),
    postCount: $("#postCount"),

    contrastToggle: $("#contrastToggle"),
    incText: $("#incText"),
    decText: $("#decText"),

    openNewPost: $("#openNewPost"),
    fabNewPost: $("#fabNewPost"),
    newPostModal: $("#newPostModal"),
    newTitle: $("#newTitle"),
    newDesc: $("#newDesc"),
    newImgUrl: $("#newImgUrl"),
    newImgFile: $("#newImgFile"),
    createPost: $("#createPost"),
    cancelCreate: $("#cancelCreate"),

    commentModal: $("#commentModal"),
    commentsList: $("#commentsList"),
    commentInput: $("#commentInput"),
    postComment: $("#postComment"),
    closeModal: $("#closeModal"),

    postDetail: $("#postDetail"),
    detailClose: $("#detailClose"),
    detailMedia: $("#detailMedia"),
    detailTitle: $("#detailTitle"),
    detailDescription: $("#detailDescription"),
    detailCommentsList: $("#detailCommentsList"),
    detailCommentInput: $("#detailCommentInput"),
    detailPostComment: $("#detailPostComment"),
    detailAudio: $("#detailAudio"),
    detailLangSelect: $("#detailLangSelect"),
    detailTranslate: $("#detailTranslate"),
    detailShare: $("#detailShare"),
    detailDelete: $("#detailDelete"),
    detailShowOriginal: $("#detailShowOriginal"),
    detailShownLang: $("#detailShownLang"),

    profileModal: $("#profileModal"),
    profileAvatar: $("#profileAvatar"),
    profileName: $("#profileName"),
    profileAge: $("#profileAge"),
    profilePostCount: $("#profilePostCount"),
    profileCommentCount: $("#profileCommentCount"),
    closeProfile: $("#closeProfile"),

    toast: $("#toast")
  };

  /* -----------------------------
     Storage
  ----------------------------- */

  function loadPosts() {
    try {
      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      );

      if (Array.isArray(stored)) {
        return normalizePosts(stored);
      }
    } catch (error) {
      console.warn("Could not load posts:", error);
    }

    return DEFAULT_POSTS.map(normalizePost);
  }

  function normalizePosts(list) {
    return list.map(normalizePost);
  }

  function normalizePost(post) {
    return {
      id: post.id || `post_${randomId()}`,
      title: String(post.title || "Untitled post"),
      description: String(post.description || ""),
      img: String(post.img || ""),
      lang: post.lang || "en",
      comments: Array.isArray(post.comments)
        ? post.comments
        : [],
      creator: post.creator || "unknown",
      translations:
        post.translations &&
        typeof post.translations === "object"
          ? post.translations
          : {},
      displayLang: post.displayLang || ""
    };
  }

  function savePosts() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(posts)
      );
    } catch (error) {
      console.warn("Could not save posts:", error);
      showToast(
        "Storage is full. Try using a smaller image."
      );
    }
  }

  function randomId() {
    if (window.crypto?.randomUUID) {
      return crypto.randomUUID().slice(0, 12);
    }

    return Math.random()
      .toString(36)
      .slice(2, 12);
  }

  function escapeSelector(value) {
    return window.CSS?.escape
      ? CSS.escape(value)
      : String(value).replace(
          /["\\]/g,
          "\\$&"
        );
  }

  /* -----------------------------
     UI helpers
  ----------------------------- */

  function showToast(message, duration = 2400) {
    clearTimeout(toastTimer);

    els.toast.textContent = message;
    els.toast.classList.add("show");

    toastTimer = setTimeout(() => {
      els.toast.classList.remove("show");
    }, duration);
  }

  function generatePlaceholder(title = "") {
    const safeTitle = title
      .slice(0, 35)
      .replace(
        /[&<>"]/g,
        char =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;"
          })[char]
      );

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg"
           width="900"
           height="540"
           viewBox="0 0 900 540">

        <defs>
          <linearGradient
            id="g"
            x1="0"
            x2="1"
            y1="0"
            y2="1">

            <stop
              offset="0"
              stop-color="#dbeafe"/>

            <stop
              offset="1"
              stop-color="#eff6ff"/>
          </linearGradient>
        </defs>

        <rect
          width="900"
          height="540"
          fill="url(#g)"/>

        <circle
          cx="760"
          cy="90"
          r="150"
          fill="#ffffff"
          opacity=".45"/>

        <circle
          cx="120"
          cy="500"
          r="190"
          fill="#93c5fd"
          opacity=".18"/>

        <text
          x="450"
          y="285"
          text-anchor="middle"
          font-family="Arial, sans-serif"
          font-size="34"
          font-weight="700"
          fill="#2563eb">
          ${safeTitle || "GridCards"}
        </text>
      </svg>
    `;

    return (
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(svg)
    );
  }

  function isVideoUrl(url) {
    return /\.(mp4|webm|ogg)(\?.*)?$/i.test(
      url || ""
    );
  }

  function getDisplayContent(post) {
    const lang = post.displayLang;

    if (
      lang &&
      post.translations?.[lang]
    ) {
      return {
        title:
          post.translations[lang].title ||
          post.title,

        description:
          post.translations[lang].description ||
          post.description
      };
    }

    return {
      title: post.title,
      description: post.description
    };
  }

  /* -----------------------------
     Posts
  ----------------------------- */

  function renderPosts(filter = "") {
    const query = filter.trim().toLowerCase();

    const visiblePosts = posts.filter(post => {
      const content =
        `${post.title} ${post.description}`.toLowerCase();

      return content.includes(query);
    });

    els.grid.replaceChildren();

    visiblePosts.forEach((post, index) => {
      const card = createCardElement(post);

      card.style.setProperty(
        "--delay",
        `${Math.min(index * 35, 300)}ms`
      );

      els.grid.appendChild(card);

      requestAnimationFrame(() => {
        card.classList.add("visible");
      });
    });

    els.emptyState.hidden =
      visiblePosts.length !== 0;

    els.postCount.textContent =
      `${visiblePosts.length} ${
        visiblePosts.length === 1
          ? "post"
          : "posts"
      }`;
  }

  function createCardElement(post) {
    const fragment =
      $("#card-template")
        .content
        .cloneNode(true);

    const card = $(".card", fragment);
    const image = $("img", card);
    const title = $(".title", card);
    const description =
      $(".description", card);

    const {
      title: displayTitle,
      description: displayDescription
    } = getDisplayContent(post);

    card.dataset.id = post.id;

    image.src =
      post.img.trim() ||
      generatePlaceholder(post.title);

    image.alt =
      `Media for ${displayTitle}`;

    image.onerror = () => {
      image.onerror = null;
      image.src =
        generatePlaceholder(post.title);
    };

    title.textContent = displayTitle;
    description.textContent =
      displayDescription;

    $(".audio", card).addEventListener(
      "click",
      event => {
        event.stopPropagation();
        playTTS(post);
      }
    );

    $(".comment", card).addEventListener(
      "click",
      event => {
        event.stopPropagation();
        openCommentsQuick(post);
      }
    );

    $(".share", card).addEventListener(
      "click",
      event => {
        event.stopPropagation();
        sharePost(post);
      }
    );

    const deleteButton =
      $(".delete", card);

    if (post.creator === CURRENT_USER) {
      deleteButton.hidden = false;

      deleteButton.addEventListener(
        "click",
        event => {
          event.stopPropagation();
          confirmDelete(post);
        }
      );
    }

    card.addEventListener(
      "click",
      () => openPostDetail(post)
    );

    card.addEventListener(
      "keydown",
      event => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          openPostDetail(post);
        }
      }
    );

    return card;
  }

  /* -----------------------------
     Audio
  ----------------------------- */

  function playTTS(post) {
    if (!("speechSynthesis" in window)) {
      showToast(
        "Text-to-speech is not supported in this browser."
      );
      return;
    }

    const content =
      getDisplayContent(post);

    const utterance =
      new SpeechSynthesisUtterance(
        `${content.title}. ${content.description}`
      );

    utterance.lang =
      post.displayLang ||
      post.lang ||
      "en";

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);

    showToast("Playing audio");
  }

  /* -----------------------------
     Comments
  ----------------------------- */

  function openCommentsQuick(post) {
    quickActivePost = post;

    renderCommentsList(
      els.commentsList,
      post
    );

    openModal(els.commentModal);

    els.commentInput.value = "";

    setTimeout(() => {
      els.commentInput.focus();
    }, 50);
  }

  function renderCommentsList(
    container,
    post
  ) {
    container.replaceChildren();

    const comments =
      post.comments || [];

    if (!comments.length) {
      const empty =
        document.createElement("p");

      empty.className =
        "comments-empty";

      empty.textContent =
        "No comments yet. Be the first to comment.";

      container.appendChild(empty);
      return;
    }

    comments.forEach(comment => {
      const item =
        document.createElement("div");

      item.className =
        "comment-item";

      const text =
        document.createElement("p");

      const lang =
        post.displayLang;

      text.textContent =
        lang &&
        comment.translations?.[lang]
          ? comment.translations[lang]
          : comment.text;

      const time =
        document.createElement("time");

      time.textContent =
        comment.at
          ? new Date(
              comment.at
            ).toLocaleString()
          : "";

      item.append(
        text,
        time
      );

      container.appendChild(item);
    });
  }

  function addComment(
    post,
    rawText
  ) {
    const text =
      rawText.trim();

    if (!post || !text) {
      return false;
    }

    post.comments =
      Array.isArray(post.comments)
        ? post.comments
        : [];

    post.comments.push({
      id: `comment_${randomId()}`,
      text,
      at: Date.now(),
      translations: {}
    });

    savePosts();

    broadcast({
      type: "comment",
      postId: post.id,
      comment: post.comments.at(-1)
    });

    return true;
  }

  /* -----------------------------
     Post detail
  ----------------------------- */

  function openPostDetail(post) {
    activePost = post;

    renderDetailMedia(post);
    renderDetailContent();

    els.detailDelete.hidden =
      post.creator !== CURRENT_USER;

    els.detailCommentInput.value = "";

    openModal(
      els.postDetail,
      true
    );

    els.detailClose.focus();
  }

  function renderDetailMedia(post) {
    els.detailMedia.replaceChildren();

    if (isVideoUrl(post.img)) {
      const video =
        document.createElement("video");

      video.src = post.img;
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";

      video.setAttribute(
        "aria-label",
        `Video for ${post.title}`
      );

      els.detailMedia.appendChild(video);
      return;
    }

    const image =
      document.createElement("img");

    image.src =
      post.img.trim() ||
      generatePlaceholder(post.title);

    image.alt =
      `Media for ${post.title}`;

    image.onerror = () => {
      image.onerror = null;
      image.src =
        generatePlaceholder(post.title);
    };

    els.detailMedia.appendChild(image);
  }

  function renderDetailContent() {
    if (!activePost) return;

    const content =
      getDisplayContent(activePost);

    els.detailTitle.textContent =
      content.title;

    els.detailDescription.textContent =
      content.description;

    els.detailShownLang.textContent =
      activePost.displayLang ||
      "original";

    renderCommentsList(
      els.detailCommentsList,
      activePost
    );
  }

  function closePostDetail() {
    closeModal(
      els.postDetail,
      true
    );

    activePost = null;
    els.detailLangSelect.value = "";
  }

  /* -----------------------------
     Delete
  ----------------------------- */

  function confirmDelete(post) {
    if (
      post.creator !== CURRENT_USER
    ) {
      showToast(
        "You can only delete your own posts."
      );
      return;
    }

    if (
      window.confirm(
        "Delete this post permanently?"
      )
    ) {
      deletePost(post.id);
    }
  }

  function deletePost(id) {
    const card =
      els.grid.querySelector(
        `.card[data-id="${escapeSelector(id)}"]`
      );

    const finish = () => {
      const index =
        posts.findIndex(
          post => post.id === id
        );

      if (index === -1) return;

      posts.splice(index, 1);

      savePosts();

      broadcast({
        type: "delete-post",
        postId: id,
        by: CURRENT_USER
      });

      if (
        activePost?.id === id
      ) {
        closePostDetail();
      }

      renderPosts(
        els.search.value
      );

      showToast("Post deleted");
    };

    if (!card) {
      finish();
      return;
    }

    card.classList.add(
      "removing"
    );

    setTimeout(
      finish,
      220
    );
  }

  /* -----------------------------
     Sharing
  ----------------------------- */

  async function sharePost(post) {
    const shareData = {
      title: post.title,
      text: post.description,
      url:
        `${location.href.split("#")[0]}` +
        `#post-${encodeURIComponent(post.id)}`
    };

    try {
      if (navigator.share) {
        await navigator.share(
          shareData
        );
      } else if (
        navigator.clipboard?.writeText
      ) {
        await navigator.clipboard.writeText(
          `${post.title}\n` +
          `${post.description}\n` +
          `${shareData.url}`
        );

        showToast(
          "Post link copied"
        );

        return;
      } else {
        showToast(
          "Sharing is not supported here."
        );

        return;
      }

      showToast("Shared");
    } catch (error) {
      if (
        error?.name !==
        "AbortError"
      ) {
        showToast(
          "Unable to share."
        );
      }
    }
  }

  /* -----------------------------
     Translation
  ----------------------------- */

  async function translateText(
    text,
    target
  ) {
    if (!text.trim()) return "";

    const url =
      `https://translate.googleapis.com/translate_a/single` +
      `?client=gtx` +
      `&sl=auto` +
      `&tl=${encodeURIComponent(target)}` +
      `&dt=t` +
      `&q=${encodeURIComponent(text)}`;

    const response =
      await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Translation request failed."
      );
    }

    const data =
      await response.json();

    if (!Array.isArray(data?.[0])) {
      throw new Error(
        "Unexpected translation response."
      );
    }

    return data[0]
      .map(
        part => part?.[0] || ""
      )
      .join("");
  }

  async function translatePostAndComments(
    post,
    language
  ) {
    if (!post || !language) return;

    showToast(
      "Translating…"
    );

    try {
      const [
        title,
        description
      ] = await Promise.all([
        translateText(
          post.title,
          language
        ),
        translateText(
          post.description,
          language
        )
      ]);

      const translatedComments =
        await Promise.all(
          (post.comments || [])
            .map(
              async comment => ({
                id: comment.id,
                translatedText:
                  await translateText(
                    comment.text,
                    language
                  )
              })
            )
        );

      post.translations ||= {};

      post.translations[
        language
      ] = {
        title,
        description,
        comments:
          Object.fromEntries(
            translatedComments.map(
              item => [
                item.id,
                item.translatedText
              ]
            )
          )
      };

      (
        post.comments || []
      ).forEach(comment => {
        const translated =
          translatedComments.find(
            item =>
              item.id ===
              comment.id
          );

        if (translated) {
          comment.translations ||= {};

          comment.translations[
            language
          ] =
            translated.translatedText;
        }
      });

      post.displayLang =
        language;

      savePosts();

      broadcast({
        type: "translate",
        postId: post.id,
        lang: language,
        title,
        description,
        comments:
          translatedComments
      });

      renderDetailContent();
      renderPosts(
        els.search.value
      );

      showToast(
        "Translation complete"
      );
    } catch (error) {
      console.error(error);

      showToast(
        "Translation failed. Check your connection."
      );
    }
  }

  function populateLanguages() {
    els.detailLangSelect.replaceChildren();

    const first =
      document.createElement(
        "option"
      );

    first.value = "";
    first.textContent =
      "Language";

    els.detailLangSelect.appendChild(
      first
    );

    LANGUAGES.forEach(
      ([code, name]) => {
        const option =
          document.createElement(
            "option"
          );

        option.value = code;
        option.textContent =
          name;

        els.detailLangSelect.appendChild(
          option
        );
      }
    );
  }

  /* -----------------------------
     Modals
  ----------------------------- */

  function openModal(
    modal,
    isDetail = false
  ) {
    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    if (!isDetail) {
      modal.dataset.previousFocus =
        document.activeElement?.id ||
        "";
    }
  }

  function closeModal(
    modal,
    isDetail = false
  ) {
    modal.setAttribute(
      "aria-hidden",
      "true"
    );

    if (!isDetail) {
      const previousId =
        modal.dataset.previousFocus;

      if (previousId) {
        document
          .getElementById(
            previousId
          )
          ?.focus();
      }
    }
  }

  /* -----------------------------
     New post
  ----------------------------- */

  function openNewPostModal() {
    els.newTitle.value = "";
    els.newDesc.value = "";
    els.newImgUrl.value = "";
    els.newImgFile.value = "";

    openModal(
      els.newPostModal
    );

    setTimeout(() => {
      els.newTitle.focus();
    }, 50);
  }

  function createPost() {
    const title =
      els.newTitle.value.trim();

    const description =
      els.newDesc.value.trim();

    const imageUrl =
      els.newImgUrl.value.trim();

    const file =
      els.newImgFile.files?.[0];

    if (!title || !description) {
      showToast(
        "Add a title and description first."
      );
      return;
    }

    if (
      imageUrl &&
      !/^https?:\/\//i.test(
        imageUrl
      )
    ) {
      showToast(
        "Please enter a valid image URL."
      );
      return;
    }

    const finish = image => {
      const post = {
        id: `post_${randomId()}`,
        title,
        description,
        img: image || "",
        lang: "en",
        comments: [],
        creator: CURRENT_USER,
        translations: {}
      };

      posts.unshift(post);

      savePosts();

      broadcast({
        type: "new-post",
        post
      });

      closeModal(
        els.newPostModal
      );

      renderPosts(
        els.search.value
      );

      showToast(
        "Post published"
      );

      els.phoneScreen.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      updateProfile();
    };

    if (!file) {
      finish(imageUrl);
      return;
    }

    if (
      file.size >
      2_500_000
    ) {
      showToast(
        "Please use an image smaller than 2.5 MB."
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () =>
      finish(
        String(reader.result)
      );

    reader.onerror = () =>
      showToast(
        "Could not read that image."
      );

    reader.readAsDataURL(file);
  }

  /* -----------------------------
     Accessibility
  ----------------------------- */

  function setFontSize(
    size,
    broadcastChange = true
  ) {
    currentFontSize =
      Math.max(
        13,
        Math.min(
          20,
          Number(size) || 15
        )
      );

    document.documentElement.style.setProperty(
      "--font-size",
      `${currentFontSize}px`
    );

    localStorage.setItem(
      FONT_KEY,
      String(currentFontSize)
    );

    if (broadcastChange) {
      broadcast({
        type: "ui",
        key: "fontSize",
        value: currentFontSize
      });
    }
  }

  function setContrast(
    enabled,
    broadcastChange = true
  ) {
    document.documentElement.classList.toggle(
      "high-contrast",
      enabled
    );

    els.contrastToggle.checked =
      enabled;

    localStorage.setItem(
      CONTRAST_KEY,
      String(enabled)
    );

    if (broadcastChange) {
      broadcast({
        type: "ui",
        key: "contrast",
        value: enabled
      });
    }
  }

  /* -----------------------------
     Multi-tab sync
  ----------------------------- */

  function setupBroadcast() {
    if (
      !("BroadcastChannel" in window)
    ) {
      return;
    }

    broadcastChannel =
      new BroadcastChannel(
        "gridcards-sync"
      );

    broadcastChannel.addEventListener(
      "message",
      event =>
        handleRemote(
          event.data
        )
    );
  }

  function broadcast(message) {
    broadcastChannel?.postMessage(
      message
    );
  }

  function handleRemote(message) {
    if (!message?.type) return;

    if (
      message.type ===
      "comment"
    ) {
      const post =
        posts.find(
          item =>
            item.id ===
            message.postId
        );

      if (
        !post ||
        post.comments.some(
          comment =>
            comment.id ===
            message.comment.id
        )
      ) {
        return;
      }

      post.comments.push(
        message.comment
      );

      savePosts();

      if (
        activePost?.id ===
        post.id
      ) {
        renderDetailContent();
      }

      renderPosts(
        els.search.value
      );

      return;
    }

    if (
      message.type ===
      "new-post"
    ) {
      if (
        !message.post ||
        posts.some(
          post =>
            post.id ===
            message.post.id
        )
      ) {
        return;
      }

      posts.unshift(
        normalizePost(
          message.post
        )
      );

      savePosts();
      renderPosts(
        els.search.value
      );

      showToast(
        "New post received"
      );

      return;
    }

    if (
      message.type ===
      "delete-post"
    ) {
      const index =
        posts.findIndex(
          post =>
            post.id ===
            message.postId
        );

      if (index === -1) {
        return;
      }

      posts.splice(
        index,
        1
      );

      savePosts();

      if (
        activePost?.id ===
        message.postId
      ) {
        closePostDetail();
      }

      renderPosts(
        els.search.value
      );

      return;
    }

    if (
      message.type ===
      "translate"
    ) {
      const post =
        posts.find(
          item =>
            item.id ===
            message.postId
        );

      if (!post) return;

      post.translations ||= {};

      post.translations[
        message.lang
      ] = {
        title:
          message.title,
        description:
          message.description,
        comments:
          Object.fromEntries(
            (
              message.comments ||
              []
            ).map(
              item => [
                item.id,
                item.translatedText
              ]
            )
          )
      };

      (
        message.comments ||
        []
      ).forEach(item => {
        const comment =
          post.comments.find(
            commentItem =>
              commentItem.id ===
              item.id
          );

        if (comment) {
          comment.translations ||= {};

          comment.translations[
            message.lang
          ] =
            item.translatedText;
        }
      });

      post.displayLang =
        message.lang;

      savePosts();

      if (
        activePost?.id ===
        post.id
      ) {
        renderDetailContent();
      }

      renderPosts(
        els.search.value
      );

      return;
    }

    if (
      message.type ===
      "ui"
    ) {
      if (
        message.key ===
        "fontSize"
      ) {
        setFontSize(
          message.value,
          false
        );
      }

      if (
        message.key ===
        "contrast"
      ) {
        setContrast(
          Boolean(
            message.value
          ),
          false
        );
      }
    }
  }

  /* -----------------------------
     CAPTCHA
  ----------------------------- */

  function generateCaptcha() {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let value = "";

    for (
      let i = 0;
      i < 5;
      i++
    ) {
      value +=
        chars[
          Math.floor(
            Math.random() *
              chars.length
          )
        ];
    }

    els.captchaText.textContent =
      value;
  }

  function setAuthError(
    message = ""
  ) {
    els.authError.textContent =
      message;
  }

  function setupAuth() {
    let savedUser = null;

    try {
      savedUser = JSON.parse(
        localStorage.getItem(
          USER_KEY
        ) || "null"
      );
    } catch {
      savedUser = null;
    }

    if (
      savedUser?.name &&
      Number(savedUser.age) >= 13
    ) {
      hideAuth();
      return;
    }

    generateCaptcha();

    els.refreshCaptcha.addEventListener(
      "click",
      () => {
        generateCaptcha();

        els.captchaInput.value =
          "";

        els.captchaInput.focus();
      }
    );

    els.authForm.addEventListener(
      "submit",
      event => {
        event.preventDefault();

        const name =
          els.authName.value.trim();

        const age =
          Number(
            els.authAge.value
          );

        const captcha =
          els.captchaInput.value
            .trim()
            .toUpperCase();

        if (
          !name ||
          !Number.isInteger(age) ||
          age < 13 ||
          age > 120
        ) {
          setAuthError(
            "Enter a valid name and age."
          );

          return;
        }

        if (
          captcha !==
          els.captchaText.textContent
        ) {
          setAuthError(
            "Captcha is incorrect. Try again."
          );

          generateCaptcha();

          els.captchaInput.value =
            "";

          return;
        }

        localStorage.setItem(
          USER_KEY,
          JSON.stringify({
            name,
            age
          })
        );

        setAuthError("");
        hideAuth();
      }
    );
  }

  function hideAuth() {
    els.authWrapper.classList.add(
      "hidden"
    );

    updateProfile();
  }

  /* -----------------------------
     Profile
  ----------------------------- */

  function updateProfile() {
    let user = null;

    try {
      user = JSON.parse(
        localStorage.getItem(
          USER_KEY
        ) || "null"
      );
    } catch {
      user = null;
    }

    const name =
      user?.name ||
      "GridCards User";

    const age =
      user?.age
        ? `Age ${user.age}`
        : "";

    els.profileName.textContent =
      name;

    els.profileAge.textContent =
      age;

    els.profileAvatar.textContent =
      name
        .charAt(0)
        .toUpperCase();

    els.profilePostCount.textContent =
      posts.filter(
        post =>
          post.creator ===
          CURRENT_USER
      ).length;

    els.profileCommentCount.textContent =
      posts.reduce(
        (total, post) =>
          total +
          (post.comments?.length ||
            0),
        0
      );
  }

  function openProfile() {
    updateProfile();

    openModal(
      els.profileModal
    );
  }

  /* -----------------------------
     Global events
  ----------------------------- */

  function closeAllOverlays() {
    closeModal(
      els.commentModal
    );

    closeModal(
      els.newPostModal
    );

    closeModal(
      els.profileModal
    );

    if (
      els.postDetail.getAttribute(
        "aria-hidden"
      ) === "false"
    ) {
      closePostDetail();
    }
  }

  function setupEvents() {
    els.search.addEventListener(
      "input",
      event =>
        renderPosts(
          event.target.value
        )
    );

    els.homeBtn.addEventListener(
      "click",
      () => {
        els.search.value = "";

        renderPosts();

        els.phoneScreen.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    );

    els.openNewPost.addEventListener(
      "click",
      openNewPostModal
    );

    els.fabNewPost.addEventListener(
      "click",
      openNewPostModal
    );

    els.createPost.addEventListener(
      "click",
      createPost
    );

    els.cancelCreate.addEventListener(
      "click",
      () =>
        closeModal(
          els.newPostModal
        )
    );

    els.profileBtn.addEventListener(
      "click",
      openProfile
    );

    els.closeProfile.addEventListener(
      "click",
      () =>
        closeModal(
          els.profileModal
        )
    );

    els.closeModal.addEventListener(
      "click",
      () =>
        closeModal(
          els.commentModal
        )
    );

    els.postComment.addEventListener(
      "click",
      () => {
        if (
          addComment(
            quickActivePost,
            els.commentInput.value
          )
        ) {
          renderCommentsList(
            els.commentsList,
            quickActivePost
          );

          els.commentInput.value =
            "";

          showToast(
            "Comment posted"
          );

          updateProfile();
        }
      }
    );

    els.detailClose.addEventListener(
      "click",
      closePostDetail
    );

    els.detailAudio.addEventListener(
      "click",
      () => {
        if (activePost) {
          playTTS(activePost);
        }
      }
    );

    els.detailShare.addEventListener(
      "click",
      () => {
        if (activePost) {
          sharePost(activePost);
        }
      }
    );

    els.detailTranslate.addEventListener(
      "click",
      () => {
        const language =
          els.detailLangSelect.value;

        if (!activePost) return;

        if (!language) {
          showToast(
            "Choose a language first."
          );

          return;
        }

        translatePostAndComments(
          activePost,
          language
        );
      }
    );

    els.detailShowOriginal.addEventListener(
      "click",
      () => {
        if (!activePost) return;

        activePost.displayLang =
          "";

        savePosts();

        renderDetailContent();

        renderPosts(
          els.search.value
        );

        els.detailLangSelect.value =
          "";
      }
    );

    els.detailDelete.addEventListener(
      "click",
      () => {
        if (activePost) {
          confirmDelete(
            activePost
          );
        }
      }
    );

    els.detailPostComment.addEventListener(
      "click",
      () => {
        if (
          addComment(
            activePost,
            els.detailCommentInput
              .value
          )
        ) {
          els.detailCommentInput.value =
            "";

          renderDetailContent();

          showToast(
            "Comment posted"
          );

          updateProfile();
        }
      }
    );

    els.contrastToggle.addEventListener(
      "change",
      event =>
        setContrast(
          event.target.checked
        )
    );

    els.incText.addEventListener(
      "click",
      () =>
        setFontSize(
          currentFontSize + 1
        )
    );

    els.decText.addEventListener(
      "click",
      () =>
        setFontSize(
          currentFontSize - 1
        )
    );

    $$(".modal").forEach(
      modal => {
        modal.addEventListener(
          "click",
          event => {
            if (
              event.target ===
              modal
            ) {
              closeModal(
                modal
              );
            }
          }
        );
      }
    );

    document.addEventListener(
      "keydown",
      event => {
        if (
          event.key !==
          "Escape"
        ) {
          return;
        }

        closeAllOverlays();
      }
    );

    window.addEventListener(
      "storage",
      event => {
        if (
          event.key !==
            STORAGE_KEY ||
          !event.newValue
        ) {
          return;
        }

        try {
          const incoming =
            JSON.parse(
              event.newValue
            );

          if (
            Array.isArray(
              incoming
            )
          ) {
            posts =
              normalizePosts(
                incoming
              );

            renderPosts(
              els.search.value
            );

            updateProfile();
          }
        } catch (error) {
          console.warn(
            "Storage update failed:",
            error
          );
        }
      }
    );
  }

  /* -----------------------------
     Hash routes
  ----------------------------- */

  function handleHashRoute() {
    const match =
      location.hash.match(
        /^#post-(.+)$/
      );

    if (!match) return;

    const postId =
      decodeURIComponent(
        match[1]
      );

    const post =
      posts.find(
        item =>
          item.id === postId
      );

    if (post) {
      openPostDetail(post);
    }
  }

  /* -----------------------------
     Init
  ----------------------------- */

  function init() {
    populateLanguages();

    setupBroadcast();

    setupEvents();

    setupAuth();

    setFontSize(
      currentFontSize,
      false
    );

    setContrast(
      localStorage.getItem(
        CONTRAST_KEY
      ) === "true",
      false
    );

    renderPosts();

    updateProfile();

    handleHashRoute();
  }

  init();
})();
