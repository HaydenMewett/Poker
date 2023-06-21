const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const DEBUG = true;

// Default values for miniumum raise amount and starting money
const MINIMUM_BET = 5; // default minimum bet amount
const MAXIMUM_BET = 100; //default maximum bet
const START_MONEY = 1000; // default starting money
const DEFAULT_ROBOT_PLAYERS = 2; // default no of robot players

// assets
const SOUND_CARD = "snd/card.mp3"; // card dealing sound
const SOUND_MONEYCLINK = "snd/clink.mp3"; // pot money sound
const SOUND_GAMEOVER = "snd/levelcomplete.wav";
const SOUND_BUTTONCLICK = "snd/click.mp3"; // click sound for button press
const SOUND_LEVELCOMPLETE = "snd/levelcomplete.wav";
const SOUND_FOLD = "snd/nope.mp3";
const SOUND_NOMORECASH = "snd/drums.wav";

const IMAGE_BOARD = "img/board.png"; // background image for board
const IMAGE_CARDS = "img/cards.png"; // card sheet image (consists of sheet of images 14 cards across by 4 down)
const IMAGE_USER = "img/user.png"; // image for user on board
const IMAGE_ROBOT = "img/robot.png"; // image for robots on board
const IMAGE_CROWN = "img/crown.png"; // image of crown showing who is dealer
const IMAGE_SPEECHBUBBLE = "img/bubble.png"; // chat bubble background image

const boardPosition = { x: 0, y: 0, width: 2560, height: 1440 }; // location of the board image

const cardSheetDimensions = { width: 14, height: 4 }; // number of cards across and down on the card sheet

// The different options a player can make
const playerActions = {
  Check: "Check",
  Bet: "Bet",
  Call: "Call",
  Raise: "Raise",
  Fold: "Fold",
  AllIn: "All In",
};

// Enumeration of the card suites
const cardSuites = {
  Hearts: 0,
  Spades: 1,
  Diamonds: 2,
  Clubs: 3,
};

// the card values
const cardValues = {
  Ace: 14,
  Two: 2,
  Three: 3,
  Four: 4,
  Five: 5,
  Six: 6,
  Seven: 7,
  Eight: 8,
  Nine: 9,
  Ten: 10,
  Jack: 11,
  Queen: 12,
  King: 13,
};

// Base score for different types of hands. Used for working out winning hands
const handValues = {
  royalFlush: 10,
  straightFlush: 9,
  fourOfAKind: 8,
  fullHouse: 7,
  flush: 6,
  straight: 5,
  threeOfAKind: 4,
  twoPair: 3,
  onePair: 2,
  highCard: 1,
};

// location of the pot text on the canvas
const potLocation = {
  x: 337.5,
  y: 307.5,
};

// location of the centre for each player avatar
const avatarCenterLocations = {
  Player1: { x: 860, y: 1147.5 },
  Player2: { x: 337.5, y: 1140 },
  Player3: { x: 860, y: 307.5 },
  Player4: { x: 2222.5, y: 1140 },
};

// locations for each of the cards on the board
const cardLocations = {
  Player1: [
    { x: 1015, y: 990 },
    { x: 1320, y: 990 },
  ],
  Player2: [
    { x: 180, y: 456 },
    { x: 180, y: 761 },
  ],
  Player3: [
    { x: 1015, y: 150 },
    { x: 1320, y: 150 },
  ],
  Player4: [
    { x: 2065, y: 455 },
    { x: 2065, y: 760 },
  ],
  Community: [
    { x: 638, y: 563 },
    { x: 903, y: 563 },
    { x: 1168, y: 563 },
    { x: 1433, y: 563 },
    { x: 1698, y: 563 },
  ],
};

// stages of the game
const gameStage = {
  NewHand: "New Hand",
  Blind: "Blind",
  Deal: "Deal",
  PreFlop: "PreFlop",
  Flop: "Flop",
  Turn: "Turn",
  River: "River",
  Showdown: "Showdown",
  GameOver: "Game Over",
};

// list of audio tracks
const audioTracks = [
  "snd/allthat.mp3",
  "snd/dreams.mp3",
  "snd/elevate.mp3",
  "snd/jazzyfrenchy.mp3",
  "snd/adventure.mp3",
  "snd/clapandyell.mp3",
  "snd/tenderness.mp3",
  "snd/happyrock.mp3",
  "snd/summer.mp3",
];

// set up the board background image
const boardImage = new Image();
boardImage.src = IMAGE_BOARD;

// set up the card image sheet
const cardImageSheet = new Image();
cardImageSheet.src = IMAGE_CARDS;

// image for the human player
const userImage = new Image();
userImage.src = IMAGE_USER;

// image for the robot player
const robotImage = new Image();
robotImage.src = IMAGE_ROBOT;

// image for the crown - showing the dealer
const crownImage = new Image();
crownImage.src = IMAGE_CROWN;

// background speech bubble image
const speechBubbleImage = new Image();
speechBubbleImage.src = IMAGE_SPEECHBUBBLE;

//
// GAME OBJECT CLASSES
// Designed to enable multiple game 'objects' on the screen with their own animations
// Originally considered for multiple types of objects if required, but only implemented
// for the Text objects
//
// GameObjectController Class
// Controls the game objects on the canvas
class GameObjectController {
  constructor() {
    this.gameObjects = []; // array of the game objects
  }

  // Add a new gameobject
  addGameObject(gameobject) {
    this.gameObjects.push(gameobject); // add an object to the game object array
  }

  // run the update method for game objects, and remove any that are set for disposal
  update() {
    let i = 0;
    // Iterate through the game objects
    while (i < this.gameObjects.length) {
      let object = this.gameObjects[i];
      object.update(); // run the object's update method
      if (object.dispose) {
        // if the object is no longer required we can remove it from the gameobject array
        this.gameObjects.splice(i, 1);
      } else {
        i++;
      }
    }
  }

  // Draw the game objects.
  draw() {
    // iterate through the objects in the gameobjects array, calling the draw method on each
    for (var i = 0; i < this.gameObjects.length; i++) {
      let object = this.gameObjects[i];
      object.draw();
    }
  }
}

//
// base template class for a game object
//
class GameObject {
  constructor(context, position) {
    this.position = position; // each game object should have a position
    this.context = context; // the canvas for the game object to draw on
    this.dispose = false; // whether to dispose of the game object or not
  }
  // Each game object should implement the draw and the update methods
  draw(context) {}
  update(param) {}
}

// Text Game Object - inherits from gameobject
// Used for drawing some text on the screen which fades and moves up over time
class TextGameObject extends GameObject {
  constructor(context, position, text, size, fadeDuration) {
    super(context, position); // call the base class constructor for context and position
    this.text = text; // the text to display
    this.fadeDuration = fadeDuration; // how long (in ms) to fade out the text
    this.startTime = Date.now(); // holds the current time to figure out the fade amount
    this.size = size; // size of the text
    this.speed = size; // pixels per second- set to the same as the size
  }

  // Update method
  update() {
    const elapsed = Date.now() - this.startTime; // the elapsed time since the object was created
    // if the elapsed time is greater than the time for the fade out, then we can dispose of the object by setting dispose flag to true
    if (elapsed > this.fadeDuration) {
      this.dispose = true;
    }
  }

