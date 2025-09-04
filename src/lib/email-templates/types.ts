import { SubscriptionType } from "@prisma/client";

type BaseEmailProps = {
  to: string;
  subject: string;
};

export type ConfirmEmailProps = {
  verificationLink: string;
};

export type ConfirmationCodeViaEmailProps = {
  verificationCode: string;
};

export type WelcomeEmailProps = {
  userName?: string;
  subscriptionType: SubscriptionType;
};

export type PaymentLinkProps = {
  paymentLinkUrl: string;
};

export type EmailProps =
  | ConfirmEmailProps
  | ConfirmationCodeViaEmailProps
  | WelcomeEmailProps
  | PaymentLinkProps;

export type EmailTemplate =
  | "confirm-email"
  | "confirmation-code-via-email"
  | "payment-link"
  | "welcome";

export type SendConfirmEmail = BaseEmailProps &
  ConfirmEmailProps & {
    template: "confirm-email";
  };

export type SendConfirmationCodeViaEmail = BaseEmailProps &
  ConfirmationCodeViaEmailProps & {
    template: "confirmation-code-via-email";
  };

export type SendPaymentLink = BaseEmailProps &
  PaymentLinkProps & {
    template: "payment-link";
  };

export type SendWelcomeEmail = BaseEmailProps &
  WelcomeEmailProps & {
    template: "welcome";
  };

export type SendEmailClientProps = {
  template: React.ReactElement;
} & BaseEmailProps;

export type SendEmailProps =
  | SendConfirmEmail
  | SendConfirmationCodeViaEmail
  | SendPaymentLink
  | SendWelcomeEmail;
