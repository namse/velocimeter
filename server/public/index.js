let interval = -1;

const horse = document.getElementById('horse');
const velocityDiv = document.getElementById('velocity');
const cadenceDiv = document.getElementById('cadence');
let frameIndex = 0;
const MAX_FRAME_INDEX = 4;

function updateVelocity(velocity) {
  velocityDiv.innerHTML = `${velocity.toFixed(1)} km/h`;
  updateInterval(velocity);
}

function updateCadence(cadence) {
  cadenceDiv.innerHTML = `${cadence.toFixed(0)} RPM`
}

function updateInterval(velocity) {
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
