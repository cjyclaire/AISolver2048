winScore = 2048;
hintDepth = 5;
// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  var manager = new GameManager(4, HTMLActuator);
});
