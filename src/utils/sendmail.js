import nodemailer from 'nodemailer'
import { config } from '../config/sendmail.config.js'


export const SENDMAIL  = async (msg,callback) => {
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: config.senderEmail,
            pass: config.emailPassword
        },
            tls: {
                rejectUnauthorized: false
            }
    })

    let message = {
        from: config.senderEmail,
        to: msg.to,
        subject: msg.subject,
    }

    msg.html ? message.html = msg?.content : message.text = msg?.content

    try {
        let info = await transporter.sendMail(message)
        callback(info)
    } catch (err) {
        console.log(err)
    }
}