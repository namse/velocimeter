const velocity = 0;

const horse = document.getElementById('horse');
let frameIndex = 0;
const MAX_FRAME_INDEX = 4;

function updateVelocity(newVelocity) {
  newVelocity = velocity;
}
속도가 0일때 처리를 해줘야 함.
function getInterval() {
  return 1500 / velocity;
}
function tick() {
  horse.classList.remove(`frame-${frameIndex}`);
  frameIndex += 1;
  if (frameIndex > MAX_FRAME_INDEX) {
    frameIndex = 0;
  }
  horse.classList.add(`frame-${frameIndex}`);

  setTimeout(next, getInterval());
}
tick();
