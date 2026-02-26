const episodeSchedulePathCandidates = ['assets/episodes.json', './assets/episodes.json', '/assets/episodes.json'];
let episodeScheduleLoadError = '';

async function loadEpisodeSchedule() {
  episodeScheduleLoadError = '';

  for (const path of episodeSchedulePathCandidates) {
    try {
      const response = await fetch(path, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load episode schedule (${response.status})`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Episode schedule JSON is not an array');
      }

      return data
        .filter((episode) => episode && typeof episode.title === 'string' && typeof episode.airDate === 'string')
        .sort((a, b) => new Date(a.airDate) - new Date(b.airDate));
    } catch (error) {
      episodeScheduleLoadError = error?.message || 'Unknown schedule loading error';
    }
  }

  console.error('Unable to load episode schedule:', episodeScheduleLoadError);
  return [];
}

// --- Countdown Clock ---
async function startCountdown() {
  const countdownElem = document.getElementById('countdownClock');
  if (!countdownElem) return;

  const episodeSchedule = await loadEpisodeSchedule();
  if (episodeSchedule.length === 0) {
    if (window.location.protocol === 'file:') {
      countdownElem.innerHTML = "<span style='color:#e09a2b;'>Episode schedule unavailable in file preview. Run from a local server.</span>";
    } else {
      countdownElem.innerHTML = "<span style='color:#e09a2b;'>Episode schedule unavailable.</span>";
    }
    return;
  }

  function getNextEpisode(now) {
    return episodeSchedule.find((episode) => new Date(episode.airDate) > now) || null;
  }

  function getEpisodeCurrentlyOn(now) {
    return episodeSchedule.find((episode) => {
      const start = new Date(episode.airDate);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      return now >= start && now < end;
    }) || null;
  }

  function formatEpisodeDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'America/New_York'
    });
  }

  function updateCountdown() {
    const now = new Date();
    const currentlyOn = getEpisodeCurrentlyOn(now);

    if (currentlyOn) {
      const startDate = new Date(currentlyOn.airDate);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
      const remaining = Math.max(0, endDate - now);
      const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((remaining / (1000 * 60)) % 60);
      const seconds = Math.floor((remaining / 1000) % 60);

      countdownElem.innerHTML =
        `<span class="countdown-number">${hours}</span><span class="countdown-label">h</span>` +
        `<span class="countdown-number">${minutes}</span><span class="countdown-label">m</span>` +
        `<span class="countdown-number">${seconds}</span><span class="countdown-label">s</span>` +
        `<br><span style='font-size:1.02rem;color:#e09a2b;font-weight:800;'>NOW ON: ${currentlyOn.title}</span>` +
        `<br><span style='font-size:0.95rem;color:#7e5b19;font-weight:600;'>Ends at 10:00 PM ET</span>`;
      return;
    }

    const nextEpisode = getNextEpisode(now);

    if (!nextEpisode) {
      countdownElem.innerHTML = "<span style='color:#e09a2b;'>All scheduled episodes have aired.</span>";
      return;
    }

    const nextAirDate = new Date(nextEpisode.airDate);
    const diff = nextAirDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    countdownElem.innerHTML =
      `<span class=\"countdown-number\">${days}</span><span class=\"countdown-label\">d</span>` +
      `<span class=\"countdown-number\">${hours}</span><span class=\"countdown-label\">h</span>` +
      `<span class=\"countdown-number\">${minutes}</span><span class=\"countdown-label\">m</span>` +
      `<span class=\"countdown-number\">${seconds}</span><span class=\"countdown-label\">s</span>` +
      `<br><span style='font-size:1.02rem;color:#a97a1a;font-weight:700;'>Next: ${nextEpisode.title}</span>` +
      `<br><span style='font-size:0.95rem;color:#7e5b19;font-weight:600;'>${formatEpisodeDate(nextAirDate)} • 8:00 PM ET</span>`;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}
document.addEventListener('DOMContentLoaded', startCountdown);
function makePlayerKey(player) {
  return player.trim().toLowerCase();
}

let winChances = {};
let picksByPerson = [];
let votedOffStatus = {};
let playerBios = {};
let castPlayers = [];
let castImageByKey = new Map();
const castDataPathCandidates = ['assets/cast.json', './assets/cast.json', '/assets/cast.json'];
const poolDataPathCandidates = ['assets/pool-data.json', './assets/pool-data.json', '/assets/pool-data.json'];

function showDataLoadError(message) {
  if (picksGrid) {
    picksGrid.innerHTML = `<p style="padding:12px;border:1px solid #e09a2b;background:#fff8e8;color:#2f2a22;border-radius:8px;">${message}</p>`;
  }
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load ${path} (${response.status})`);
  }
  return response.json();
}

async function fetchJsonFromCandidates(paths, label) {
  let lastError = null;
  for (const path of paths) {
    try {
      return await fetchJson(path);
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`Unable to load ${label} from candidates: ${paths.join(', ')}. Last error: ${lastError?.message || 'Unknown error'}`);
}

async function loadAppData() {
  const [castData, poolData] = await Promise.all([
    fetchJsonFromCandidates(castDataPathCandidates, 'cast data'),
    fetchJsonFromCandidates(poolDataPathCandidates, 'pool data')
  ]);

  return { castData, poolData };
}

function validateCastData(data) {
  if (!Array.isArray(data)) {
    throw new Error('cast.json must be an array.');
  }
  const invalidRows = data.filter((item) => !item || typeof item.name !== 'string' || typeof item.image !== 'string');
  if (invalidRows.length > 0) {
    throw new Error('cast.json contains invalid entries. Each entry must include string name and image.');
  }
}

function validatePoolData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('pool-data.json must be an object.');
  }
  if (!data.winChances || typeof data.winChances !== 'object' || Array.isArray(data.winChances)) {
    throw new Error('pool-data.json: winChances must be an object.');
  }
  if (!Array.isArray(data.picksByPerson)) {
    throw new Error('pool-data.json: picksByPerson must be an array.');
  }
  if (!data.votedOffStatus || typeof data.votedOffStatus !== 'object' || Array.isArray(data.votedOffStatus)) {
    throw new Error('pool-data.json: votedOffStatus must be an object.');
  }
  if (data.bios && (typeof data.bios !== 'object' || Array.isArray(data.bios))) {
    throw new Error('pool-data.json: bios must be an object when provided.');
  }

  for (const team of data.picksByPerson) {
    if (!team || typeof team.person !== 'string' || !Array.isArray(team.picks) || !team.picks.every((name) => typeof name === 'string')) {
      throw new Error('pool-data.json: each picksByPerson entry must include string person and string[] picks.');
    }
  }

  for (const [key, value] of Object.entries(data.votedOffStatus)) {
    if (typeof value !== 'boolean') {
      throw new Error(`pool-data.json: votedOffStatus[${key}] must be boolean.`);
    }
  }

  for (const [key, value] of Object.entries(data.winChances)) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new Error(`pool-data.json: winChances[${key}] must be a number.`);
    }
  }
}

function validateCrossReferences() {
  const castKeys = new Set(castPlayers.map((castPlayer) => makePlayerKey(castPlayer.name)));
  const pickedKeys = new Set();

  for (const team of picksByPerson) {
    for (const playerName of team.picks) {
      const playerKey = makePlayerKey(playerName);
      pickedKeys.add(playerKey);
      if (!castKeys.has(playerKey)) {
        console.error(`Missing cast record for picked player: ${playerName}`);
      }
      if (winChances[playerKey] === undefined) {
        console.error(`Missing win chance for picked player: ${playerName}`);
      }
      if (votedOffStatus[playerKey] === undefined) {
        console.error(`Missing votedOffStatus for picked player: ${playerName}`);
      }
    }
  }

  for (const key of Object.keys(winChances)) {
    if (!castKeys.has(key)) {
      console.error(`winChances has unknown player key: ${key}`);
    }
  }
  for (const key of Object.keys(votedOffStatus)) {
    if (!castKeys.has(key)) {
      console.error(`votedOffStatus has unknown player key: ${key}`);
    }
  }
  for (const key of Object.keys(playerBios)) {
    if (!castKeys.has(key)) {
      console.error(`bios has unknown player key: ${key}`);
    }
  }
}

async function initializeApp() {
  let castData;
  let poolData;
  try {
    const loadedData = await loadAppData();
    castData = loadedData.castData;
    poolData = loadedData.poolData;
  } catch (fetchError) {
    console.error('Failed to load app data from JSON fetch.', fetchError);
    showDataLoadError('Unable to load player data. Verify assets/cast.json and assets/pool-data.json are deployed and reachable.');
    return;
  }

  try {

    validateCastData(castData);
    validatePoolData(poolData);

    castPlayers = castData;
    castImageByKey = new Map(
      castPlayers.map((castPlayer) => [makePlayerKey(castPlayer.name), castPlayer.image])
    );

    winChances = poolData.winChances;
    picksByPerson = poolData.picksByPerson;
    votedOffStatus = poolData.votedOffStatus;
    playerBios = poolData.bios || {};

    validateCrossReferences();
    render();
    runEliminationAnimations(poolData);
  } catch (error) {
    console.error('Failed to initialize app data:', error);
    showDataLoadError('Data loaded but failed validation. Check the browser console for details.');
  }
}

function isVotedOff(key) {
  return !!votedOffStatus[key];
}

const votedOutSeenStorageKey = "survivor-voted-out-seen-v1";
const newlyVotedOutKeys = getNewlyVotedOutKeys();

function getNewlyVotedOutKeys() {
  const currentlyVotedOutKeys = Object.keys(votedOffStatus).filter((key) => votedOffStatus[key]);
  let seenKeys = [];

  try {
    const raw = localStorage.getItem(votedOutSeenStorageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      seenKeys = parsed;
    }
  } catch (error) {
    seenKeys = [];
  }

  const seenSet = new Set(seenKeys.map((key) => String(key).toLowerCase()));
  const newlyVotedOut = currentlyVotedOutKeys.filter((key) => !seenSet.has(key));

  try {
    localStorage.setItem(votedOutSeenStorageKey, JSON.stringify(currentlyVotedOutKeys));
  } catch (error) {
    // Ignore storage write failures (private mode/quota issues)
  }

  return new Set(newlyVotedOut);
}

const picksGrid = document.getElementById("picksGrid");
const standingsBody = document.getElementById("standingsBody");
const template = document.getElementById("playerCardTemplate");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const revealTimings = {
  riseDurationMs: 1400,
  holdBeforeSpeechMs: 3000,
  speechAnimationDurationMs: 3200,
  holdAfterSpeechMs: 1400,
  fallDurationMs: 1800
};

// Call render after data files are loaded and validated
window.addEventListener('DOMContentLoaded', initializeApp);

function render() {
  picksGrid.innerHTML = "";

  // Sort teams alphabetically, Extras last
  const sortedTeams = [...picksByPerson].sort((a, b) => {
    if (a.person === "Extras") return 1;
    if (b.person === "Extras") return -1;
    return a.person.localeCompare(b.person);
  });

  for (const entry of sortedTeams) {
    const personCard = document.createElement("article");
    personCard.className = "person-card";
    const isExtras = entry.person === "Extras";
    if (isExtras) {
      personCard.classList.add("extras-card");
    }
    const personName = document.createElement("h2");
    personName.className = "person-name";
    personName.textContent = isExtras ? "Extras (Undrafted)" : entry.person;
    const playersList = document.createElement("div");
    playersList.className = "players-list";

    // Sort players: active first, then by name
    const sortedPlayers = [...entry.picks].sort((a, b) => {
      const aKey = makePlayerKey(a);
      const bKey = makePlayerKey(b);
      const aVoted = isVotedOff(aKey);
      const bVoted = isVotedOff(bKey);
      if (aVoted !== bVoted) return aVoted - bVoted; // false (active) before true (voted off)
      return a.localeCompare(b);
    });

    for (const player of sortedPlayers) {
      const card = template.content.firstElementChild.cloneNode(true);
      const key = makePlayerKey(player);
      const votedOff = isVotedOff(key);
      const isNewlyVotedOut = votedOff && newlyVotedOutKeys.has(key);
      card.dataset.key = key;
      const thumbnail = card.querySelector(".player-thumb");
      const imagePath = castImageByKey.get(key);
      thumbnail.src = imagePath;
      thumbnail.alt = player;
      // Make thumbnail clickable to open large image
      if (imagePath) {
        thumbnail.style.cursor = 'zoom-in';
        thumbnail.addEventListener('click', (e) => {
          e.stopPropagation();
          const modal = document.getElementById('imageModal');
          const modalImg = document.getElementById('modalImage');
          modalImg.src = imagePath;
          modalImg.alt = player;
          modal.style.display = 'flex';
        });
      }
      // (Modal close logic moved outside render loop)
      // Modal close logic (attach only once, outside render)
      function setupModalListeners() {
        const modal = document.getElementById('imageModal');
        if (!modal) return;
        const closeBtn = document.getElementById('closeModalBtn');
        const backdrop = modal.querySelector('.image-modal-backdrop');
        function closeModal() {
          modal.style.display = 'none';
          const modalImg = document.getElementById('modalImage');
          if (modalImg) modalImg.src = '';
        }
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (backdrop) backdrop.addEventListener('click', closeModal);
        document.addEventListener('keydown', (e) => {
          if (modal.style.display !== 'none' && (e.key === 'Escape' || e.key === 'Esc')) {
            closeModal();
          }
        });
      }
      setupModalListeners();
      // Set player name
      const nameSpan = card.querySelector('.player-name');
      if (nameSpan) {
        nameSpan.textContent = player;
        // Add expandable bio inside card
        const playerKey = makePlayerKey(player);
        const bio = playerBios[playerKey];
        if (bio) {
          // Create bio element
          const bioDiv = document.createElement('div');
          bioDiv.className = 'player-bio-expand';
          bioDiv.textContent = bio;
          bioDiv.style.display = 'none';
          // Insert after .player-row (thumbnail+name row)
          const row = card.querySelector('.player-row');
          if (row) row.after(bioDiv);
          // Toggle expand/collapse on name click
          nameSpan.style.cursor = 'pointer';
          nameSpan.style.textDecoration = 'underline dotted';
          nameSpan.addEventListener('click', function(e) {
            e.stopPropagation();
            const expanded = bioDiv.style.display === 'block';
            bioDiv.style.display = expanded ? 'none' : 'block';
            // Optionally expand/collapse card
            const cardEl = card.closest('.player-card, button.player-card');
            if (cardEl) {
              if (!expanded) {
                cardEl.classList.add('bio-expanded');
              } else {
                cardEl.classList.remove('bio-expanded');
              }
            }
          });
        }
      }
      // Set odds (commented out)
      /*
      const oddsSpan = card.querySelector('.player-odds');
      let chance = winChances[key] ?? "";
      if (votedOff) chance = 0;
      if (oddsSpan) oddsSpan.textContent = chance !== "" ? `${chance}%` : "";
      */
      // Remove status pill if present
      const statusPill = card.querySelector('.player-status');
      if (statusPill) statusPill.remove();
      updateCardState(card, votedOff, isNewlyVotedOut);
      playersList.appendChild(card);
    }
    personCard.append(personName, playersList);
    picksGrid.appendChild(personCard);
  }

  renderStandings();
  queueVotedOutRevealAnimation();
}

let revealQueuePromise = Promise.resolve();

function queueVotedOutRevealAnimation() {
  const newlyVotedCards = Array.from(document.querySelectorAll('.player-card.needs-tribe-reveal'));
  if (newlyVotedCards.length === 0) return;

  if (reducedMotionQuery.matches) {
    newlyVotedCards.forEach((card) => {
      card.classList.remove('needs-tribe-reveal');
      card.classList.remove('pending-tribe-reveal');
    });
    return;
  }

  revealQueuePromise = revealQueuePromise.then(async () => {
    for (const card of newlyVotedCards) {
      if (!document.body.contains(card)) continue;
      await animateVotedOutReveal(card);
      card.classList.remove('needs-tribe-reveal');
    }
  });
}

function getOrCreateRevealLayer() {
  let layer = document.getElementById('votedOutRevealLayer');
  if (layer) return layer;

  layer = document.createElement('div');
  layer.id = 'votedOutRevealLayer';
  layer.className = 'voted-out-reveal-layer';
  layer.innerHTML = '<div class="voted-out-reveal-backdrop"></div>';
  document.body.appendChild(layer);
  return layer;
}

function waitForMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runElementAnimation(element, keyframes, options) {
  const animation = element.animate(keyframes, options);
  return animation.finished.catch(() => undefined);
}

async function animateVotedOutReveal(card) {
  const startRect = card.getBoundingClientRect();
  if (startRect.width === 0 || startRect.height === 0) return;

  const revealLayer = getOrCreateRevealLayer();
  revealLayer.classList.add('active');

  const revealCard = card.cloneNode(true);
  revealCard.classList.add('voted-out-reveal-card');
  revealCard.classList.remove('needs-tribe-reveal');
  revealCard.classList.remove('tribe-has-spoken');
  revealCard.style.left = `${startRect.left}px`;
  revealCard.style.top = `${startRect.top}px`;
  revealCard.style.width = `${startRect.width}px`;
  revealCard.style.height = `${startRect.height}px`;
  revealCard.style.margin = '0';
  revealCard.style.pointerEvents = 'none';
  revealLayer.appendChild(revealCard);

  card.style.visibility = 'hidden';

  const targetWidth = Math.min(window.innerWidth * 0.86, 520);
  const scale = targetWidth / Math.max(startRect.width, 1);
  const targetLeft = (window.innerWidth - startRect.width) / 2;
  const targetTop = Math.max((window.innerHeight - startRect.height * scale) / 2, 24);

  await runElementAnimation(
    revealCard,
    [
      { left: `${startRect.left}px`, top: `${startRect.top}px`, transform: 'scale(1)' },
      { left: `${targetLeft}px`, top: `${targetTop}px`, transform: `scale(${scale})` }
    ],
    { duration: revealTimings.riseDurationMs, easing: 'cubic-bezier(0.2, 0.75, 0.22, 1)', fill: 'forwards' }
  );

  await waitForMs(revealTimings.holdBeforeSpeechMs);

  revealCard.style.setProperty('--tribe-animation-duration', `${revealTimings.speechAnimationDurationMs}ms`);
  revealCard.classList.remove('pending-tribe-reveal');

  revealCard.classList.remove('tribe-has-spoken');
  void revealCard.offsetWidth;
  revealCard.classList.add('tribe-has-spoken');

  await waitForMs(revealTimings.speechAnimationDurationMs + revealTimings.holdAfterSpeechMs);

  await runElementAnimation(
    revealCard,
    [
      { left: `${targetLeft}px`, top: `${targetTop}px`, transform: `scale(${scale})` },
      { left: `${startRect.left}px`, top: `${startRect.top}px`, transform: 'scale(1)' }
    ],
    { duration: revealTimings.fallDurationMs, easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)', fill: 'forwards' }
  );

  card.classList.remove('pending-tribe-reveal');
  card.style.visibility = '';
  revealCard.remove();
  if (!revealLayer.querySelector('.voted-out-reveal-card')) {
    revealLayer.classList.remove('active');
  }
}

function renderStandings() {
  standingsBody.innerHTML = "";

  // Calculate team win chance sums
  const teamChances = picksByPerson.map(entry => {
    let sum = 0;
    for (const player of entry.picks) {
      const key = makePlayerKey(player);
      // If voted off, chance is 0
      let val = isVotedOff(key) ? 0 : (winChances[key] ?? 0);
      sum += Number(val) || 0;
    }
    return { person: entry.person, sum };
  });

  // Total for all teams except Extras
  const total = teamChances.filter(t => t.person !== "Extras").reduce((acc, t) => acc + t.sum, 0);

  // Map for quick lookup
  const teamChanceMap = Object.fromEntries(teamChances.map(t => [t.person, t.sum]));

  // Odds commented out
  const standings = picksByPerson
    .map((entry) => {
      const remainingCount = entry.picks.filter(
        (player) => !isVotedOff(makePlayerKey(player))
      ).length;
      /*
      const odds = entry.person !== "Extras" && total > 0 ? ((teamChanceMap[entry.person] / total) * 100).toFixed(2) : "-";
      */
      return {
        person: entry.person,
        remainingCount
        // odds
      };
    })
    .sort((a, b) => {
      if (a.person === "Extras" && b.person !== "Extras") return 1;
      if (b.person === "Extras" && a.person !== "Extras") return -1;
      if (b.remainingCount !== a.remainingCount) {
        return b.remainingCount - a.remainingCount;
      }
      return a.person.localeCompare(b.person);
    });

  for (const entry of standings) {
    const row = document.createElement("tr");
    const isExtras = entry.person === "Extras";
    if (isExtras) {
      row.classList.add("extras-row");
    }
    const personCell = document.createElement("td");
    personCell.textContent = isExtras ? "Extras (Undrafted)" : entry.person;
    const remainingCell = document.createElement("td");
    remainingCell.textContent = `${entry.remainingCount}`;
    // Odds column commented out
    // const oddsCell = document.createElement("td");
    // oddsCell.textContent = entry.odds === "-" ? "-" : `${entry.odds}%`;
    row.append(personCell, remainingCell);
    standingsBody.appendChild(row);
  }
}

function updateCardState(card, isVotedOff, isNewlyVotedOut = false) {
  card.classList.toggle("voted-off", isVotedOff);
  card.classList.remove("tribe-has-spoken");
  card.classList.toggle("needs-tribe-reveal", isNewlyVotedOut);
  card.classList.toggle("pending-tribe-reveal", isNewlyVotedOut);
  card.setAttribute("aria-pressed", String(isVotedOff));
  // Apply permanent grayscale immediately for already-eliminated players
  if (isVotedOff) {
    const thumb = card.querySelector('.player-thumb');
    if (thumb) thumb.style.filter = 'grayscale(100%)';
  }
}

// ============================================================
//  ELIMINATION ANIMATION ENGINE
// ============================================================

function detectNewEliminations(currentVotedOff) {
  const STORAGE_KEY = 'survivor_voted_off_cache';
  let previous = {};
  try {
    previous = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (e) { /* ignore parse errors */ }

  const newlyEliminated = [];
  for (const [key, isOut] of Object.entries(currentVotedOff)) {
    if (isOut && !previous[key]) {
      newlyEliminated.push(key);
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentVotedOff));
  return newlyEliminated;
}

function findOwner(playerKey) {
  for (const entry of picksByPerson) {
    for (const pick of entry.picks) {
      if (makePlayerKey(pick) === playerKey) return entry.person;
    }
  }
  return null;
}

// ── Canvas spark burst after torch snuff ──────────────────────
function launchSparks(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width  = canvas.offsetWidth  || 280;
  canvas.height = canvas.offsetHeight || 373;
  const cx = canvas.width / 2;
  const cy = canvas.height * 0.82;
  const particles = [];
  for (let i = 0; i < 90; i++) {
    const angle  = (Math.random() * Math.PI) + Math.PI; // upward hemisphere
    const speed  = Math.random() * 4.5 + 1.5;
    const hue    = Math.random() * 40 + 15; // orange-gold
    particles.push({
      x: cx + (Math.random() - 0.5) * canvas.width * 0.5,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: Math.random() * 0.014 + 0.007,
      size: Math.random() * 2.8 + 0.8,
      color: `hsl(${hue}, 100%, ${Math.random() * 35 + 55}%)`,
    });
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      if (p.life <= 0) continue;
      alive = true;
      p.x   += p.vx;
      p.y   += p.vy;
      p.vy  += 0.1;   // gravity
      p.vx  *= 0.985; // drag
      p.life -= p.decay;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, p.size * p.life), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (alive) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

// ── Build CSS flame layers inside fireWrap ────────────────────
function buildFlames(fireWrap) {
  const layers = [
    { left: '5%',  w: '28%', h: '72px',  dur: 0.92, delay: 0,    c: ['#ff4500','#ff6b00','#cc1100'] },
    { left: '20%', w: '36%', h: '100px', dur: 0.74, delay: 0.11, c: ['#ff6b00','#ffaa00','#ff4400'] },
    { left: '14%', w: '30%', h: '82px',  dur: 1.08, delay: 0.22, c: ['#ff3300','#ff7700','#dd1100'] },
    { left: '38%', w: '32%', h: '108px', dur: 0.81, delay: 0.04, c: ['#ffcc00','#ffaa00','#ff8800'] },
    { left: '52%', w: '34%', h: '90px',  dur: 0.97, delay: 0.17, c: ['#ff4500','#ff6600','#ff2200'] },
    { left: '62%', w: '26%', h: '74px',  dur: 1.03, delay: 0.07, c: ['#ff5500','#ff8800','#ff3300'] },
    { left: '28%', w: '44%', h: '62px',  dur: 0.63, delay: 0.30, c: ['#ffee44','#ffcc00','#ffaa00'] },
  ];
  layers.forEach((f, i) => {
    const el = document.createElement('div');
    el.className = 'elim-flame';
    el.style.cssText = [
      `left:${f.left}`, `width:${f.w}`, `height:${f.h}`,
      `background:radial-gradient(ellipse at 50% 100%,${f.c[2]} 0%,${f.c[0]} 38%,${f.c[1]} 62%,transparent 100%)`,
      `filter:blur(${3 + (i % 3)}px)`,
      `animation-duration:${f.dur}s`,
      `animation-delay:${f.delay}s`,
      `opacity:0.88`,
    ].join(';');
    fireWrap.appendChild(el);
  });
}

// ── Full cinematic modal ───────────────────────────────────────
function showEliminationModal(playerKey, imagePath, playerDisplayName, ownerName) {
  return new Promise(resolve => {

    // Helper: show element via class
    const show = (el, delayMs) => setTimeout(() => el.classList.add('elim-visible'), delayMs);

    // ── Letterboxes ──
    const lbTop = document.createElement('div');
    lbTop.className = 'elim-letterbox top';
    const lbBot = document.createElement('div');
    lbBot.className = 'elim-letterbox bottom';
    document.body.append(lbTop, lbBot);
    requestAnimationFrame(() => {
      lbTop.classList.add('open');
      lbBot.classList.add('open');
    });

    // ── Overlay ──
    const overlay = document.createElement('div');
    overlay.className = 'elim-overlay';

    // Photo wrap
    const photoWrap = document.createElement('div');
    photoWrap.className = 'elim-photo-wrap';

    const img = new Image();
    img.className = 'elim-photo';
    img.src = imagePath;
    img.alt = playerDisplayName;

    const vignette = document.createElement('div');
    vignette.className = 'elim-vignette';

    const fireWrap = document.createElement('div');
    fireWrap.className = 'elim-fire-wrap';
    buildFlames(fireWrap);

    const sparkCanvas = document.createElement('canvas');
    sparkCanvas.className = 'elim-spark-canvas';

    photoWrap.append(img, vignette, fireWrap, sparkCanvas);

    // Text elements
    const title = document.createElement('div');
    title.className = 'elim-title';
    title.textContent = 'The Tribe Has Spoken';

    const subtitle = document.createElement('div');
    subtitle.className = 'elim-subtitle';
    subtitle.textContent = playerDisplayName;

    const callout = document.createElement('div');
    callout.className = 'elim-owner-callout';
    if (ownerName) callout.textContent = `${ownerName}'s torch has been snuffed`;

    const dismiss = document.createElement('div');
    dismiss.className = 'elim-dismiss';
    dismiss.textContent = 'Click anywhere to continue';

    overlay.append(photoWrap, title, subtitle, callout, dismiss);
    document.body.appendChild(overlay);

    // Trigger overlay + photo fade-in
    requestAnimationFrame(() => {
      overlay.classList.add('elim-visible');
      show(photoWrap, 100);
    });

    // Sync canvas size after layout
    setTimeout(() => {
      sparkCanvas.width  = photoWrap.offsetWidth  || 280;
      sparkCanvas.height = photoWrap.offsetHeight || 373;
    }, 200);

    // 1.6s — desaturate
    setTimeout(() => img.classList.add('desaturated'), 1600);

    // 3.8s — snuff fire, launch sparks
    setTimeout(() => {
      fireWrap.classList.add('snuffed');
      launchSparks(sparkCanvas);
    }, 3800);

    // 4.8s — title
    show(title, 4800);

    // 5.8s — player name
    show(subtitle, 5800);

    // 6.6s — owner callout
    if (ownerName) show(callout, 6600);

    // 8s — dismiss hint + enable click
    let dismissible = false;
    setTimeout(() => {
      show(dismiss, 0);
      dismissible = true;
    }, 8000);

    function doClose() {
      if (!dismissible) return;
      overlay.style.transition = 'opacity 0.65s ease';
      overlay.style.opacity    = '0';
      lbTop.classList.remove('open');
      lbBot.classList.remove('open');
      setTimeout(() => {
        overlay.remove();
        lbTop.remove();
        lbBot.remove();
        resolve();
      }, 700);
    }

    overlay.addEventListener('click', doClose);
    setTimeout(doClose, 13000); // auto-close after 13s
  });
}

// ── Permanent badge + callout on owner's team card ────────────
function markOwnerCard(ownerName, playerDisplayName) {
  const personCards = document.querySelectorAll('article.person-card');
  for (const card of personCards) {
    const heading = card.querySelector('h2.person-name');
    if (!heading) continue;
    // Strip any existing badge text before comparing
    const rawText = Array.from(heading.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent).join('').trim();
    if (rawText.toLowerCase() !== ownerName.toLowerCase()) continue;

    if (!heading.querySelector('.elim-rip-badge')) {
      const badge = document.createElement('span');
      badge.className = 'elim-rip-badge';
      badge.textContent = 'torch snuffed';
      heading.appendChild(badge);
    }
    const callout = document.createElement('div');
    callout.className = 'elim-snuffed-callout';
    callout.innerHTML = `${ownerName}'s torch has been snuffed<br><span style="font-size:0.85em;opacity:0.75;">${playerDisplayName} &mdash; voted off the island</span>`;
    card.appendChild(callout);
    break;
  }
}

// ── Master entry point ────────────────────────────────────────
async function runEliminationAnimations(poolData) {
  const newlyEliminated = detectNewEliminations(poolData.votedOffStatus);
  if (newlyEliminated.length === 0) return;

  await new Promise(r => setTimeout(r, 800));

  for (const playerKey of newlyEliminated) {
    const imagePath = castImageByKey.get(playerKey);
    if (!imagePath) {
      console.warn(`[Elimination] No image for: ${playerKey}`);
      continue;
    }

    const displayName = playerKey.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const ownerName = findOwner(playerKey);

    await showEliminationModal(playerKey, imagePath, displayName, ownerName);

    if (ownerName) markOwnerCard(ownerName, displayName);

    if (newlyEliminated.length > 1) await new Promise(r => setTimeout(r, 1200));
  }
}
