import "server-only";
import { SMSAPI } from "smsapi";
import twilio, { RestException } from "twilio";

abstract class SmsClientInterface {
  abstract sendSms(
    phoneNumber: string,
    message: string,
    scheduled: boolean
  ): Promise<void>;

  // ON server
  protected createUTCdistributionDate(): Date {
    // Current local Date (UTC)
    const nowUtc = new Date();

    const year = nowUtc.getUTCFullYear();
    const month = nowUtc.getUTCMonth();
    const day = nowUtc.getUTCDate();

    // CET = UTC+1 → so 20:59 CET = 19:59 UTC
    const utcHour = 19; // 19
    const minute = 59;
    const second = 0;

    // Build the exact UTC timestamp
    return new Date(Date.UTC(year, month, day, utcHour, minute, second));
  }

  // DD-MM-YYYY
  protected toCETDate(date: Date): string {
    return new Intl.DateTimeFormat("nl-NL", {
      dateStyle: "short",
      timeStyle: "medium",
      timeZone: "CET",
    })
      .format(date)
      .replace(",", "");
  }
}

class SmsApiClient extends SmsClientInterface {
  private readonly authToken: string;
  private readonly smsapi: SMSAPI;

  constructor() {
    super();
    this.authToken = process.env.SMS_API_TOKEN || "";
    if (!this.authToken) {
      throw new Error("SMS_API_TOKEN environment variable is required");
    }
    this.smsapi = new SMSAPI(this.authToken);
  }

  async sendSms(phoneNumber: string, message: string): Promise<void> {
    try {
      console.log(
        `[ SmsApiClient.sendSms ]Sending SMS to ${phoneNumber}: ${message}`
      );
      const result = await this.smsapi.sms.sendSms(`${phoneNumber}`, message);
      console.log(`[ SmsApiClient.sendSms ] SMS API response:`, result);
    } catch (error) {
      console.error(
        `[ SmsApiClient.sendSms ] Failed to send SMS to ${phoneNumber}:`,
        error
      );
    }
  }
}

class SmsPlanetClient extends SmsClientInterface {
  private readonly apiUrl = "https://api2.smsplanet.pl/sms";
  private readonly authToken: string;

  constructor() {
    super();
    this.authToken = process.env.SMS_PLANET_TOKEN || "";
    if (!this.authToken) {
      throw new Error(
        "[ SmsPlanetClient] SMS_PLANET_TOKEN environment variable is required"
      );
    }
  }

  async sendSms(
    phoneNumber: string,
    message: string,
    scheduled: boolean
  ): Promise<void> {
    try {
      console.log(
        `[ SmsPlanetClient.sendSms ] Sending SMS via SmsPlanet to ${phoneNumber}: ${message}`
      );

      // Date format dd-MM-yyyy HH:mm:ss e.g. 13-11-2025 08:38:00
      const formData = new URLSearchParams({
        from: "Szept",
        to: phoneNumber,
        msg: message,
        ...(scheduled
          ? { date: this.toCETDate(this.createUTCdistributionDate()) }
          : {}),
      });

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const result = await response.text();
      console.log("[ SmsPlanetClient.sendSms ] SMS Planet response:", result);

      // Try to parse the response as JSON to check for API errors
      try {
        const jsonResult = JSON.parse(result);

        // Check if the response contains an error
        if (jsonResult.errorCode || jsonResult.errorMsg) {
          const errorMessage = jsonResult.errorMsg || "Unknown error";
          const errorCode = jsonResult.errorCode || "Unknown";
          throw new Error(`SMS Planet API error ${errorCode}: ${errorMessage}`);
        }
      } catch (parseError) {
        // If parsing fails, it might be a successful response or different format
        // Continue with the original response
      }

      // Check HTTP status code as well
      if (!response.ok) {
        throw new Error(
          `SMS Planet API HTTP error: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error(
        `[ SmsPlanetClient.sendSms ] Failed to send SMS via SmsPlanet to ${phoneNumber}:`,
        error
      );
      throw error;
    }
  }
}

class TwilioClient extends SmsClientInterface {
  private readonly client: twilio.Twilio;
  private readonly fromPhoneNumber: string;

  constructor() {
    super();
    const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
    const authToken = process.env.TWILIO_AUTH_TOKEN || "";
    const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "";

    if (!accountSid) {
      throw new Error(
        "[ TwilioClient ] TWILIO_ACCOUNT_SID environment variable is required"
      );
    }
    if (!authToken) {
      throw new Error(
        "[ TwilioClient ] TWILIO_AUTH_TOKEN environment variable is required"
      );
    }
    if (!fromPhoneNumber) {
      throw new Error(
        "[ TwilioClient ] TWILIO_PHONE_NUMBER environment variable is required"
      );
    }

    this.client = twilio(accountSid, authToken);
    this.fromPhoneNumber = fromPhoneNumber;
  }

  async sendSms(
    phoneNumber: string,
    message: string,
    scheduled: boolean
  ): Promise<void> {
    try {
      console.log(
        `[ TwilioClient.sendSms ] Sending SMS via Twilio to ${phoneNumber}: ${message}`
      );

      const messageOptions: {
        body: string;
        to: string;
        from: string;
        sendAt?: Date;
      } = {
        body: message,
        to: phoneNumber,
        from: this.fromPhoneNumber,
      };

      // If scheduled is true, set the sendAt time to the UTC distribution date
      if (scheduled) {
        const sendAtDate = this.createUTCdistributionDate();
        messageOptions.sendAt = sendAtDate;
        console.log(
          `[ TwilioClient.sendSms ] Scheduling SMS for ${sendAtDate.toISOString()}`
        );
      }

      const result = await this.client.messages.create(messageOptions);
      console.log(
        `[ TwilioClient.sendSms ] Twilio message sent successfully. SID: ${result.sid}`
      );
    } catch (error) {
      if (error instanceof RestException) {
        console.error(
          `[ TwilioClient.sendSms ] Twilio Error ${error.code}: ${error.message}`,
          {
            status: error.status,
            moreInfo: error.moreInfo,
          }
        );
        throw new Error(
          `Twilio API error ${error.code}: ${error.message}`
        );
      } else {
        console.error(
          `[ TwilioClient.sendSms ] Failed to send SMS via Twilio to ${phoneNumber}:`,
          error
        );
        throw error;
      }
    }
  }
}

class LocalSmsClient extends SmsClientInterface {
  constructor() {
    super();
  }

  async sendSms(phoneNumber: string, message: string): Promise<void> {
    console.log(
      `[ LocalSmsClient.sendSms ] Sending SMS to ${phoneNumber}: ${message}`
    );
  }
}

export async function sendSms(
  phoneNumber: string,
  message: string,
  scheduled: boolean
) {
  const configuredSmsClient = process.env.SMS_API_PROVIDER;

  switch (configuredSmsClient) {
    case "smsapi":
      const smsApiClient = new SmsApiClient();
      await smsApiClient.sendSms(phoneNumber, message);
      break;
    case "smsplanet":
      const smsPlanetClient = new SmsPlanetClient();
      await smsPlanetClient.sendSms(phoneNumber, message, scheduled);
      break;
    case "twilio":
      const twilioClient = new TwilioClient();
      await twilioClient.sendSms(phoneNumber, message, scheduled);
      break;
    case "local":
      const localSmsClient = new LocalSmsClient();
      await localSmsClient.sendSms(phoneNumber, message);
      break;
    default:
      throw new Error(
        `[ sendSms ] Unsupported SMS API provider: ${configuredSmsClient}`
      );
  }
}
