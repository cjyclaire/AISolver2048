function Tile(pos, val) {
	this.x = pos.x;
	this.y = pos.y;
	this.valus = val;
	this.prevPosition = null;
}
Tile.prototype.savePosition = function () {
	this.prevPosition = {x : this.x, y: this.y};
}
Tile.prototype.updatePosition = function (newPos) {
	this.x = newPos.x;
	this.y = newPos.y;
}
