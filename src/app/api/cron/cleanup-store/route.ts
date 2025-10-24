import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkCronSecret } from "../../utils/checkCronSecret";

export async function POST(request: NextRequest) {
  checkCronSecret(request);

  try {
    // Delete all expired key-value records
    const result = await prisma.keyValue.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(), // Delete records where expiresAt is less than current time
        },
      },
    });

    console.log(
      `[ /api/cron/cleanup-store ] Cleanup completed: ${result.count} expired records deleted`
    );

    const now = new Date();
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} expired records`,
      deletedCount: result.count,
      timestamp: now.toISOString(),
      cetTime: now.toLocaleString("en-US", { timeZone: "Europe/Warsaw" }),
    });
  } catch (error) {
    console.error("Error during cleanup:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to cleanup expired records",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
