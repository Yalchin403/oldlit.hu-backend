import Queue = require('bull');
import emailProcess from "../bg-processes/email";

const emailQueue = new Queue('email', {
    redis: {
        port: parseInt(process.env.REDIS_PORT),
        host: process.env.REDIS_URI
    }
});

emailQueue.process(emailProcess)

const sendEmail = (data: any) => {
    emailQueue.add(data);
};

export default sendEmail;