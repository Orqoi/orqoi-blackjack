const startBtn = document.querySelector(".start-btn");
const goBtn = document.querySelector(".go-btn");
const betBtn = document.querySelector(".bet-value");
const page1 = document.querySelector(".page-1");
const page2 = document.querySelector(".page-2");
const page3 = document.querySelector(".page-3");
const dealerCards = document.querySelector(".dealer-cards");
const playerCards = document.querySelector(".player-cards");
const currentBalance = document.querySelector(".current-balance");
const gameText = document.querySelector(".game-text");
const gameButtons = document.querySelector(".game-buttons");
const maxBalance = document.querySelector(".max-balance");

startBtn.addEventListener("click", function(){
	let player = new Player(playerCards, 100);
	let computer = new Computer(dealerCards);
	let max = localStorage.getItem('maxBal');
	if(!max){
		localStorage.setItem('maxBal', 100);
	}
	else{
		updateMax();
	}
	page1.style.display = "none";
	page2.style.display = "initial";
	page3.style.display = "none";

	function increment(n){
		if (parseInt(betBtn.innerText) + n > player.balance){
			betBtn.innerText = player.balance;
		}
		else{
			betBtn.innerText = parseInt(betBtn.innerText) + n;
		}
	}

	function decrement(n){
		if (betBtn.innerText > n){
			betBtn.innerText -= n;
		}
		else{
			betBtn.innerText = 1;
		}
	}

	document.querySelector(".minus-one").onclick = () => decrement(1);
	document.querySelector(".minus-five").onclick = () => decrement(5);
	document.querySelector(".plus-one").onclick = () => increment(1);
	document.querySelector(".plus-five").onclick = () =>increment(5);

	function lose(bet, text=""){
		player.deduct(bet);
		updateBalance();
		if(text == ""){
			gameText.innerText = "You Lose";
		}
		else{
			gameText.innerText = text;
		}
		
		gameEnd();
	}

	function win(bet, text=""){
		player.add(bet);
		updateBalance();
		if(text == ""){
			gameText.innerText = "You Win";
		}
		else{
			gameText.innerText = text;
		}
		gameEnd();
	}

	function draw(){
		gameText.innerText = "Push";
		gameEnd();
	}

	function updateBalance(){
		currentBalance.innerText = `Current Balance: $${player.balance}`;
		updateMax();
	}

	function updateMax(){
		let maxBal = localStorage.getItem("maxBal");
		if (maxBal < player.balance){
			localStorage.setItem("maxBal", player.balance);
			maxBalance.innerText = `Highest Balance Reached: $${player.balance}`;
		}
		else{
			maxBalance.innerText = `Highest Balance Reached: $${maxBal}`;
		}
	}

	function fullClear(){
		dealerCards.innerHTML = "";
		playerCards.innerHTML = "";
		gameText.innerText = "";
		computer.reset();
		player.reset();
	}

	function gameEnd(){
		if (document.querySelector(".hit-btn") != null){
			gameButtons.removeChild(document.querySelector(".hit-btn"));
			gameButtons.removeChild(document.querySelector(".stand-btn"));
		}
		let endButton = document.createElement("button");
		endButton.innerText = "Play Again?";
		endButton.setAttribute('class', 'go-btn end-btn');
		gameButtons.appendChild(endButton);
		endButton.addEventListener("click", function(){
			fullClear();
			
			if (player.balance == 0){
				alert("Game Over!");
				location.reload();
			}
			else{
				page1.style.display = "none";
				page2.style.display = "initial";
				page3.style.display = "none";
			}
			
		});
	}
	
	goBtn.addEventListener("click", function(){
		let bet = parseInt(betBtn.innerText);
		if (isNaN(bet)){
			alert("Nice try");
			betBtn.innerText = 1;
			return;
		}
		else if (bet > player.balance){
			alert("Insufficient Balance");
			return;
		}
		let deck = new Deck(generateDeck());

		let hit = document.createElement("button");
		hit.innerText = "Hit";
		hit.setAttribute('class', 'hit hit-btn');
		gameButtons.appendChild(hit);

		let stand = document.createElement("button");
		stand.innerText = "Stand";
		stand.setAttribute('class', 'stand stand-btn');
		gameButtons.appendChild(stand);

		hit.onclick = function(){
			player.draw(deck, 1);
			if (player.sum() > 21){
				lose(bet);
			}
		};

		stand.onclick = function(){
		//prompt computer for next move
			let choice = "";
			while (choice != "stand"){
				choice = computer.choice(player);
				if (choice == "hit"){
					computer.draw(deck, 1);
					if (computer.sum() > 21){
						win(bet);
						return;
					}
				}
			}
			
			if (computer.sum() < player.sum()){
				win(bet);
			}
			else if (computer.sum() > player.sum()){
				lose(bet);
			}
			else{
				draw();
			}
		};
		page1.style.display = "none";
		page2.style.display = "none";
		page3.style.display = "initial";
		hit.style.display = "initial";
		stand.style.display = "initial";
		if (document.querySelector(".end-btn") != null){
			gameButtons.removeChild(document.querySelector(".end-btn"));
		}
		computer.draw(deck, 2);
		player.draw(deck, 2);
		if (player.sum() == 21 && computer.sum() == 21){
			draw();
		}
		else if (player.sum() == 21){
			win(bet, "Player Blackjack");
		}
		else if (computer.sum() == 21){
			lose(bet, "Computer Blackjack");
		}
		
	});
});

