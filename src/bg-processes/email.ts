import { Job } from 'bull';
import { sendSMTPEmail, emailDataType } from '../utils/user';


const emailProcess = async (job: Job) => {
    let data: emailDataType = await job.data;
    let emailSubject: string = data.emailSubject;
    let email: string = data.email;
    let emailContentHTML = data.emailContentHTML;

    sendSMTPEmail(email, emailSubject ,emailContentHTML);
}
export default emailProcess;