  // draw the text object
  draw() {
    const elapsed = Date.now() - this.startTime; // elasped time
    // work out the amount of alpha to apply when drawing. as alpha gets closer to 1 it is more transparent
    // so if elapsed time is 4000 and fade duration is 5000, the alpha will be 1 - (4000/5000) = 0.2 alpha. When elapsed is greater than fade
    // duration the value will be greater than 1, but then the Math.min function will return the 1 value anyway. Resulting in an alpha of 0
    const alpha = 1 - Math.min(elapsed / this.fadeDuration, 1);
    this.context.save(); // save the current drawing context as we will make changes
    this.context.fillStyle = `rgba(50, 50, 100, ${alpha})`; // set the fill style (colour) which includes the alpha

    // Render the text at the specified position
    this.context.font = "bold " + this.size + "px Trebuchet MS";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.shadowColor = "yellow";
    this.context.shadowBlur = this.size / 10; // put a blur in the background

    const offsetY = this.speed * (elapsed / 1000); // offset the y value as the time elapses to make the text rise upward

    // draw the text
    this.context.fillText(
      this.text,
      this.position.x,
      this.position.y - offsetY
    );
    this.context.restore(); // restore the drawing context
  }
}

//
// END OF GAME OBJECT CLASSES
//

//
// POT
//
class Pot {
  constructor(amount = 0, position = potLocation) {
    this.amount = amount; // the amount of the pot
    this.drawAmount = amount; // the currently drawn amount in animations
    this.position = position; // where the pot text is located
    this.startTime; // time that the animation starts
    this.startAmount; // the start amount at the beginning of the animation
  }

  // draw the pot text
  draw() {
    ctx.save(); // save the context
    ctx.textAlign = "center"; // set up the text details
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";
    ctx.lineWidth = 10;
    ctx.font = "bold 120px Trebuchet MS";
    ctx.strokeText("$" + this.drawAmount, this.position.x, this.position.y); // draw the outline
    ctx.fillText("$" + this.drawAmount, this.position.x, this.position.y); // draw the fill colour
    ctx.restore(); // restore the context
  }

  // update - used to animate the increase/decrease value of the text in the pot
  update() {
    // if the amount drawn is the same as the final amount then we can just exit
    if (this.amount === this.drawAmount) {
      return;
    }
    // work out how much the value should increase/decrease per second
    // if the start amount is 50 and the end amount is 100 then we want to do 50 per second
    const amountPerSecond = Math.abs(this.amount - this.startAmount);
    const elapsed = Date.now() - this.startTime; // the elapsed time since the animation started
    // used to see if a sound should be played, store the drawamount
    // because the update routine is run up to 60 times per second, we don't want to play the sound for every time it is run
    // we only want to play the sound if the amount drawn changes (for many of the updates, the amount drawn will not change)
    let preDrawAmount = this.drawAmount;
    // are we increasing the pot, or decreasing it?
    if (this.amount > this.drawAmount) {
      // Pot value is being increased (money added to the pot)
      // work out the rounded (Math.floor) minium (Math.min) amount between
      // the start amount + the amount after x milliseconds of time has elapsed, and the total amount that should be shown
      // this is so the drawn amount wont increase over the total amount it is supposed to be
      this.drawAmount = Math.floor(
        Math.min(
          this.startAmount + (elapsed / 1000) * amountPerSecond,
          this.amount
        )
      );
    } else {
      // pot value is being decreased (money taken out of the pot)
      // inverse logic from the above check.
      this.drawAmount = Math.floor(
        Math.max(
          this.startAmount - (elapsed / 1000) * amountPerSecond,
          this.amount
        )
      );
    }
    // check if the drawamount had changed, if so play a sound. this section will only be executed if the actual number being
    // drawn changes.
    if (this.drawAmount !== preDrawAmount) {
      new Audio(SOUND_MONEYCLINK).play();
    }
  }

  // adds an amount to the pot.
  addAmount(amount) {
    this.startTime = Date.now(); // set the start time for the animation
    this.startAmount = this.amount; // set the initial start amount (which is the amount prior to adding), this will not change during the animation
    this.drawAmount = this.amount; // set the draw amount, this will change through the animation
    this.amount += amount; // set the actual pot amount.
  }

  // removes all money from the pot and returns the total pot amount.
  payOut() {
    this.startTime = Date.now();
    this.startAmount = this.amount;
    this.drawAmount = this.amount;
    const payout = this.amount;
    this.amount = 0;
    return payout;
  }
}

//
// CARD
//
class Card {
  constructor(
    suite,
    value,
    cardSheet,
    position,
    portrait = true,
    faceUp = false
  ) {
    this.suite = suite;
    this.value = value;
    this.cardSheet = cardSheet;
    this.position = position;
    this.portrait = portrait;
    this.faceUp = faceUp;
  }

  draw({ rotated, inplay }) {
    let showCardFaceUp = this.faceUp;
    if (checkShowCardsOverride.checked) {
      showCardFaceUp = true;
    }
    let cardWidth = this.cardSheet.width / cardSheetDimensions.width;
    let cardHeight = this.cardSheet.height / cardSheetDimensions.height;
    let cardvalue = this.getCardValue(false);
    let positionX = this.position.x;
    let positionY = this.position.y;
    // save the current context
    ctx.save();

    if (rotated) {
      const angle = (90 * Math.PI) / 180;
      ctx.translate(positionX, positionY);
      ctx.rotate(angle);
      ctx.translate(-positionX, -positionY - cardHeight);
    }
    ctx.filter = "drop-shadow(5px 5px 10px black) ";
    if (!inplay) {
      ctx.filter += "grayscale(100%) ";
    }
    //draw the appropriate card image from the card sheet
    ctx.drawImage(
      this.cardSheet,
      showCardFaceUp ? (cardvalue - 1) * cardWidth : 13 * cardWidth,
      showCardFaceUp ? cardSuites[this.suite] * cardHeight : 0,
      cardWidth,
      cardHeight,
      positionX,
      positionY,
      cardWidth,
      cardHeight
    );
    //restore the context
    ctx.restore();
  }

  toString() {
    return this.value + " of " + this.suite;
  }

  // return the card value as an int, determines if aces should be high value or low
  getCardValue(acesHigh = true) {
    let cvalue = cardValues[this.value];
    if (!acesHigh && this.value === "Ace") {
      cvalue = 1;
    }
    return cvalue;
  }
}

//
// DECK
//
class Deck {
  constructor() {
    this.deck = []; // deck array
  }

  newDeck() {
    // iterate through each of the suites and values, push to the deck array along with the reference to the card image sheet (for drawing)
    for (const suite in cardSuites) {
      for (const value in cardValues) {
        this.deck.push(new Card(suite, value, cardImageSheet));
      }
    }
  }

  // shuffle the deck
  shuffle() {
    for (let i = 0; i < this.deck.length; i++) {
      let j = Math.floor(Math.random() * this.deck.length); // get a random number
      let temp = this.deck[i]; // get the value of the current card in the loop
      this.deck[i] = this.deck[j]; // swap it with the random card we chose
      this.deck[j] = temp; // now set the value to the temp
    }
  }

  // Deal a card from the deck
  deal() {
    // if there are no more cards, create a new deck and shuffle it
    if (this.deck.length == 0) {
      this.newDeck();
      this.shuffle();
    }
    new Audio(SOUND_CARD).play(); // play the card deal sound
    return this.deck.pop(); // return the top card in the deck array
  }

