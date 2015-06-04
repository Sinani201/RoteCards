var cardList = [];

function makeCardRow() {
	var tr = document.createElement("tr");
	tr.className = "fc-row";

	tr.getIndex = function() {
		return Array.prototype.indexOf.call(this.parentNode.childNodes, this);
	};

	// enabled checkbox
	var td_enabled = document.createElement("td");
	td_enabled.className = "fc-enabled";

	var checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.checked = true;

	tr.setEnabled = function(b) {
		checkbox.checked = b;
	};

	tr.isEnabled = function() {
		return checkbox.checked;
	}

	td_enabled.appendChild(checkbox);

	// flashcard question textbox
	var td_cardq = document.createElement("td");
	td_cardq.className = "fc-cardq";

	var input_cardq = document.createElement("input");
	input_cardq.type = "text";

	tr.focusQuestion = function() {
		input_cardq.focus();
	};

	tr.setQuestion = function(text) {
		input_cardq.value = text;
	};

	tr.getQuestion = function() {
		return input_cardq.value;
	};

	td_cardq.appendChild(input_cardq);

	// flashcard answer textbox
	var td_carda = document.createElement("td");
	td_carda.className = "fc-carda";

	var input_carda = document.createElement("input");
	input_carda.type = "text";

	tr.setAnswer = function(text) {
		input_carda.value = text;
	};

	tr.getAnswer = function() {
		return input_carda.value;
	}

	// when the user presses the enter key in a question box, advance to the
	// answer box
	input_cardq.onkeypress = function(e) {
		if (!e) e = window.event;
		if (e.keyCode == "13") {
			input_carda.focus();
			return false;
		}
	};

	// when the user presses the enter key in an answer box, advance to the
	// next question
	input_carda.onkeypress = function(e) {
		if (!e) e = window.event;
		if (e.keyCode == "13") {
			var sibling = this.parentNode.parentNode.nextSibling;
			if (sibling) {
				//sibling.getElementsByClassName("fc-cardq")[0].children[0].focus();
				sibling.focusQuestion();
			} else {
				addEmptyCard();
			}
			return false;
		}
	};

	td_carda.appendChild(input_carda);

	// score box
	var td_score = document.createElement("td");
	td_score.className = "fc-cards";

	var input_cards = document.createElement("input");
	input_cards.type = "text";
	input_cards.disabled = true;
	input_cards.className = "fc-scoreinput";

	tr.setScore = function(score) {
		input_cards.value = score;
	};
	tr.getScore = function() {
		return 1 * input_cards.value;
	};

	td_score.appendChild(input_cards);

	// duplicate button
	var td_dup = document.createElement("td");
	td_dup.className = "fc-td-dup";

	var button_dup = document.createElement("button");
	button_dup.className = "fc-b fc-b-dup";
	button_dup.appendChild(document.createTextNode("Duplicate"));
	button_dup.onclick = function() {
		newCard = addEmptyCard(tr.getIndex() + 1);
		newCard.setQuestion(tr.getQuestion());
		newCard.setAnswer(tr.getAnswer());
		//newCard.setImportance(tr.getImportance());
	};

	td_dup.appendChild(button_dup);

	// swap button
	var td_swap = document.createElement("td");
	td_swap.className = "fc-td-swap";

	var button_swap = document.createElement("button");
	button_swap.className = "fc-b fc-b-swap";
	button_swap.appendChild(document.createTextNode("Swap"));
	button_swap.onclick = function() {
		q = tr.getQuestion();
		tr.setQuestion(tr.getAnswer());
		tr.setAnswer(q);
	};

	td_swap.appendChild(button_swap);

	// remove button
	var td_remove = document.createElement("td");
	td_remove.className = "fc-td-remove";

	var button_remove = document.createElement("button");
	button_remove.className = "fc-b fc-b-remove";
	button_remove.appendChild(document.createTextNode("Remove"));
	button_remove.onclick = function() {
		removeCard(tr.getIndex());
	};

	td_remove.appendChild(button_remove);

	// put all of the columns into the row
	tr.appendChild(td_enabled);
	tr.appendChild(td_cardq);
	tr.appendChild(td_carda);
	tr.appendChild(td_score);
	tr.appendChild(td_dup);
	tr.appendChild(td_swap);
	tr.appendChild(td_remove);

	return tr;
}

function Card(enabled, question, answer, score, importance) {
	this.tableRow = makeCardRow();

	this.isEnabled = this.tableRow.isEnabled;
	this.setEnabled = this.tableRow.setEnabled;
	this.setEnabled(enabled);

	this.getQuestion = this.tableRow.getQuestion;
	this.setQuestion = this.tableRow.setQuestion;
	this.setQuestion(question);

	this.getAnswer = this.tableRow.getAnswer;
	this.setAnswer = this.tableRow.setAnswer;
	this.setAnswer(answer);
	
	this.getScore = this.tableRow.getScore;
	this.setScore = this.tableRow.setScore;
	this.setScore(score);

	this.i = importance;
	this.getImportance = function() {
		return this.i;
	};
	this.setImportance = function(imp) {
		this.i = imp;
	};
	this.setImportance(importance);

	this.getSnapshot = function() {
		return {
			q: this.getQuestion(),
			a: this.getAnswer(),
			e: this.isEnabled(),
			s: this.getScore(),
			i: this.getImportance()
		};
	};
}

