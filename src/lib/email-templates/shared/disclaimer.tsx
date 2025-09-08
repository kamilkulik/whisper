import { Section, Text } from "@react-email/components";
import { text } from "./styles";
import { getTranslations } from "next-intl/server";

export async function Disclaimer() {
  const t = await getTranslations("EmailTemplates.SHARED");
  return (
    <Section style={lowerSection}>
      <Text style={cautionText}>{t("disclaimer")}</Text>
    </Section>
  );
}

const lowerSection = { padding: "25px 35px" };

const cautionText = {
  ...text,
  fontSize: "12px",
  margin: "0px",
  textAlign: "left" as const,
};