  // remove a particular card from the deck
  removeCard(card) {
    // look for the value in the deck
    let index = this.deck.findIndex(
      (c) => c.suite === card.suite && c.value === card.value
    );
    // if it was found, remove it
    if (index !== -1) {
      this.deck.splice(index, 1);
    }
  }
}

//
// PLAYER
//
class Player {
  constructor(playerName, startingMoney = START_MONEY) {
    this.playerName = playerName;
    this.hand = [];
    this.inPlay = true;
    this.isDealer = false;
    this.money = startingMoney;
    this.isCurrentPlayer = false;
    this.finishedBetting = false;
    this.betAmount = 0; // bet amount for this hand round
    this._speechBubbleText;
    this.totalBet = 0; // total amount bet so far
    this.isAllIn = false;
  }

  placeBet(amount) {
    this.money -= amount;
    this.betAmount += amount;
    this.totalBet += amount;
  }

  clearBet(allBets = false) {
    this.betAmount = 0;
    this.finishedBetting = false;

    if (allBets) {
      this.totalBet = 0;
    }
  }

  // add a card to the players hand, setting either a custom position or the default
  addCard(card, position) {
    card.position = position
      ? position
      : cardLocations[this.playerName][this.hand.length];
    this.hand.push(card);
  }

  clearSpeechBubbleText(endOfRound = false) {
    if (endOfRound || !this.isAllIn) {
      this._speechBubbleText = "";
    }
  }

  async setSpeechBubbleText(newText) {
    if (this._speechBubbleText) {
      // we already have some text
      // set it to blank then set it to the new text after a second
      this._speechBubbleText = "";
      setTimeout(() => {
        this._speechBubbleText = newText;
      }, 1000);
    } else {
      this._speechBubbleText = newText;
    }
  }

  draw() {
    this.drawAvatar();
    this.drawCards();
    if (this._speechBubbleText) {
      this.drawSpeechBubble();
    }
  }

  drawSpeechBubble() {
    ctx.save();
    const bubbleCentre = {
      x: avatarCenterLocations[this.playerName].x,
      y:
        avatarCenterLocations[this.playerName].y +
        speechBubbleImage.height +
        60,
    };
    ctx.filter = "drop-shadow(5px 5px 5px black) ";
    ctx.drawImage(
      speechBubbleImage,
      bubbleCentre.x - speechBubbleImage.width / 2,
      bubbleCentre.y - (speechBubbleImage.height + 10) / 2
    );
    ctx.filter = "none";
    ctx.font = "bold 30px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.fillText(this._speechBubbleText, bubbleCentre.x, bubbleCentre.y);
    ctx.restore();
  }

  drawAvatar() {
    const playerImage = this.playerName === "Player1" ? userImage : robotImage;
    ctx.save();

    let filterString = "drop-shadow(5px 5px 10px black) ";

    if (!this.inPlay) {
      filterString += "grayscale(100%) opacity(20%) ";
    }
    if (this.isCurrentPlayer) {
      ctx.shadowBlur = 50;
      ctx.shadowColor = "yellow";
    }

    ctx.filter = filterString.trim();
    ctx.drawImage(
      playerImage,
      avatarCenterLocations[this.playerName].x - playerImage.width / 2,
      avatarCenterLocations[this.playerName].y - playerImage.height / 2
    );
    ctx.restore();
    // Draw player name
    ctx.save();
    if (!this.inPlay) {
      ctx.filter = "grayscale(100%) opacity(20%) ";
    }
    ctx.font = "bold 40px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    let playerText = this.playerName === "Player1" ? "YOU" : this.playerName;

    ctx.strokeText(
      playerText,
      avatarCenterLocations[this.playerName].x,
      avatarCenterLocations[this.playerName].y - playerImage.height / 2
    );
    ctx.fillText(
      playerText,
      avatarCenterLocations[this.playerName].x,
      avatarCenterLocations[this.playerName].y - playerImage.height / 2
    );

    // Draw money
    ctx.font = "bold 50px Trebuchet MS";
    ctx.strokeText(
      "$" + this.money,
      avatarCenterLocations[this.playerName].x,
      avatarCenterLocations[this.playerName].y + playerImage.height / 2
    );
    ctx.fillText(
      "$" + this.money,
      avatarCenterLocations[this.playerName].x,
      avatarCenterLocations[this.playerName].y + playerImage.height / 2
    );

    ctx.restore();
    // Draw the crown if this is the dealer
    if (this.isDealer) {
      ctx.save();
      ctx.filter = "drop-shadow(5px 5px 10px black)";
      ctx.drawImage(
        crownImage,
        avatarCenterLocations[this.playerName].x - crownImage.width / 2,
        avatarCenterLocations[this.playerName].y - playerImage.height
      );
      ctx.restore();
    }
  }

  drawCards() {
    this.hand.forEach((card, index) => {
      card.draw(
        this.playerName === "Player2" || this.playerName === "Player4"
          ? { rotated: true, inplay: this.inPlay }
          : { rotated: false, inplay: this.inPlay }
      );
    });
  }
}

// Delay
// Use with await to halt processing for ms milliseconds - blocking call
async function delay(ms) {
  let id = setInterval(function () {
    renderScreen();
  }, 10);
  await new Promise((resolve) => {
    setTimeout(function () {
      clearInterval(id);
      resolve();
    }, ms);
  });
}

// Deal a card (assign to a players hand)
async function dealCard(player, numberCards) {
  let start = player.hand.length;
  for (let i = start; i < start + numberCards; i++) {
    let endPosition = cardLocations[player.playerName][i];
    let faceUp = false;
    if (player.playerName === "Player1" || player.playerName === "Community") {
      faceUp = true;
    }
    let card = deck.deal();
    card.faceUp = faceUp;
    player.addCard(card, endPosition);

    await delay(500);
  }
}

// Set the next player
function setNextPlayer() {
  let playerNo;

  if (
    players.every((player) => {
      !player.inPlay;
    })
  ) {
    return false;
  }

  players.forEach((player, index) => {
    if (player.isCurrentPlayer) {
      players[index].isCurrentPlayer = false;
      playerNo = index;
    }
  });
  do {
    playerNo = (playerNo + 1) % players.length;
  } while (!players[playerNo].inPlay);
  players[playerNo].isCurrentPlayer = true;
  return playerNo;
}

// Set the next Dealer
function setNextDealer() {
  let playerNo;
  players.forEach((player, index) => {
    if (player.isDealer) {
      players[index].isDealer = false;
      playerNo = (index + 1) % players.length;
    }
  });
  if (!playerNo) {
    playerNo = Math.floor(Math.random() * players.length);
  }
  players[playerNo].isDealer = true;
  players[playerNo].isCurrentPlayer = true;
  gameObjectController.addGameObject(
    new TextGameObject(
      ctx,
      {
        x: avatarCenterLocations["Player" + (playerNo + 1)].x,
        y: avatarCenterLocations["Player" + (playerNo + 1)].y,
      },
      "Set Dealer",
      50,
      3000
    )
  );
  players[playerNo].setSpeechBubbleText("Dealer!");
  return playerNo;
}

// AUDIO FUNCTIONS
//play audio - plays an audio file
function playAudio() {
  if (enableAudio) {
    const trackNo = Math.floor(Math.random() * audioTracks.length);
    if (DEBUG) console.log("Playing track no: " + trackNo);
    audio.src = audioTracks[trackNo];
    audio.play();
  }
}