/* game logic */
const SUITS = ['club', 'diamond', 'heart', 'spade'];
const VALUES = ['1','2','3','4','5','6','7','8','9','10','jack','queen','king'];
const numbers = {
	'1': 1,
	'2':2,
	'3':3,
	'4':4,
	'5':5,
	'6':6,
	'7':7,
	'8':8,
	'9':9,
	'10':10,
	'jack':10,
	'queen':10,
	'king':10
};

class Deck {
	constructor(cards){
		this.cards = cards;
	}

	get numberOfCards(){
		return this.cards.length;
	}

	randomCard(){
		let randomElement = this.cards[Math.floor(Math.random() * this.cards.length)];
		const index = this.cards.indexOf(randomElement);
		if (index > -1) {
			this.cards.splice(index, 1);
		}
		return randomElement;
	}

}

class Card {
	constructor(suit, value, image){
		this.suit = suit;
		this.value = value;
		this.image = image;
		this.displayed = true;
	}

	number(){
		return numbers[this.value];
	}

	src(){
		if (this.displayed){
			return this.image;
		}
		else{
			return "./2x/back-maroon.png";
		}
	}

	display(){
		this.displayed = true;
	}

}

class Computer{
	constructor(node){
		this.node = node;
		this.cards = [];
	}

	reset(){
		this.cards = [];
	}

	sum(){
		let total = 0;
		let numberOfAces = 0;

		for (let card of this.cards){
			if (card.value == '1'){
				numberOfAces++;
				total++;
			}
			else{
				total += card.number();
			}
		}

		for (let aceCount = 0; aceCount < numberOfAces; aceCount++){
			if (total + 10 <= 21){
				total += 10;
			}
		}

		return total;
	}

	draw(deck, numCards){
		for(let i = 0; i < numCards; i++){
			let card = deck.randomCard();
			this.cards.push(card);
			let oImg = document.createElement("img");
			oImg.setAttribute('src', card.src());
			oImg.setAttribute('class', 'card');
			this.node.appendChild(oImg);
		}
	}


	choice(player){
		if (this.sum() >= player.sum() || player.sum() > 21){
			return 'stand';
		}
		else{
			return 'hit';
		}
	}
}

class Player extends Computer{
	constructor(node, balance){
		super(node);
		this.cards = [];
		this.balance = balance;
	}

	deduct(bet){
		this.balance -= bet;
	}

	add(bet){
		this.balance += bet;
	}
}

function generateDeck(){
	return SUITS.flatMap(suit=> {
		return VALUES.map(value => {
			let name = `./2x/${suit}_${value}.png`;
			return new Card(suit, value, name);
		});
	});
}

/*
TODO:
1. restart game once game over, without reloading window.
2. hide one card initially for computer then display it after player stand
3. write more comments, segment and clean up code
4. add more aesthetics
*/