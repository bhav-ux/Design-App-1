"use strict";

/* =========================================================
   GRIDCARDS
========================================================= */


/* =========================================================
   SETTINGS
========================================================= */

const STORAGE_KEY =
  "gridcards_posts_v10";

const USER_KEY =
  "gridcards_user_v10";

const FONT_KEY =
  "gridcards_font_v10";

const CONTRAST_KEY =
  "gridcards_contrast_v10";

const CURRENT_USER =
  "gridcards-user";


/* =========================================================
   DEFAULT POSTS
========================================================= */

const DEFAULT_POSTS = [

  {
    id: "post-1",

    title:
      "Community meeting — 10AM",

    description:
      "Join the project owners for the monthly update and Q&A.",

    img: "",

    creator:
      "system",

    comments: [],

    translations: {}
  },


  {
    id: "post-2",

    title:
      "Maintenance window",

    description:
      "Services will be degraded for one hour during maintenance.",

    img: "",

    creator:
      "system",

    comments: [],

    translations: {}
  },


  {
    id: "post-3",

    title:
      "New feature: Dark mode",

    description:
      "Try the experimental dark mode and give feedback.",

    img: "",

    creator:
      "system",

    comments: [],

    translations: {}
  },


  {
    id: "post-4",

    title:
      "Volunteer call",

    description:
      "We need volunteers for the outreach program next weekend.",

    img: "",

    creator:
      "system",

    comments: [],

    translations: {}
  }

];


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
   STATE
========================================================= */

let posts =
  loadPosts();

let activePost =
  null;

let commentPost =
  null;

let captchaCode =
  "";

let fontSize =
  Number(
    localStorage.getItem(
      FONT_KEY
    )
  ) || 15;

let toastTimer =
  null;

let channel =
  null;


/* =========================================================
   ELEMENTS
========================================================= */

const $ =
  id =>
    document.getElementById(id);


/* Auth */

const authScreen =
  $("authScreen");

const authForm =
  $("authForm");

const authName =
  $("authName");

const authAge =
  $("authAge");

const captchaText =
  $("captchaText");

const captchaInput =
  $("captchaInput");

const refreshCaptcha =
  $("refreshCaptcha");

const authError =
  $("authError");


/* App */

const app =
  $("app");

const homeBtn =
  $("homeBtn");

const search =
  $("search");

const grid =
  $("grid");

const emptyState =
  $("emptyState");

const postCount =
  $("postCount");


/* Controls */

const contrastToggle =
  $("contrastToggle");

const incText =
  $("incText");

const decText =
  $("decText");


/* New post */

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


/* Detail */

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


/* Comments */

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


/* Profile */

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


/* Toast */

const toast =
  $("toast");


/* =========================================================
   STORAGE
========================================================= */

function loadPosts() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!saved) {

      return DEFAULT_POSTS.map(
        post => ({
          ...post,
          comments: [],
          translations: {}
        })
      );

    }

    const parsed =
      JSON.parse(saved);

    if (!Array.isArray(parsed)) {

      return DEFAULT_POSTS;

    }

    return parsed;

  } catch (error) {

    console.error(
      "Could not load posts:",
      error
    );

    return DEFAULT_POSTS;

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
      "Storage is full. Try a smaller image."
    );

  }

}


/* =========================================================
   UTILITIES
========================================================= */

function createId() {

  if (
    window.crypto &&
    crypto.randomUUID
  ) {

    return crypto
      .randomUUID()
      .slice(0, 12);

  }

  return Math.random()
    .toString(36)
    .substring(2, 14);

}


function showToast(
  message
) {

  clearTimeout(
    toastTimer
  );

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 2400);

}


function escapeHtml(
  value
) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    value;

  return div.innerHTML;

}


/* =========================================================
   PLACEHOLDER IMAGE
========================================================= */

