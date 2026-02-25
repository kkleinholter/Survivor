// --- Countdown Clock ---
function startCountdown() {
  const countdownElem = document.getElementById('countdownClock');
  if (!countdownElem) return;
  // Survivor 50 premiere: Feb 25, 2026, 8:00 PM EST (convert to UTC: 2026-02-26T01:00:00Z)
  const premiereDate = new Date('2026-02-26T01:00:00Z');
  function updateCountdown() {
    const now = new Date();
    let diff = premiereDate - now;
    if (diff < 0) diff = 0;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    if (diff === 0) {
      countdownElem.innerHTML = "<span style='color:#e09a2b;'>Survivor 50 has begun!</span>";
    } else {
      countdownElem.innerHTML =
        `<span class=\"countdown-number\">${days}</span><span class=\"countdown-label\">d</span>` +
        `<span class=\"countdown-number\">${hours}</span><span class=\"countdown-label\">h</span>` +
        `<span class=\"countdown-number\">${minutes}</span><span class=\"countdown-label\">m</span>` +
        `<span class=\"countdown-number\">${seconds}</span><span class=\"countdown-label\">s</span>` +
        `<br><span style='font-size:1.08rem;color:#a97a1a;font-weight:600;'>until Survivor 50!</span>`;
    }
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);
}
document.addEventListener('DOMContentLoaded', startCountdown);
// --- Win Chance Logic (Hard-coded, not editable) ---
const winChances = {
  "angelina keeley": 1,
  "aubry bracco": 76,
  "benjamin \"coach\" wade": 2,
  "charlie davis": 1,
  "chrissy hofbeck": 2,
  "christian hubicki": 2,
  "cirie fields": 6,
  "colby donaldson": 1,
  "dee valladares": 2,
  "emily flippen": 1,
  "genevieve mushaluk": 1,
  "jenna lewis-dougherty": 2,
  "jonathan young": 4,
  "joseph hunter": 6,
  "kamilla karthigesu": 1,
  "kyle fraser": 1,
  "mike white": 1,
  "ozzy lusth": 2,
  "q burdette": 1,
  "rick devens": 1,
  "rizo velovic": 2,
  "savannah louie": 1,
  "stephanie lagrossa kendrick": 2,
  "tiffany ervin": 1
};

const picksByPerson = [
  {
    person: "Caitlyn",
    picks: ["Christian Hubicki", "Jonathan Young", "Jenna Lewis-Dougherty"],
  },
  {
    person: "Matt",
    picks: ["Ozzy Lusth", "Kamilla Karthigesu", "Genevieve Mushaluk"],
  },
  {
    person: "Emily",
    picks: ["Kyle Fraser", "Stephanie Lagrossa Kendrick", "Chrissy Hofbeck"],
  },
  {
    person: "Dylan",
    picks: ["Rick Devens", "Colby Donaldson", "Savannah Louie"],
  },
  {
    person: "Kevin",
    picks: ["Charlie Davis", "Joseph Hunter", "Aubry Bracco"],
  },
  {
    person: "Kathy",
    picks: ["Tiffany Ervin", "Rizo Velovic", "Benjamin \"Coach\" Wade"],
  },
  {
    person: "Alan",
    picks: ["Dee Valladares", "Emily Flippen", "Q Burdette"],
  },
  {
    person: "Extras",
    picks: ["Cirie Fields", "Angelina Keeley", "Mike White"],
  },
];


function makePlayerKey(player) {
  return player.trim().toLowerCase();
}

