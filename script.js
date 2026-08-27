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

let likedSongs = new Set(JSON.parse(localStorage.getItem("tunexa-likes") || "[]"));
let playlists = JSON.parse(localStorage.getItem("tunexa-playlists") || "[]");

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
  if (!playPauseIcon)  return;

playPauseIcon.src = audio.paused
   ? "player_icon3.png"
   : "player_icon6.png";

playPauseIcon.classList.toggle("playing", !audio.paused);
}

audio.addEventListener("play", updatePlayIcon);
audio.addEventListener("pause", updatePlayIcon);
audio.addEventListener("ended", updatePlayIcon);


function clearCardHighlights() {
  cards.forEach(card => card.classList.remove("playing"));
}

function saveLikes() {
  localStorage.setItem("tunexa-likes", JSON.stringify([...likedSongs]));
}

function savePlaylists() {
  localStorage.setItem("tunexa-playlists", JSON.stringify(playlists));
}

function isLiked(index) {
  return likedSongs.has(index);
}

function refreshLikeButtons() {
  document.querySelectorAll(".like-btn").forEach(btn => {
    const index = Number(btn.dataset.likeIndex);
    const liked = isLiked(index);
    btn.textContent = liked ? "♥" : "♡";
    btn.classList.toggle("liked", liked);
  });
}

function toggleLike(index) {
  if (likedSongs.has(index)) {
    likedSongs.delete(index);
  } else {
    likedSongs.add(index);
  }

  saveLikes();
  refreshLikeButtons();
  renderLibrary();
}

function addLikeButton(card, index) {
  if (!card || card.querySelector(".like-btn")) return;

  const btn = document.createElement("button");
  btn.className = "like-btn";
  btn.type = "button";
  btn.dataset.likeIndex = index;
  btn.textContent = isLiked(index) ? "♥" : "♡";
  if (isLiked(index)) btn.classList.add("liked");

  btn.addEventListener("click", e => {
    e.stopPropagation();
    toggleLike(index);
  });

  card.appendChild(btn);
}

