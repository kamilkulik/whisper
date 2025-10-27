import { Link, Text } from "@react-email/components";
import { footerLink, text } from "./styles";
import { getTranslations } from "next-intl/server";

export async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "EmailTemplates.SHARED",
  });
  const CURRENT_HOST = process.env.CURRENT_HOST;
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  return (
    <Text style={footerText}>
      {t("footer")}
      {t("our")}
      <Link
        href={`${protocol}://${CURRENT_HOST}/terms`}
        target="_blank"
        style={footerLink}
      >
        {t("link-1")}
      </Link>
      {t("and")}
      <Link
        href={`${protocol}://${CURRENT_HOST}/privacy-policy`}
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
