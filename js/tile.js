function Tile(pos, val) {
	this.x = pos.x;
	this.y = pos.y;
	this.value = val;
}
Tile.prototype.updatePosition = function (newPos) {
	this.x = newPos.x;
	this.y = newPos.y;
}
Tile.prototype.updateValue = function (newVal) {
	this.value = newVal;
}
Tile.prototype.clone = function() {
    newTile = new Tile({ x: this.x, y: this.y }, this.value);
    return newTile;
}