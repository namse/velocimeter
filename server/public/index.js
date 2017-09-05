let velocity = 0;
let interval = -1;

const horse = document.getElementById('horse');
let frameIndex = 0;
const MAX_FRAME_INDEX = 4;

function updateVelocity(newVelocity) {
  velocity = newVelocity;
  updateInterval();
}

function updateInterval() {
  const previousInterval = interval;
  interval = velocity === 0
    ? -1
    : 1500 / velocity;

  if (previousInterval <= 0 && interval > 0) {
    tick();
  }
}


function tick() {
  horse.classList.remove(`frame-${frameIndex}`);
  frameIndex += 1;
  if (frameIndex > MAX_FRAME_INDEX) {
    frameIndex = 0;
  }
  horse.classList.add(`frame-${frameIndex}`);
  if (interval > 0) {
    setTimeout(tick, interval);
  }
}

tick();
