import "server-only";
import { SMSAPI } from "smsapi";
import twilio, { RestException } from "twilio";
import { isValidE164, normalizeE164 } from "./consts";
import { getTimezoneOffset, TimezoneOption } from "@/app/_consts";
import { DEFAULT_DELIVERY_HOUR, DEFAULT_TIMEZONE } from "@/app/_consts";
import {
  MessageListInstanceCreateOptions,
  MessageScheduleType,
} from "twilio/lib/rest/api/v2010/account/message";

export interface SchedulingOptions {
  timezone: string; // IANA timezone (e.g., "Europe/Warsaw", "America/New_York")
  deliveryHour: number; // Hour in user's local time (0-23), message sent at HH:59
}

abstract class SmsClientInterface {
  abstract sendSms(
    phoneNumber: string,
    message: string,
    scheduled: boolean,
    schedulingOptions?: SchedulingOptions,
  ): Promise<void>;

  /**
   * Creates a UTC ISO-8601 format Date for when the SMS should be delivered.
   * Uses ISO-8601 format with explicit timezone offset: YYYY-MM-DDTHH:mm:ss±hh:mm
   *
   * @param timezone - IANA timezone string (e.g., "Europe/Warsaw")
   * @param deliveryHour - Hour in user's local time (0-23)
   * @returns Date object representing the UTC time for delivery at HH:59 in user's timezone
   */
  protected createUTCdistributionDate(
    timezone: TimezoneOption = DEFAULT_TIMEZONE,
    deliveryHour: number = DEFAULT_DELIVERY_HOUR,
  ): Date {
    const nowUtc = new Date();

    // Get the current date in the user's timezone using ISO-8601 format (YYYY-MM-DD)
    // "en-CA" locale produces ISO-8601 date format
    const dateFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const localDateStr = dateFormatter.format(nowUtc); // Format: YYYY-MM-DD (ISO-8601)

    // Get the timezone offset (handles DST automatically)
    const offset = getTimezoneOffset(timezone);

    // Build ISO-8601 compliant date-time string with explicit offset: "YYYY-MM-DDTHH:59:00±hh:mm"
    // Example: "2025-02-16T20:59:00+01:00" for Europe/Warsaw
    const iso8601String = `${localDateStr}T${deliveryHour.toString().padStart(2, "0")}:59:00${offset}`;

    // JavaScript Date constructor automatically converts ISO-8601 with offset to UTC
    return new Date(iso8601String);
  }

