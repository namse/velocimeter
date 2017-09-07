let previousWheelRevolutions;
let currentWheelRevolutions;
let previousWheelEvent;
let currentWheelEvent;

let lastVelocity = 0;
let lastWheelEvent;
let lastWheelRounds;
let exercisedWheelRevolutions;

let previousCrankRevolutions;
let currentCrankRevolutions;
let previousCrankEvent;
let currentCrankEvent;

let lastCadence = 0;
let lastCrankEvent;

const MIN_VELOCITY_VALUE = 2.5;
const MAX_CEVENT_TIME = 4;
const WHEEL_SIZE = 700;
const MAX_WHEEL_TIME = Math.floor(((WHEEL_SIZE * 0.001 * 3.6) / MIN_VELOCITY_VALUE));
const WHEEL_SIZE_METER = WHEEL_SIZE / 1000;

export default function calculate(value) {
  const flags = value[0];
  const isWheel = flags & 1 !== 0;
  const isCrank = flags & 2 !== 0;

  const absoluteTime = new Date();
  if (isWheel) {
    previousWheelRevolutions = currentWheelRevolutions;

    currentWheelRevolutions = (value[1]
      + value[2] * 256
      + value[3] * 256 * 256
      + value[4] * 256 * 256);

    previousWheelEvent = currentWheelEvent;

    currentWheelEvent = (value[5] + value[6] * 256) / 1024.0;

    if (!lastWheelEvent) {
      lastWheelEvent = absoluteTime;
    } else {
      const eventDiff = currentWheelEvent;
      if (previousWheelEvent) {
        if (previousWheelEvent <= currentWheelEvent) {
          eventDiff = currentWheelEvent - previousWheelEvent;
        } else {
          // rollover
          eventDiff = currentWheelEvent + ((0xFFFF / 1024.0) - previousWheelEvent);
        }
      }
      let wheelRounds = (currentWheelRevolutions - previousWheelRevolutions);

      if (currentWheelRevolutions < previousWheelRevolutions) {
        previousWheelRevolutions = currentWheelRevolutions;
        wheelRounds = 0;
      }

      if (wheelRounds > 0) {
        lastWheelRounds = wheelRounds;
      }

      exercisedWheelRevolutions += wheelRounds;
      let velocity = 0;

      if ((!eventDiff || !wheelRounds)
        && (absoluteTime - lastWheelEvent) < MAX_WHEEL_TIME ) {
        velocity = lastVelocity;
        exercisedWheelRevolutions += lastWheelRounds;
      }

      if (eventDiff && wheelRounds) {
        velocity = ((WHEEL_SIZE_METER * wheelRounds) / eventDiff) * 3.6;
        lastWheelEvent = absoluteTime;
      }

      lastVelocity = velocity;
      const distance = WHEEL_SIZE_METER * exercisedWheelRevolutions; // in meters
      const totalDistance = WHEEL_SIZE * currentWheelRevolutions; // in meters, assumption that the wheel size has been the same
    }
  }

  // if cadence present can be combo sensor or cadence sensor only
  if (isCrank) {
    previousCrankRevolutions = currentCrankRevolutions;
    previousCrankEvent = currentCrankEvent;

    currentCrankRevolutions = isWheel
      ? (value[7] + value[8] * 256)
      : (value[1] + value[2] * 256);
    currentCrankEvent = isWheel
      ? (value[9] + value[10] * 256) / 1024.0
      : (value[3] + value[4] * 256) / 1024.0;

    const crankRounds = currentCrankRevolutions - previousCrankRevolutions;
    if (currentCrankRevolutions < previousCrankRevolutions) {
      previousCrankRevolutions = (0xFFFF - previousCrankRevolutions);
      crankRounds = currentCrankRevolutions - previousCrankRevolutions;
    }

    if (!lastCrankEvent) {
      // skip first packet
      lastCrankEvent = absoluteTime;
    } else {
      const eventDiff = currentCrankEvent;

      if (previousCrankEvent) {
        if (previousCrankEvent <= currentCrankEvent) {
          eventDiff = currentCrankEvent - previousCrankEvent;
        } else {
          // rollover
          eventDiff = currentCrankEvent + ((0xFFFF / 1024.0) - previousCrankEvent);
        }
      }

      if ((!eventDiff || !crankRounds)
       && (absoluteTime - lastCrankEvent) < MAX_CEVENT_TIME) {
        // do nothing lastCadence
      } else if (eventDiff && crankRounds) {
        lastCadence = Math.floor(((crankRounds / eventDiff) * 60));
        lastCrankEvent = absoluteTime;
      } else {
        lastCadence = 0;
      }
    }
  }
  return {
    cadence: lastCadence,
    velocity: lastVelocity
  }
}
