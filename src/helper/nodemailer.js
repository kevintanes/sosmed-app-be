const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "taneskevin14@gmail.com",
        pass: "ntlzrobvlfsswdgk"
    }
});

module.exports = transporter;