function stopAudio() {
  audio.pause();
  audio.currentTime = 0;
}

// utility method to create a game object for status messages
function addStatusMessage(text, position, textSize, delay) {
  gameObjectController.addGameObject(
    new TextGameObject(
      ctx,
      { x: position.x, y: position.y },
      text,
      textSize,
      delay
    )
  );
}

// replaced this function
function sortHandOLD(hand) {
  hand.sort((a, b) => {
    return cardValues[a.value] - cardValues[b.value];
  });
}

function sortHand(hand, acesHigh = true) {
  hand.sort((a, b) => {
    return a.getCardValue(acesHigh) - b.getCardValue(acesHigh);
  });
}

function getCombinations(hand, handSize, current = [], result = []) {
  if (current.length === handSize) {
    result.push(current);
    return;
  }
  for (let i = 0; i < hand.length; i++) {
    getCombinations(
      hand.slice(i + 1),
      handSize,
      current.concat(hand[i]),
      result
    );
  }
  return result;
}

function findKeyByValue(obj, value) {
  for (const key in obj) {
    if (obj[key] == value) {
      return key;
    }
  }
  return null; // Value not found
}

function getRoyalFlushScore(hand) {
  if (hand[0].getCardValue() === 10 && getStraightFlushScore(hand)) {
    return {
      score: handValues.royalFlush,
      description: "Royal Flush with " + hand[0].suite,
    };
  }
}

function getStraightFlushScore(hand) {
  if (getFlushScore(hand) && getStraightScore(hand))
    return {
      score: (
        handValues.straightFlush +
        hand[hand.length - 1].getCardValue() / 100
      ).toFixed(2),
      description:
        "Straight Flush, with " +
        hand[0].suite +
        " from " +
        hand[0].value +
        " to " +
        hand[hand.length - 1].value,
    };
}

function getFlushScore(hand) {
  const checkSuite = hand[0].suite;
  const res = hand.every((value) => value.suite === checkSuite);
  return res
    ? {
        score: (
          handValues.flush +
          hand[hand.length - 1].getCardValue() / 100
        ).toFixed(2),
        description: "Flush with " + checkSuite,
      }
    : false;
}

function getFullHouseScore(hand) {
  let res = false;
  let pairKey = false;
  let threeKey = false;
  const grpValues = getGroupedValues(hand);
  for (key in grpValues) {
    if (grpValues[key] === 2) {
      pairKey = key;
    }
    if (grpValues[key] === 3) {
      threeKey = key;
    }
  }
  if (threeKey && pairKey) {
    res = {
      score: (handValues.fullHouse + threeKey / 100 + pairKey / 10000).toFixed(
        4
      ),
      description:
        "Full house with " +
        findKeyByValue(cardValues, threeKey) +
        "s" +
        " and " +
        findKeyByValue(cardValues, pairKey) +
        "s",
    };
  }
  return res;
}

function getStraightScore(hand) {
  let acesHigh;
  if (
    /////////////////////////////////// check this
    hand.length > 1 &&
    hand[hand.length - 1].value === "Ace" &&
    hand[hand.length - 2].value === "King"
  ) {
    //ace high
    acesHigh = true;
  } else {
    acesHigh = false;
    sortHand(hand, false);
  }
  let index = 0;
  do {
    const currentCard = hand[index].getCardValue(acesHigh);
    const nextCard = hand[index + 1].getCardValue(acesHigh);
    if (nextCard !== currentCard + 1) {
      return false;
    }
    index++;
  } while (index < hand.length - 1);
  return {
    score: (
      handValues.straight +
      hand[hand.length - 1].getCardValue() / 100
    ).toFixed(2),
    description:
      "Straight, " + hand[0].value + " to " + hand[hand.length - 1].value,
  };
}

function getFourOfAKindScore(hand) {
  let res = false;
  const grpValues = getGroupedValues(hand);
  for (key in grpValues) {
    if (grpValues[key] > 3) {
      res = {
        score: (handValues.fourOfAKind + key / 100).toFixed(2),
        description:
          "Four of a Kind with " + findKeyByValue(cardValues, key) + "s",
      };
    }
  }
  return res;
}

function getThreeOfAKindScore(hand) {
  let res = false;
  const grpValues = getGroupedValues(hand);
  for (key in grpValues) {
    if (grpValues[key] > 2) {
      res = {
        score: (handValues.threeOfAKind + key / 100).toFixed(2),
        description:
          "Three of a Kind with " + findKeyByValue(cardValues, key) + "s",
      };
    }
  }
  return res;
}

function getTwoPairScore(hand) {
  let res = false;
  let pairArray = [];
  const grpValues = getGroupedValues(hand);
  for (key in grpValues) {
    if (grpValues[key] > 1) {
      pairArray.push({
        key: key,
        value: grpValues[key],
      });
    }
  }
  if (pairArray.length > 1) {
    res = {
      score: (
        handValues.twoPair +
        pairArray[pairArray.length - 1].key / 100 +
        pairArray[0].key / 10000
      ).toFixed(4),
      description:
        "A pair of " +
        findKeyByValue(cardValues, pairArray[pairArray.length - 1].key) +
        "s, and a pair of " +
        findKeyByValue(cardValues, pairArray[pairArray.length - 2].key) +
        "s",
    };
  }
  return res;
}

function getOnePairScore(hand) {
  let res = false;
  const grpValues = getGroupedValues(hand);
  for (key in grpValues) {
    if (grpValues[key] > 1) {
      res = {
        score: (handValues.onePair + key / 100).toFixed(2),
        description: "A pair of " + findKeyByValue(cardValues, key) + "s",
      };
    }
  }
  return res;
}

function getHighCardScore(hand) {
  let card = hand[hand.length - 1];
  return {
    score: (handValues.highCard + card.getCardValue() / 100).toFixed(2),
    description: card.toString() + " high",
  };
}

function getGroupedValues(hand) {
  valueObject = {};
  for (const card of hand) {
    if (valueObject[cardValues[card.value]]) {
      valueObject[cardValues[card.value]]++;
    } else {
      valueObject[cardValues[card.value]] = 1;
    }
  }
  return valueObject;
}

function getHandValue(hand) {
  sortHand(hand);
  let x;
  if ((x = getRoyalFlushScore(hand))) {
    return x;
  }
  if ((x = getStraightFlushScore(hand))) {
    return x;
  }
  if ((x = getFourOfAKindScore(hand))) {
    return x;
  }
  if ((x = getFullHouseScore(hand))) {
    return x;
  }
  if ((x = getFlushScore(hand))) {
    return x;
  }
  if ((x = getStraightScore(hand))) {
    return x;
  }
  if ((x = getThreeOfAKindScore(hand))) {
    return x;
  }
  if ((x = getTwoPairScore(hand))) {
    return x;
  }
  if ((x = getOnePairScore(hand))) {
    return x;
  }
  x = getHighCardScore(hand);
  return x;
}

function clearAllSpeechBubbles(endOfRound = false) {
  players.forEach((player) => {
    player.clearSpeechBubbleText(endOfRound);
  });
}

function isMoreThanOnePlayerLeft() {
  let count = 0;
  players.forEach((player) => {
    if (player.inPlay) {
      count++;
    }
  });
  return count > 1;
}

