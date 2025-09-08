import { Link, Text } from "@react-email/components";
import { footerLink, text } from "./styles";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("EmailTemplates.SHARED");
  return (
    <Text style={footerText}>
      {t("footer")}
      {t("our")}
      <Link
        href="https://wieczornyszept.pl/regulamin"
        target="_blank"
        style={footerLink}
      >
        {t("link-1")}
      </Link>
      {t("and")}
      <Link
        href="https://wieczornyszept.pl/polityka-prywatnosci"
        target="_blank"
        style={footerLink}
      >
        {t("link-2")}
      </Link>
      .
    </Text>
  );
}

const footerText = {
  ...text,
  fontSize: "12px",
  padding: "0 20px",
  textAlign: "left" as const,
};
