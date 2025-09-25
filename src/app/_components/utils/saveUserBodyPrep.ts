import { SubscriptionType, SupportedLanguagesEnum } from "@prisma/client";
import { UserData } from "@/app/api/users/route";

export interface GatheredUserData {
  email: string;
  messageLanguage: SupportedLanguagesEnum;
  name: string;
  phoneNumber: string;
  product: SubscriptionType | null;
}

function isPremium(product: SubscriptionType | null | undefined): boolean {
  switch (product) {
    case null:
      return false;
    case undefined:
      return false;
    case SubscriptionType.MONTHLY:
      return true;
    case SubscriptionType.ONE_TIME:
      return true;
    case SubscriptionType.TRIAL:
      return false;
    default:
      return false;
  }
}

export function prepSaveUserBody({
  email,
  messageLanguage,
  name,
  phoneNumber,
  product,
}: GatheredUserData): UserData {
  const premium = isPremium(product);

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
