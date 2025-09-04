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

const baseUrl = process.env.SZEPT_URL
  ? `https://${process.env.SZEPT_URL}`
  : "http://localhost:3000";

export function WelcomeEmail(props: WelcomeEmailProps) {
  const { subscriptionType } = props;

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
              <Heading style={h1}>Witamy w serwisie Wieczorny Szept</Heading>
              <Text style={mainText}>
                Droga Czytelniczo, Drogi Czytelniku, <br />
                <br />
                {subscriptionType === SubscriptionType.ONE_TIME
                  ? "Cieszymy się z okazanego nam zaufania i rozpoczęcia 30 dniowej, jednorazowej subskrypcji Wieczornego Szeptu."
                  : "Cieszymy się z okazanego nam zaufania i rozpoczęcia subskrypcji Wieczornego Szeptu."}
                <br />
                {subscriptionType === SubscriptionType.ONE_TIME
                  ? "Od dziś, każdego wieczoru o 20:59 przez kolejne 30 dni, otrzymasz wiadomość, która ogrzeje Twoje serce i przyniesie chwilę spokoju."
                  : "Od dziś, każdego wieczoru o 20:59, otrzymasz wiadomość, która ogrzeje Twoje serce i przyniesie chwilę spokoju."}
              </Text>
              {subscriptionType === SubscriptionType.ONE_TIME ? null : (
                <Text style={mainText}>
                  Twoją subskrypcją możesz zarządzać w dowolnym momencie w{" "}
                  <Link href={`${baseUrl}/dashboard`} style={dashboardLink}>
                    Panelu Użytkownika
                  </Link>
                  .
                </Text>
              )}
              <Text style={bottomText}>
                Dziękujemy, że jesteś z nami. Niech każdy szept będzie dla
                Ciebie źródłem uśmiechu i refleksji.
                <br />
                <br />Z serdecznymi pozdrowieniami,
                <br />
                Zespół Wieczornego Szeptu 🌙
              </Text>
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

const dashboardLink = {
  color: "#2754C5",
  fontFamily:
    "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
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

const cautionText = {
  ...text,
  fontSize: "12px",
  margin: "0px",
  textAlign: "left" as const,
};
