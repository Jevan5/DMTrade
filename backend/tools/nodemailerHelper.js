const nodemailer = require('nodemailer');
const secrets    = require('../../secrets.json');

var sendMail = function(recipient, subject, body){
    let transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            user: secrets.emailAddress,
            pass: secrets.emailPassword
        }
    });

    let mailOptions = {
        from: secrets.emailAddress,
        to: recipient,
        subject: subject,
        text: body
    };

    return transporter.sendMail(mailOptions);
}

module.exports = {
    sendMail: sendMail
};