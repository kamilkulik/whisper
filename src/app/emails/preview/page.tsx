import { ConfirmCodeViaEmail } from "@/lib/email-templates";
import { WelcomeEmail } from "@/lib/email-templates/welcome";

export default function EmailPreview() {
  return <ConfirmCodeViaEmail verificationCode="123456" />;
}
