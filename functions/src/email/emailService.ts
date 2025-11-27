import { createTransport } from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { debug, error } from 'firebase-functions/logger'


// const logger = useLogger('nodemailer');
const isVerified = false;

export function useNodeMailer() {
// TODO: add unsubscribe link
  const env = {
    EMAIL_HOST: process.env.EMAIL_HOST || '',
    EMAIL_PORT: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 0,
    EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',
    EMAIL_USER: process.env.EMAIL_USER || '',
    EMAIL_PASS: process.env.EMAIL_PASS || '',
  }
  const config = {
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_SECURE,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    }
  }
  debug(config)
  const transporter = createTransport(config);

  async function sendMail(options: SMTPTransport.Options) {
    try {
      await transporter.sendMail({
        from: env.EMAIL_USER,
          ...options,
      })
      console.log(`Email sent to ${options.to}`);
      return {success: true}
    } catch (e: any) {
      error(`Failed to send email to ${options.to}`);
      return {success: false, error: true, message: `Failed to send email to ${options.to}`, errorDetails: e};
    }
  }

  async function verifyTransporter() {
    try {
      await transporter.verify();
      console.log('Email transporter verified');
      return true;
    } catch (e: any) {
      error(`Email transporter verification failed. ${e.message}`);
      return false;
    }
  }

  function createShippingNotificationEmail(to: string, orderId: string, trackingNumber: string, carrier: string) {
    const subject = `A package from Danger Lettuce Carnivores, order #${orderId}, is on the way! `
    const html = ``
    return {
      to,
      subject,
      html,
    }
  }

//     If you encounter any issues with your order, or have any questions, please let us know! 
// Thank you for your business!
// Danger Lettuce Carnivores

  return {
    sendMail,
  }
}
