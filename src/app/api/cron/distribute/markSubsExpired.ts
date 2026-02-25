import { prisma } from "@/lib/prisma";

export async function markSubsExpired(): Promise<void> {
    try {
        await prisma.$executeRaw`
        -- 1. Mark expired subscriptions (per type)
        UPDATE subscriptions s
        SET 
            status = 'EXPIRED'::"SubscriptionStatus",
            updated_at = NOW()
        WHERE s.status = 'ACTIVE'::"SubscriptionStatus"
        AND (
            CASE
            -- TRIAL: expired if 7 messages delivered OR time ran out
            WHEN s.type = 'TRIAL'::"SubscriptionType" THEN (
                s.date_expires < NOW()
                OR EXISTS (
                    SELECT 1 FROM users u
                    WHERE u.id = s.user_id
                    AND COALESCE(u.last_used_message, 0) >= 7
                )
            )

            -- ONE_TIME: purely date-based (snapped to end of day)
            WHEN s.type = 'ONE_TIME'::"SubscriptionType" THEN (
                s.date_expires < NOW()
            )

            -- MONTHLY: only expire if already scheduled for cancellation
            -- Active monthly subs are managed by Stripe (renewals update via webhook)
            WHEN s.type = 'MONTHLY'::"SubscriptionType" THEN (
                s.date_expires < NOW()
            )

            ELSE false
            END
        );
    `
    } catch (error) {
        console.error("[ /api/cron/distribute ] Error marking subscriptions as expired:", error);
    }
}