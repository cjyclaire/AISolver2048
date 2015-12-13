function Grid(size) {
	this.size = size;
	this.score = 0;
	this.cells = [];
	this.initialize(); // all cells with null
	this.playerTurn = true;
	// 2 tiles initialize
	this.addRandomTile();
	this.addRandomTile();

	// pre allocate, differ from cells
	this.index = [];
	for (var i = 0; i < this.size; i++) {
		this.index.push([]);
		for (var j = 0; j < this.size; j++) {
			this.index[i].push({x : i , y : j});
		}
	}
};
// initialize an empty grid
Grid.prototype.initialize = function () {
	for (var i = 0; i < this.size; i++) {
		var row = this.cells[i] = [];
		for (var j = 0; j < this.size; j++) {
			row.push(null);
		};
	};
};
// return all vacant cell position
Grid.prototype.vacantCells = function () {
	var cells = []; // vacant cells
	var count = 0;
	for (var i = 0; i < this.size; i++) {
		for (var j = 0; j < this.size; j++) {
			var tile = this.cells[i][j];
			if (!tile) {
				cells.push({x: i, y: j});
				count++;
			}
		}
	}
	return {cells : cells, count: count};
};
// clone the whole grid
Grid.prototype.clone = function () {
	var cloneGrid = new Grid(this.size);
	// turn???
	for (var i = 0; i < this.size; i++) {
		for (var j = 0; j < this.size; j++) {
			if (this.cells[i][j]) {
				cloneGrid.insertTile(this.cells[i][j].clone());
			}
		}
	}
	cloneGrid.score = this.score;
	return cloneGrid;
};
// find a vacant position randomly
Grid.prototype.randomVacantCell = function () {
	var cells = this.vacantCells().cells;
	if (cells.length) {
		return cells[Math.floor(Math.random() * cells.length)];
	}
};
// check availability
Grid.prototype.hasVacant = function () {
	return !!this.vacantCells().cells.length;
};
// check content in one cell
Grid.prototype.isOccupied = function (cell) {
	return !!this.hasTile(cell);
};
// return contents of one cell / null
Grid.prototype.hasTile = function (cell) {
	if (this.inRange(cell)) {
		return this.cells[cell.x][cell.y];
	}
	return null;
};
// in range check
Grid.prototype.inRange = function (cell) {
	return cell.x >= 0 && cell.x < this.size &&
			cell.y >= 0 && cell.y < this.size;
};
// insert a tile
Grid.prototype.insertTile = function (tile) {
	this.cells[tile.x][tile.y] = tile;
};
// remove a tile
Grid.prototype.removeTile = function (tile) {
	this.cells[tile.x][tile.y] = null;
};
Grid.prototype.addRandomTile = function () {
	this.playerTurn = true; // initial part set twice
	if (this.hasVacant()) {
		var value = Math.random() < 0.8 ? 2 : 4;
		var tile = new Tile(this.randomVacantCell(), value);
		this.insertTile(tile);
	}
};
// move a tile to another cell, update current position
Grid.prototype.moveTile = function (tile, cell) {
	this.cells[tile.x][tile.y] = null;
	this.cells[cell.x][cell.y] = tile;
	tile.updatePosition(cell);
};
// directions
Grid.prototype.directions = {
	0 : {x : 0, y : -1}, // up
	1 : {x : 1, y : 0}, // right
	2 : {x : 0, y : 1}, // down
	3 : {x : -1, y : 0} // left
};
Grid.prototype.move = function (moveDirection) {
	var direction = this.directions[moveDirection];
	// make sure traversal will be in right direction
	var meshGrid = this.makeTurn(direction);
	var score = 0;
	var won = false;
	var over = false;

	var cell, tile;
	var self = this;
	// traversal begin
	meshGrid.x.forEach(function(x){
		meshGrid.y.forEach(function(y) {
			if (won || !self.movesCheck()) {
				return {score : score, won : won, over : !self.movesCheck()};
			}
			cell = self.index[x][y];
			tile = self.hasTile(cell);
			if (tile) {
				var farthest = self.findFarthest(cell, direction);
				var nextTile = self.hasTile(farthest.next);

				if (nextTile && nextTile.value === tile.value) {
					nextTile.updateValue(2*tile.value);
                    self.removeTile(tile);
                    // update score, check winner
                    score += 2*tile.value;
                    if (2*tile.value === winScore) {
                        won = true;
                    }
				} else {
					// move
					self.moveTile(tile, farthest.farthest);
				}
			}
		});
	});
	// move to game manager
	// if (!won) {
	// 	this.addRandomTile();
	// }
	this.playerTurn = false;
	over = !this.movesCheck();
	this.score += score;
	return {score : score, won : won, over : over};
};
// generate a meshgrid with correct direction to guide traversal
Grid.prototype.makeTurn = function (direction) {
	var meshGrid = { x : [], y : [] };
	for (var i = 0; i < this.size; i++) {
		meshGrid.x.push(i);
		meshGrid.y.push(i);
	};
	if (direction.x === 1) {
		meshGrid.x = meshGrid.x.reverse();
	}
	if (direction.y === 1) {
		meshGrid.y = meshGrid.y.reverse();
	}
	return meshGrid;
};
// find the farthest cell position to hit
Grid.prototype.findFarthest = function (cell, direction) {
	var prevCell = cell;
	cell = {x : prevCell.x + direction.x, y : prevCell.y + direction.y};
	while (this.inRange(cell) && !this.isOccupied(cell)) {
		prevCell = cell;
		cell = {x : prevCell.x + direction.x, y : prevCell.y + direction.y};
	}

	return {
		farthest : prevCell,
		next : cell
	};
};
// check is there still possible move
Grid.prototype.movesCheck = function () {
	return this.hasVacant() || this.hasMatches();
};
// check is there still possible merges
Grid.prototype.hasMatches = function () {
	for (var i = 0; i < this.size; i++) {
		for (var j = 0; j < this.size; j++) {
			var tile = this.hasTile({x : i, y : j});
			if (tile) {
				for (var d = 0; d < 4; d++) {
					var direction = this.directions[d];
					var cell = {x: i + direction.x, y: j + direction.y};
					var matchTile = this.hasTile(cell);
					if (matchTile && matchTile.value === tile.value) {
						return true;
					}
				};
			}
		}
	}
	return false;
};
// compute clustering score
Grid.prototype.clusteringScore = function () {
	var score = 0;
	for (var i = 0; i < this.size; i++) {
		for (var j = 0; j < this.size; j++) {
			var tile = this.hasTile({x : i, y : j});
			if (!tile) {
				continue;
			}
			// for each tile,
			// compute average abosulte value with its neighbors
			var neighborCount = 0;
			var absSum = 0;
			// check all directions
			for (var k = 0; k < 4; k++) {
				var direction = this.directions[k];
				var cell = {x: i + direction.x, y: j + direction.y};
				var neighborTile = this.hasTile(cell);
				if (neighborTile) {// this check includes inRange!
					// yeah, got a neighbor!
					neighborCount++;
					absSum += Math.abs(neighborTile.value - tile.value);
				}
			}
			if (neighborCount !== 0) {
				score += (absSum / neighborCount);
			}
		}
	}
	return score;
};
// check if has won the game
Grid.prototype.isWin = function () {
	var self = this;
	for (var i = 0; i < this.size; i++) {
		for (var j = 0; j < this.size; j++) {
			// !!null => false, !null => true
			var tile = self.hasTile(this.index[i][j]);
			if (!!tile && tile.value === winScore) {
				return true;
			}
		}
	}
	return false;
};
// check if 2 grids are equal
Grid.prototype.isEqual = function (newGrid) {
	// var newCells = newGrid.cells;
	var self = this;
	for (var i = 0; i < this.size; i++) {
		for (var j = 0; j < this.size; j++) {
			var newTile = newGrid.hasTile(this.index[i][j]);
			var tile = self.hasTile(this.index[i][j]);
			if (!!newTile && tile) {
				return false;
			} else if (newTile && !!tile) {
				return false;
			} else if (newTile && tile && newTile.value !== tile.value) {
				return false;
			}
		}
	}
	return true;
}
