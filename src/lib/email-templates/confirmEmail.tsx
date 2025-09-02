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
import { ConfirmEmailProps } from "./types";

// const baseUrl = process.env.VERCEL_URL
//   ? `https://${process.env.VERCEL_URL}`
//   : "";

export function ConfirmEmail({ verificationLink }: ConfirmEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Potwierdź swój adres email</Preview>
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
              <Heading style={h1}>Potwierdź swój adres email</Heading>
              <Text style={mainText}>
                Dziękujemy za rozpoczęcie rejestracji w serwisie Wieczorny
                Szept. Aby potwierdzić swój adres email, kliknij w poniższy
                link. Jeśli nie zakładasz konta, zignoruj tę wiadomość.
              </Text>
              <Section style={verificationSection}>
                <Text style={verifyText}>Jednorazowy link potwierdzający</Text>

                <Link href={verificationLink} style={codeText}>
                  Potwierdz email
                </Link>
                <Text style={validityText}>
                  (ten link jest ważny przez 24 godziny)
                </Text>
              </Section>
            </Section>
            <Hr />
            <Section style={lowerSection}>
              <Text style={cautionText}>
                Wieczorny Szept nigdy nie wysyła wiadomości e-mail w których
                prosi o ujawnienie lub weryfikację hasła, karty kredytowej, lub
                numeru konta bankowego.
              </Text>
            </Section>
          </Section>
          <Text style={footerText}>
            {
              "Ta wiadomość została wygenerowana i wysłana automatycznie przez serwis Wieczorny Szept. Nasz "
            }
            <Link
              href="https://wieczornyszept.pl/regulamin"
              target="_blank"
              style={link}
            >
              regulamin
            </Link>
            {" oraz "}
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
    "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "15px",
  textAlign: "center" as const,
};

const link = {
  color: "#2754C5",
  fontFamily:
    "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "12px",
  textDecoration: "underline",
};

const text = {
  color: "#333",
  fontFamily:
    "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
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
  textAlign: "left" as const,
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

const mainText = {
  ...text,
  marginBottom: "18px",
  textAlign: "left" as const,
};

const cautionText = { ...text, margin: "0px", textAlign: "left" as const };
