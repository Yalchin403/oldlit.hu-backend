import { Job } from "bull";
import { initializeLogger } from "../utils/inti-logger";
import { PremiumBookUpdaterType, turnPremiumOffForBook } from "../utils/book";

const logger = initializeLogger();

const premiumUpdaterProcess = async (job: Job) => {
  let data: PremiumBookUpdaterType = await job.data;
  let bookID: number = data.bookID;
  logger.info(`Turning premium premium off for book with ID: ${bookID}`);
  await turnPremiumOffForBook(bookID);
};
export default premiumUpdaterProcess;
