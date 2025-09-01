import { WelcomeEmail } from "@/lib/email-templates/welcome";

export default function EmailPreview() {
  return (
    <WelcomeEmail userName="John Doe" confirmEmailUrl="https://example.com" />
  );
}
