import "server-only";
import { CreateEmailResponseSuccess, Resend } from "resend";
import { EmailTemplate } from "./email-templates/singup";

interface EmailClientInterface {
  sendEmail(
    to: string,
    subject: string,
    message: string
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
    this.fromEmail = process.env.FROM_EMAIL || "noreply@wieczornyszept.pl";
    this.resend = new Resend(this.apiKey);
  }

  async sendEmail(
    to: string,
    subject: string,
    message: string
  ): Promise<CreateEmailResponseSuccess> {
    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: [to],
      subject: subject,
      react: EmailTemplate({ firstName: "John" }),
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

class LocalEmailClient implements EmailClientInterface {
  async sendEmail(
    to: string,
    subject: string,
    message: string
  ): Promise<CreateEmailResponseSuccess> {
    console.log(`[LOCAL] Sending email to ${to}: ${subject}`);
    console.log(`[LOCAL] Message: ${message}`);

    return {
      id: "123",
    };
  }
}

export async function sendEmail(to: string, subject: string, message: string) {
  const configuredEmailClient = process.env.EMAIL_API_PROVIDER;

  switch (configuredEmailClient) {
    case "resend":
      const resendEmailClient = new ResendEmailClient();
      await resendEmailClient.sendEmail(to, subject, message);
      break;
    case "local":
      const localEmailClient = new LocalEmailClient();
      await localEmailClient.sendEmail(to, subject, message);
      break;
    default:
      throw new Error(
        `Unsupported Email API provider: ${configuredEmailClient}`
      );
  }
}