function gotNoMoneyLeft() {
  pauseGameLoop = true;
  enableAnimationFrame = false;
  document.getElementById("noMoreCash").classList.remove("d-none");
  new Audio(SOUND_NOMORECASH).play();
}

//
//
// start the game with x number of players
//
//
function startGame(numberOfPlayers) {
  loadSettings();
  playAudio();
  players = [];
  gameObjectController = new GameObjectController();
  for (let i = 1; i <= numberOfPlayers; i++) {
    players.push(new Player("Player" + i, startingMoney));
  }
  logEvent("Started a new game with " + numberOfPlayers + " players");

  startNewRound();
}

function startNewRound() {
  enableAnimationFrame = false;
  pauseGameLoop = true;
  let player1 = players.find((a) => a.playerName === "Player1");
  if (player1 && player1.money < minimumBet) {
    gotNoMoneyLeft();
  } else {
    pot = new Pot();
    communityHand = new Player("Community");
    currentStage = gameStage.NewHand;
    players.forEach((player) => {
      player.hand = [];
      player.inPlay = true;
      player.isAllIn = false;
    });
    setNextDealer();
    resetPlayerBets(true);
    enableAnimationFrame = true;
    pauseGameLoop = false;
    gameLoop();
  }
}

//
// function: gameLoop
// The main game loop
//

async function gameLoop() {
  // draw the board
  renderScreen();
  if (!pauseGameLoop) {
    // check what the current game stage is
    switch (currentStage) {
      case gameStage.NewHand:
        pauseGameLoop = true;
        logEvent("---New Hand---");
        deck = new Deck();
      // fall through
      case gameStage.Blind:
        pauseGameLoop = true;
        logEvent("-Blind-");
        await doBlind(); //await on these events so the delays will work
        currentStage = gameStage.PreFlop;
        pauseGameLoop = false;
        break;
      case gameStage.PreFlop:
        pauseGameLoop = true;
        logEvent("-PreFlop-");
        await doDeal();
        clearAllSpeechBubbles();
        doBetting(gameStage.Flop);

        break;
      case gameStage.Flop:
        pauseGameLoop = true;
        logEvent("-Flop-");
        await doFlop();
        clearAllSpeechBubbles();
        doBetting(gameStage.Turn);

        break;
      case gameStage.Turn:
        pauseGameLoop = true;
        logEvent("-Turn-");
        await doTurn();
        clearAllSpeechBubbles();
        doBetting(gameStage.River);

        break;
      case gameStage.River:
        pauseGameLoop = true;
        logEvent("-River-");
        await doRiver();
        clearAllSpeechBubbles();
        doBetting(gameStage.Showdown);
        break;
      case gameStage.Showdown:
        //work out the winner
        pauseGameLoop = true;
        clearAllSpeechBubbles(true);
        logEvent("-Showdown-");
        doShowdown();
        currentStage = gameStage.GameOver;
        pauseGameLoop = false;
        break;
      case gameStage.GameOver:
        break;
    }
  }
  if (enableAnimationFrame) {
    raf = window.requestAnimationFrame(gameLoop);
  }
}

function drawBoard() {
  // draw the background board image
  try {
    ctx.drawImage(
      boardImage,
      boardPosition.x,
      boardPosition.y,
      boardPosition.width,
      boardPosition.height
    );
  } catch (error) {
    if (DEBUG) console.log("drawBoard", error);
  }
}

function drawPathRotator() {
  //draw the path rotator
  currentPos1 = (currentPos1 + 10) % svgLength;
  let point = svgOverlay.getPointAtLength(currentPos1);
  svgCircle1.setAttribute("cx", point.x);
  svgCircle1.setAttribute("cy", point.y);
}

// Render all the screen elements
function renderScreen() {
  try {
    gameObjectController.update();
    pot.update();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBoard();

    drawPathRotator();

    pot.draw();

    //draw the players cards
    players.forEach((player) => {
      player.draw();
    });

    // draw the community hand
    communityHand.drawCards();

    //draw the game objects
    gameObjectController.draw();
  } catch (error) {
    if (DEBUG) console.log(error);
  }
}

function resetFinishedBetting() {
  for (let i = 0; i < players.length; i++) {
    if (players[i].inPlay) {
      players[i].finishedBetting = false;
    }
  }
  if (DEBUG) console.log("Resetting betting flags");
}

function isEndRound() {
  // check for only 1 player left and everyone finished betting
  let activeCount = 0;
  let finishedBettingCount = 0;
  for (let i = 0; i < players.length; i++) {
    if (players[i].inPlay) {
      activeCount++;
      if (players[i].finishedBetting) {
        finishedBettingCount++;
      }
    }
  }

  if (activeCount < 2 || activeCount === finishedBettingCount) {
    if (DEBUG) console.log("Round finished");
    return true;
  }
  if (DEBUG) console.log("Round not finished");
  return false;
}

function getHighestBet() {
  let highest = -1;
  for (let i = 0; i < players.length; i++) {
    if (players[i].betAmount > highest) {
      highest = players[i].betAmount;
    }
  }
  if (DEBUG) console.log("Highest Bet: " + highest);
  return highest;
}

function playerSmallBlind(player) {
  if (smallBlind > player.money) {
    playerAllIn(player);
  }
  player.placeBet(smallBlind);
  pot.addAmount(smallBlind);
  player.setSpeechBubbleText("Small Blind");
  addStatusMessage(
    "Small Blind",
    avatarCenterLocations[player.playerName],
    50,
    4000
  );
  logEvent(player.playerName + " Small Blind $" + smallBlind);
}

function playerBigBlind(player) {
  if (bigBlind >= player.money) {
    playerAllIn(player);
  }
  player.placeBet(bigBlind);
  pot.addAmount(bigBlind);
  player.setSpeechBubbleText("Big Blind");
  addStatusMessage(
    "Big Blind",
    avatarCenterLocations[player.playerName],
    50,
    4000
  );
  logEvent(player.playerName + " Big Blind $" + bigBlind);
}

function playerFold(player) {
  player.inPlay = false;
  if (DEBUG) console.log(player.playerName + " Fold ");
  // add a speech bubble unless it is the human player
  if (player.playerName !== "Player1") {
    player.setSpeechBubbleText("Fold");
  }
  new Audio(SOUND_FOLD).play();
  addStatusMessage("Fold", avatarCenterLocations[player.playerName], 50, 4000);
  logEvent(player.playerName + " Fold");
}

function playerCall(player) {
  player.finishedBetting = true;
  let diff = getHighestBet() - player.betAmount;
  if (diff > 0) {
    if (diff >= player.money) {
      playerAllIn(player);
    }
    if (DEBUG) console.log(player.playerName + " Call");
    player.placeBet(diff);
    pot.addAmount(diff);
    // add a speech bubble unless it is the human player
    if (player.playerName !== "Player1") {
      player.setSpeechBubbleText("Call");
    }
    addStatusMessage(
      "Call",
      avatarCenterLocations[player.playerName],
      50,
      4000
    );
    logEvent(player.playerName + " Call $" + diff);
  } else {
    playerCheck(player);
  }
}

function playerCheck(player) {
  // do nothing
  player.finishedBetting = true;
  if (DEBUG) console.log(player.playerName + " Check");
  // add a speech bubble unless it is the human player
  if (player.playerName !== "Player1") {
    player.setSpeechBubbleText("Check");
  }
  addStatusMessage("Check", avatarCenterLocations[player.playerName], 50, 4000);
  logEvent(player.playerName + " Check ");
}

