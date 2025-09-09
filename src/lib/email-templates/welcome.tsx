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
import { WelcomeEmailProps } from "./types";
import { SubscriptionType } from "@prisma/client";
import { Footer, text } from "./shared";
import { getTranslations } from "next-intl/server";
import { Disclaimer } from "./shared/disclaimer";

const baseUrl = process.env.SZEPT_URL
  ? `https://${process.env.SZEPT_URL}`
  : "http://localhost:3000";

export async function WelcomeEmail({
  locale,
  subscriptionType,
}: WelcomeEmailProps) {
  const t = await getTranslations({
    locale,
    namespace: "EmailTemplates.Welcome",
  });

  return (
    <Html>
      <Head />
      <Body style={main}>
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
              {/* <Heading style={h1}>Witamy w serwisie Wieczorny Szept</Heading> */}
              <Text style={mainText}>
                {t("greeting")} <br />
                <br />
                {subscriptionType === SubscriptionType.ONE_TIME
                  ? t("paragraph-1-one-time")
                  : subscriptionType === SubscriptionType.TRIAL
                    ? t("paragraph-1-trial")
                    : t("paragraph-1-monthly")}
                <br />
                {subscriptionType === SubscriptionType.ONE_TIME
                  ? t("paragraph-2-one-time")
                  : subscriptionType === SubscriptionType.TRIAL
                    ? t("paragraph-2-trial")
                    : t("paragraph-2-monthly")}
              </Text>
              {subscriptionType === SubscriptionType.TRIAL ? (
                <Text style={mainText}>
                  {t("CTA-copy-trial")}{" "}
                  <Link href={`${baseUrl}/dashboard`} style={dashboardLink}>
                    {t("dashboard-link")}
                  </Link>
                  .
                </Text>
              ) : subscriptionType === SubscriptionType.ONE_TIME ? null : (
                <Text style={mainText}>
                  {t("CTA-copy-monthly")}{" "}
                  <Link href={`${baseUrl}/dashboard`} style={dashboardLink}>
                    {t("dashboard-link")}
                  </Link>
                  .
                </Text>
              )}
              <Text style={bottomText}>
                {t("thank-you")}
                <br />
                <br />
                {t("signature")}
                <br />
                {t("signature-team")}
              </Text>
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

const dashboardLink = {
  color: "#2754C5",
  fontFamily:
    "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  textDecoration: "underline",
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

const mainText = {
  ...text,
  marginBottom: "12px",
  textAlign: "left" as const,
};

const bottomText = {
  ...text,
  marginBottom: "18px",
  textAlign: "left" as const,
};
