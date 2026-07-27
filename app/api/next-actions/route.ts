export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PRIORITY_ORDER = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
} as const;

function parseNumberParam(searchParams: URLSearchParams, key: string) {
  const rawValue = searchParams.get(key);
  if (!rawValue) return null;

  const value = Number(rawValue);
  return Number.isNaN(value) ? null : value;
}

function compareByPriorityAndDueDate(
  left: { priority: keyof typeof PRIORITY_ORDER; dueDate: string; createdAt: Date },
  right: { priority: keyof typeof PRIORITY_ORDER; dueDate: string; createdAt: Date }
) {
  const priorityGap = PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority];
  if (priorityGap !== 0) return priorityGap;

  const dueDateGap = left.dueDate.localeCompare(right.dueDate);
  if (dueDateGap !== 0) return dueDateGap;

  return left.createdAt.getTime() - right.createdAt.getTime();
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const memberId = parseNumberParam(url.searchParams, "memberId");
    const status = url.searchParams.get("status");

    const nextActions = await prisma.nextAction.findMany({
      where: {
        memberId: memberId ?? undefined,
        status: status === "TODO" || status === "COMPLETED" ? status : undefined,
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

    nextActions.sort(compareByPriorityAndDueDate);

    return NextResponse.json(nextActions);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Next Action 조회 실패" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const memberId = Number(body.memberId);

    if (Number.isNaN(memberId)) {
      return NextResponse.json(
        { message: "회원이 필요합니다" },
        { status: 400 }
      );
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true },
    });

    if (!member) {
      return NextResponse.json(
        { message: "회원을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    const nextAction = await prisma.nextAction.create({
      data: {
        memberId,
        type: body.type ?? "FOLLOW_UP",
        title: body.title,
        description: body.description ?? "",
        dueDate: body.dueDate,
        priority: body.priority ?? "MEDIUM",
        status: body.status ?? "TODO",
        completedAt:
          body.status === "COMPLETED" ? new Date() : null,
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

    return NextResponse.json(nextAction);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Next Action 등록 실패" },
      { status: 500 }
    );
  }
}