function placeholderImage(
  title
) {

  const safe =
    escapeHtml(
      title.substring(
        0,
        35
      )
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
        cx="730"
        cy="130"
        r="160"
        fill="#ffffff"
        opacity="0.55"
      />


      <circle
        cx="100"
        cy="530"
        r="200"
        fill="#60a5fa"
        opacity="0.12"
      />


      <text
        x="450"
        y="315"
        text-anchor="middle"
        font-family="Arial"
        font-size="36"
        font-weight="700"
        fill="#2563eb"
      >
        ${safe}
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

  for (
    let i = 0;
    i < 5;
    i++
  ) {

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


function isLoggedIn() {

  return Boolean(
    localStorage.getItem(
      USER_KEY
    )
  );

}


function showApp() {

  authScreen.classList.add(
    "hidden"
  );

  app.classList.remove(
    "hidden"
  );

  updateProfile();

}


function showLogin() {

  app.classList.add(
    "hidden"
  );

  authScreen.classList.remove(
    "hidden"
  );

  generateCaptcha();

  authName.focus();

}


authForm.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const name =
      authName.value.trim();

    const age =
      Number(
        authAge.value
      );

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
      !age ||
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

      captchaInput.value =
        "";

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


    authForm.reset();

    showApp();

    showToast(
      "Welcome to GridCards!"
    );

  }
);


refreshCaptcha.addEventListener(
  "click",
  () => {

    generateCaptcha();

    captchaInput.value =
      "";

    captchaInput.focus();

  }
);


/* =========================================================
   RENDER POSTS
========================================================= */

function renderPosts() {

  const query =
    search.value
      .trim()
      .toLowerCase();


  const filtered =
    posts.filter(
      post => {

        const text =
          `${post.title} ${post.description}`
            .toLowerCase();

        return text.includes(
          query
        );

      }
    );


  grid.innerHTML =
    "";


  filtered.forEach(
    (post, index) => {

      const card =
        createCard(
          post
        );


      card.style.transitionDelay =
        `${index * 35}ms`;


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
    filtered.length > 0;


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

function createCard(
  post
) {

  const template =
    document
      .getElementById(
        "card-template"
      );


  const fragment =
    template.content.cloneNode(
      true
    );


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


  const audio =
    fragment.querySelector(
      ".audio"
    );


  const comment =
    fragment.querySelector(
      ".comment"
    );


  const share =
    fragment.querySelector(
      ".share"
    );


  const deleteButton =
    fragment.querySelector(
      ".delete"
    );


  card.dataset.id =
    post.id;


  image.src =
    post.img ||
    placeholderImage(
      post.title
    );


  image.alt =
    post.title;


  image.onerror =
    () => {

      image.onerror =
        null;

      image.src =
        placeholderImage(
          post.title
        );

    };


  title.textContent =
    post.title;


  description.textContent =
    post.description;


  audio.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      speakPost(
        post
      );

    }
  );


  comment.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      openComments(
        post
      );

    }
  );


  share.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      sharePost(
        post
      );

    }
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

      openDetail(
        post
      );

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

        openDetail(
          post
        );

      }

    }
  );


  return card;

}


/* =========================================================
   DETAIL
========================================================= */

function openDetail(
  post
) {

  activePost =
    post;


  renderDetail();


  postDetail.setAttribute(
    "aria-hidden",
    "false"
  );


  detailClose.focus();

}


function closeDetail() {

  postDetail.setAttribute(
    "aria-hidden",
    "true"
  );

  activePost =
    null;

}


function renderDetail() {

  if (!activePost)
    return;


  detailTitle.textContent =
    activePost.title;


  detailDescription.textContent =
    activePost.description;


  detailShownLang.textContent =
    activePost.displayLanguage
      ? activePost.displayLanguage.toUpperCase()
      : "ORIGINAL";


  detailDelete.hidden =
    activePost.creator !==
    CURRENT_USER;


  detailLangSelect.value =
    "";


  renderDetailMedia();


  renderComments(
    detailCommentsList,
    activePost
  );

}