function renderLibrary() {
  const likedContainer = document.querySelector("#liked-songs-container");
  const playlistsContainer = document.querySelector("#playlists-container");

  if (likedContainer) {
    likedContainer.innerHTML = "";
    const likedIndices = [...likedSongs];

    if (likedIndices.length === 0) {
      likedContainer.innerHTML = `<p class="empty-text">Songs you like will appear here.</p>`;
    } else {
      likedIndices.forEach(index => {
        const song = songs[index];
        if (!song) return;

        const card = document.createElement("div");
        card.className = "card";
        card.dataset.song = index;
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

        addLikeButton(card, index);
        likedContainer.appendChild(card);
      });
    }
  }

  if (playlistsContainer) {
    playlistsContainer.innerHTML = "";

    const addCard = document.createElement("button");
    addCard.className = "card add-playlist-card";
    addCard.type = "button";

    const randomCover = songs[Math.floor(Math.random() * songs.length)]?.cover || "";

    addCard.innerHTML = `
      <div class="card-img add-playlist-icon" style="background-image:url('${randomCover}')"><span>+</span></div>
      <p class="card-title">Create Playlist</p>
      <p class="card-info">Pick songs to add</p>
    `;
    addCard.addEventListener("click", openPlaylistModal);
    playlistsContainer.appendChild(addCard);

    playlists.forEach(playlist => {
      const card = document.createElement("div");
      card.className = "card";

      const coverSongs = playlist.songs
        .map(index => songs[index])
        .filter(Boolean)
        .slice(0, 4);

      const coverImgs = coverSongs
        .map(song => `<img src="${song.cover}">`)
        .join("");

      const coverClass = coverSongs.length > 1 ? "playlist-cover" : "playlist-cover single";

      card.innerHTML = `
        <div class="card-img ${coverClass}">${coverImgs}</div>
        <p class="card-title">${playlist.name}</p>
        <p class="card-info">${playlist.songs.length} song${playlist.songs.length === 1 ? "" : "s"}</p>
      `;

      card.addEventListener("click", () => {
        if (!playlist.songs.length) return;
        currentIndex = playlist.songs[0];
        loadSong(currentIndex);
        playSong();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-playlist-btn";
      deleteBtn.type = "button";
      deleteBtn.title = "Remove playlist";
      deleteBtn.textContent = "×";

      deleteBtn.addEventListener("click", e => {
        e.stopPropagation();
        playlists = playlists.filter(p => p.id !== playlist.id);
        savePlaylists();
        renderLibrary();
        showToast("Playlist removed");
      });

      card.appendChild(deleteBtn);

      playlistsContainer.appendChild(card);
    });
  }
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
      showToast("not found");
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


cards.forEach((card, i) => {
  const requestedIndex = Number(card.dataset.song);
  const index = Number.isFinite(requestedIndex) ? requestedIndex % songs.length : i % songs.length;

  card.addEventListener("click", () => {
    currentIndex = index;
    loadSong(currentIndex);
    playSong();
  });

  addLikeButton(card, index);
});

const playlistModalOverlay = document.querySelector("#playlist-modal-overlay");
const playlistModalClose = document.querySelector("#playlist-modal-close");
const playlistSongPicker = document.querySelector("#playlist-song-picker");
const playlistModalCreateBtn = document.querySelector("#playlist-modal-create");
const playlistNameInput = document.querySelector("#playlist-name-input");

function openPlaylistModal() {
  if (!playlistModalOverlay || !playlistSongPicker) return;

  if (playlistNameInput) {
    playlistNameInput.value = "";
  }

  playlistSongPicker.innerHTML = songs.map((song, index) => `
    <label class="song-picker-item">
      <input type="checkbox" value="${index}">
      <img src="${song.cover}" class="song-picker-thumb">
      <span class="song-picker-info">
        <span class="song-picker-title">${song.title}</span>
        <span class="song-picker-artist">${song.artist}</span>
      </span>
    </label>
  `).join("");

  playlistModalOverlay.classList.remove("hidden");

  setTimeout(() => {
    playlistNameInput?.focus();
  }, 0);
}

function closePlaylistModal() {
  playlistModalOverlay?.classList.add("hidden");
}

playlistModalClose?.addEventListener("click", closePlaylistModal);

playlistModalOverlay?.addEventListener("click", e => {
  if (e.target === playlistModalOverlay) closePlaylistModal();
});

playlistModalCreateBtn?.addEventListener("click", () => {
  const checked = playlistSongPicker
    ? [...playlistSongPicker.querySelectorAll("input[type='checkbox']:checked")]
    : [];

  if (checked.length === 0) {
    showToast("Select at least one song");
    return;
  }

  const enteredName = playlistNameInput?.value.trim();
  const playlistName = enteredName || `My Playlist #${playlists.length + 1}`;

  const playlist = {
    id: Date.now(),
    name: playlistName,
    songs: checked.map(cb => Number(cb.value))
  };

  playlists.push(playlist);
  savePlaylists();
  renderLibrary();
  closePlaylistModal();
  showToast(`Playlist "${playlistName}" created`);
});


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


if (volumeBar) {
  audio.volume = Number(volumeBar.value);

  volumeBar.addEventListener("input", () => {
    audio.volume = Number(volumeBar.value);
  });
}


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
    card.dataset.song = index;
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

    addLikeButton(card, index);
    searchResults.appendChild(card);
  });
}

searchInput?.addEventListener("input", e => {
  renderSearchResults(e.target.value);
});


document.querySelector("#back-btn")?.addEventListener("click", () => history.back());
document.querySelector("#forward-btn")?.addEventListener("click", () => history.forward());

document.querySelector(".premium")?.addEventListener("click", () => {
  showToast("Premium feature — coming soon");
});

document.querySelector(".install")?.addEventListener("click", () => {
  showToast("Tunexa app install — coming soon");
});


const modalOverlay = document.querySelector("#modal-overlay");
const modalClose = document.querySelector("#modal-close");

modalClose?.addEventListener("click", () => modalOverlay?.classList.add("hidden"));

modalOverlay?.addEventListener("click", e => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.add("hidden");
  }
});


loadSong(currentIndex);
renderSearchResults("");
renderLibrary();
setActiveNav(navHome);
