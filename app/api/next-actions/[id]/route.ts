import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const nextActionId = Number(id);

    if (Number.isNaN(nextActionId)) {
      return NextResponse.json(
        { message: "유효한 ID가 아닙니다" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const existing = await prisma.nextAction.findUnique({
      where: { id: nextActionId },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Next Action을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    const memberId =
      typeof body.memberId === "number" ? body.memberId : existing.memberId;

    if (memberId !== existing.memberId) {
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
    }

    const status =
      body.status === "TODO" || body.status === "COMPLETED"
        ? body.status
        : existing.status;

    const nextAction = await prisma.nextAction.update({
      where: {
        id: nextActionId,
      },
      data: {
        memberId,
        type: body.type ?? existing.type,
        title: body.title ?? existing.title,
        description:
          typeof body.description === "string"
            ? body.description
            : existing.description,
        dueDate: body.dueDate ?? existing.dueDate,
        priority: body.priority ?? existing.priority,
        status,
        completedAt:
          status === "COMPLETED"
            ? existing.completedAt ?? new Date()
            : null,
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
      { message: "Next Action 수정 실패" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const nextActionId = Number(id);

    if (Number.isNaN(nextActionId)) {
      return NextResponse.json(
        { message: "유효한 ID가 아닙니다" },
        { status: 400 }
      );
    }

    await prisma.nextAction.delete({
      where: {
        id: nextActionId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Next Action 삭제 실패" },
      { status: 500 }
    );
  }
}
