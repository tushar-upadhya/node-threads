const { readFile } = require("node:fs");

// sync js -> runs first
// once this finishes -> process.nexttick, promise callback/microtask
// timer, I/O callback, setimmediate, other handler(whatever)

console.log("[1] sync : script starts");

setTimeout(() => {
  console.log("timer : top level settimeout(0)");
}, 0);

setImmediate(() => {
  console.log("immediate top level");
});

// special to node
process.nextTick(() => {
  console.log("[3] nextTick");
});

// current sync code -> nextTick queue -> promise/microtask -> event loop

Promise.resolve().then(() => {
  console.log("[5] -> promise DOT then");
});

// special to node
process.nextTick(() => {
  console.log("[4] second nextTick");

  Promise.resolve().then(() => {
    console.log("[6] -> promise create inside nextTick");
  });
});

console.log("[2] sync script end");

readFile(__filename, () => {
  console.log("[I/O] fs.readFile callBack");

  setTimeout(() => {
    console.log("I/O timer set-timer -> 0");
  }, 0);

  setImmediate(() => {
    console.log("immediate inside I/O");
  });
});
