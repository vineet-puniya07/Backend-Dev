const { Queue, Worker } = require('bullmq');

function createOrderQueue({ connection, queueName = 'orders' }) {
  return new Queue(queueName, { connection });
}

function startOrderWorker({ connection, queueName = 'orders', handler, concurrency = 10, logger }) {
  const worker = new Worker(
    queueName,
    async (job) => handler(job),
    {
      connection,
      concurrency
    }
  );

  worker.on('completed', (job) => logger?.info?.({ jobId: job.id }, 'order job completed'));
  worker.on('failed', (job, err) => logger?.error?.({ jobId: job?.id, err }, 'order job failed'));

  return worker;
}

module.exports = { createOrderQueue, startOrderWorker };