function playerAllIn(player) {
  player.finishedBetting = true;
  if (DEBUG) console.log(player.playerName + " All In");

  player.setSpeechBubbleText("All In");
  player.isAllIn = true;
  player.placeBet(player.money);
  addStatusMessage(
    "All In",
    avatarCenterLocations[player.playerName],
    50,
    4000
  );
  logEvent(player.playerName + " All In ");
}

function playerRaise(player, raiseAmount) {
  let diff = getHighestBet() - player.betAmount;
  let betTotal = diff + raiseAmount;

  if (betTotal >= player.money) {
    playerAllIn(player);
  }

  resetFinishedBetting();
  player.finishedBetting = true;

  if (DEBUG)
    console.log(
      player.playerName + " Raise $" + raiseAmount + " ($" + betTotal + ")"
    );
  console.log(betTotal);
  player.placeBet(betTotal);
  pot.addAmount(betTotal);
  // add a speech bubble unless it is the human player
  if (player.playerName !== "Player1") {
    player.setSpeechBubbleText("Raise $" + raiseAmount);
  }
  addStatusMessage("Raise", avatarCenterLocations[player.playerName], 50, 4000);
  logEvent(
    player.playerName + " Raise $" + raiseAmount + " ($" + betTotal + ")"
  );
}

async function doBetting(nextStage) {
  // pause the game loop
  pauseGameLoop = true;
  //resetPlayerBets();
  clearAllSpeechBubbles();

  while (!isEndRound()) {
    const playerNo = setNextPlayer(); // get the next player
    let player = players[playerNo];

    if (player.isAllIn) {
      player.finishedBetting = true;
      continue;
    }
    const highestBet = getHighestBet();
    const checkIsPossible = highestBet === 0;

    if (player.playerName === "Player1") {
      // human player
      await GetUserBettingDecision(player, highestBet, checkIsPossible).then(
        (result) => {
          switch (result.action) {
            case playerActions.Fold:
              playerFold(player);
              break;
            case playerActions.Check:
              if (checkIsPossible) {
                playerCheck(player);
              } else playerCall(player);
              break;
            case playerActions.Call:
              playerCall(player);
              break;
            case playerActions.Raise:
              playerRaise(player, result.amount);
              break;
            case playerActions.AllIn:
              playerAllIn(player);
              break;
          }
        }
      );
    } else {
      // Do AI betting
      doAIBetting(checkIsPossible, player);
    }
    await delay(500);
  }
  // clear the betting flag
  resetPlayerBets();
  if (!isMoreThanOnePlayerLeft()) currentStage = gameStage.Showdown;
  else currentStage = nextStage;

  pauseGameLoop = false;
}

function doAIBetting(checkIsPossible, player) {
  let handScore = evaluateHand(player);
  let move = Math.floor(Math.random() * 3);
  switch (move) {
    case 0:
      if (checkIsPossible) {
        playerCheck(player);
      } else {
        playerCall(player);
      }
      break;
    case 1:
      playerRaise(player, 10);
      break;
    case 2:
      if (
        currentStage === gameStage.PreFlop ||
        currentStage === gameStage.Flop
      ) {
        playerCall(player);
      } else {
        // playerFold(player);
        playerCall(player); // no folding
      }
      break;
  }
}

// determine whether to call or raise, depending on the handstrength, the current bet
// and the game stage
function determineCallorRaise(handStrength, player) {
  const currentBet = player.betAmount;
  switch (gameStage) {
    case gameStage.PreFlop:
      break;
    case gameStage.Flop:
      break;
    case gameStage.Turn:
      break;
    case gameStage.River:
      break;
  }
}

// determine whether to fold or continue. this returns a value depending on the
// game stage. the value needs to be higher if the bet is higher
function calculateDecisionThreshold(player) {
  const currentBet = player.betAmount;
  switch (gameStage) {
    case gameStage.PreFlop:
      break;
    case gameStage.Flop:
      break;
    case gameStage.Turn:
      break;
    case gameStage.River:
      break;
  }
}

// evaluate hand - routine to give a numeric score to the hand, taking into account
// the current game stage.
function evaluateHand(player) {
  const bestHandScore = getBestHandScore(player.hand);
  if (DEBUG) console.log(bestHandScore);
  let score = bestHandScore.score;

  switch (currentStage) {
    case gameStage.PreFlop:
      //increase the score for a high pair
      let pairScore = getOnePairScore(player.hand);
      if (
        (score >= handValues.onePair + cardValues.Jack &&
          score <= handValues.onePair + cardValues.Ace) ||
        (pairScore >= handValues.onePair + cardValues.Jack &&
          pairScore <= handValues.onePair + cardValues.Ace)
      ) {
        return 12;
      }
      if (Math.floor(score) == handValues.onePair) {
        return 8;
      }
      if (score == handValues.highCard + cardValues.Ace) {
        return 5;
      }
      const rankdiff = Math.abs(player.hand[0] - player.hand[1]);
      if (rankdiff == 1 || rankdiff == 2) {
        return 4;
      }
      return score;
    case gameStage.Flop:
      return score;
    case gameStage.Turn:
      return score;
    case gameStage.River:
      return score;
  }
  return -1;
}

function getRemainingCards(hand) {
  let deck = new Deck();
  deck.newDeck();
  hand.forEach((card) => {
    deck.removeCard(card);
  });
  return deck.deck;
}

function getBestHandScore(hand) {
  let max = false;
  if (hand) {
    let combinations = getCombinations(
      hand,
      Math.min(hand.length, Math.min(hand.length, 5))
    );

    combinations.forEach((hand) => {
      let handValue = getHandValue(hand);
      if (!max || Number(handValue.score) > Number(max.score)) {
        max = handValue;
      }
    });
  }
  if (DEBUG) console.log("Best hand: ", max);
  return max;
}

function getUnknownCardCombinations(remainingCards, lengthOfCombination) {
  const combinations = [];

  function backtrack(startIndex, currentCombination) {
    if (currentCombination.length === lengthOfCombination) {
      combinations.push([...currentCombination]);
      return;
    }
    for (let i = startIndex; i < remainingCards.length; i++) {
      currentCombination.push(remainingCards[i]);
      backtrack(i + 1, currentCombination);
      currentCombination.pop();
    }
  }

  backtrack(0, []);
  return combinations;
}

function getHandCombinations(hand, maxCardsToChooseFrom = 7) {
  let combinations = [];
  let remainingCards = getRemainingCards(hand);
  let unknownCardCombinations = getUnknownCardCombinations(
    remainingCards,
    maxCardsToChooseFrom - hand.length
  );
  unknownCardCombinations.forEach((c) => {
    let newHand = hand.concat(c);
    let newHandCombinations = getCombinations(newHand, 5);
    newHandCombinations.forEach((n) => {
      combinations.push(n);
    });
  });
  return combinations;
}

function getBestPossibleHand(hand, maxCardsToChooseFrom = 7) {
  let combinations = getHandCombinations(hand, maxCardsToChooseFrom);
  let max = false;
  combinations.forEach((combination) => {
    let handValue = getHandValue(combination);
    if (!max || handValue.score > max.score) {
      max = handValue;
    }
  });
  return max;
}

