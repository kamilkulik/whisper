import { SubscriptionType, SupportedLanguagesEnum, User } from "@prisma/client";
import { UserData } from "@/app/api/users/route";

export interface GatheredUserData {
  email: string;
  messageLanguage: SupportedLanguagesEnum;
  name: string;
  phoneNumber: string;
  product: SubscriptionType;
}

export function prepSaveUserBody({
  email,
  messageLanguage,
  name,
  phoneNumber,
  product,
}: GatheredUserData): UserData {
  const premium = product !== SubscriptionType.TRIAL;

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
