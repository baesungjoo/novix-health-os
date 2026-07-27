export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseNumberParam(searchParams: URLSearchParams, key: string) {
  const rawValue = searchParams.get(key);
  if (!rawValue) return null;

  const value = Number(rawValue);
  return Number.isNaN(value) ? null : value;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const memberId = parseNumberParam(url.searchParams, "memberId");
    const limit = parseNumberParam(url.searchParams, "limit");

    const events = await prisma.$queryRawUnsafe<Array<{
      id: number;
      memberId: number;
      reservationId: number | null;
      type: string;
      title: string;
      description: string;
      metadata: string;
      createdAt: string;
      member_id: number;
      member_name: string;
      member_phone: string;
      reservation_id: number | null;
      reservation_date: string | null;
      reservation_time: string | null;
      reservation_status: string | null;
    }>>(
      `
        SELECT
          timeline.id,
          timeline.memberId,
          timeline.reservationId,
          timeline.type,
          timeline.title,
          timeline.description,
          timeline.metadata,
          timeline.createdAt,
          member.id AS member_id,
          member.name AS member_name,
          member.phone AS member_phone,
          reservation.id AS reservation_id,
          reservation.date AS reservation_date,
          reservation.time AS reservation_time,
          reservation.status AS reservation_status
        FROM TimelineEvent AS timeline
        INNER JOIN Member AS member
          ON member.id = timeline.memberId
        LEFT JOIN Reservation AS reservation
          ON reservation.id = timeline.reservationId
        ${memberId ? `WHERE timeline.memberId = ${memberId}` : ""}
        ORDER BY datetime(timeline.createdAt) DESC, timeline.id DESC
        ${limit ? `LIMIT ${limit}` : ""}
      `
    );

    const normalizedEvents = events.map((event) => ({
      id: event.id,
      memberId: event.memberId,
      reservationId: event.reservationId,
      type: event.type,
      title: event.title,
      description: event.description,
      metadata: event.metadata,
      createdAt: event.createdAt,
      member: {
        id: event.member_id,
        name: event.member_name,
        phone: event.member_phone,
      },
      reservation: event.reservation_id
        ? {
            id: event.reservation_id,
            date: event.reservation_date,
            time: event.reservation_time,
            status: event.reservation_status,
          }
        : null,
    }));

    return NextResponse.json(normalizedEvents);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "타임라인 조회 실패" },
      { status: 500 }
    );
  }
}
