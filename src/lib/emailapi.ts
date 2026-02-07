import "server-only";

import { CreateEmailResponseSuccess, Resend } from "resend";
import {
  ConfirmCodeViaEmail,
  ConfirmEmail,
  PaymentLink,
  WelcomeEmail,
  SendEmailProps,
  SendEmailClientProps,
  TrialExpirationNotification,
} from "./email-templates";

interface EmailClientInterface {
  sendEmail(props: SendEmailClientProps): Promise<CreateEmailResponseSuccess>;
}

export type EmailTemplate =
  | "confirm-email"
  | "confirmation-code-via-email"
  | "payment-link"
  | "welcome"
  | "trial-expiration-notification";

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
      process.env.FROM_EMAIL || "Evening Whisper <noreply@eveningwhisper.app>";
    this.resend = new Resend(this.apiKey);
  }

  async sendEmail({
    to,
    subject,
    template,
  }: SendEmailClientProps): Promise<CreateEmailResponseSuccess> {
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
  async sendEmail(
    props: SendEmailClientProps
  ): Promise<CreateEmailResponseSuccess> {
    const { to, subject } = props;
    console.log(`[LOCAL] Sending email to ${to}: ${subject}`);

    return {
      id: "123",
    };
  }
}

export async function sendEmail(props: SendEmailProps) {
  const configuredEmailClient = process.env.EMAIL_API_PROVIDER;
  const { locale, template } = props;
  let templateToUse: React.ReactElement;

  switch (template) {
    case "welcome":
      templateToUse = await WelcomeEmail({
        locale,
        userName: props.userName,
        subscriptionType: props.subscriptionType,
      });
      break;
    case "confirm-email":
      templateToUse = await ConfirmEmail({
        locale,
        verificationLink: props.verificationLink,
      });
      break;
    case "confirmation-code-via-email":
      console.log("Verification code", props.verificationCode);
      templateToUse = await ConfirmCodeViaEmail({
        locale,
        verificationCode: props.verificationCode ?? "421341",
      });
      break;
    case "payment-link":
      templateToUse = PaymentLink({
        locale,
        paymentLinkUrl: props.paymentLinkUrl,
      });
      break;
    case "trial-expiration-notification":
      templateToUse = await TrialExpirationNotification({
        locale,
      });
      break;
    default:
      throw new Error(`Unsupported template: ${template}`);
  }

  switch (configuredEmailClient) {
    case "resend":
      const resendEmailClient = new ResendEmailClient();
      await resendEmailClient.sendEmail({
        ...props,
        template: templateToUse,
      });
      break;
    case "local":
      const localEmailClient = new LocalEmailClient();
      await localEmailClient.sendEmail({
        ...props,
        template: templateToUse,
      });
      break;
    default:
      throw new Error(
        `Unsupported Email API provider: ${configuredEmailClient}`
      );
  }
}