function getWinningPercentageForCurrentHand(hand, community) {
  let ownHandScore = getBestHandScore(hand);
  let otherCombinations = getHandCombinations(community);
  let wins = 0;
  otherCombinations.forEach((combination) => {
    let score = getBestHandScore(combination);
    if (ownHandScore.score >= score.score) {
      wins++;
    }
  });
  var odds = ((wins / otherCombinations.length) * 100).toFixed(2);
  return odds;
}

async function GetUserBettingDecision(player, highestBet, checkIsPossible) {
  // need to configure the modal with values that are applicable
  let buttonsArray = [];
  let showSlider = false;
  buttonsArray.push(buttonFold);
  if (checkIsPossible) {
    buttonsArray.push(buttonCheck);
  } else if (player.money >= highestBet) {
    buttonsArray.push(buttonCall);
  }
  if (player.money > highestBet + minimumBet) {
    showSlider = true;
    buttonsArray.push(buttonRaise);
  }
  if (player.money > 0 && player.money < highestBet) {
    buttonsArray.push(buttonAllIn);
  }
  let callAmount = highestBet - player.betAmount;
  let minimumRaiseAmount = highestBet + minimumBet;
  let maximumRaiseAmount = player.money - callAmount;
  showUserDialog(
    callAmount,
    minimumRaiseAmount,
    maximumRaiseAmount,
    buttonsArray,
    showSlider
  );
  let listener;
  const promise = new Promise((resolve) => {
    // add a listener for the user input
    listener = document.addEventListener("userInputEvent", () => {
      resolve(userEvent.data);
    });
  });
  const result = await promise;
  // remove the listener
  document.removeEventListener("userInputEvent", listener);
  hideUserDialog();
  console.log("User bet result", result);
  return result;
}

function showUserDialog(
  callAmount,
  minimumRaise,
  maximumRaise,
  buttons,
  showSlider = true
) {
  sliderBet.min = minimumRaise;
  sliderBet.max = Math.min(maximumRaise, maximumBet);
  sliderBet.value = minimumRaise;
  inputSliderValue.value = sliderBet.value;
  const allButtons = [
    buttonFold,
    buttonCall,
    buttonRaise,
    buttonCheck,
    buttonAllIn,
  ];
  buttonCall.innerText = "Call ($" + callAmount + ")";
  // hide all the buttons first
  allButtons.forEach((button) => (button.style.display = "none"));
  // now show the applicable ones
  buttons.forEach((button) => (button.style.display = "inline"));
  let sliderDisplay = "inline";
  if (!showSlider) sliderDisplay = "none";
  inputSliderValue.style.display = sliderDisplay;
  sliderBet.style.display = sliderDisplay;
  modalPlayerInput.show();
}

function hideUserDialog() {
  modalPlayerInput.close();
}

function showRoundWinnerDialog(text) {
  new Audio(SOUND_LEVELCOMPLETE).play();
  document.getElementById("roundWinnerLabel").innerHTML = text;
  roundWinnerDiv.classList.remove("d-none");
}

function hideRoundWinnerDialog() {
  roundWinnerDiv.classList.add("d-none");
}
function showGameWinnerDialog(player) {
  new Audio(SOUND_LEVELCOMPLETE).play();
  gameWinnerDiv.classList.remove("d-none");
}

function hideGameWinnerDialog() {
  gameWinnerDiv.classList.add("d-none");
}

async function doBlind() {
  addStatusMessage(
    "Blinds",
    { x: canvas.width / 2, y: canvas.height / 2 },
    200,
    3000
  );
  let smallBlindPlayerNo = setNextPlayer();
  let smallBlindPlayer = players[smallBlindPlayerNo];
  playerSmallBlind(smallBlindPlayer);
  await delay(1000);
  // // big blind
  let bigBlindPlayerNo = setNextPlayer();
  let bigBlindPlayer = players[bigBlindPlayerNo];
  playerBigBlind(bigBlindPlayer);
  await delay(1000);
}

async function doDeal() {
  addStatusMessage(
    "Pre-Flop",
    { x: canvas.width / 2, y: canvas.height / 2 },
    200,
    3000
  );

  for (let i = 0; i < players.length; i++) {
    await dealCard(players[i], 2);
  }
}

async function doFlop() {
  addStatusMessage(
    "Flop",
    { x: canvas.width / 2, y: canvas.height / 2 },
    200,
    3000
  );
  await dealCard(communityHand, 3);
}

async function doTurn() {
  addStatusMessage(
    "Turn",
    { x: canvas.width / 2, y: canvas.height / 2 },
    200,
    3000
  );
  await dealCard(communityHand, 1);
}

async function doRiver() {
  addStatusMessage(
    "River",
    { x: canvas.width / 2, y: canvas.height / 2 },
    200,
    3000
  );
  await dealCard(communityHand, 1);
}

function doShowdown() {
  let winners = [];
  let highScore = -1;

  let winnerText = "";

  for (let i = 0; i < players.length; i++) {
    if (players[i].inPlay) {
      players[i].hand.forEach((card) => (card.faceUp = true)); // turn up all the cards
      let score = getBestHandScore(players[i].hand.concat(communityHand.hand));
      score.description = score.description.replace("Sixs", "Sixes");
      if (DEBUG) console.log(players[i], score);
      if (score.score < highScore) {
        continue;
      }
      if (score.score > highScore) {
        winners = [];
      }
      // hack if there was no community hand to remove the hand identifier description
      if (communityHand.hand.length === 0) {
        score = { score: 0, description: "" };
      }
      winners.push({ player: players[i], score: score });
      highScore = score.score;
    }
  }
  let potAmount = pot.payOut();
  logEvent("Winner Pot $" + potAmount);
  winners.forEach((winner) => {
    winner.player.money += Math.floor(potAmount / winners.length);
    winnerText +=
      "<strong>" +
      winner.player.playerName +
      "</strong> <span style='color: #ffff00;'>" +
      winner.score.description +
      "</span><br>";
    logEvent(winner.player.playerName + "-" + winner.score.description);
  });
  winnerText =
    winnerText +
    "<strong><span style='color: #ff0000;'> POT $" +
    potAmount +
    "</span></strong>";
  showRoundWinnerDialog(winnerText);
}

function resetPlayerBets(allBets = false) {
  console.log("Resetting player bets");
  players.forEach((player) => {
    player.clearBet(allBets);
  });
}

// event handlers

// Start Button Pressed
function onButtonStart() {
  // get the player count
  let playerCount = parseInt(document.getElementById("playerCount").value);
  if (playerCount < 1) {
    playerCount = 1;
  }
  if (playerCount > 3) {
    playerCount = 3;
  }
  //hide the introduction div
  document.getElementById("introduction").classList.add("d-none");
  startGame(playerCount + 1);
}

// Fold Button Pressed
function onButtonFold() {
  if (DEBUG) console.log("Fold");
  new Audio(SOUND_BUTTONCLICK).play();
  userEvent.data = {
    action: playerActions.Fold,
  };
  document.dispatchEvent(userEvent);
}

// Raise Button Pressed
function onButtonRaise() {
  if (DEBUG) console.log("Raise");
  new Audio(SOUND_BUTTONCLICK).play();
  userEvent.data = {
    action: playerActions.Raise,
    amount: parseInt(inputSliderValue.value),
  };
  document.dispatchEvent(userEvent);
}

