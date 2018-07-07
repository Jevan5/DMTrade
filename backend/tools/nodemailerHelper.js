const nodemailer = require('nodemailer');

var sendMail = function(recipient, subject, body){
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'DMTrade2877@gmail.com',
            pass: 'HorseSpongeBikini'
        }
    });

    let mailOptions = {
        from: 'DMTrade2877@gmail.com',
        to: recipient,
        subject: subject,
        text: body
    };

    return transporter.sendMail(mailOptions);
}

module.exports = {
    sendMail: sendMail
}