const castPlayers = [
  { name: "Mike White", image: "assets/images/cast/01-mike-white.jpg" },
  { name: "Cirie Fields", image: "assets/images/cast/02-cirie-fields.jpg" },
  { name: "Ozzy Lusth", image: "assets/images/cast/03-ozzy-lusth.jpg" },
  { name: "Benjamin \"Coach\" Wade", image: "assets/images/cast/04-benjamin-coach-wade.jpg" },
  { name: "Stephanie Lagrossa Kendrick", image: "assets/images/cast/05-stephanie-lagrossa-kendrick.jpg" },
  { name: "Jenna Lewis-Dougherty", image: "assets/images/cast/06-jenna-lewis-dougherty.jpg" },
  { name: "Colby Donaldson", image: "assets/images/cast/07-colby-donaldson.jpg" },
  { name: "Tiffany Ervin", image: "assets/images/cast/08-tiffany-ervin.jpg" },
  { name: "Charlie Davis", image: "assets/images/cast/09-charlie-davis.jpg" },
  { name: "Q Burdette", image: "assets/images/cast/10-q-burdette.jpg" },
  { name: "Emily Flippen", image: "assets/images/cast/11-emily-flippen.jpg" },
  { name: "Dee Valladares", image: "assets/images/cast/12-dee-valladares.jpg" },
  { name: "Jonathan Young", image: "assets/images/cast/13-jonathan-young.jpg" },
  { name: "Christian Hubicki", image: "assets/images/cast/14-christian-hubicki.jpg" },
  { name: "Angelina Keeley", image: "assets/images/cast/15-angelina-keeley.jpg" },
  { name: "Kyle Fraser", image: "assets/images/cast/16-kyle-fraser.jpg" },
  { name: "Aubry Bracco", image: "assets/images/cast/17-aubry-bracco.jpg" },
  { name: "Chrissy Hofbeck", image: "assets/images/cast/18-chrissy-hofbeck.jpg" },
  { name: "Rick Devens", image: "assets/images/cast/19-rick-devens.jpg" },
  { name: "Kamilla Karthigesu", image: "assets/images/cast/20-kamilla-karthigesu.jpg" },
  { name: "Joseph Hunter", image: "assets/images/cast/21-joseph-hunter.jpg" },
  { name: "Genevieve Mushaluk", image: "assets/images/cast/22-genevieve-mushaluk.jpg" },
  { name: "Savannah Louie", image: "assets/images/cast/23-savannah-louie.jpg" },
  { name: "Rizo Velovic", image: "assets/images/cast/24-rizo-velovic.jpg" }
];

const castImageByKey = new Map(
  castPlayers.map((castPlayer) => [makePlayerKey(castPlayer.name), castPlayer.image])
);


// --- Hard-coded voted off state ---
const votedOffStatus = {
  "angelina keeley": false,
  "aubry bracco": false,
  "benjamin \"coach\" wade": false,
  "charlie davis": false,
  "chrissy hofbeck": false,
  "christian hubicki": false,
  "cirie fields": false,
  "colby donaldson": false,
  "dee valladares": false,
  "emily flippen": false,
  "genevieve mushaluk": false,
  "jenna lewis-dougherty": false,
  "jonathan young": false,
  "joseph hunter": false,
  "kamilla karthigesu": false,
  "kyle fraser": false,
  "mike white": false,
  "ozzy lusth": false,
  "q burdette": false,
  "rick devens": false,
  "rizo velovic": false,
  "savannah louie": false,
  "stephanie lagrossa kendrick": false,
  "tiffany ervin": false
};

function isVotedOff(key) {
  return !!votedOffStatus[key];
}

const picksGrid = document.getElementById("picksGrid");
const standingsBody = document.getElementById("standingsBody");
const template = document.getElementById("playerCardTemplate");



