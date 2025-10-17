import { SubscriptionType } from "@prisma/client";
import { Locale } from "next-intl";

type BaseEmailProps = {
  to: string;
  subject: string;
  locale: string;
};

export type ConfirmEmailProps = {
  locale: string;
  verificationLink: string;
};

export type ConfirmationCodeViaEmailProps = {
  locale: string;
  verificationCode: string;
};

export type WelcomeEmailProps = {
  locale: Locale;
  userName?: string;
  subscriptionType: SubscriptionType;
};

export type PaymentLinkProps = {
  locale: string;
  paymentLinkUrl: string;
};

export type TrialExpirationNotificationProps = {
  locale: string;
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
  | "welcome"
  | "trial-expiration-notification";

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

export type SendTrialExpirationNotification = BaseEmailProps & {
  template: "trial-expiration-notification";
};

export type SendEmailClientProps = {
  template: React.ReactElement;
} & BaseEmailProps;

export type SendEmailProps =
  | SendConfirmEmail
  | SendConfirmationCodeViaEmail
  | SendPaymentLink
  | SendWelcomeEmail
  | SendTrialExpirationNotification;
