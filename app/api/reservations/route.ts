export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseMemberId(searchParams: URLSearchParams) {
  const rawMemberId = searchParams.get("memberId");
  if (!rawMemberId) return null;

  const memberId = Number(rawMemberId);
  return Number.isNaN(memberId) ? null : memberId;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const memberId = parseMemberId(url.searchParams);

    const reservations = await prisma.reservation.findMany({
      where: memberId ? { memberId } : undefined,
      orderBy: {
        createdAt: "desc",
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

    return NextResponse.json(reservations);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "예약 조회 실패" },
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
    });

    if (!member) {
      return NextResponse.json(
        { message: "회원을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        memberId,
        date: body.date,
        time: body.time,
        status: body.status ?? "PENDING",
        memo: body.memo ?? "",
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

    return NextResponse.json(reservation);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "예약 등록 실패" },
      { status: 500 }
    );
  }
}
