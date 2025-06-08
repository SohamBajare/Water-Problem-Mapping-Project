// email feature for authorised person
const nodemailer = require("nodemailer");

// Setup transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "sohambajare0348@gmail.com",
        pass: "guht pbbv jwhk jtcj" // Use App Password, not your normal Gmail password
    }
});

// Export a sendMail function (optional but good practice)
function sendEmail(to, subject, text, html = null) {
    const mailOptions = {
        from: "sohambajare0348@gmail.com",
        to,
        subject,
        text,
        ...(html && { html })  // Add HTML content only if provided
    };

    return transporter.sendMail(mailOptions);
}

module.exports = sendEmail;