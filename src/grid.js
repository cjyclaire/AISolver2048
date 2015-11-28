function Grid(size) {
	this.size = size;
	this.cells = [];
	this.initialize(); // all cells with null
	this.playerMode = true;

	// 2 tiles initialize
	this.addRandomTile();
	this.addRandomTile();
};
// cell iterator, apply callback to each cell
Grid.prototype.cellIterator = function (callback) {
	for (var i = 0; i < this.size; i++) {
		for (var j = 0; j < this.size; j++) {
			callback(i, j, this.cells[i][j]);
		};
	};
};
// pre-allocate, for speed
Grid.prototype.index = [];
for (var i = 0; i < this.size; i++) {
	Grid.prototype.index.push([]);
	for (var j = 0; j < this.size; j++) {
		Grid.prototype.index[i].push({x : i , y : j});
	};
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
	this.cellIterator(function (i, j, cell) {
		if (!cell) { // record empty cell indexes
			cells.push({x: i, y: j});
		}
	});
	return cells;
};
// find a vacant position randomly
Grid.prototype.randomVacantCell = function () {
	var cells = this.vacantCells();
	if (cells.length) {
		// why return row ?????????????
		return cells[Math.floor(Math.random() * cells.length)];
	}
};
// check availability
Grid.prototype.hasVacant = function () {
	// !! return false if 0, null, NaN
	return !!this.vacantCells().length;
};
// check one cell availability
Grid.prototype.isVacant = function (cell) {
	return !this.isOccupied(cell);
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
	if (this.hasVacant()) {
		var value = Math.random() < 0.8 ? 2 : 4;
		var tile = new Tile(this.randomVacantCell(), value);
		this.insertTile(tile);
	}
};
// prepare merge
Grid.prototype.prepareTileMerge = function () {
	// record recurrent grid
	this.cellIterator(function (i, j, tile) {
		if (tile) {
			// ?? tile.?? = null;
			tile.savePosition();// save position
		}
	});
};
// move a tile to another cell, update its current position
Grid.prototype.moveTile = function (tile, cell) {
	this.cells[tile.x][tile.y] = null;
	this.cells[cell.x][cell.y] = tile;
	tile.updatePosition(cell);
};
// direction ??????????????
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
	// prepare
	var cell, tile;
	this.prepareTileMerge();
	var self = this;
	// traversal begin
	meshGrid.x.forEach(function(x){
		meshGrid.y.forEach(function(y) {
			cell = self.index[x][y];
			tile = self.hasTile(cell);
			if (tile) {
				var farthest = self.findFarthest(cell, direction);
				var nextTile = self.hasTile(farthest.next);
				// 1 merge per row traversal //&& !next.??
				if (nextTile && nextTile.value === tile.value) {
					// merge
					var mergedTile = new Tile(farthest.next, tile.value * 2);
					// mergedTile.?? = [tile, nextTile];

					self.insertTile(mergedTile);
					self.removeTile(tile);
					tile.updatePosition(farthest.next);

					// update score, check winner
					score += mergedTile.value;
					if (mergedTile.value === 2048) {
						won = true;
					}
				} else {
					// move
					self.moveTile(tile, farthest.farthest);
				}
				// after a player move
				if (cell.x !== tile.x || cell.y !== tile.y) {
					over = !this.movesCheck(); // no available moves
					if (!won && !over) {
						this.addRandomTile();
					}
				}
			}
		});
	});
	return {score : score, won : won, over : over};
};
// generate a meshgrid with correct direction to guide traversal
Grid.prototype.makeTurn = function (direction) {
	var meshGrid = { x : [], y : [] };
	for (var i = 0; i < this.size; i++) {
		meshGrid.x.push(i);
		meshGrid.y.push(i);
	};
	// ?????????
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
	while (this.inRange(cell) && this.isVacant(cell)) {
		prevCell = cell;
		cell = {x : prevCell.x + direction.x, y : prevCell.y + direction.y};
	}

	return {
		farthest : prevCell;
		next : cell;
	};
};
// check is there still possible move
Grid.prototype.movesCheck = function () {
	return this.hasVacant() || this.hasMatches();
};
// check is there still possible merges
Grid.prototype.hasMatches = function () {
	var self = this;
	for (var i = 0; i < this.size; i++) {
		for (var j = 0; j < this.size; j++) {
			var tile = this.hasTile({x : i, y : j});
			if (tile) {
				for (var d = 0; d < 4; d++) {
					var direction = directions[d];
					var cell = {x: i + direction.x, y: j + direction.y};
					var matchTile = self.hasTile(cell);
					if (matchTile && matchTile.value == tile.value) {
						return true;
					}
				};
			}
		}
	}
	// use iterator
	// this.cellIterator(function(i, j, cell) {
	// 	var tile = this.hasTile(cell);// this??
	// 	if (tile) {
	// 		for (var i = 0; i < 4; i++) {
	// 			var direction = directions[d];
	// 			var testCell = {x: i + direction.x, y: j + direction.y};
	// 			var matchTile = self.hasTile(testCell);
	// 			if (matchTile && matchTile.value == tile.value) {
	// 				return true;
	// 			}
	// 		}
	// 	}
	// });
	return false;
};



