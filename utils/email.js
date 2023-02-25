const nodemailer = require('nodemailer');

module.exports = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? 25),
    auth: {
      user: process.env.SMTP_ACCOUNT, // generated ethereal user
      pass: process.env.SMTP_PASSWORD, // generated ethereal password
    },
});