import { Body, Head, Html, Text } from "@react-email/components";
import { PaymentLinkProps } from "./types";

export function PaymentLink({ paymentLinkUrl }: PaymentLinkProps) {
  return (
    <Html>
      <Head />
      <Body>
        <Text>{paymentLinkUrl}</Text>
      </Body>
    </Html>
  );
}
