"use strict";

/* =========================================================
   GRIDCARDS - SCRIPT.JS
========================================================= */

const STORAGE_KEY = "gridcards_posts_v11";
const USER_KEY = "gridcards_user_v11";
const FONT_KEY = "gridcards_font_v11";
const CONTRAST_KEY = "gridcards_contrast_v11";
const CURRENT_USER = "gridcards-user";


/* =========================================================
   LANGUAGES
========================================================= */

const LANGUAGES = [
  ["hi", "Hindi"],
  ["en", "English"],
  ["es", "Spanish"],
  ["fr", "French"],
  ["de", "German"],
  ["it", "Italian"],
  ["pt", "Portuguese"],
  ["zh-CN", "Chinese"],
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


/* =========================================================
   DEFAULT POSTS
========================================================= */

const DEFAULT_POSTS = [
  {
    id: "post-1",
    title: "Community meeting — 10AM",
    description:
      "Join the project owners for the monthly update and Q&A.",
    img: "",
    creator: "system",
    comments: [],
    translations: {},
    displayLanguage: ""
  },

  {
    id: "post-2",
    title: "Maintenance window",
    description:
      "Services will be degraded for one hour during maintenance.",
    img: "",
    creator: "system",
    comments: [],
    translations: {},
    displayLanguage: ""
  },

  {
    id: "post-3",
    title: "New feature: Dark mode",
    description:
      "Try the experimental dark mode and give feedback.",
    img: "",
    creator: "system",
    comments: [],
    translations: {},
    displayLanguage: ""
  },

  {
    id: "post-4",
    title: "Volunteer call",
    description:
      "We need volunteers for the outreach program next weekend.",
    img: "",
    creator: "system",
    comments: [],
    translations: {},
    displayLanguage: ""
  }
];


/* =========================================================
   STATE
========================================================= */

let posts = loadPosts();
let activePost = null;
let commentPost = null;
let captchaCode = "";
let toastTimer = null;
let channel = null;

let fontSize =
  Number(localStorage.getItem(FONT_KEY)) || 15;


/* =========================================================
   HELPERS
========================================================= */

const $ = id =>
  document.getElementById(id);


function createId() {
  if (
    window.crypto &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID().slice(0, 12);
  }

  return Math.random()
    .toString(36)
    .slice(2, 14);
}


function showToast(message) {
  clearTimeout(toastTimer);

  toast.textContent = message;

  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}


function languageName(code) {
  return (
    LANGUAGES.find(
      item => item[0] === code
    )?.[1] || code
  );
}


/* =========================================================
   ELEMENTS
========================================================= */

const authScreen = $("authScreen");
const authForm = $("authForm");
const authName = $("authName");
const authAge = $("authAge");
const captchaText = $("captchaText");
const captchaInput = $("captchaInput");
const refreshCaptcha = $("refreshCaptcha");
const authError = $("authError");

const app = $("app");

const homeBtn = $("homeBtn");
const search = $("search");
const grid = $("grid");
const emptyState = $("emptyState");
const postCount = $("postCount");

const contrastToggle =
  $("contrastToggle");

const incText =
  $("incText");

const decText =
  $("decText");

const openNewPost =
  $("openNewPost");

const fabNewPost =
  $("fabNewPost");

const newPostModal =
  $("newPostModal");

const newTitle =
  $("newTitle");

const newDesc =
  $("newDesc");

const newImgUrl =
  $("newImgUrl");

const newImgFile =
  $("newImgFile");

const createPostButton =
  $("createPost");

const cancelCreate =
  $("cancelCreate");

const postDetail =
  $("postDetail");

const detailClose =
  $("detailClose");

const detailMedia =
  $("detailMedia");

const detailTitle =
  $("detailTitle");

const detailDescription =
  $("detailDescription");

const detailAudio =
  $("detailAudio");

const detailLangSelect =
  $("detailLangSelect");

const detailTranslate =
  $("detailTranslate");

const detailShare =
  $("detailShare");

const detailDelete =
  $("detailDelete");

const detailShowOriginal =
  $("detailShowOriginal");

const detailShownLang =
  $("detailShownLang");

const detailCommentsList =
  $("detailCommentsList");

const detailCommentInput =
  $("detailCommentInput");

const detailPostComment =
  $("detailPostComment");

const commentModal =
  $("commentModal");

const commentsList =
  $("commentsList");

const commentInput =
  $("commentInput");

const postComment =
  $("postComment");

const closeModalButton =
  $("closeModal");

const profileBtn =
  $("profileBtn");

const profileModal =
  $("profileModal");

const profileAvatar =
  $("profileAvatar");

const profileName =
  $("profileName");

const profileAge =
  $("profileAge");

const profilePostCount =
  $("profilePostCount");

const profileCommentCount =
  $("profileCommentCount");

const closeProfile =
  $("closeProfile");

const logoutButton =
  $("logoutButton");

const toast =
  $("toast");


/* =========================================================
   STORAGE
========================================================= */

function cloneDefaultPosts() {
  return DEFAULT_POSTS.map(post =>
    JSON.parse(JSON.stringify(post))
  );
}


function normalisePost(post) {
  return {
    id:
      post?.id ||
      `post-${createId()}`,

    title:
      String(
        post?.title ||
        "Untitled post"
      ),

    description:
      String(
        post?.description ||
        ""
      ),

    img:
      String(
        post?.img ||
        ""
      ),

    creator:
      String(
        post?.creator ||
        "system"
      ),

    comments:
      Array.isArray(
        post?.comments
      )
        ? post.comments
        : [],

    translations:
      post?.translations &&
      typeof post.translations === "object"
        ? post.translations
        : {},

    displayLanguage:
      String(
        post?.displayLanguage ||
        ""
      )
  };
}


function loadPosts() {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return cloneDefaultPosts();
    }

    const data =
      JSON.parse(raw);

    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {
      return cloneDefaultPosts();
    }

    return data.map(
      normalisePost
    );

  } catch (error) {
    console.error(
      "Could not load posts:",
      error
    );

    return cloneDefaultPosts();
  }
}


