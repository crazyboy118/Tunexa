const audio = new Audio();
audio.preload = "metadata";

const songs = [
  {
    title: "End of Beginning",
    artist: "jeo kerry",
    cover: "card1img.jpeg",
    src: "song1.mp3"
  },
  {
    title: "Golden Brown",
    artist: "The Stranglers",
    cover: "card2img.jpeg",
    src: "song3.mp3"
  },
  {
    title: "Believer",
    artist: "Imagine Dragons",
    cover: "card3img.jpeg",
    src: "song4.mp3"
  },
  {
    title: "Bye",
    artist: "NSYNC",
    cover: "card4img.jpeg",
    src: "song2.mp3"
  },
  {
    title: "Sapphire",
    artist: "Ed Sheeran",
    cover: "card5img.jpeg",
    src: "song5.mp3"
  },
  {
    title: "Blinding Lights",
    artist: "The Weeknd",
    cover: "card6img.jpeg",
    src: "song6.mp3"
  }
];

let currentIndex = 0;
let shuffleActive = false;
let repeatActive = false;

const playerIcons = document.querySelectorAll(".player-control-icon");
const progressBar = document.querySelector(".progress-bar");
const currTimeEl = document.querySelector(".curr-time");
const totalTimeEl = document.querySelector(".total-time");
const albumEl = document.querySelector(".album");
const cards = document.querySelectorAll(".card");

const [shuffleIcon, prevIcon, playPauseIcon, nextIcon, repeatIcon] = playerIcons;

const titleEl = document.querySelector("#np-title");
const artistEl = document.querySelector("#np-artist");
const volumeBar = document.querySelector("#volume-bar");

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function updatePlayIcon() {
  if (!playPauseIcon) return;
  playPauseIcon.classList.toggle("playing", !audio.paused);
  playPauseIcon.style.transform = audio.paused ? "scale(1)" : "scale(1.12)";
}

function clearCardHighlights() {
  cards.forEach(card => card.classList.remove("playing"));
}

function loadSong(index) {
  const song = songs[index];
  if (!song) return;

  currentIndex = index;
  audio.src = song.src;

  if (albumEl) {
    albumEl.style.backgroundImage = `url("${song.cover}")`;
    albumEl.style.backgroundSize = "cover";
    albumEl.style.backgroundPosition = "center";
  }

  if (titleEl) titleEl.textContent = song.title;
  if (artistEl) artistEl.textContent = song.artist;

  if (progressBar) progressBar.value = 0;
  if (currTimeEl) currTimeEl.textContent = "00:00";
  if (totalTimeEl) totalTimeEl.textContent = "00:00";

  clearCardHighlights();
}

function playSong() {
  const promise = audio.play();

  if (promise && typeof promise.catch === "function") {
    promise.catch(error => {
      console.error("Tunexa audio error:", error);
      showToast("Song file nahi mil rahi. MP3 path check karo.");
    });
  }

  updatePlayIcon();
  highlightCurrentCard();
}

function pauseSong() {
  audio.pause();
  updatePlayIcon();
}

function togglePlay() {
  if (!audio.src) loadSong(currentIndex);

  if (audio.paused) {
    playSong();
  } else {
    pauseSong();
  }
}

function playNext() {
  if (shuffleActive) {
    let next = Math.floor(Math.random() * songs.length);
    if (songs.length > 1 && next === currentIndex) {
      next = (next + 1) % songs.length;
    }
    currentIndex = next;
  } else {
    currentIndex = (currentIndex + 1) % songs.length;
  }

  loadSong(currentIndex);
  playSong();
}

function playPrev() {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  loadSong(currentIndex);
  playSong();
}

function highlightCurrentCard() {
  clearCardHighlights();

  cards.forEach((card, i) => {
    const dataSong = Number(card.dataset.song);
    const index = Number.isFinite(dataSong) ? dataSong : i % songs.length;

    if (index === currentIndex) {
      card.classList.add("playing");
    }
  });
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.tunexaToastTimer);
  window.tunexaToastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

// Player controls
playPauseIcon?.addEventListener("click", togglePlay);
nextIcon?.addEventListener("click", playNext);
prevIcon?.addEventListener("click", playPrev);

shuffleIcon?.addEventListener("click", () => {
  shuffleActive = !shuffleActive;
  shuffleIcon.classList.toggle("active-control", shuffleActive);
  showToast(shuffleActive ? "Shuffle on" : "Shuffle off");
});

