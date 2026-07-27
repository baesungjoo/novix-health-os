import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const nextActionId = Number(id);

    if (Number.isNaN(nextActionId)) {
      return NextResponse.json(
        { message: "유효한 ID가 아닙니다" },
        { status: 400 }
      );
    }

    const existing = await prisma.nextAction.findUnique({
      where: { id: nextActionId },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Next Action을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    const nextAction = await prisma.nextAction.update({
      where: { id: nextActionId },
      data: {
        status: "COMPLETED",
        completedAt: existing.completedAt ?? new Date(),
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
      { message: "Next Action 완료 처리 실패" },
      { status: 500 }
    );
  }
}
