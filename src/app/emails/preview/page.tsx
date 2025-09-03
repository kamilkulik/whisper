import { ConfirmCodeViaEmail, ConfirmEmail } from "@/lib/email-templates";
import { WelcomeEmail } from "@/lib/email-templates/welcome";

export default function EmailPreview() {
  return (
    <ConfirmEmail verificationLink="https://wieczornyszept.pl/verify-email" />
  );
}