function newBlankCard() {
	return new Card(true, "", "", -1, 3);
}

// add a new card to the card list and DOM.
// optional argument index is the desired index of where the card will go.
// if omitted, will place the card at the end of the list.
function addEmptyCard(index) {
	var card = newBlankCard();
	var newRow = card.tableRow;
	var table = document.getElementById("flashcards-table");
	if (index % 1 === 0) {
		table.insertBefore(newRow, table.childNodes[index]);
		cardList.splice(index, 0, card);
	} else {
		table.appendChild(newRow);
		cardList.push(card);
	}

	newRow.focusQuestion();
	return card;
}

// removes the card at a certain index
function removeCard(index) {
	cardList.splice(index, 1);
	var table = document.getElementById("flashcards-table");
	table.removeChild(table.childNodes[index]);
}

function removeChildren(parent) {
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
}

function clearAllCards() {
	removeChildren(document.getElementById("flashcards-table"));
	cardList = [];
}

/**
 * Takes an array of card snapshot objects and writes it to the text entry fields.
 */
function importCards(cards) {
	clearAllCards();
	for (var i = 0; i < cards.length; i++) {
		var c = addEmptyCard();
		if (typeof cards[i].e !== "undefined") {
			c.setEnabled(cards[i].e);
		}
		if (typeof cards[i].q !== "undefined") {
			c.setQuestion(cards[i].q);
		}
		if (typeof cards[i].a !== "undefined") {
			c.setAnswer(cards[i].a);
		}
		if (typeof cards[i].s !== "undefined") {
			c.setScore(cards[i].s);
		}
		if (typeof cards[i].i !== "undefined") {
			c.setImportance(cards[i].i);
		}
	}
}

/**
 * Returns an array of the card objects that the user is editing.
 */
function exportCards() {
	return cardList.map(function(c) {return c.getSnapshot();});
}

function quizMode() {
	document.getElementById("flashcard-edit").style.display = "none";
	document.getElementById("quiz").style.display = "block";
}

function editMode() {
	document.getElementById("flashcard-edit").style.display = "block";
	document.getElementById("quiz").style.display = "none";
}

var currentCard = null;
function getCurrentCard() {
	return currentCard;
}

function presentCard(card) {
	currentCard = card;

	// show the user the question
	var div_question = document.getElementById("quiz-question");
	removeChildren(div_question);
	div_question.appendChild(document.createTextNode(card.getQuestion()));

	// fill in the real answer (this is hidden unless the answer needs to be verified)
	var div_realanswer = document.getElementById("quiz-realanswer");
	removeChildren(div_realanswer);
	div_realanswer.appendChild(document.createTextNode(card.getAnswer()));

	var answerbox = document.getElementById("quiz-answerbox");
	if (card.getScore() < 0) {
		answerbox.value = card.getAnswer();
		answerbox.disabled = true;
		document.getElementById("quiz-firsttime").style.display = "block";
		document.getElementById("quiz-firsttime").focus();
	} else {
		// clear the user entry box
		answerbox.disabled = false;
		answerbox.value = "";
		answerbox.focus();
		document.getElementById("quiz-firsttime").style.display = "none";
	}
}

var verifying = false;
function isVerifying() {
	return verifying;
}

function verifyCard() {
	document.getElementById("quiz-answerbox").disabled = true;
	document.getElementById("quiz-realanswer").style.display = "block";
	document.getElementById("quiz-verifyresponse").style.display = "block";
	document.getElementById("quiz-verifyresponse").focus();
	verifying = true;
}

function unverify() {
	document.getElementById("quiz-answerbox").disabled = false;
	document.getElementById("quiz-realanswer").style.display = "none";
	document.getElementById("quiz-verifyresponse").style.display = "none";
	verifying = false;
}

///////////////////////////////////

function shuffle(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}

	return array;
}

function fac(num) {
	var rval=1;
	for (var i = 2; i <= num; i++)
	rval = rval * i;
	return rval;
}

