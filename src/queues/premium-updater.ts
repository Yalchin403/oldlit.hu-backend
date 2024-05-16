import Queue = require("bull");
import premiumUpdaterProcess from "../bg-processes/premium-updater";
import { PremiumBookUpdaterType } from "../utils/book";
import { initializeLogger } from "../utils/inti-logger";

const logger = initializeLogger();

const premiumUpdaterQueue = new Queue("premiumUpdater", {
  redis: {
    port: parseInt(process.env.REDIS_PORT),
    host: process.env.REDIS_URI,
  },
});

premiumUpdaterQueue.process(premiumUpdaterProcess);

const turnoffPremiumBook = (data: PremiumBookUpdaterType, delay) => {
  logger.info(
    `Sending book data for premium updater job for queue: ${JSON.stringify(
      data
    )}`
  );
  premiumUpdaterQueue.add(data, { delay });
};

export default turnoffPremiumBook;
