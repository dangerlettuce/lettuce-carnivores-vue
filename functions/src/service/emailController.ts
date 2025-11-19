import admin from 'firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import { onCall } from 'firebase-functions/v2/https';
import type { CallableRequest } from 'firebase-functions/v2/https'
import { FunctionResponse } from '../types/Functions'
import type { Order } from '../types/Orders';
import { generateOrderStatusUpdateTemplate } from './emailTemplate';
import { useNodeMailer } from './emailService';
const collectionName = 'sentEmails' as const
interface EmailRequest extends CallableRequest { data: { order: Order, } }

export default onCall({},async(request: EmailRequest): Promise<FunctionResponse> => {
    const template = generateOrderStatusUpdateTemplate(request.data.order);
    if (!template) {
        return {success: false, error: true, message: 'Error generating email template', errorDetails: 'Unable to generate email template', data: template}
    }

    const emailRequest = {
      to: request.data.order.shippingInfo.email,
      subject: `Your Danger Lettuce order ${request.data.order.id} was shipped!`,
      html: template,
    };
    
    try {
        await useNodeMailer().sendMail(emailRequest);
        console.log(`Shipping notification email sent for order #${request.data.order.id}`);
    } catch (e: any) {
        console.error(`Error sending shipping notification email for order #${request.data.order.id}: ${e.toString()}`);
        return {success: false, error: true, message: 'Error sending email', errorDetails: e.toString(), data: e}
    }

    try {
        await admin.firestore().collection(collectionName).doc(request.data.order.id.toString()).set({...emailRequest, sentAt: Timestamp.now()})
        return {success: true, error: false, message: `Success! Email sent to ${request.data.order.shippingInfo.email}`, errorDetails: null, data: null} 
    } catch (e: any) {
        console.error({message: 'Error saving giveaway entry', data: request})
        return {success: false, error: true, message: 'Error saving entry', errorDetails: e.toString(), data: null}
    }
})