function renderDetailMedia() {

  detailMedia.innerHTML =
    "";


  if (
    activePost.img &&
    /\.(mp4|webm|ogg)$/i.test(
      activePost.img
    )
  ) {

    const video =
      document.createElement(
        "video"
      );

    video.src =
      activePost.img;

    video.controls =
      true;

    video.playsInline =
      true;

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
    activePost.img ||
    placeholderImage(
      activePost.title
    );


  image.alt =
    activePost.title;


  image.onerror =
    () => {

      image.onerror =
        null;

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

  container.innerHTML =
    "";


  const comments =
    post.comments || [];


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


      const translated =
        activePost &&
        activePost.displayLanguage &&
        comment.translations &&
        comment.translations[
          activePost.displayLanguage
        ];


      text.textContent =
        translated ||
        comment.text;


      const time =
        document.createElement(
          "time"
        );


      time.textContent =
        new Date(
          comment.created
        ).toLocaleString();


      item.appendChild(
        text
      );

      item.appendChild(
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
  text
) {

  const clean =
    text.trim();


  if (!clean) {

    showToast(
      "Write a comment first."
    );

    return false;

  }


  if (!post.comments) {

    post.comments =
      [];

  }


  post.comments.push({

    id:
      createId(),

    text:
      clean,

    created:
      Date.now(),

    translations:
      {}

  });


  savePosts();


  sync({
    type:
      "update",
    posts
  });


  updateProfile();


  return true;

}


/* =========================================================
   QUICK COMMENTS
========================================================= */

function openComments(
  post
) {

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
   NEW POST
========================================================= */

function openNewPostModal() {

  newTitle.value =
    "";

  newDesc.value =
    "";

  newImgUrl.value =
    "";

  newImgFile.value =
    "";


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


  if (imageUrl) {

    if (
      !/^https?:\/\//i.test(
        imageUrl
      )
    ) {

      showToast(
        "Enter a valid image URL."
      );

      return;

    }

  }


  if (file) {

    if (
      file.size >
      2500000
    ) {

      showToast(
        "Image must be under 2.5 MB."
      );

      return;

    }


    const reader =
      new FileReader();


    reader.onload =
      () => {

        finishPost(
          String(
            reader.result
          )
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

  const post = {

    id:
      "post-" +
      createId(),

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
      {}

  };


  posts.unshift(
    post
  );


  savePosts();


  sync({
    type:
      "update",
    posts
  });


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
  id
) {

  const post =
    posts.find(
      item =>
        item.id === id
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


  const confirmed =
    confirm(
      "Delete this post?"
    );


  if (!confirmed)
    return;


  posts =
    posts.filter(
      item =>
        item.id !== id
    );


  savePosts();


  sync({
    type:
      "update",
    posts
  });


  if (
    activePost &&
    activePost.id === id
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

function speakPost(
  post
) {

  if (
    !window.speechSynthesis
  ) {

    showToast(
      "Text-to-speech is not supported."
    );

    return;

  }


  speechSynthesis.cancel();


  const text =
    `${post.title}. ${post.description}`;


  const utterance =
    new SpeechSynthesisUtterance(
      text
    );


  speechSynthesis.speak(
    utterance
  );


  showToast(
    "Playing audio..."
  );

}


/* =========================================================
   SHARING
========================================================= */

async function sharePost(
  post
) {

  const url =
    `${location.href.split("#")[0]}#post=${encodeURIComponent(post.id)}`;


  try {

    if (
      navigator.share
    ) {

      await navigator.share({

        title:
          post.title,

        text:
          post.description,

        url

      });

      return;

    }


    await navigator.clipboard.writeText(
      url
    );


    showToast(
      "Post link copied!"
    );

  } catch (error) {

    if (
      error.name !==
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
  language
) {

  const url =
    `https://translate.googleapis.com/translate_a/single` +
    `?client=gtx` +
    `&sl=auto` +
    `&tl=${encodeURIComponent(language)}` +
    `&dt=t` +
    `&q=${encodeURIComponent(text)}`;


  const response =
    await fetch(
      url
    );


  if (!response.ok) {

    throw new Error(
      "Translation failed"
    );

  }


  const data =
    await response.json();


  return data[0]
    .map(
      part =>
        part[0]
    )
    .join("");

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


  detailTranslate.disabled =
    true;

  detailTranslate.textContent =
    "Translating...";


  try {

    const title =
      await translateText(
        activePost.title,
        language
      );


    const description =
      await translateText(
        activePost.description,
        language
      );


    if (
      !activePost.translations
    ) {

      activePost.translations =
        {};

    }


    activePost.translations[
      language
    ] = {

      title,
      description

    };


    if (
      activePost.comments
    ) {

      for (
        const comment
        of activePost.comments
      ) {

        const translated =
          await translateText(
            comment.text,
            language
          );


        if (
          !comment.translations
        ) {

          comment.translations =
            {};

        }


        comment.translations[
          language
        ] =
          translated;

      }

    }


    activePost.displayLanguage =
      language;


    savePosts();


    renderDetail();


    renderPosts();


    showToast(
      "Translation complete!"
    );


  } catch (error) {

    console.error(
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


detailTranslate.addEventListener(
  "click",
  translatePost
);


detailShowOriginal.addEventListener(
  "click",
  () => {

    if (!activePost)
      return;


    activePost.displayLanguage =
      "";


    savePosts();


    renderDetail();

    renderPosts();

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


closeModalButton.addEventListener(
  "click",
  () => {

    closeModal(
      commentModal
    );

  }
);


cancelCreate.addEventListener(
  "click",
  () => {

    closeModal(
      newPostModal
    );

  }
);


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
   COMMENTS EVENTS
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

      showToast(
        "Comment posted!"
      );

    }

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
   SEARCH
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


/* =========================================================
   PROFILE
========================================================= */

function getUser() {

  try {

    return JSON.parse(
      localStorage.getItem(
        USER_KEY
      )
    );

  } catch {

    return null;

  }

}


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
        19,
        size
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
    enabled
  );


  localStorage.setItem(
    CONTRAST_KEY,
    String(enabled)
  );


  contrastToggle.checked =
    enabled;

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
   ESCAPE KEY
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

function setupSync() {

  if (
    "BroadcastChannel" in window
  ) {

    channel =
      new BroadcastChannel(
        "gridcards_channel"
      );


    channel.addEventListener(
      "message",
      event => {

        if (
          event.data?.type ===
          "update"
        ) {

          posts =
            event.data.posts;

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


function sync(
  data
) {

  if (channel) {

    channel.postMessage(
      data
    );

  }

}


/* =========================================================
   HASH SHARING
========================================================= */

function handleSharedPost() {

  const match =
    location.hash.match(
      /^#post=(.+)$/
    );


  if (!match)
    return;


  const id =
    decodeURIComponent(
      match[1]
    );


  const post =
    posts.find(
      item =>
        item.id === id
    );


  if (post) {

    openDetail(
      post
    );

  }

}


/* =========================================================
   INITIALISE
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


  setupSync();


  renderPosts();


  if (
    isLoggedIn()
  ) {

    showApp();

  } else {

    showLogin();

  }


  window.addEventListener(
    "hashchange",
    handleSharedPost
  );


  setTimeout(
    handleSharedPost,
    100
  );

}


init();
