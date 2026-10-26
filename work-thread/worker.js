const { parentPort, workerData } = require("node:worker_threads");

function doSomeCpuHeavyWork(iterationsInput) {
  let result = 0;

  for (let i = 0; i < iterationsInput; i += 1) {
    result += Math.sqrt(i) * Math.sin(i);
  }

  return result;
}

const result = doSomeCpuHeavyWork(workerData.iterations);

parentPort.postMessage(result);
