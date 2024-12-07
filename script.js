document.addEventListener("DOMContentLoaded", () => {
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const ranks = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ];

  const marvelCharacters = [
    "Iron Man",
    "Thor",
    "Hulk",
    "Black Widow",
    "Hawkeye",
    "Captain America",
    "Doctor Strange",
    "Scarlet Witch",
    "Loki",
    "Vision",
    "War Machine",
    "Falcon",
    "Winter Soldier",
    "Star-Lord",
    "Gamora",
    "Drax",
    "Rocket",
    "Groot",
    "Mantis",
    "Nebula",
    "Black Panther",
    "Captain Marvel",
    "Ant-Man",
    "Wasp",
    "Wolverine",
    "Deadpool",
    "Spider-Man",
    "Venom",
    "Carnage",
    "Daredevil",
    "Punisher",
    "Nick Fury",
    "Maria Hill",
    "Quicksilver",
    "Scarlet Witch",
    "Vision",
    "Ultron",
    "Thanos",
    "Hela",
    "Red Skull",
    "Green Goblin",
    "Doctor Octopus",
    "Sandman",
    "Electro",
    "Mysterio",
    "Vulture",
    "Shang-Chi",
    "The Mandarin",
    "Moon Knight",
    "Blade",
    "Ghost Rider",
    "Silver Surfer",
    "Galactus",
    "Nova",
    "Adam Warlock",
    "Beta Ray Bill",
    "Sentry",
    "Jessica Jones",
    "Luke Cage",
    "Iron Fist",
    "She-Hulk",
    "Ms. Marvel",
    "Kate Bishop",
    "America Chavez",
    "Echo",
    "Namor",
    "Hercules",
    "Squirrel Girl",
    "Howard the Duck",
  ];

  let deck = [];
  let players = [];
  let activePlayers = [];
  let finishedPlayers = [];
  let discardPile = [];
  let currentSuit = null;
  let currentRank = null;
  let currentPlayerIndex = 0;
  let gameOver = false;
  let playerCount = 2;
  let isKnockout = false;

  let penaltyActive = false;
  let penaltyCount = 0;

  const statusSpan = document.getElementById("status");
  const drawButton = document.getElementById("draw-button");
  const boardDiv = document.querySelector(".board");
  const playersContainer = document.getElementById("players-container");
  const discardDiv = document.getElementById("discard");
  const deckDiv = document.getElementById("deck");

  const startGameBtn = document.getElementById("start-game");
  const playerCountSelect = document.getElementById("player-count");
  const gameModeSelect = document.getElementById("game-mode");

  const resultsModal = document.getElementById("results-modal");
  const resultsTitle = document.getElementById("results-title");
  const resultsBody = document.getElementById("results-body");
  const nextRoundBtn = document.getElementById("next-round-btn");
  const closeModalBtn = document.getElementById("close-modal-btn");

  const thinkingIndicator = document.getElementById("thinking-indicator");
  const thinkingText = document.getElementById("thinking-text");

  startGameBtn.addEventListener("click", startGameSetup);
  nextRoundBtn.addEventListener("click", () => {
    closeModal();
    startNextKnockoutRound();
  });
  closeModalBtn.addEventListener("click", () => {
    closeModal();
  });

  function showThinkingIndicator(playerName) {
    thinkingText.textContent = `${playerName} is thinking...`;
    thinkingIndicator.style.display = "block";
  }

  function hideThinkingIndicator() {
    thinkingIndicator.style.display = "none";
  }

  function startGameSetup() {
    playerCount = parseInt(playerCountSelect.value, 10);
    if (playerCount < 2 || playerCount > 4) playerCount = 2;
    isKnockout = gameModeSelect.value === "knockout";
    setupInitialPlayers();
    initGame();
  }

  function setupInitialPlayers() {
    players = [];
    players.push({ name: "You", hand: [] });
    let usedIndices = [];
    for (let i = 1; i < playerCount; i++) {
      let idx;
      do {
        idx = Math.floor(Math.random() * marvelCharacters.length);
      } while (usedIndices.includes(idx));
      usedIndices.push(idx);
      players.push({ name: marvelCharacters[idx], hand: [] });
    }
  }

  function initGame() {
    deck = [];
    discardPile = [];
    finishedPlayers = [];
    currentSuit = null;
    currentRank = null;
    currentPlayerIndex = 0;
    gameOver = false;
    penaltyActive = false;
    penaltyCount = 0;

    createDeck();
    shuffle(deck);
    dealCards();

    activePlayers = [...players];
    updateStatus();
    renderGame();

    boardDiv.style.display = "block";
    document.querySelector(".game-options").style.display = "none";
    document.querySelector(".actions").style.display = "block";
  }

  function startNextKnockoutRound() {
    deck = [];
    discardPile = [];
    finishedPlayers = [];
    currentSuit = null;
    currentRank = null;
    currentPlayerIndex = 0;
    gameOver = false;
    penaltyActive = false;
    penaltyCount = 0;

    createDeck();
    shuffle(deck);
    for (let p of players) {
      p.hand = [];
    }
    dealCards();

    activePlayers = [...players];
    updateStatus();
    renderGame();
  }

  function createDeck() {
    for (let s of suits) {
      for (let r of ranks) {
        deck.push({ rank: r, suit: s });
      }
    }
    deck.push({ rank: "Joker", suit: "red" });
    deck.push({ rank: "Joker", suit: "black" });
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function dealCards() {
    for (let p = 0; p < players.length; p++) {
      for (let i = 0; i < 7; i++) {
        players[p].hand.push(deck.pop());
      }
    }
    let starter = deck.pop();
    discardPile.push(starter);
    currentSuit = starter.suit;
    currentRank = starter.rank;
  }

  function renderGame() {
    playersContainer.innerHTML = "";
    const playerPositions = [
      "player-bottom",
      "player-right",
      "player-top",
      "player-left",
    ];

    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const playerArea = document.createElement("div");
      playerArea.classList.add("player-area");
      playerArea.id = playerPositions[i];

      let title = p.name;
      if (activePlayers.includes(p) && i === getCurrentPlayerGlobalIndex()) {
        title += " (Current Turn)";
      } else if (!activePlayers.includes(p) && finishedPlayers.includes(p)) {
        title += " (Finished)";
      }

      playerArea.innerHTML = `<h2>${title}</h2>`;
      const handDiv = document.createElement("div");
      handDiv.classList.add("hand");

      if (p.name === "You") {
        p.hand.forEach((card, index) => {
          const cardEl = createCardElement(card);
          if (
            !gameOver &&
            activePlayers.includes(p) &&
            i === getCurrentPlayerGlobalIndex() &&
            canPlay(card)
          ) {
            cardEl.addEventListener("click", () => {
              attemptPlayCard(p, index);
            });
          } else {
            cardEl.classList.add("disabled");
          }
          handDiv.appendChild(cardEl);
        });
      } else {
        for (let c = 0; c < p.hand.length; c++) {
          const cardEl = document.createElement("div");
          cardEl.classList.add("card", "back");
          cardEl.innerHTML = "?";
          handDiv.appendChild(cardEl);
        }
      }

      playerArea.appendChild(handDiv);
      playersContainer.appendChild(playerArea);
    }

    renderDiscard();
    deckDiv.textContent = deck.length > 0 ? deck.length : "0";
  }

  function renderDiscard() {
    discardDiv.innerHTML = "";
    let topCard = discardPile[discardPile.length - 1];
    let cardEl = createCardElement(topCard);
    discardDiv.appendChild(cardEl);
  }

  function createCardElement(card) {
    let cardEl = document.createElement("div");
    cardEl.classList.add("card", `suit-${card.suit}`);
    cardEl.innerHTML = `
            <span class="rank">${card.rank}</span>
            <span class="suit">${getSuitSymbol(card.suit)}</span>
        `;
    return cardEl;
  }

  function getSuitSymbol(suit) {
    switch (suit) {
      case "hearts":
        return "♥";
      case "diamonds":
        return "♦";
      case "clubs":
        return "♣";
      case "spades":
        return "♠";
      case "black":
        return "🃏";
      case "red":
        return "🃏";
    }
  }

  function isPowerCard(card) {
    return card.rank === "2" || card.rank === "8" || card.rank === "Joker";
  }

  function canPlay(card) {
    let topCard = discardPile[discardPile.length - 1];
    if (topCard.rank === "Joker") {
      return true;
    }
    if (card.rank === "Joker") return true;
    if (card.rank === "8") return true;
    return card.suit === currentSuit || card.rank === currentRank;
  }

  function attemptPlayCard(playerObj, cardIndex) {
    const card = playerObj.hand[cardIndex];
    if (playerObj.hand.length === 1 && isPowerCard(card)) {
      drawCardForPlayer(playerObj);
      endTurn();
      return;
    }
    playCard(playerObj, cardIndex);
  }

  function playCard(playerObj, cardIndex) {
    const card = playerObj.hand[cardIndex];
    playerObj.hand.splice(cardIndex, 1);
    discardPile.push(card);

    if (card.rank === "8") {
      let chosenSuit;
      if (playerObj.name === "You") {
        chosenSuit = prompt(
          "You played an 8! Choose a suit: hearts, diamonds, clubs, spades",
          "hearts"
        );
        if (!suits.includes(chosenSuit)) {
          chosenSuit = "hearts";
        }
      } else {
        chosenSuit = suits[Math.floor(Math.random() * suits.length)];
      }
      currentSuit = chosenSuit;
      currentRank = null;
    } else if (card.rank === "Joker") {
      // Joker does not set suit or rank
    } else {
      currentSuit = card.suit;
      currentRank = card.rank;
    }

    // Penalty logic
    if (card.rank === "2") {
      if (!penaltyActive) {
        penaltyActive = true;
        penaltyCount = 2;
      } else {
        penaltyCount += 2;
      }
    } else if (card.rank === "Joker") {
      if (!penaltyActive) {
        penaltyActive = true;
        penaltyCount = 4;
      } else {
        penaltyCount += 4;
      }
    }

    handlePlayerFinishedCheck(playerObj);
    checkRoundOrGameState();

    if (playerObj.name === "You") {
      endTurn();
    } else {
      setTimeout(() => endTurn(), 1500);
    }
  }

  function endTurn() {
    if (gameOver || activePlayers.length <= 1) return;

    let currentActiveIndex = getCurrentPlayerActiveIndex();
    currentActiveIndex = (currentActiveIndex + 1) % activePlayers.length;
    let nextPlayer = activePlayers[currentActiveIndex];
    currentPlayerIndex = players.indexOf(nextPlayer);

    if (penaltyActive) {
      let nextP = nextPlayer;
      let canContinue = nextP.hand.some(
        (c) => c.rank === "2" || c.rank === "Joker"
      );
      if (!canContinue) {
        for (let i = 0; i < penaltyCount; i++) {
          drawCardForPlayer(nextP);
        }
        penaltyCount = 0;
        penaltyActive = false;

        updateStatus();
        renderGame();
        let playerObj = players[getCurrentPlayerGlobalIndex()];
        if (!gameOver && playerObj.name !== "You") {
          showThinkingIndicator(playerObj.name);
          setTimeout(() => endTurn(), 1500);
        } else {
          hideThinkingIndicator();
          endTurn();
        }
        return;
      }
    }

    updateStatus();
    renderGame();

    let playerObj = players[getCurrentPlayerGlobalIndex()];
    if (!gameOver && playerObj.name !== "You") {
      showThinkingIndicator(playerObj.name);
      setTimeout(() => computerPlay(), 1500);
    } else {
      hideThinkingIndicator();
    }
  }

  function computerPlay() {
    hideThinkingIndicator();

    let playerObj = players[getCurrentPlayerGlobalIndex()];
    let playableCards = playerObj.hand.filter((c) => canPlay(c));
    let chainCards = playableCards.filter(
      (c) => c.rank === "2" || c.rank === "Joker"
    );
    let cardIndex;

    if (penaltyActive) {
      if (chainCards.length > 0) {
        let chosenCard = chainCards[0];
        cardIndex = playerObj.hand.indexOf(chosenCard);
      } else {
        for (let i = 0; i < penaltyCount; i++) {
          drawCardForPlayer(playerObj);
        }
        penaltyCount = 0;
        penaltyActive = false;
        setTimeout(() => endTurn(), 1500);
        return;
      }
    } else {
      if (playableCards.length > 0) {
        let chosenCard = playableCards[0];
        cardIndex = playerObj.hand.indexOf(chosenCard);
      } else {
        drawCardForPlayer(playerObj);
        setTimeout(() => endTurn(), 1500);
        return;
      }
    }

    if (playerObj.hand.length === 1 && isPowerCard(playerObj.hand[cardIndex])) {
      drawCardForPlayer(playerObj);
      setTimeout(() => endTurn(), 1500);
      return;
    }

    playCard(playerObj, cardIndex);
  }

  function drawCardForPlayer(pObj) {
    if (deck.length === 0) {
      recycleDiscardIntoDeck();
    }
    if (deck.length > 0) {
      pObj.hand.push(deck.pop());
    }
  }

  function recycleDiscardIntoDeck() {
    if (discardPile.length > 1) {
      let topCard = discardPile.pop();
      let cardsToRecycle = discardPile.splice(0, discardPile.length);
      shuffle(cardsToRecycle);
      deck = cardsToRecycle;
      discardPile.push(topCard);
    }
  }

  drawButton.addEventListener("click", () => {
    if (!gameOver && players[getCurrentPlayerGlobalIndex()].name === "You") {
      let playerObj = players[getCurrentPlayerGlobalIndex()];
      drawCardForPlayer(playerObj);
      endTurn();
    }
  });

  deckDiv.addEventListener("click", () => {
    if (!gameOver && players[getCurrentPlayerGlobalIndex()].name === "You") {
      let playerObj = players[getCurrentPlayerGlobalIndex()];
      drawCardForPlayer(playerObj);
      endTurn();
    }
  });

  function handlePlayerFinishedCheck(playerObj) {
    if (playerObj.hand.length === 0) {
      finishedPlayers.push(playerObj);
      let idx = activePlayers.indexOf(playerObj);
      if (idx !== -1) activePlayers.splice(idx, 1);
    }
  }

  function checkRoundOrGameState() {
    if (gameOver) return;

    if (!isKnockout) {
      if (finishedPlayers.length > 0) {
        endNormalGame();
      }
    } else {
      if (activePlayers.length === 1) {
        endKnockoutRound(activePlayers[0]);
      }
    }
  }

  function endNormalGame() {
    gameOver = true;
    let winner = finishedPlayers[0];
    let others = players
      .filter((p) => p !== winner)
      .sort((a, b) => a.hand.length - b.hand.length);
    let rankings = [winner, ...others];
    showResultsModal(rankings, true);
  }

  function endKnockoutRound(loser) {
    gameOver = true;
    let rankings = [...finishedPlayers, loser];
    players = players.filter((p) => p !== loser);
    showResultsModal(rankings, false);
  }

  function showResultsModal(rankings, wasNormalMode) {
    resultsBody.innerHTML = "";
    let titleText = wasNormalMode ? "Game Over!" : "Round Over!";
    resultsTitle.textContent = titleText;

    for (let i = 0; i < rankings.length; i++) {
      let div = document.createElement("div");
      let place = i + 1;
      let cls = "";
      if (place === 1) cls = "trophy-gold";
      else if (place === 2) cls = "trophy-silver";
      else if (place === 3) cls = "trophy-bronze";

      if (!wasNormalMode && i === rankings.length - 1) {
        cls = "";
        div.textContent = `${place}. ${rankings[i].name} (Loser)`;
      } else {
        div.className = cls;
        div.textContent = `${place}. ${rankings[i].name}`;
      }
      resultsBody.appendChild(div);
    }

    let userStillIn = players.some((p) => p.name === "You");

    if (wasNormalMode) {
      nextRoundBtn.style.display = "none";
    } else {
      if (userStillIn && players.length > 1) {
        nextRoundBtn.style.display = "inline-block";
      } else {
        nextRoundBtn.style.display = "none";
      }
    }

    resultsModal.style.display = "flex";
  }

  function closeModal() {
    resultsModal.style.display = "none";
    renderGame();
    updateStatus();
  }

  function updateStatus() {
    if (gameOver) return;
    let playerObj = players[getCurrentPlayerGlobalIndex()];
    let penaltyInfo = penaltyActive ? ` | Penalty: ${penaltyCount} cards` : "";
    statusSpan.textContent = `${playerObj.name}'s turn. Current suit: ${currentSuit}, rank: ${currentRank}${penaltyInfo}`;
  }

  function getCurrentPlayerGlobalIndex() {
    return currentPlayerIndex;
  }

  function getCurrentPlayerActiveIndex() {
    if (activePlayers.length === 0) return -1;
    let currentPlayer = players[currentPlayerIndex];
    return activePlayers.indexOf(currentPlayer);
  }
});
