"use client";

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReservationManager } from '@/components/reservation/ReservationManager';

export default function Page() {
	return (
		<Suspense fallback={<main className="page"><p className="muted">예약 데이터를 불러오는 중입니다...</p></main>}>
			<ReservationsContent />
		</Suspense>
	);
}

function ReservationsContent() {
	const searchParams = useSearchParams();

	const { date, reservationId } = useMemo(() => {
		const rawDate = searchParams.get('date') ?? '';
		const rawReservationId = searchParams.get('reservationId');

		return {
			date: /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : undefined,
			reservationId: rawReservationId && !Number.isNaN(Number(rawReservationId)) ? Number(rawReservationId) : null,
		};
	}, [searchParams]);

	return (
		<main className="page">
			<header className="page-header">
				<div>
					<p className="eyebrow">RESERVATIONS</p>
					<h1>예약관리</h1>
					<p className="muted">예약 접수와 진행 상태를 한눈에 관리합니다.</p>
				</div>
			</header>

			<ReservationManager initialDate={date} initialReservationId={reservationId} />

			<style jsx>{`
				.page {
					display: grid;
					gap: 18px;
				}

				.page-header {
					display: flex;
					justify-content: space-between;
					align-items: end;
					gap: 16px;
				}

				.eyebrow {
					margin: 0 0 8px;
					color: var(--green);
					font-size: 12px;
					font-weight: 800;
					letter-spacing: 0.12em;
				}

				h1 {
					margin: 0;
					font-size: 32px;
				}

				.muted {
					margin: 8px 0 0;
					color: var(--muted);
				}
			`}</style>
		</main>
	);
}
