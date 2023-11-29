import { transporter } from "../utils/utils.js";

export const sendEmail = async (user, subject, html) => {
  const result = await transporter.sendMail({
    from: CONFIG.NODEMAILER_EMAIL,
    to: user.email,
    subject,
    html
  })
  return result
}