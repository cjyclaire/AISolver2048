function alphabeta(grid, depth, alpha, beta, playerTurn) {
	var direction  = -1;
	var bestScore = 0;

	if (grid.isWin()) {
		bestScore = Number.MAX_VALUE;
	}
	else if (!grid.movesCheck()) {
		// console.log("full");
		bestScore = Math.min(grid.score, 1);
	}
	else if (depth === 0) {

		bestScore = heuristicScore(grid.score, grid.vacantCells().count, grid.clusteringScore());
		// console.log(bestScore);
	}
	else {
		if (playerTurn) {
			for (var dir = 0; dir<4; dir++) {
				var newGrid = grid.clone();
				newGrid.move(dir);
				if (newGrid.score - grid.score === 0 && grid.isEqual(newGrid)) {
					continue;
				}
				var currentResult = alphabeta(newGrid, depth-1, alpha, beta, false);
				var currentScore = currentResult.score;
				// console.log(currentScore);
				if (currentScore > alpha) {
					alpha = currentScore;
					direction = dir;
				}

				if (beta <= alpha) {
					// console.log("break");
					break;
				}
			}

			bestScore = alpha;
		}

		else {
			var vacantCells = grid.vacantCells().cells;

			outloop: for (var i = 0; i < vacantCells.length; i++) {
				var cell = vacantCells[i];

				for (var value = 2; value < 6; value*=2) {
					var newGrid = grid.clone();
					var tile = new Tile (cell, value);
					newGrid.insertTile(tile.clone());

					var currentResult = alphabeta(newGrid, depth-1, alpha, beta, true);
					var currentScore = currentResult.score;
					if (currentScore < beta) {
						beta = currentScore;
					}

					if (beta <= alpha) {
						break outloop;
					}
				}
			}

			bestScore = beta;

			if (vacantCells.length === 0) {
				bestScore = 0;
			}
		}
	}
	return {score: bestScore, direction: direction};
}
function heuristicScore(actualScore, vacantCellsCount, clusteringScore) {
	var score = actualScore + Math.log(actualScore) * vacantCellsCount - clusteringScore;
	return Math.max(score, Math.min(1, actualScore));
}