repeatIcon?.addEventListener("click", () => {
  repeatActive = !repeatActive;
  repeatIcon.classList.toggle("active-control", repeatActive);
  showToast(repeatActive ? "Repeat on" : "Repeat off");
});

// Cards
cards.forEach((card, i) => {
  card.addEventListener("click", () => {
    const requestedIndex = Number(card.dataset.song);
    currentIndex = Number.isFinite(requestedIndex)
      ? requestedIndex % songs.length
      : i % songs.length;

    loadSong(currentIndex);
    playSong();
  });
});

// Progress
audio.addEventListener("loadedmetadata", () => {
  if (totalTimeEl) totalTimeEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (audio.duration && progressBar) {
    progressBar.value = (audio.currentTime / audio.duration) * 100;
  }

  if (currTimeEl) currTimeEl.textContent = formatTime(audio.currentTime);
  if (audio.duration && totalTimeEl) {
    totalTimeEl.textContent = formatTime(audio.duration);
  }
});

progressBar?.addEventListener("input", () => {
  if (audio.duration) {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  }
});

audio.addEventListener("play", updatePlayIcon);
audio.addEventListener("pause", updatePlayIcon);

audio.addEventListener("ended", () => {
  if (repeatActive) {
    audio.currentTime = 0;
    playSong();
  } else {
    playNext();
  }
});

audio.addEventListener("error", () => {
  console.error("Could not load:", audio.src);
  showToast("MP3 load nahi hua — song file ka naam/path check karo.");
});

// Volume
if (volumeBar) {
  audio.volume = Number(volumeBar.value);

  volumeBar.addEventListener("input", () => {
    audio.volume = Number(volumeBar.value);
  });
}

// Navigation
const homeSection = document.querySelector("#home-section");
const searchSection = document.querySelector("#search-section");
const librarySection = document.querySelector("#library-section");

const navHome = document.querySelector("#nav-home");
const navSearch = document.querySelector("#nav-search");
const navLibrary = document.querySelector("#nav-library");

function showSection(section) {
  [homeSection, searchSection, librarySection].forEach(s => {
    s?.classList.add("hidden");
  });
  section?.classList.remove("hidden");
}

function setActiveNav(active) {
  [navHome, navSearch, navLibrary].forEach(n => n?.classList.remove("active"));
  active?.classList.add("active");
}

navHome?.addEventListener("click", () => {
  showSection(homeSection);
  setActiveNav(navHome);
});

navSearch?.addEventListener("click", () => {
  showSection(searchSection);
  setActiveNav(navSearch);
  document.querySelector("#search-input")?.focus();
});

navLibrary?.addEventListener("click", () => {
  showSection(librarySection);
  setActiveNav(navLibrary);
});

// Search
const searchInput = document.querySelector("#search-input");
const searchResults = document.querySelector("#search-results");

function renderSearchResults(query) {
  if (!searchResults) return;

  searchResults.innerHTML = "";

  const q = query.trim().toLowerCase();
  const matches = songs
    .map((song, index) => ({ song, index }))
    .filter(({ song }) =>
      !q ||
      song.title.toLowerCase().includes(q) ||
      song.artist.toLowerCase().includes(q)
    );

  matches.forEach(({ song, index }) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${song.cover}" class="card-img">
      <p class="card-title">${song.title}</p>
      <p class="card-info">${song.artist}</p>
    `;

    card.addEventListener("click", () => {
      currentIndex = index;
      loadSong(currentIndex);
      playSong();
    });

    searchResults.appendChild(card);
  });
}

searchInput?.addEventListener("input", e => {
  renderSearchResults(e.target.value);
});

// Small buttons
document.querySelector("#back-btn")?.addEventListener("click", () => history.back());
document.querySelector("#forward-btn")?.addEventListener("click", () => history.forward());

document.querySelector(".premium")?.addEventListener("click", () => {
  showToast("Premium feature — coming soon");
});

document.querySelector(".install")?.addEventListener("click", () => {
  showToast("Tunexa app install — coming soon");
});

// Modal
const modalOverlay = document.querySelector("#modal-overlay");
const modalClose = document.querySelector("#modal-close");

modalClose?.addEventListener("click", () => modalOverlay?.classList.add("hidden"));

modalOverlay?.addEventListener("click", e => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.add("hidden");
  }
});

// Initial state
loadSong(currentIndex);
renderSearchResults("");
setActiveNav(navHome);
