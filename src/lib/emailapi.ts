import "server-only";
import { CreateEmailResponseSuccess, Resend } from "resend";
import { WelcomeEmail } from "./email-templates/welcome";
import { ConfirmEmail } from "./email-templates/confirm-email";

interface EmailClientInterface {
  sendEmail(
    to: string,
    subject: string,
    message: string,
    template: React.ReactElement
  ): Promise<CreateEmailResponseSuccess>;
}

class ResendEmailClient implements EmailClientInterface {
  private readonly apiKey: string;
  private readonly fromEmail: string;
  private readonly resend: Resend;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("RESEND_API_KEY environment variable is required");
    }
    this.fromEmail =
      process.env.FROM_EMAIL || "Wieczorny Szept <noreply@wieczornyszept.pl>";
    this.resend = new Resend(this.apiKey);
  }

  async sendEmail(
    to: string,
    subject: string,
    message: string,
    template: React.ReactElement
  ): Promise<CreateEmailResponseSuccess> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject: subject,
        react: template,
      });

      if (error) {
        console.error(
          `Failed to send email to ${to}:`,
          JSON.stringify(error, null, 2)
        );
        throw new Error("Well, resend says no");
      }

      return data;
    } catch (error) {
      console.error(`Technical issue sending email ${to}:`, error);
      throw new Error(`Technical issue sending email`);
    }
  }
}

class LocalEmailClient implements EmailClientInterface {
  async sendEmail(
    to: string,
    subject: string,
    message: string,
    template: React.ReactElement
  ): Promise<CreateEmailResponseSuccess> {
    console.log(`[LOCAL] Sending email to ${to}: ${subject}`);
    console.log(`[LOCAL] Message: ${message}`);

    return {
      id: "123",
    };
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  message: string,
  template: string | null
) {
  const configuredEmailClient = process.env.EMAIL_API_PROVIDER;
  let templateToUse: React.ReactElement;

  switch (template) {
    case "welcome":
      templateToUse = WelcomeEmail({
        userName: "User",
        confirmEmailUrl: "https://example.com/verify-email?email=" + to,
      });
      break;
    case "confirm-email":
      templateToUse = ConfirmEmail({
        userName: "User",
        verificationCode: "",
      });
      break;
    default:
      throw new Error(`Unsupported template: ${template}`);
  }

  console.log("templateToUse", templateToUse);

  switch (configuredEmailClient) {
    case "resend":
      const resendEmailClient = new ResendEmailClient();
      await resendEmailClient.sendEmail(to, subject, message, templateToUse);
      break;
    case "local":
      const localEmailClient = new LocalEmailClient();
      await localEmailClient.sendEmail(to, subject, message, templateToUse);
      break;
    default:
      throw new Error(
        `Unsupported Email API provider: ${configuredEmailClient}`
      );
  }
}
