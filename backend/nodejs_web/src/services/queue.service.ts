import { Queue, Worker, QueueEvents, JobsOptions } from "bullmq";
import IORedis from "ioredis";
import logger from "./logger.service";

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null, 
  enableReadyCheck: false,  
});
export const logQueue = new Queue("logQueue", { connection });

export const cleanupQueue = new Queue("cleanupQueue", { connection });

new Worker(
  "logQueue",
  async (job) => {
    logger.info(`📘 Log job: ${JSON.stringify(job.data)}`);
  },
  { connection }
);

new Worker(
  "cleanupQueue",
  async (job) => {
    const { carId } = job.data;
    logger.info(`🧹 Dọn xe pending quá hạn: ${carId}`);
  },
  { connection }
);

export const addLogJob = async (data: any) => {
  await logQueue.add("add_log", data);
};

export const addCarCleanupJob = async (carId: string, delayMs: number) => {
  await cleanupQueue.add(
    "cleanup_pending",
    { carId },
    { delay: delayMs, attempts: 1 }
  );
};