function savePosts() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(posts)
    );
  } catch (error) {
    console.error(
      "Could not save posts:",
      error
    );

    showToast(
      "Storage is full. Use a smaller image."
    );
  }
}


/* =========================================================
   PLACEHOLDER IMAGE
========================================================= */

function placeholderImage(
  title = ""
) {
  const safe =
    title
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="900"
      height="600"
      viewBox="0 0 900 600"
    >

      <defs>
        <linearGradient
          id="gradient"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="#dbeafe"
          />

          <stop
            offset="100%"
            stop-color="#eff6ff"
          />
        </linearGradient>
      </defs>

      <rect
        width="900"
        height="600"
        fill="url(#gradient)"
      />

      <circle
        cx="740"
        cy="120"
        r="160"
        fill="#ffffff"
        opacity="0.55"
      />

      <circle
        cx="100"
        cy="540"
        r="200"
        fill="#60a5fa"
        opacity="0.12"
      />

      <text
        x="450"
        y="315"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="36"
        font-weight="700"
        fill="#2563eb"
      >
        ${safe || "GridCards"}
      </text>

    </svg>
  `;

  return (
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(svg)
  );
}


/* =========================================================
   AUTH
========================================================= */

function generateCaptcha() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  captchaCode = "";

  for (let i = 0; i < 5; i++) {
    captchaCode +=
      chars[
        Math.floor(
          Math.random() *
          chars.length
        )
      ];
  }

  captchaText.textContent =
    captchaCode;
}


function getUser() {
  try {
    return JSON.parse(
      localStorage.getItem(
        USER_KEY
      ) || "null"
    );
  } catch {
    return null;
  }
}


function showApp() {
  authScreen.hidden = true;
  app.hidden = false;

  updateProfile();

  setTimeout(() => {
    search.focus();
  }, 100);
}


function showLogin() {
  app.hidden = true;
  authScreen.hidden = false;

  generateCaptcha();

  setTimeout(() => {
    authName.focus();
  }, 50);
}


function setupAuthentication() {
  generateCaptcha();

  refreshCaptcha.addEventListener(
    "click",
    () => {
      generateCaptcha();

      captchaInput.value = "";

      authError.textContent = "";

      captchaInput.focus();
    }
  );


  authForm.addEventListener(
    "submit",
    event => {
      event.preventDefault();

      const name =
        authName.value.trim();

      const age =
        Number(authAge.value);

      const enteredCaptcha =
        captchaInput.value
          .trim()
          .toUpperCase();

      authError.textContent =
        "";


      if (!name) {
        authError.textContent =
          "Please enter your name.";

        return;
      }


      if (
        !Number.isInteger(age) ||
        age < 13 ||
        age > 120
      ) {
        authError.textContent =
          "Please enter a valid age.";

        return;
      }


      if (
        enteredCaptcha !==
        captchaCode
      ) {
        authError.textContent =
          "Incorrect captcha.";

        captchaInput.value = "";

        generateCaptcha();

        return;
      }


      localStorage.setItem(
        USER_KEY,
        JSON.stringify({
          name,
          age
        })
      );


      showApp();

      showToast(
        `Welcome, ${name}!`
      );
    }
  );
}


/* =========================================================
   DISPLAYED CONTENT
========================================================= */

function displayContent(post) {
  const translation =
    post.displayLanguage &&
    post.translations?.[
      post.displayLanguage
    ];

  return {
    title:
      translation?.title ||
      post.title,

    description:
      translation?.description ||
      post.description
  };
}


/* =========================================================
   RENDER POSTS
========================================================= */

function renderPosts() {
  const query =
    search.value
      .trim()
      .toLowerCase();


  const filtered =
    posts.filter(post => {
      const text =
        `${post.title} ${post.description}`
          .toLowerCase();

      return text.includes(
        query
      );
    });


  grid.innerHTML = "";


  filtered.forEach(
    (post, index) => {

      const card =
        createCard(post);

      card.style.transitionDelay =
        `${Math.min(
          index * 35,
          280
        )}ms`;

      grid.appendChild(
        card
      );

      requestAnimationFrame(
        () => {
          card.classList.add(
            "visible"
          );
        }
      );
    }
  );


  emptyState.hidden =
    filtered.length !== 0;


  postCount.textContent =
    `${filtered.length} ${
      filtered.length === 1
        ? "post"
        : "posts"
    }`;
}


/* =========================================================
   CREATE CARD
========================================================= */

function createCard(post) {
  const fragment =
    document
      .getElementById(
        "card-template"
      )
      .content
      .cloneNode(true);


  const card =
    fragment.querySelector(
      ".card"
    );

  const image =
    fragment.querySelector(
      ".card-image"
    );

  const title =
    fragment.querySelector(
      ".card-title"
    );

  const description =
    fragment.querySelector(
      ".card-description"
    );


  const content =
    displayContent(post);


  card.dataset.id =
    post.id;


  image.src =
    post.img ||
    placeholderImage(
      post.title
    );

  image.alt =
    content.title;


  image.onerror = () => {
    image.onerror = null;

    image.src =
      placeholderImage(
        post.title
      );
  };


  title.textContent =
    content.title;

  description.textContent =
    content.description;


  fragment
    .querySelector(".audio")
    .addEventListener(
      "click",
      event => {
        event.stopPropagation();

        speakPost(post);
      }
    );


  fragment
    .querySelector(".comment")
    .addEventListener(
      "click",
      event => {
        event.stopPropagation();

        openComments(post);
      }
    );


  fragment
    .querySelector(".share")
    .addEventListener(
      "click",
      event => {
        event.stopPropagation();

        sharePost(post);
      }
    );


  const deleteButton =
    fragment.querySelector(
      ".delete"
    );


  if (
    post.creator ===
    CURRENT_USER
  ) {
    deleteButton.hidden =
      false;

    deleteButton.addEventListener(
      "click",
      event => {
        event.stopPropagation();

        deletePost(
          post.id
        );
      }
    );
  }


  card.addEventListener(
    "click",
    () => {
      openDetail(post);
    }
  );


  card.addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();

        openDetail(post);
      }
    }
  );


  return card;
}


/* =========================================================
   POST DETAIL
========================================================= */

function openDetail(post) {
  activePost =
    posts.find(
      item =>
        item.id === post.id
    ) || post;


  renderDetail();


  postDetail.setAttribute(
    "aria-hidden",
    "false"
  );
}


function closeDetail() {
  postDetail.setAttribute(
    "aria-hidden",
    "true"
  );

  activePost = null;

  detailLangSelect.value =
    "";
}


function renderDetail() {
  if (!activePost) return;


  const content =
    displayContent(
      activePost
    );


  detailTitle.textContent =
    content.title;


  detailDescription.textContent =
    content.description;


  detailShownLang.textContent =
    activePost.displayLanguage
      ? languageName(
          activePost.displayLanguage
        ).toUpperCase()
      : "ORIGINAL";


  detailLangSelect.value =
    activePost.displayLanguage ||
    "";


  detailDelete.hidden =
    activePost.creator !==
    CURRENT_USER;


  renderDetailMedia();


  renderComments(
    detailCommentsList,
    activePost
  );
}


/* =========================================================
   MEDIA
========================================================= */

function renderDetailMedia() {
  detailMedia.innerHTML = "";


  const url =
    activePost?.img || "";


  if (
    /\.(mp4|webm|ogg)(\?.*)?$/i.test(
      url
    )
  ) {
    const video =
      document.createElement(
        "video"
      );

    video.src = url;

    video.controls = true;

    video.playsInline = true;

    detailMedia.appendChild(
      video
    );

    return;
  }


  const image =
    document.createElement(
      "img"
    );


  image.src =
    url ||
    placeholderImage(
      activePost.title
    );


  image.alt =
    activePost.title;


  image.onerror = () => {
    image.onerror = null;

    image.src =
      placeholderImage(
        activePost.title
      );
  };


  detailMedia.appendChild(
    image
  );
}


/* =========================================================
   COMMENTS
========================================================= */

function renderComments(
  container,
  post
) {
  container.innerHTML = "";


  const comments =
    Array.isArray(
      post.comments
    )
      ? post.comments
      : [];


  if (!comments.length) {
    const empty =
      document.createElement(
        "p"
      );

    empty.className =
      "comments-empty";

    empty.textContent =
      "No comments yet. Be the first to comment.";

    container.appendChild(
      empty
    );

    return;
  }


  comments.forEach(
    comment => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "comment-item";


      const text =
        document.createElement(
          "p"
        );


      const translatedText =
        post.displayLanguage &&
        comment.translations?.[
          post.displayLanguage
        ];


      text.textContent =
        translatedText ||
        comment.text;


      const time =
        document.createElement(
          "time"
        );


      time.textContent =
        comment.created
          ? new Date(
              comment.created
            ).toLocaleString()
          : "";


      item.append(
        text,
        time
      );


      container.appendChild(
        item
      );
    }
  );
}


function addComment(
  post,
  rawText
) {
  if (!post)
    return false;


  const text =
    rawText.trim();


  if (!text) {
    showToast(
      "Write a comment first."
    );

    return false;
  }


  post.comments ||= [];


  post.comments.push({
    id: createId(),
    text,
    created: Date.now(),
    translations: {}
  });


  savePosts();

  sync();


  return true;
}


function openComments(post) {
  commentPost =
    post;

  renderComments(
    commentsList,
    post
  );

  commentInput.value =
    "";

  openModal(
    commentModal
  );

  setTimeout(
    () => {
      commentInput.focus();
    },
    50
  );
}


/* =========================================================
   CREATE POST
========================================================= */

function openNewPostModal() {
  newTitle.value = "";
  newDesc.value = "";
  newImgUrl.value = "";
  newImgFile.value = "";

  openModal(
    newPostModal
  );

  setTimeout(
    () => {
      newTitle.focus();
    },
    50
  );
}


function createPost() {
  const title =
    newTitle.value.trim();

  const description =
    newDesc.value.trim();

  const imageUrl =
    newImgUrl.value.trim();

  const file =
    newImgFile.files[0];


  if (!title) {
    showToast(
      "Please enter a title."
    );

    return;
  }


  if (!description) {
    showToast(
      "Please enter a description."
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


  if (file) {

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      showToast(
        "Please select an image."
      );

      return;
    }


    if (
      file.size >
      2500000
    ) {
      showToast(
        "Image must be smaller than 2.5 MB."
      );

      return;
    }


    const reader =
      new FileReader();


    reader.onload = () => {
      finishPost(
        String(
          reader.result
        )
      );
    };


    reader.onerror = () => {
      showToast(
        "Could not read the image."
      );
    };


    reader.readAsDataURL(
      file
    );

    return;
  }


  finishPost(
    imageUrl
  );
}


function finishPost(
  image
) {
  posts.unshift({
    id:
      `post-${createId()}`,

    title:
      newTitle.value.trim(),

    description:
      newDesc.value.trim(),

    img:
      image || "",

    creator:
      CURRENT_USER,

    comments:
      [],

    translations:
      {},

    displayLanguage:
      ""
  });


  savePosts();

  sync();


  closeModal(
    newPostModal
  );


  renderPosts();

  updateProfile();


  showToast(
    "Post published!"
  );
}


/* =========================================================
   DELETE
========================================================= */

function deletePost(
  postId
) {
  const post =
    posts.find(
      item =>
        item.id === postId
    );


  if (!post)
    return;


  if (
    post.creator !==
    CURRENT_USER
  ) {
    showToast(
      "You can only delete your own posts."
    );

    return;
  }


  if (
    !window.confirm(
      "Delete this post?"
    )
  ) {
    return;
  }


  posts =
    posts.filter(
      item =>
        item.id !== postId
    );


  savePosts();

  sync();


  if (
    activePost?.id ===
    postId
  ) {
    closeDetail();
  }


  renderPosts();

  updateProfile();

  showToast(
    "Post deleted."
  );
}


/* =========================================================
   TEXT TO SPEECH
========================================================= */

function speakPost(post) {
  if (
    !window.speechSynthesis
  ) {
    showToast(
      "Text-to-speech is not supported."
    );

    return;
  }


  const content =
    displayContent(post);


  const utterance =
    new SpeechSynthesisUtterance(
      `${content.title}. ${content.description}`
    );


  if (
    post.displayLanguage
  ) {
    utterance.lang =
      post.displayLanguage;
  }


  speechSynthesis.cancel();

  speechSynthesis.speak(
    utterance
  );


  showToast(
    "Playing audio..."
  );
}


/* =========================================================
   SHARE
========================================================= */

async function sharePost(post) {
  const url =
    `${location.origin}${location.pathname}` +
    `#post=${encodeURIComponent(
      post.id
    )}`;


  try {

    if (navigator.share) {
      await navigator.share({
        title: post.title,
        text: post.description,
        url
      });

      return;
    }


    if (
      navigator.clipboard?.writeText
    ) {
      await navigator.clipboard.writeText(
        url
      );

      showToast(
        "Post link copied!"
      );

      return;
    }


    showToast(
      "Sharing is not supported."
    );

  } catch (error) {

    if (
      error?.name !==
      "AbortError"
    ) {
      showToast(
        "Could not share the post."
      );
    }
  }
}


/* =========================================================
   TRANSLATION
========================================================= */

function populateLanguages() {
  detailLangSelect.innerHTML =
    '<option value="">Language</option>';


  LANGUAGES.forEach(
    ([code, name]) => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        code;

      option.textContent =
        name;

      detailLangSelect.appendChild(
        option
      );
    }
  );
}


async function translateText(
  text,
  targetLanguage
) {
  if (
    !text ||
    !text.trim()
  ) {
    return "";
  }


  const url =
    "https://translate.googleapis.com/translate_a/single" +
    "?client=gtx" +
    "&sl=auto" +
    `&tl=${encodeURIComponent(
      targetLanguage
    )}` +
    "&dt=t" +
    `&q=${encodeURIComponent(
      text
    )}`;


  const response =
    await fetch(url);


  if (!response.ok) {
    throw new Error(
      `Translation HTTP ${response.status}`
    );
  }


  const data =
    await response.json();


  if (
    !Array.isArray(data) ||
    !Array.isArray(data[0])
  ) {
    throw new Error(
      "Invalid translation response."
    );
  }


  return data[0]
    .map(
      part =>
        part?.[0] || ""
    )
    .join("")
    .trim();
}


async function translatePost() {
  if (!activePost)
    return;


  const language =
    detailLangSelect.value;


  if (!language) {
    showToast(
      "Select a language first."
    );

    return;
  }


  /*
    Already translated?
    Just show the stored translation.
  */

  const existing =
    activePost
      .translations?.[
        language
      ];


  if (
    existing?.title &&
    existing?.description
  ) {
    activePost.displayLanguage =
      language;

    savePosts();

    renderDetail();

    renderPosts();

    showToast(
      `Showing ${languageName(
        language
      )}.`
    );

    return;
  }


  detailTranslate.disabled =
    true;

  detailTranslate.textContent =
    "Translating...";


  try {

    /*
      Translate TITLE and DESCRIPTION.
    */

    const [
      translatedTitle,
      translatedDescription
    ] = await Promise.all([
      translateText(
        activePost.title,
        language
      ),

      translateText(
        activePost.description,
        language
      )
    ]);


    if (
      !translatedTitle ||
      !translatedDescription
    ) {
      throw new Error(
        "Translation returned empty text."
      );
    }


    /*
      Save translation.
    */

    activePost.translations ||= {};


    activePost.translations[
      language
    ] = {
      title:
        translatedTitle,

      description:
        translatedDescription
    };


    /*
      Translate comments.
    */

    for (
      const comment
      of activePost.comments || []
    ) {

      try {

        comment.translations ||= {};

        comment.translations[
          language
        ] =
          await translateText(
            comment.text,
            language
          );

      } catch (error) {

        console.warn(
          "Comment translation failed:",
          error
        );
      }
    }


    /*
      THIS CONTROLS WHAT IS DISPLAYED.
    */

    activePost.displayLanguage =
      language;


    /*
      Save everything.
    */

    savePosts();


    /*
      Sync other tabs.
    */

    sync();


    /*
      Immediately update
      the current UI.
    */

    renderDetail();

    renderPosts();

    updateProfile();


    showToast(
      `Translated to ${languageName(
        language
      )}!`
    );


  } catch (error) {

    console.error(
      "Translation error:",
      error
    );


    showToast(
      "Translation failed. Check your internet connection."
    );

  } finally {

    detailTranslate.disabled =
      false;

    detailTranslate.textContent =
      "Translate";
  }
}


/* =========================================================
   SHOW ORIGINAL
========================================================= */

detailShowOriginal.addEventListener(
  "click",
  () => {

    if (!activePost)
      return;


    activePost.displayLanguage =
      "";


    savePosts();

    sync();


    renderDetail();

    renderPosts();


    detailLangSelect.value =
      "";
  }
);


/* =========================================================
   MODALS
========================================================= */

function openModal(
  modal
) {
  modal.setAttribute(
    "aria-hidden",
    "false"
  );
}


function closeModal(
  modal
) {
  modal.setAttribute(
    "aria-hidden",
    "true"
  );
}


document
  .querySelectorAll(".modal")
  .forEach(
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


/* =========================================================
   COMMENT EVENTS
========================================================= */

postComment.addEventListener(
  "click",
  () => {

    if (
      addComment(
        commentPost,
        commentInput.value
      )
    ) {

      renderComments(
        commentsList,
        commentPost
      );

      commentInput.value =
        "";

      updateProfile();

      showToast(
        "Comment posted!"
      );
    }
  }
);


detailPostComment.addEventListener(
  "click",
  () => {

    if (
      addComment(
        activePost,
        detailCommentInput.value
      )
    ) {

      detailCommentInput.value =
        "";

      renderDetail();

      updateProfile();

      showToast(
        "Comment posted!"
      );
    }
  }
);


closeModalButton.addEventListener(
  "click",
  () => {
    closeModal(
      commentModal
    );
  }
);


/* =========================================================
   DETAIL EVENTS
========================================================= */

detailClose.addEventListener(
  "click",
  closeDetail
);


detailAudio.addEventListener(
  "click",
  () => {

    if (activePost) {
      speakPost(
        activePost
      );
    }
  }
);


detailTranslate.addEventListener(
  "click",
  translatePost
);


detailShare.addEventListener(
  "click",
  () => {

    if (activePost) {
      sharePost(
        activePost
      );
    }
  }
);


detailDelete.addEventListener(
  "click",
  () => {

    if (activePost) {
      deletePost(
        activePost.id
      );
    }
  }
);


/* =========================================================
   SEARCH / HOME
========================================================= */

search.addEventListener(
  "input",
  renderPosts
);


homeBtn.addEventListener(
  "click",
  () => {

    search.value =
      "";

    renderPosts();
  }
);


/* =========================================================
   NEW POST
========================================================= */

openNewPost.addEventListener(
  "click",
  openNewPostModal
);


fabNewPost.addEventListener(
  "click",
  openNewPostModal
);


createPostButton.addEventListener(
  "click",
  createPost
);


cancelCreate.addEventListener(
  "click",
  () => {
    closeModal(
      newPostModal
    );
  }
);


/* =========================================================
   PROFILE
========================================================= */

function updateProfile() {
  const user =
    getUser();


  if (!user)
    return;


  profileName.textContent =
    user.name;


  profileAge.textContent =
    `Age ${user.age}`;


  profileAvatar.textContent =
    user.name
      .charAt(0)
      .toUpperCase();


  profilePostCount.textContent =
    posts.filter(
      post =>
        post.creator ===
        CURRENT_USER
    ).length;


  profileCommentCount.textContent =
    posts.reduce(
      (
        total,
        post
      ) =>
        total +
        (
          post.comments?.length ||
          0
        ),
      0
    );
}


profileBtn.addEventListener(
  "click",
  () => {

    updateProfile();

    openModal(
      profileModal
    );
  }
);


closeProfile.addEventListener(
  "click",
  () => {
    closeModal(
      profileModal
    );
  }
);


logoutButton.addEventListener(
  "click",
  () => {

    localStorage.removeItem(
      USER_KEY
    );


    closeModal(
      profileModal
    );


    showLogin();

    showToast(
      "You have been logged out."
    );
  }
);


/* =========================================================
   TEXT SIZE
========================================================= */

function setFontSize(
  size
) {
  fontSize =
    Math.max(
      13,
      Math.min(
        20,
        Number(size) || 15
      )
    );


  document.documentElement.style.setProperty(
    "--font-size",
    `${fontSize}px`
  );


  localStorage.setItem(
    FONT_KEY,
    String(fontSize)
  );
}


incText.addEventListener(
  "click",
  () => {
    setFontSize(
      fontSize + 1
    );
  }
);


decText.addEventListener(
  "click",
  () => {
    setFontSize(
      fontSize - 1
    );
  }
);


/* =========================================================
   CONTRAST
========================================================= */

function setContrast(
  enabled
) {
  document.documentElement.classList.toggle(
    "high-contrast",
    Boolean(enabled)
  );


  contrastToggle.checked =
    Boolean(enabled);


  localStorage.setItem(
    CONTRAST_KEY,
    String(Boolean(enabled))
  );
}


contrastToggle.addEventListener(
  "change",
  event => {
    setContrast(
      event.target.checked
    );
  }
);


/* =========================================================
   ESCAPE
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key !==
      "Escape"
    ) {
      return;
    }


    closeModal(
      commentModal
    );

    closeModal(
      newPostModal
    );

    closeModal(
      profileModal
    );

    closeDetail();
  }
);


/* =========================================================
   CROSS-TAB SYNC
========================================================= */

function sync() {
  if (!channel)
    return;

  channel.postMessage({
    type:
      "posts-updated",

    posts
  });
}


function setupSync() {

  if (
    "BroadcastChannel" in window
  ) {

    channel =
      new BroadcastChannel(
        "gridcards-sync-v11"
      );


    channel.addEventListener(
      "message",
      event => {

        const data =
          event.data;


        if (
          data?.type !==
          "posts-updated"
        ) {
          return;
        }


        if (
          !Array.isArray(
            data.posts
          )
        ) {
          return;
        }


        posts =
          data.posts.map(
            normalisePost
          );


        savePosts();

        renderPosts();

        updateProfile();


        if (activePost) {

          const updated =
            posts.find(
              post =>
                post.id ===
                activePost.id
            );


          if (updated) {

            activePost =
              updated;

            renderDetail();
          }
        }
      }
    );
  }


  window.addEventListener(
    "storage",
    event => {

      if (
        event.key !==
        STORAGE_KEY
      ) {
        return;
      }


      posts =
        loadPosts();


      renderPosts();

      updateProfile();
    }
  );
}


/* =========================================================
   HASH SHARING
========================================================= */

function handleHashPost() {
  const match =
    location.hash.match(
      /^#post=(.+)$/
    );


  if (!match)
    return;


  const postId =
    decodeURIComponent(
      match[1]
    );


  const post =
    posts.find(
      item =>
        item.id ===
        postId
    );


  if (post) {
    openDetail(post);
  }
}


/* =========================================================
   INIT
========================================================= */

function init() {

  populateLanguages();

  setFontSize(
    fontSize
  );


  setContrast(
    localStorage.getItem(
      CONTRAST_KEY
    ) === "true"
  );


  setupAuthentication();

  setupSync();

  renderPosts();


  const user =
    getUser();


  if (
    user?.name &&
    Number(user.age) >= 13
  ) {

    showApp();

  } else {

    showLogin();
  }


  window.addEventListener(
    "hashchange",
    handleHashPost
  );


  setTimeout(
    handleHashPost,
    150
  );
}


init();
