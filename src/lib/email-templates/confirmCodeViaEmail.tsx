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
import { getTranslations } from "next-intl/server";
import { Footer } from "./shared/footer";
import { Disclaimer } from "./shared/disclaimer";

// const baseUrl = process.env.VERCEL_URL
//   ? `https://${process.env.VERCEL_URL}`
//   : "";

export async function ConfirmCodeViaEmail({
  locale,
  verificationCode,
}: ConfirmationCodeViaEmailProps) {
  const t = await getTranslations({
    locale,
    namespace: "EmailTemplates.ConfirmCodeViaEmail",
  });
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>{t("preview")}</Preview>
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
              <Heading style={h1}>{t("title")}</Heading>
              <Text style={mainText}>{t("paragraph-1")}</Text>
              <Section style={verificationSection}>
                <Text style={verifyText}>{t("verification-code-title")}</Text>

                <Text style={codeText}>{verificationCode}</Text>
                <Text style={validityText}>
                  {t("verification-code-disclaimer")}
                </Text>
              </Section>
            </Section>
            <Hr />
            <Disclaimer locale={locale} />
          </Section>
          <Footer locale={locale} />
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

const cautionText = {
  ...text,
  fontSize: "12px",
  margin: "0px",
  textAlign: "left" as const,
};