// Call Button Pressed
function onButtonCall() {
  if (DEBUG) console.log("Call");
  new Audio(SOUND_BUTTONCLICK).play();
  userEvent.data = {
    action: playerActions.Call,
  };
  document.dispatchEvent(userEvent);
}

// Check button Pressed
function onButtonCheck() {
  if (DEBUG) console.log("Check");
  new Audio(SOUND_BUTTONCLICK).play();
  userEvent.data = {
    action: playerActions.Check,
  };
  document.dispatchEvent(userEvent);
}
function onButtonAllIn() {
  if (DEBUG) console.log("All in");
  new Audio(SOUND_BUTTONCLICK).play();
  userEvent.data = {
    action: playerActions.AllIn,
  };
  document.dispatchEvent(userEvent);
}

function setAudioControls(state) {
  audio.controls = state;
}

function onMusicCheckChange() {
  if (checkMusicEnabled.checked) {
    enableAudio = true;
    playAudio();
  } else {
    enableAudio = false;
    stopAudio();
  }
  //localStorage.setItem("EnableAudio", checkMusicEnabled.checked);
  saveSettings();
  //setAudioControls(enableAudio);
}

// new game button clicked in options
function onNewGame() {
  location.reload();
}
// Log an event
function logEvent(event) {
  logTextArea.value += event + "\n";
}

// when the input for the number of players changes, make sure it is valid
function onInputPlayerCountChange() {
  if (inputPlayerCount.value < 1 || inputPlayerCount.value > 3) {
    alert("Enter between 1 and 3 opponents");
    inputPlayerCount.value = DEFAULT_ROBOT_PLAYERS;
  }
}

function onInputMinimumBetChange() {
  if (
    inputMinimumBet.value < 2 ||
    inputMinimumBet.value > Math.floor(inputStartMoney.value / 10)
  ) {
    alert(
      "Enter between 2 and " +
        Math.floor(inputStartMoney.value / 10) +
        " for minimum bet"
    );
    inputMinimumBet.value = Math.floor(inputStartMoney.value / 10);
    saveSettings();
  }
}

function onInputStartMoneyChange() {
  //
  if (inputStartMoney.value < 100 || inputStartMoney.value > 10000) {
    alert("Enter between 100 and 10000 for starting money.");
    inputStartMoney.value = START_MONEY;
  }
  if (inputMinimumBet.value > Math.floor(inputStartMoney.value / 10)) {
    inputMinimumBet.value = Math.floor(inputStartMoney.value / 10);
  }
  saveSettings();
}

function onButtonRoundOk() {
  hideRoundWinnerDialog();
  startNewRound();
}

function loadSettings() {
  enableAudio = localStorage.getItem("EnableAudio")
    ? localStorage.getItem("EnableAudio") === "true"
    : true;
  startingMoney = Number(localStorage.getItem("StartingMoney"));
  if (!startingMoney) {
    startingMoney = START_MONEY;
  }
  minimumBet = Number(localStorage.getItem("MinimumBet"));
  if (!minimumBet) {
    minimumBet = MINIMUM_BET;
  }

  checkMusicEnabled.checked = enableAudio;
  setAudioControls(enableAudio);
  inputStartMoney.value = startingMoney;
  inputMinimumBet.value = minimumBet;
  bigBlind = minimumBet;
  smallBlind = Math.floor(bigBlind / 2);
  maximumBet = (startingMoney * 50) / 100; //set maximum bet to 50% of starting money
}

function saveSettings() {
  enableAudio = checkMusicEnabled.checked;
  startingMoney = Number(inputStartMoney.value);
  minimumBet = Number(inputMinimumBet.value);

  localStorage.setItem("EnableAudio", enableAudio);
  localStorage.setItem("StartingMoney", startingMoney);
  localStorage.setItem("MinimumBet", minimumBet);
}

/////////////////////////////////////////////////////// START HERE ///////////////////////////////////////////////////////////

let deck;
let players;
let communityHand;
let currentStage;
let gameObjectController;
let pauseGameLoop;
let pot;
let minimumBet;
let maximumBet;
let startingMoney;
let bigBlind;
let smallBlind;
// let enableAudio = localStorage.getItem("EnableAudio")
//   ? localStorage.getItem("EnableAudio") === "true"
//   : true;
let enableAudio;
let raf;
let enableAnimationFrame = false;

// path rotator elements
let svgOverlay = document.getElementsByClassName("cls-svg")[0];
let svgCircle1 = document.getElementById("svg-circle1");
let svgLength = svgOverlay.getTotalLength();
let currentPos1 = svgLength / 4;

// Document HTML controls

const buttonNewGame = document.getElementById("newGameButton");
const inputStartMoney = document.getElementById("inputStartingMoney");
const inputMinimumBet = document.getElementById("inputMinimumBet");
const checkShowCardsOverride = document.getElementById("alwaysShowCards");
const checkMusicEnabled = document.getElementById("musicEnabled");
const buttonStart = document.getElementById("startButton");
const logTextArea = document.getElementById("logTextArea");
const modalPlayerInput = document.getElementById("modalPlayerInput");
const roundWinnerDiv = document.getElementById("roundWinner");
const buttonRoundOk = document.getElementById("roundOkButton");
const gameWinnerDiv = document.getElementById("gameWinner");
const inputSliderValue = document.getElementById("sliderValue");
const sliderBet = document.getElementById("betSlider");
const buttonFold = document.getElementById("fold");
const buttonCall = document.getElementById("call");
const buttonRaise = document.getElementById("raise");
const buttonCheck = document.getElementById("check");
const buttonAllIn = document.getElementById("allin");
const inputPlayerCount = document.getElementById("playerCount");
const buttonStartAgain = document.getElementById("noMoreCashButton");
const audio = document.getElementById("audio");

//
// ADD EVENT LISTENERS
//

checkMusicEnabled.addEventListener("change", onMusicCheckChange);
// add even listener for the bet slider
sliderBet.addEventListener("input", function () {
  inputSliderValue.value = sliderBet.value; // Update the value of the text input
});
// fold button event listener
buttonFold.addEventListener("click", onButtonFold);
// call button event listener
buttonCall.addEventListener("click", onButtonCall);
// raise button event listener
buttonRaise.addEventListener("click", onButtonRaise);
// check button event listener
buttonCheck.addEventListener("click", onButtonCheck);
buttonAllIn.addEventListener("click", onButtonAllIn);
// Add the audio event listener for when song has finished
audio.addEventListener("ended", playAudio);
inputPlayerCount.addEventListener("change", onInputPlayerCountChange);
inputStartMoney.addEventListener("change", onInputStartMoneyChange);
inputMinimumBet.addEventListener("change", onInputMinimumBetChange);
buttonRoundOk.addEventListener("click", onButtonRoundOk);
buttonStartAgain.addEventListener("click", onNewGame);
buttonNewGame.addEventListener("click", onNewGame);

// wait for everything to load, then enable the start button
window.addEventListener(
  "load",
  function () {
    canvas.width = boardPosition.width;
    canvas.height = boardPosition.height;
    //add an event listener for the start button click
    buttonStart.addEventListener("click", onButtonStart);
    //show the board in the background
    loadSettings();
    drawBoard();
  },
  false
);

// create the custom user event for user betting input
const userEvent = new Event("userInputEvent", {
  bubbles: true,
  cancelable: true,
});
