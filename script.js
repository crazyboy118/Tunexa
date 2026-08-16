const audio = new Audio();
const songs = [
  {
    title: "End of beginning",
    artist: "jeo kerry",
    cover: "card1img.jpeg",
    src: "song1.mp3"
  },
  {
    title: "golden Brown",
    artist: "The strangler",
    cover: "card2img.jpeg",
    src: "song3.mp3"
  },
  {
    title: "believer",
    artist: "Imagine Dragons",
    cover: "card3img.jpeg",
    src: "song4.mp3"
  },
  {
    title: "bye",
    artist: "NSYNC",
    cover: "card4img.jpeg",
    src: "song2.mp3"
  },
  {
    title: "sapphire",
    artist: "ED sheeran",
    cover: "card5img.jpeg",
    src: "song5.mp3"
  },
  {
    title: "blinding lights",
    artist: "weekend",
    cover: "card6img.jpeg",
    src: "song6.mp3"
  }
];

let currentIndex = 0;

const playerIcons   = document.querySelectorAll(".player-control-icon");
const progressBar   = document.querySelector(".progress-bar");
const currTimeEl    = document.querySelector(".curr-time");
const totalTimeEl   = document.querySelector(".total-time");
const albumEl       = document.querySelector(".album");
const cards         = document.querySelectorAll(".card");


const [shuffleIcon, prevIcon, playPauseIcon, nextIcon, repeatIcon] = playerIcons;

function setActiveCard(index) {
  cards.forEach((card, i) => {
    if (i === index) {
      card.classList.add("playing");
      card.classList.remove("dimmed");
    } else {
      card.classList.remove("playing");
      card.classList.add("dimmed");
    }
  });
}

function loadSong(index) {
  const song = songs[index];
  audio.src = song.src;
  if (albumEl) {
    albumEl.style.backgroundImage = `url(${song.cover})`;
    albumEl.style.backgroundSize = "cover";
  }
  setActiveCard(index);
}

function playSong() {
  audio.play();
  if (playPauseIcon) playPauseIcon.src = "player_icon6.png"; 
}

function pauseSong() {
  audio.pause();
  if (playPauseIcon) playPauseIcon.src = "player_icon3.png"; 
}

function togglePlay() {
  if (audio.paused) {
    playSong();
  } else {
    pauseSong();
  }
}

function playNext() {
  currentIndex = (currentIndex + 1) % songs.length;
  loadSong(currentIndex);
  playSong();
}

function playPrev() {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  loadSong(currentIndex);
  playSong();
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" + s : s}`;
}


if (playPauseIcon) playPauseIcon.addEventListener("click", togglePlay);
if (nextIcon) nextIcon.addEventListener("click", playNext);
if (prevIcon) prevIcon.addEventListener("click", playPrev);


audio.addEventListener("timeupdate", () => {
  if (progressBar && audio.duration) {
    progressBar.value = (audio.currentTime / audio.duration) * 100;
  }
  if (currTimeEl) currTimeEl.textContent = formatTime(audio.currentTime);
  if (totalTimeEl) totalTimeEl.textContent = formatTime(audio.duration);
});


if (progressBar) {
  progressBar.addEventListener("input", () => {
    if (audio.duration) {
      audio.currentTime = (progressBar.value / 100) * audio.duration;
    }
  });
}


 audio.addEventListener("ended", playNext);


cards.forEach((card, i) => {
  card.addEventListener("click", () => {
    currentIndex = i % songs.length; 
    loadSong(currentIndex);
    playSong();
  });
});

window.addEventListener("DOMContentLoaded", () => {
  loadSong(currentIndex);
});
