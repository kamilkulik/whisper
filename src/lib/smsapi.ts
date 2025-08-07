import 'server-only'

import { SMSAPI } from 'smsapi';

export const smsapi = new SMSAPI(process.env.SMS_API_TOKEN || '');