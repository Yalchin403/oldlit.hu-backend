import { Job } from 'bull';
import { sendSMTPEmail, emailDataType } from '../utils/user';


const emailProcess = async (job: Job) => {
    let data: emailDataType = await job.data
    let emailSubject: string = "Verify your email"
    let emailContentHTML: string = `Hello, ${data.firstName}, <br>welcome to our website!
    Please visit the below link to verify your account.<br>

    ${data.verifyLink}

    <br>

    Thanks for joining!`;

    sendSMTPEmail(data.email, emailSubject ,emailContentHTML);

}

export default emailProcess;