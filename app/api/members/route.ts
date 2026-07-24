export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 회원 목록 조회
export async function GET() {
  try {
    const members = await prisma.member.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "회원 조회 실패" },
      { status: 500 }
    );
  }
}

// 회원 등록
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const member = await prisma.member.create({
      data: {
        name: body.name,
        phone: body.phone,
        birthday: body.birthday,
        visits: body.visits ?? 0,
        interest: body.interest ?? "",
        memo: body.memo ?? "",
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "회원 등록 실패" },
      { status: 500 }
    );
  }
}