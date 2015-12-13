function HTMLActuator() {
	this.tileContainer = document.getElementsByClassName("tile-container")[0];
	this.scoreContainer = document.getElementsByClassName("score-container")[0];
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
	this.clearChild(this.tileContainer);

	grid.cells.forEach(function (column) {
    column.forEach(function (cell) {
      if (cell) {
        this.addTile(cell);
        }
    }, this);
  }, this);

	this.updateScore(metadata.score);

	if (metadata.over) this.showMessage(false);
	if (metadata.won) this.showMessage(true);
}

HTMLActuator.prototype.clearChild = function (container) {
	while (container.hasChildNodes()) {
		container.removeChild(container.firstChild);
	}
}

HTMLActuator.prototype.addTile = function (tile) {
	var position = "tile-position-" + (tile.x+1) + "-" + (tile.y+1);
	var element = document.createElement("div");
	var className = "tile tile-" + tile.value+ " " + position;
	element.setAttribute("class", className);
	element.textContent = tile.value;
	this.tileContainer.appendChild(element);
}

HTMLActuator.prototype.updateScore = function(score) {
	this.scoreContainer.textContent = score;
}

HTMLActuator.prototype.showMessage = function(result) {
	var message = result ? "You win!" : "Game over!";
	var type = result ? "game-won": "game-over";

	var messageContainer = document.getElementsByClassName("game-message")[0];
	messageContainer.classList.add(type);
	messageContainer.getElementsByTagName("p")[0].textContent = message;
}

HTMLActuator.prototype.clearMessage = function() {
	var messageContainer = document.getElementsByClassName("game-message")[0];
    messageContainer.classList.remove("game-won", "game-over");
    messageContainer.getElementsByTagName("p")[0].textContent = "";
}

HTMLActuator.prototype.setAIButton = function(message) {
	document.getElementById('run-button').innerHTML = message;
}
