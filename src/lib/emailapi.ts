import "server-only";

import { CreateEmailResponseSuccess, Resend } from "resend";
import {
  ConfirmCodeViaEmail,
  ConfirmEmail,
  PaymentLink,
  WelcomeEmail,
  EmailProps,
  SendEmailProps,
} from "./email-templates";

interface EmailClientInterface {
  sendEmail(props: EmailProps): Promise<CreateEmailResponseSuccess>;
}

export type EmailTemplate =
  | "confirm-email"
  | "confirmation-code-via-email"
  | "payment-link"
  | "welcome";

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

  async sendEmail({
    to,
    subject,
    message,
    template,
  }: SendEmailProps): Promise<CreateEmailResponseSuccess> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
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
  async sendEmail(props: SendEmailProps): Promise<CreateEmailResponseSuccess> {
    const { to, subject, message } = props;
    console.log(`[LOCAL] Sending email to ${to}: ${subject}`);
    console.log(`[LOCAL] Message: ${message}`);

    return {
      id: "123",
    };
  }
}

export async function sendEmail(props: SendEmailProps) {
  const configuredEmailClient = process.env.EMAIL_API_PROVIDER;
  const { template } = props;
  let templateToUse: React.ReactElement;

  switch (template) {
    case "welcome":
      templateToUse = WelcomeEmail({
        userName: props.userName,
      });
      break;
    case "confirm-email":
      templateToUse = ConfirmEmail({
        verificationLink: "",
      });
      break;
    case "confirmation-code-via-email":
      templateToUse = ConfirmCodeViaEmail({
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
      await resendEmailClient.sendEmail(props);
      break;
    case "local":
      const localEmailClient = new LocalEmailClient();
      await localEmailClient.sendEmail(props);
      break;
    default:
      throw new Error(
        `Unsupported Email API provider: ${configuredEmailClient}`
      );
  }
}
