import "server-only";
import { SMSAPI } from "smsapi";

interface SmsClientInterface {
  sendSms(phoneNumber: string, message: string): Promise<void>;
}

class SmsApiClient implements SmsClientInterface {
  private readonly authToken: string;
  private readonly smsapi: SMSAPI;

  constructor() {
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

class SmsPlanetClient implements SmsClientInterface {
  private readonly apiUrl = "https://api2.smsplanet.pl/sms";
  private readonly authToken: string;

  constructor() {
    this.authToken = process.env.SMS_PLANET_TOKEN || "";
    if (!this.authToken) {
      throw new Error(
        "[ SmsPlanetClient] SMS_PLANET_TOKEN environment variable is required"
      );
    }
  }

  async sendSms(phoneNumber: string, message: string): Promise<void> {
    try {
      console.log(
        `[ SmsPlanetClient.sendSms ] Sending SMS via SmsPlanet to ${phoneNumber}: ${message}`
      );

      const formData = new URLSearchParams({
        from: "TEST",
        to: phoneNumber,
        msg: message,
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

class LocalSmsClient implements SmsClientInterface {
  async sendSms(phoneNumber: string, message: string): Promise<void> {
    console.log(
      `[ LocalSmsClient.sendSms ] Sending SMS to ${phoneNumber}: ${message}`
    );
  }
}

export async function sendSms(phoneNumber: string, message: string) {
  const configuredSmsClient = process.env.SMS_API_PROVIDER;

  switch (configuredSmsClient) {
    case "smsapi":
      const smsApiClient = new SmsApiClient();
      await smsApiClient.sendSms(phoneNumber, message);
      break;
    case "smsplanet":
      const smsPlanetClient = new SmsPlanetClient();
      await smsPlanetClient.sendSms(phoneNumber, message);
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
