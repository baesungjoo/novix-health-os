import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// 회원 수정
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const member = await prisma.member.update({
      where: {
        id: Number(id),
      },
      data: {
        name: body.name,
        phone: body.phone,
        birthday: body.birthday,
        visits: body.visits,
        interest: body.interest,
        memo: body.memo,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "회원 수정 실패" },
      { status: 500 }
    );
  }
}

// 회원 삭제
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    await prisma.member.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "회원 삭제 실패" },
      { status: 500 }
    );
  }
}