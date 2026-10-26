// password-based key derivation function 2

const { pbkdf2 } = require("node:crypto");
// one main js thread - node js is going to use to run js code

const pool_size = 4;
const task_count = 8;
const iterations = 400000;
const start_at = Date.now();

console.log(`thead pool size ${pool_size}`);
console.log(`Scheduling ${task_count} PBKDF2 tasks,,,,,,,,,,,`);

function elapseMS() {
  return Date.now() - start_at;
}

// js does not do like this
// start task 1
// wait for task 1
// start task 2
// wait for task 2

// it will do like this
// submit task 1
// submit task 2
// ...
// submit task 8

for (let id = 1; id <= task_count; id += 1) {
  pbkdf2(
    `password -> ${id}`,
    `salt -> ${id}`,
    iterations,
    32,
    "sha256",
    (error) => {
      if (error) {
        console.error(`task ${id} failed`, error.message);
      }
      console.log(`task ${id} finished at ${elapseMS()} ms`);
    },
  );
}
console.log(`js finished scheduling everything at ${elapseMS()}`);
