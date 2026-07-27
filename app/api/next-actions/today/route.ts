export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PRIORITY_ORDER = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
} as const;

function getKoreaTodayIsoDate(referenceDate: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(referenceDate);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export async function GET() {
  try {
    const today = getKoreaTodayIsoDate();

    const nextActions = await prisma.nextAction.findMany({
      where: {
        dueDate: today,
        status: "TODO",
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    nextActions.sort((left, right) => {
      const priorityGap = PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority];
      if (priorityGap !== 0) return priorityGap;

      return left.createdAt.getTime() - right.createdAt.getTime();
    });

    return NextResponse.json(nextActions);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "오늘 Next Action 조회 실패" },
      { status: 500 }
    );
  }
}
