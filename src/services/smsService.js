import twilio from 'twilio';
import { twilioCredentials } from './constants';

let client = twilio(twilioCredentials.accountSid, twilioCredentials.authToken);

class SmsService {
    sendVerificationCode(number, code) {
        let message = `Welcome to Headway app. To activate your account please enter ${code} in the app.`;

        client.messages.create({
            to: number,
            from: twilioCredentials.fromNumber,
            body: message,
        }, function (err, message) {
            // console.log('failed to send message: ', err);
            // console.log('sent message: ', message);
        });
    }

    inviteContact(user, contact) {
        let message = `Hi ${contact.displayName}, \
    Your friend ${user.name} invited to the Headway app. \
    Install the app to help ${user.name} explore the world. \
    Make your cicle and start your journey. \

    Regards
    - Headway Team`;

        client.messages.create({
            to: contact.PhoneNumber,
            from: twilioCredentials.fromNumber,
            body: message,
        }, function (err, message) {
        });
    }
}

let smsService = new SmsService();
export default smsService;