function getCardsForQuiz(slider, allCards, numberOfCards) {
	// sort the items by importance, and within each importance, sort randomly
	allCards = allCards.filter(function(a) {
		return a.isEnabled();
	}).sort(function(a, b) {
		return a.getImportance() - b.getImportance();
	});

	if (allCards.length <= numberOfCards) {
		return allCards;
	}

	var starti = 0;
	for (var endi = 0; endi <= allCards.length; endi++) {
		if (endi === allCards.length ||
				allCards[endi].getImportance() !== allCards[starti].getImportance()) {
			Array.prototype.splice.apply(
					allCards, [starti, endi-starti].concat(
						shuffle(allCards.slice(starti, endi))));
			starti = endi;
		}
	}

	// find the min and max score so we can find out how many buckets are needed
	var minScore = allCards[0].getScore();
	var maxScore = allCards[0].getScore();
	for (var i = 0; i < allCards.length; i++) {
		if (allCards[i].getScore() < minScore) {
			minScore = allCards[i].getScore();
		} else if (allCards[i].getScore() > maxScore) {
			maxScore = allCards[i].getScore();
		}
	}

	var bucketCount = maxScore - minScore + 1;
	var buckets = [];
	// Poisson distribution based on score-- the slider decides if we want to
	// focus on high or low scoring items, and this picks items to test based
	// on that
	var p = []
	for (var i = 0; i < bucketCount; i++) {
		buckets.push([]);
		p.push((Math.pow(slider, i) / fac(i)) * Math.exp(-slider));
	}
	

	// sort the associations into buckets based on score
	for (var i = 0; i < allCards.length; i++) {
		buckets[allCards[i].getScore() - minScore].push(allCards[i]);
	}

	itemsToTest = [];
	while (itemsToTest.length < numberOfCards) {
		var x = Math.random();

		for (var i = 0; i < buckets.length; i++) {
			if (x < p[i]) {
				if (buckets[i].length > 0) {
					itemsToTest.push(buckets[i].pop());
					break;
				}
			}
			x -= p[i];
		}
	}

	return itemsToTest;
}

// a list of cards, with the first element being the next card to test
var quizQueue = [];
// a list of card-int pairings, with quizSchedule[n][1] being the unix time of
// when this card should be displayed next. Cards at the beginning should have
// the earliest times
var quizSchedule = [];

function initQuiz(cards) {
	quizQueue = cards;
	quizSchedule = [];
}

// returns the next card for the current quiz, or null if the quiz should end
function nextCard() {
	if (quizSchedule.length > 0 && quizSchedule[0][1] < Date.now()) {
		return quizSchedule.shift()[0];
	} else if (quizQueue.length > 0) {
		return quizQueue.pop();
	} else {
		return null;
	}
}

function scheduleCard(card) {
	// schedule the card to a time in the future based on its score.
	quizSchedule.push([card, Date.now() + 1000 * Math.pow(5, card.getScore())]);
	quizSchedule.sort(function(a, b) {
		return a[1] - b[1];
	});
}

function advance(prevCard) {
	unverify();
	scheduleCard(prevCard);
	next = nextCard();
	if (next === null) {
		editMode();
	} else {
		presentCard(next);
	}
}

function correctAnswer(card) {
	card.setScore(card.getScore() + 1);
	advance(card);
}

function incorrectAnswer(card) {
	card.setScore(0);
	advance(card);
}

function checkAnswer(card, answer) {
	if (card.getAnswer().toLowerCase() === answer.toLowerCase()) {
		correctAnswer(card);
	} else {
		verifyCard();
	}
}

window.onload = function() {
	document.getElementById("newfc").onclick = addEmptyCard;

	document.getElementById("import-button").onclick = function() {
		importCards(JSON.parse(document.getElementById("import-box").value));
	};

	document.getElementById("export-button").onclick = function() {
		document.getElementById("import-box").value = JSON.stringify(exportCards());
	};

	document.getElementById("study").onclick = function() {
		quizMode();
		initQuiz(getCardsForQuiz(document.getElementById("slider").value/100.0,
				cardList,
				1 * document.getElementById("items-to-study").value));
		presentCard(nextCard());
	};

	document.getElementById("quiz-answerbox").onkeypress = function(e) {
		if (!e) e = window.event;
		if (e.keyCode == "13") {
			checkAnswer(getCurrentCard(), this.value);
		}
	};

	// keyboard shortcuts for yes and no buttons
	//document.onkeypress = function(e) {
	document.getElementById("quiz-verifyresponse").onkeypress = function(e) {
		if (!e) e = window.event;
		if (isVerifying()) {
			// Y button
			if (e.charCode === 121 || e.charCode === 89) {
				correctAnswer(getCurrentCard());
			// N button
			} else if (e.charCode === 110 || e.charCode === 78) {
				incorrectAnswer(getCurrentCard());
			}
		}
	};

	document.getElementById("verify-yes").onclick = function() {
		correctAnswer(getCurrentCard());
	};
	document.getElementById("verify-no").onclick = function() {
		incorrectAnswer(getCurrentCard());
	};

	document.getElementById("quiz-firsttime").onkeypress = function(e) {
		if (!e) e = window.event;
		if (e.keyCode == "13") {
			correctAnswer(getCurrentCard());
		}
	};
	document.getElementById("firsttime-ok").onclick = function() {
		correctAnswer(getCurrentCard());
	};

	document.getElementById("b-abort").onclick = function() {
		editMode();
	};

	addEmptyCard();
};