// Call render after all functions and variables are defined
window.addEventListener('DOMContentLoaded', render);

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
        const bios = {
          "jenna lewis-dougherty": "As the only player to span the entire history of the show, Jenna first competed in the cultural phenomenon of Season 1: Borneo, where she famously missed a video from home. She later returned for Season 8: All-Stars, leading a ruthless 'anti-winner' alliance that secured her a 3rd-place finish. She returns decades later to prove that an 'Old School' legend can dominate the 'New Era.'",
          "ozzy lusth": "Widely considered the greatest physical specimen to ever play, Ozzy's journey began as the runner-up in Season 13: Cook Islands. He became a fan favorite in Season 16: Micronesia, a redemption seeker in Season 23: South Pacific, and a veteran presence in Season 34: Game Changers. For his fifth outing, he plans to make his provider skills indispensable to avoid being seen as a late-game threat.",
          "cirie fields": "The 'mastermind' who started as the woman who 'got off the couch' in Season 12: Panama, Cirie went on to become a tactical legend in Season 16: Micronesia, Season 20: Heroes vs. Villains, and Season 34: Game Changers. Despite never winning, her social manipulation is feared by all. Fresh off a victory on The Traitors, she enters Season 50 with the biggest target on her back.",
          "christian hubicki": "The breakout star of Season 37: David vs. Goliath, Christian is a robotics professor who combined elite puzzle-solving with an infectious personality. He was famously targeted for being 'too likable' to take to the end. In his return, he aims to use his scientific mind to 'de-code' the frantic pace of modern Survivor and mask his threat level.",
          "rick devens": "After being voted out and battling back from the Season 38: Edge of Extinction, Rick became a one-man wrecking ball, finding multiple idols and winning crucial challenges. His high-energy 'news anchor' persona made him a massive TV personality. He returns to Season 50 looking to repeat his idol-hunting dominance but with a better social finish.",
          "emily flippen": "Emily provided one of the most compelling 'redemption arcs' in Season 45, moving from a blunt, abrasive outsider on Day 1 to a sophisticated strategic power player by the mid-game. As an investment analyst, she views the game through a lens of risk and reward, hoping to leverage her 'underdog' status against the massive legends on her tribe.",
          "savannah louie": "The reigning Sole Survivor of Season 49, Savannah is a former reporter who used her interviewing skills to 'interrogate' her way to the million dollars. Coming into Season 50 back-to-back, she has the advantage of being a fresh enigma, but the disadvantage of the 'winner' title looming over her every move.",
          "joseph hunter": "A fire captain who served as the moral and physical anchor for his tribe in Season 48, Joe is a traditionalist who values loyalty and hard work. He finished in the top five of his original season by being a 'shield' for others. In Season 50, he looks to repeat that role while ensuring he isn't the final person cut before the finish line.",
          "benjamin \"coach\" wade": "The 'Dragon Slayer' first brought his eccentric stories to Season 18: Tocantins, before returning for a brief stint in Season 20: Heroes vs. Villains and a dominant runner-up performance in Season 23: South Pacific. After a 14-year hiatus, Coach returns claiming to have found true Zen, though fans expect the same spiritual theatrics that made him an icon.",
          "chrissy hofbeck": "An actuary who broke barriers for older female contestants in Season 35: Heroes vs. Healers vs. Hustlers, Chrissy tied the record for female individual immunity wins with four. She was a strategic force who fell just short of the win. She returns to Season 50 to prove that her mathematical approach to the game is still the ultimate winning formula.",
          "mike white": "Before winning Emmys for The White Lotus, Mike was the runner-up of Season 37: David vs. Goliath. He played a deceptively 'chill' game while pulling the strings behind the scenes. Because he is already a successful Hollywood creator, he plays with a 'nothing to lose' attitude that makes him one of the most dangerous wildcards in the cast.",
          "dee valladares": "The winner of Season 45, Dee is remembered for her 'all-business' mindset and her fierce loyalty to her core alliance—until the moment she had to cut them. She is a multi-tooled player who can win challenges, find idols, and manipulate votes. She enters Season 50 as the gold standard for 'New Era' winners.",
          "jonathan young": "Jonathan redefined what it meant to be a 'challenge beast' in Season 42, almost single-handedly winning tribal immunities for his team. While his physical strength is his calling card, his bio for Season 50 emphasizes a desire to show more social depth and prove he isn't just a 'shield' for the strategic players.",
          "tiffany ervin": "A vibrant artist from Season 46, Tiffany was a social powerhouse who was unfortunately blindsided while holding a Hidden Immunity Idol. She returns for Season 50 with a 'redemption' mindset, determined to play a more paranoid, careful game to ensure she never leaves the island with an advantage in her pocket again.",
          "charlie davis": "A law student who played an impeccable social game in Season 46, Charlie lost the title of Sole Survivor in a heartbreaking 5-3-0 jury vote. Known for his Taylor Swift references and 'nice guy' demeanor, he returns to Season 50 with a chip on his shoulder, ready to prove he can play a more cutthroat game to secure the win.",
          "kamilla karthigesu": "In Season 48, Kamilla was known for her 'bold and brash' strategic moves and her ability to navigate complex social webs. She narrowly missed the finale after a loss in the fire-making challenge. She enters Season 50 looking to align with 'alpha' personalities to hide her own status as a calculating strategist.",
          "colby donaldson": "The original 'Golden Boy' of Season 2: The Australian Outback, Colby won five individual immunities and became a national hero. After returning for Season 8: All-Stars and Season 20: Heroes vs. Villains, he is looking to wash away the 'Superman in a fat suit' comments from his last outing and reclaim his status as a physical legend.",
          "stephanie lagrossa kendrick": "Stephenie became a legend in Season 10: Palau as the sole survivor of the decimated Ulong tribe. She returned as a 'villainous' runner-up in Season 11: Guatemala and had a short stay in Season 20: Heroes vs. Villains. Now a mother of three, she brings that same 'never quit' intensity to Season 50.",
          "aubry bracco": "Aubry's journey from a nervous 'nerd' to a strategic warrior in Season 32: Kaôh Rōng is one of the show's most famous arcs. She also competed in Season 34: Game Changers and Season 38: Edge of Extinction. She returns to the beach with a wealth of experience, hoping to play a more 'under the radar' game than her previous high-profile appearances.",
          "angelina keeley": "The 'Negotiator' of Season 37: David vs. Goliath, Angelina is famous for getting rice for her tribe and her quest for a jacket. Despite the memes, she was a savvy finalist who understood the game's mechanics perfectly. She returns to Season 50 promising more 'high-level' negotiations and a bit more self-awareness.",
          "q burdette": "The breakout character of Season 46, Q's 'Big Mistake!' catchphrase and unpredictable gameplay made him a polarizing force. He famously tried to quit and then fought to stay, causing total chaos. He enters Season 50 with a 'take no prisoners' attitude, targeting winners and legends from Day 1.",
          "kyle fraser": "The winner of Season 48, Kyle used his background as a trial attorney to dominate the social game and win over a difficult jury. As a member of the 'New Era' winner's circle, he knows he has a target on his back and plans to use his 'courtroom' persuasion to keep the heat on the older legends.",
          "genevieve mushaluk": "A quiet but lethal strategist from Season 47, Genevieve made it to the Final Five by staying flexible and making moves at the perfect time. In a tribe full of 'Big Personalities' like Colby and Q, she hopes to use her lower profile to slip through the cracks and strike when the legends least expect it.",
          "rizo velovic": "Commonly known as the 'RizGod,' Rizo was the charismatic runner-up of Season 49. He played a flashy, social game that made him a fan favorite but ultimately fell short to his ally, Savannah. He returns to Season 50 with a 'hungry' energy, desperate to prove he can win the million on his own terms."
        };
        const playerKey = makePlayerKey(player);
        const bio = bios[playerKey];
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
      updateCardState(card, votedOff);
      playersList.appendChild(card);
    }
    personCard.append(personName, playersList);
    picksGrid.appendChild(personCard);
  }

  renderStandings();
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
      // Sort by odds (descending), then alphabetically
      /*
      const aOdds = a.odds === "-" ? -1 : parseFloat(a.odds);
      const bOdds = b.odds === "-" ? -1 : parseFloat(b.odds);
      if (bOdds !== aOdds) return bOdds - aOdds;
      */
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

function updateCardState(card, isVotedOff) {
  card.classList.toggle("voted-off", isVotedOff);
  card.setAttribute("aria-pressed", String(isVotedOff));
  // No status pill or label to update, and odds are set in render()
}


function makePlayerKey(player) {
  return player.trim().toLowerCase();
}
