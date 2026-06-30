import twilio from "twilio";

export interface PhoneLookupResult {
    phoneNumber: string;
    valid: boolean;
}

export class TwilioService {
    private readonly client: twilio.Twilio;

    constructor() {
        const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
        const authToken = process.env.TWILIO_AUTH_TOKEN || "";

        if (!accountSid) {
            throw new Error(
                "[ TwilioService ] TWILIO_ACCOUNT_SID environment variable is required",
            );
        }
        if (!authToken) {
            throw new Error(
                "[ TwilioService ] TWILIO_AUTH_TOKEN environment variable is required",
            );
        }

        this.client = twilio(accountSid, authToken);
    }

    /**
     * Looks up a phone number via the Twilio Lookup v2 API.
     * Returns the canonical E.164 phone number and whether it's valid.
     *
     * A successful lookup response means the number is routable — we treat
     * that as valid (the `valid` field on the response is null unless the
     * paid validation add-on is enabled).
     *
     * A 404 from Twilio means the number doesn't exist — we return valid: false.
     * Any other error (network, auth, 500) is re-thrown.
     */
    async lookupPhoneNumber(rawPhone: string): Promise<PhoneLookupResult> {
        try {
            const result = await this.client.lookups.v2.phoneNumbers(rawPhone).fetch();
            console.log(`[ TwilioService ] Lookup "${rawPhone}" → "${result.phoneNumber}"`, JSON.stringify(result, null, 2));
            return { phoneNumber: result.phoneNumber, valid: result.valid };
        } catch (error: unknown) {
            if (error && typeof error === "object" && "status" in error && error.status === 404) {
                console.warn(`[ TwilioService ] Phone number not found: ${rawPhone}`);
                return { phoneNumber: rawPhone, valid: false };
            }
            console.error(`[ TwilioService ] Unexpected lookup error for ${rawPhone}:`, error);
            throw error;
        }
    }
}

// Shell-deploy guard: skip module-scope instantiation when Twilio env vars are missing,
// otherwise `next build` crashes while loading any route that imports this service.
// Original:
// export const twilioService = new TwilioService();
export const twilioService = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    ? new TwilioService()
    : (null as unknown as TwilioService);