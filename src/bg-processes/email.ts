import { Job } from "bull";
import { emailDataType, sendEmail } from "../utils/user";
import { initializeLogger } from "../utils/inti-logger";

const logger = initializeLogger();

const emailProcess = async (job: Job) => {
  let data: emailDataType = await job.data;
  let emails: Array<string> = data.email;
  let templateName: string = data.templateName;
  let substitutions: string = data.substitutions;
  logger.info(
    `Sending email to: [${emails}] with data: ${substitutions} using template: ${templateName} `
  );
  await sendEmail(emails, templateName, substitutions);
};
export default emailProcess;
