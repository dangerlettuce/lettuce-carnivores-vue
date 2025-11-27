import admin from 'firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import { onCall } from 'firebase-functions/v2/https';
import type { CallableRequest } from 'firebase-functions/v2/https'
import { FunctionResponse } from '../types/Functions'
import type { Order } from '../types/Orders';
import { generateOrderStatusUpdate } from './templates/orderShippedEmail';
import { generateOrderConfirmationEmail } from './templates/orderConfirmationEmail';
import { useNodeMailer } from './emailService';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
const collectionName = 'sentEmails' as const
interface EmailRequest extends CallableRequest { data: Order }

export const sendOrderStatusEmail = onCall({secrets: ['EMAIL_USER', 'EMAIL_PASS']},async(request: EmailRequest): Promise<FunctionResponse> => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if(!emailUser || !emailPass) {
        return {success: false, error: true, message: 'Missing env variables for email user or pass'}
    }
    let html;
    let subject;
    if (request.data.orderStatus.status === 'Shipped') {
        html = generateOrderStatusUpdate(request.data);
        subject = `Your Danger Lettuce order ${request.data.id} was shipped!`
    }
    if (!html) {
        return {success: false, error: true, message: 'Error generating email template', errorDetails: 'Unable to generate email template', data: html}
    }

    const emailConfig = {
      to: request.data.shippingInfo.email,
      bcc: 'mail@dangerlettuce.com',
      subject,
      html,
      text: html.toString(),
    };
    return await sendMailAndSaveToDb(emailConfig, request.data.id);
})

export const sendOrderConfirmationEmail = onCall({}, async(request: EmailRequest): Promise<FunctionResponse> => {
    const subject = `Danger Lettuce order ${request.data.id} confirmed`;
    const html = generateOrderConfirmationEmail(request.data);
    if (!html) {
        return {success: false, error: true, message: 'Error generating email template', errorDetails: 'Unable to generate email template', data: html}
    }

    const emailConfig = {
      to: request.data.shippingInfo.email,
      bcc: 'noreply@dangerlettuce.com',
      subject,
      html,
      text: html.toString(),
    };
    return await sendMailAndSaveToDb(emailConfig, request.data.id);

})


async function sendMailAndSaveToDb(emailConfig: SMTPTransport.Options, id: string | number) {
    try {
        await useNodeMailer().sendMail(emailConfig);
    } catch (e: any) {
        console.error(`Error sending email for ID #${id}: ${e.toString()}`);
        return {success: false, error: true, message: 'Error sending email', errorDetails: e.toString(), data: e}
    }

    try {
        await admin.firestore().collection(collectionName).doc(id.toString()).set({...emailConfig, sentAt: Timestamp.now()})
        return {success: true, error: false, message: `Success! Email sent to ${emailConfig.to}`, errorDetails: null, data: null} 
    } catch (e: any) {
        console.error({message: 'Error saving doc', data: {id, emailConfig}});
        return {success: false, error: true, message: 'Error saving doc', errorDetails: e.toString(), data: null}
    }
}
