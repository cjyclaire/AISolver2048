function GameManager(size, HTMLActuator) {
	this.size = size;
	this.isRunning = false;
	this.keyMap = {
	    38: 0, // Up
	    39: 1, // Right
	    40: 2, // Down
	    37: 3 // Left
	};
	this.actuator = new HTMLActuator;

	this.setup();
	this.listen();
}

GameManager.prototype.setup = function() {
	this.grid = new Grid(this.size);
	this.running = false;
	this.score = 0;
	this.won = false;
	this.over = false;

	this.actuate(); // send grid to actuator;
}

GameManager.prototype.listen = function() {
	var self = this;
	document.addEventListener("keydown", function(event) {
		var direction = self.keyMap[event.which];
		if (direction != undefined) {
			event.preventDefault();
			self.move(direction);
		}
	});
	// put retry button under grid.
	var restart = document.getElementsByClassName("retry-button")[0];
	restart.addEventListener("click", function() {
		event.preventDefault();
		self.restart();
	});
	var aiRun = document.getElementsByClassName("ai-button")[0];
	aiRun.addEventListener("click", function() {
		if (self.isRunning) {
			self.isRunning = false;
			self.actuator.setAIButton("AI-RUN");
		}
		else {
			self.isRunning = true;
			self.run();
			self.actuator.setAIButton("STOP");
		}
	});
}

GameManager.prototype.move = function(direction) {
	var metadata = this.grid.move(direction);
	if (!metadata.won) {
		this.grid.addRandomTile();
	}

	this.score += metadata.score;
	this.won = metadata.won;
	this.over = metadata.over;
	this.actuate();
}

GameManager.prototype.run = function() {
	var bestResult = alphabeta(this.grid, hintDepth, Number.MIN_VALUE, Number.MAX_VALUE, this.grid.playerTurn);
	if (bestResult.direction != -1) {
		this.move(bestResult.direction);
	}

	if (this.isRunning && !this.won && !this.over) {
		var self = this;
		setTimeout(function() {
			self.run();
		}, 100);
	}
}

GameManager.prototype.restart = function() {
	this.actuator.clearMessage();
	this.setup();
	this.actuator.setAIButton("AI-RUN");
}

GameManager.prototype.actuate = function () {
	this.actuator.actuate(this.grid, {score: this.score, over: this.over, won: this.won});
}
