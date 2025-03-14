
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: 'ahmedsabrymahmoud225@gmail.com',
    pass: 'tlrvktzjnbrzdgbn',
  },
});


const SendMail = async (email, message) => {
  await transporter.sendMail({
    from: email, // sender address
    to: 'ahmedsabrymahmoud225@gmail.com', // list of receivers
    subject: "Technical Support", // Subject line
    html: `   <table style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #CE5BEB; border-radius: 10px; direction: rtl;">
  <tr>
    <td style="text-align: center; background-color: #5B61EB; padding: 20px;">
      <h1 style="color: #f4f4f4; font-family: 'Markazi Text'; font-size: 50px; margin: 0;">Tradof</h1>
      <img src="https://raw.githubusercontent.com/SABRY225/Tradof.api/refs/heads/main/logo.png" alt="الشعار" width="100px" height="100px" style="margin:0px 20px;">
    </td>
  </tr>
  <tr>
    <td style="text-align: center; padding: 5px 0;">
      <h1 style="color: #000;">Technical Support</h1>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px;">
      <div style="text-align: left; margin: 0.5rem 0 0 0; font-size: large;">
        ${message}
      </div>
    </td>
  </tr>
  <tr>
    <td style="text-align: center; padding: 10px; background-color: #5B61EB; border-top: 1px solid #ddd;">
      <p style="color: #f4f4f4; font-weight: bold;">tradofhelp@gmail.com</p>
      <p style="color: #f4f4f4; font-weight: bold;">Tradof Platform ©. All rights reserved</p>
    </td>
  </tr>
</table>
`, // html body
  });
}

module.exports = { SendMail }