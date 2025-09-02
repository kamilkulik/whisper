import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { ConfirmationCodeViaEmailProps } from "./types";

// const baseUrl = process.env.VERCEL_URL
//   ? `https://${process.env.VERCEL_URL}`
//   : "";

export function ConfirmCodeViaEmail({
  verificationCode,
}: ConfirmationCodeViaEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Confirm Email</Preview>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={imageSection}>
              {/* <Img
                src={`${baseUrl}/static/aws-logo.png`}
                width="75"
                height="45"
                alt="AWS's Logo"
              /> */}
            </Section>
            <Section style={upperSection}>
              <Heading style={h1}>Weryfikacja adresu email</Heading>
              <Text style={mainText}>
                Dziękujemy za rozpoczęcie procesu tworzenia nowego konta
                Wieczorny Szept. Chcemy się upewnić, że to ty. Prosimy o
                wprowadzenie następującego kodu weryfikacyjnego, gdy zostaniesz
                poproszony. Jeśli nie chcesz tworzyć konta, możesz zignorować tę
                wiadomość.
              </Text>
              <Section style={verificationSection}>
                <Text style={verifyText}>Kod weryfikacyjny</Text>

                <Text style={codeText}>{verificationCode}</Text>
                <Text style={validityText}>
                  (Ten kod jest ważny przez 2 minuty)
                </Text>
              </Section>
            </Section>
            <Hr />
            <Section style={lowerSection}>
              <Text style={cautionText}>
                Wieczorny Szept nigdy nie wysyła wiadomości e-mail i nie poprosi
                o ujawnienie lub weryfikację hasła, karty kredytowej, lub numeru
                konta bankowego.
              </Text>
            </Section>
          </Section>
          <Text style={footerText}>
            Ta wiadomość została wygenerowana i wysłana przez Wieczorny Szept,
            <Link
              href="https://wieczornyszept.pl/regulamin"
              target="_blank"
              style={link}
            >
              regulamin
            </Link>
            <Link href="https://wieczornyszept.pl" target="_blank" style={link}>
              Wieczorny Szept
            </Link>
            <Link
              href="https://wieczornyszept.pl/polityka-prywatnosci"
              target="_blank"
              style={link}
            >
              polityka prywatności
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#fff",
  color: "#212121",
};

const container = {
  padding: "20px",
  margin: "0 auto",
  backgroundColor: "#eee",
};

const h1 = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "15px",
};

const link = {
  color: "#2754C5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  textDecoration: "underline",
};

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  margin: "24px 0",
};

const imageSection = {
  backgroundColor: "#252f3d",
  display: "flex",
  padding: "20px 0",
  alignItems: "center",
  justifyContent: "center",
};

const coverSection = { backgroundColor: "#fff" };

const upperSection = { padding: "25px 35px" };

const lowerSection = { padding: "25px 35px" };

const footerText = {
  ...text,
  fontSize: "12px",
  padding: "0 20px",
};

const verifyText = {
  ...text,
  margin: 0,
  fontWeight: "bold",
  textAlign: "center" as const,
};

const codeText = {
  ...text,
  fontWeight: "bold",
  fontSize: "36px",
  margin: "10px 0",
  textAlign: "center" as const,
};

const validityText = {
  ...text,
  margin: "0px",
  textAlign: "center" as const,
};

const verificationSection = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mainText = { ...text, marginBottom: "14px" };

const cautionText = { ...text, margin: "0px" };