  /**
   * Formats a UTC Date to CET date string for SMS Planet API
   * Format: DD-MM-YYYY HH:mm:ss
   */
  protected toTimezoneDate(date: Date, timezone: string = "CET"): string {
    return new Intl.DateTimeFormat("nl-NL", {
      dateStyle: "short",
      timeStyle: "medium",
      timeZone: timezone,
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

  async sendSms(
    phoneNumber: string,
    message: string,
    _scheduled: boolean,
    _schedulingOptions?: SchedulingOptions,
  ): Promise<void> {
    try {
      console.log(
        `[ SmsApiClient.sendSms ]Sending SMS to ${phoneNumber}: ${message}`,
      );
      const result = await this.smsapi.sms.sendSms(`${phoneNumber}`, message);
      console.log(`[ SmsApiClient.sendSms ] SMS API response:`, result);
    } catch (error) {
      console.error(
        `[ SmsApiClient.sendSms ] Failed to send SMS to ${phoneNumber}:`,
        error,
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
        "[ SmsPlanetClient] SMS_PLANET_TOKEN environment variable is required",
      );
    }
  }

  async sendSms(
    phoneNumber: string,
    message: string,
    scheduled: boolean,
    schedulingOptions?: SchedulingOptions,
  ): Promise<void> {
    try {
      console.log(
        `[ SmsPlanetClient.sendSms ] Sending SMS via SmsPlanet to ${phoneNumber}: ${message}`,
      );

      // Calculate scheduled time based on user's timezone and delivery hour
      let scheduledDate: string | undefined;
      if (scheduled) {
        const timezone =
          (schedulingOptions?.timezone as TimezoneOption) ?? DEFAULT_TIMEZONE;
        const deliveryHour =
          schedulingOptions?.deliveryHour ?? DEFAULT_DELIVERY_HOUR;
        const utcDistributionDate = this.createUTCdistributionDate(
          timezone,
          deliveryHour,
        );
        // SMS Planet expects CET time format: dd-MM-yyyy HH:mm:ss
        scheduledDate = this.toTimezoneDate(utcDistributionDate, "CET");
        console.log(
          `[ SmsPlanetClient.sendSms ] Scheduling for timezone ${timezone}, hour ${deliveryHour}:59, CET: ${scheduledDate}`,
        );
      }

      // Date format dd-MM-yyyy HH:mm:ss e.g. 13-11-2025 08:38:00
      const formData = new URLSearchParams({
        from: "Szept",
        to: phoneNumber,
        msg: message,
        ...(scheduledDate ? { date: scheduledDate } : {}),
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
          `SMS Planet API HTTP error: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error(
        `[ SmsPlanetClient.sendSms ] Failed to send SMS via SmsPlanet to ${phoneNumber}:`,
        error,
      );
      throw error;
    }
  }
}

class TwilioClient extends SmsClientInterface {
  private readonly client: twilio.Twilio;
  private readonly fromPhoneNumber: string;
  private readonly messagingServiceSid: string;

  constructor() {
    super();
    const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID || "";
    const authToken = process.env.TWILIO_AUTH_TOKEN || "";
    const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "";

    if (!accountSid) {
      throw new Error(
        "[ TwilioClient ] TWILIO_ACCOUNT_SID environment variable is required",
      );
    }
    if (!authToken) {
      throw new Error(
        "[ TwilioClient ] TWILIO_AUTH_TOKEN environment variable is required",
      );
    }
    if (!fromPhoneNumber) {
      throw new Error(
        "[ TwilioClient ] TWILIO_PHONE_NUMBER environment variable is required",
      );
    }

    this.client = twilio(accountSid, authToken);
    this.fromPhoneNumber = fromPhoneNumber;
    this.messagingServiceSid = messagingServiceSid;
  }

  async sendSms(
    phoneNumber: string,
    message: string,
    scheduled: boolean,
    schedulingOptions?: SchedulingOptions,
  ): Promise<void> {
    try {
      console.log(
        `[ TwilioClient.sendSms ] Sending SMS via Twilio to ${phoneNumber}: ${message}`,
      );

      const messageOptions: MessageListInstanceCreateOptions = {
        body: message,
        to: phoneNumber,
        from: this.fromPhoneNumber,
        messagingServiceSid: this.messagingServiceSid,
      };

      // If scheduled is true, set the sendAt time based on user's timezone and delivery hour
      if (scheduled) {
        const timezone =
          (schedulingOptions?.timezone as TimezoneOption) ?? DEFAULT_TIMEZONE;
        const deliveryHour =
          schedulingOptions?.deliveryHour ?? DEFAULT_DELIVERY_HOUR;
        const sendAtDate = this.createUTCdistributionDate(
          timezone,
          deliveryHour,
        );
        messageOptions.sendAt = sendAtDate; // ISO-8601
        messageOptions.scheduleType = "fixed";

        console.log(
          `[ TwilioClient.sendSms ] Scheduling SMS for ${sendAtDate.toISOString()} (timezone: ${timezone}, hour: ${deliveryHour}:59)`,
        );
      }

      const result = await this.client.messages.create(messageOptions);

      console.log(
        `[ TwilioClient.sendSms ] Twilio message sent successfully. SID: ${result.sid}`,
      );
    } catch (error) {
      if (error instanceof RestException) {
        console.error(
          `[ TwilioClient.sendSms ] Twilio Error ${error.code}: ${error.message}`,
          {
            status: error.status,
            moreInfo: error.moreInfo,
          },
        );
        throw new Error(`Twilio API error ${error.code}: ${error.message}`);
      } else {
        console.error(
          `[ TwilioClient.sendSms ] Failed to send SMS via Twilio to ${phoneNumber}:`,
          error,
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

  async sendSms(
    phoneNumber: string,
    message: string,
    scheduled: boolean,
    schedulingOptions?: SchedulingOptions,
  ): Promise<void> {
    const timezone = schedulingOptions?.timezone ?? DEFAULT_TIMEZONE;
    const deliveryHour =
      schedulingOptions?.deliveryHour ?? DEFAULT_DELIVERY_HOUR;
    console.log(
      `[ LocalSmsClient.sendSms ] Sending SMS to ${phoneNumber}: ${message}`,
      scheduled
        ? `(scheduled for ${deliveryHour}:59 in ${timezone})`
        : "(immediate)",
    );
  }
}

export async function sendSms(
  phoneNumber: string,
  message: string,
  scheduled: boolean,
  schedulingOptions?: SchedulingOptions,
) {
  // Normalize and validate E.164 format before sending
  const normalizedPhone = normalizeE164(phoneNumber);
  if (!isValidE164(normalizedPhone)) {
    throw new Error(
      `[ sendSms ] Invalid phone number format. Expected E.164 format (e.g., +48791321431), got: ${phoneNumber}`,
    );
  }

  const configuredSmsClient = process.env.SMS_API_PROVIDER;

  switch (configuredSmsClient) {
    case "smsapi":
      const smsApiClient = new SmsApiClient();
      await smsApiClient.sendSms(
        normalizedPhone,
        message,
        scheduled,
        schedulingOptions,
      );
      break;
    case "smsplanet":
      const smsPlanetClient = new SmsPlanetClient();
      await smsPlanetClient.sendSms(
        normalizedPhone,
        message,
        scheduled,
        schedulingOptions,
      );
      break;
    case "twilio":
      const twilioClient = new TwilioClient();
      await twilioClient.sendSms(
        normalizedPhone,
        message,
        scheduled,
        schedulingOptions,
      );
      break;
    case "local":
      const localSmsClient = new LocalSmsClient();
      await localSmsClient.sendSms(
        normalizedPhone,
        message,
        scheduled,
        schedulingOptions,
      );
      break;
    default:
      throw new Error(
        `[ sendSms ] Unsupported SMS API provider: ${configuredSmsClient}`,
      );
  }
}
