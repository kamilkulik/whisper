import { SupportedLanguagesEnum, User } from "@prisma/client";
import { UserData } from "@/app/api/users/route";

export type Product = "trial" | "one-time" | "subscription";
export interface GatheredUserData {
  email: string;
  messageLanguage: SupportedLanguagesEnum;
  name: string;
  phoneNumber: string;
  product: Product;
}

export function prepSaveUserBody({
  email,
  messageLanguage,
  name,
  phoneNumber,
  product,
}: GatheredUserData): UserData {
  const premium = product !== "trial";

  return {
    email,
    emailVerified: false,
    messageLanguage,
    name,
    phoneNumber,
    phoneNumberVerified: true,
    premium,
  };
}
