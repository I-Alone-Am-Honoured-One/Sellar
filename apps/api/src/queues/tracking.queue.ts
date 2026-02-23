import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { config } from "../common/config";
import { prisma } from "../common/prisma";
import { lpExpressAdapter, omnivaAdapter } from "../modules/shipping/providers";

const connection = new Redis(config.redisUrl, { maxRetriesPerRequest: null });
export const trackingQueue = new Queue("tracking", { connection });

export const trackingWorker = new Worker(
  "tracking",
  async (job) => {
    const deal = await prisma.deal.findUnique({ where: { id: job.data.dealId } });
    if (!deal) return;
    const adapter = deal.shippingProvider === "OMNIVA" ? omnivaAdapter : lpExpressAdapter;
    const tracking = await adapter.track(job.data.trackingCode);
    await prisma.trackingEvent.create({ data: { dealId: deal.id, status: tracking.status, rawPayload: tracking.raw as any } });
    if (tracking.status === "IN_TRANSIT" && deal.state === "DROPPED_OFF") {
      await prisma.deal.update({ where: { id: deal.id }, data: { state: "IN_TRANSIT" } });
    }
  },
  { connection }
);
