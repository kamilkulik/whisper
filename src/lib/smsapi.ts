import "server-only";

import { SMSAPI } from "smsapi";

export const smsapi = new SMSAPI(process.env.SMS_API_TOKEN || "");

export async function sendSms(phoneNumber: string, message: string) {
  try {
    if (message) {
      // mock messageService for now to log to the console the message
      console.log(`Sending SMS to ${phoneNumber}: ${message}`);
      const result = await smsapi.sms.sendSms(`${phoneNumber}`, message);
      console.log(result);
    }
  } catch (error) {
    // in case of message service failure log the error
    console.error(
      `Failed to send message ${message} to ${phoneNumber}:`,
      error
    );
  }
}
