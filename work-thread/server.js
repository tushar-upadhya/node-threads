const { createServer } = require("node:http");
const { Worker } = require("node:worker_threads");
const path = require("node:path");

const iterations = 30000000000;

function doSomeCpuHeavyWork(iterationsInput) {
  let result = 0;

  for (let i = 0; i < iterationsInput; i += 1) {
    result += Math.sqrt(i) * Math.sin(i);
  }

  return result;
}

const server = createServer((req, res) => {
  // Route 1: Home page
  if (req.url === "/") {
    res.writeHead(200, {
      "Content-Type": "text/plain",
    });

    res.end("Server is running!");
    return;
  }

  // Route 2: Health check
  if (req.url === "/health") {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        ok: true,
      }),
    );
    return;
  }

  // Route 3: CPU work on the main thread
  if (req.url === "/block") {
    console.log("Starting CPU work on MAIN THREAD");

    const startedAt = Date.now();
    const result = doSomeCpuHeavyWork(iterations);
    const duration = Date.now() - startedAt;

    console.log(`MAIN THREAD WORK FINISHED in ${duration} ms`);

    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        result,
        duration,
        ranOn: "main thread",
      }),
    );
    return;
  }

  // Route 4: CPU work on a worker thread
  if (req.url === "/worker") {
    console.log("Starting CPU work on WORKER THREAD");

    const startedAt = Date.now();

    const worker = new Worker(path.join(__dirname, "worker.js"), {
      workerData: {
        iterations,
      },
    });

    worker.on("message", (result) => {
      const duration = Date.now() - startedAt;

      console.log(`WORKER FINISHED in ${duration} ms`);

      res.writeHead(200, {
        "Content-Type": "application/json",
      });

      res.end(
        JSON.stringify({
          result,
          duration,
          ranOn: "worker thread",
        }),
      );
    });

    worker.on("error", (error) => {
      console.error("Worker error:", error.message);

      if (!res.headersSent) {
        res.writeHead(500, {
          "Content-Type": "application/json",
        });
      }

      res.end(
        JSON.stringify({
          error: error.message,
        }),
      );
    });

    worker.on("exit", (code) => {
      if (code !== 0 && !res.writableEnded) {
        if (!res.headersSent) {
          res.writeHead(500, {
            "Content-Type": "application/json",
          });
        }

        res.end(
          JSON.stringify({
            error: `Worker stopped with exit code ${code}`,
          }),
        );
      }
    });

    return;
  }

  // Fallback: Unknown route
  res.writeHead(404, {
    "Content-Type": "application/json",
  });

  res.end(
    JSON.stringify({
      error: "NOT FOUND",
      path: req.url,
    }),
  );
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
