import Queue = require("bull");
import emailProcess from "../bg-processes/email";
import { emailDataType } from "../utils/user";
import { initializeLogger } from "../utils/inti-logger";

const logger = initializeLogger();

const emailQueue = new Queue("email", {
  redis: {
    port: parseInt(process.env.REDIS_PORT),
    host: process.env.REDIS_URI,
  },
});

emailQueue.process(emailProcess);

const sendEmail = (data: emailDataType) => {
  logger.info(`Sending email data for queue: ${JSON.stringify(data)}`);
  emailQueue.add(data);
};

export default sendEmail;
