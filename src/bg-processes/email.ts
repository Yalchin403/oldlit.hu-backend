import { Job } from 'bull';
import { sendSMTPEmail, emailDataType } from '../utils/user';


const emailProcess = async (job: Job) => {
    let data: emailDataType = await job.data
    let emailSubject: string = "Verify your email"
    let emailContentHTML: string = `
    Hello, <b>${data.firstName}</b>,<br>
    <br>Welcome to our website!<br>
    Please visit the below link to verify your account.<br><br>

    ${data.verifyLink}

    <br><br>

    Thanks for joining!`;

    sendSMTPEmail(data.email, emailSubject ,emailContentHTML);

}

export default emailProcess;