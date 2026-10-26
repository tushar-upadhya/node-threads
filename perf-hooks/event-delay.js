const { performance, monitorEventLoopDelay } = require("node:perf_hooks");

// main thread -> busy on this loop -> other js can not run -> event loop is delayed
function blockEventLoop(msAsInput) {
  const end = performance.now() + msAsInput;

  while (performance.now() < end) {
    // current time = 1000ms
    // msAsInput = 1300ms
    // end = 1300
  }
}

const start = performance.now();
blockEventLoop(300);
const end = performance.now();

console.log(`work took-> ${(end - start).toFixed(2)} ms`);

const eventLoopDelay = monitorEventLoopDelay({
  resolution: 20,
});

eventLoopDelay.enable();
setTimeout(() => {
  // with intention we are blocking main thread
  blockEventLoop(300);

  setTimeout(() => {
    // eventLoopDelay.max -> nanoseconds
    // 1ms = 1,000,000

    const maxDelayInMs = eventLoopDelay.max / 1e6;
    console.log(`max event loop delay ${maxDelayInMs.toFixed(2)} ms`);

    eventLoopDelay.disable();
  }, 50);
}, 50);
