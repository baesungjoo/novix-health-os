'use client';

import { Cake, CalendarDays, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import { RecentActivityWidget } from '@/components/dashboard/RecentActivityWidget';
import { NextActionTodayWidget } from '@/components/next-action/NextActionTodayWidget';
import { TodayReservationSummaryCard } from '@/components/dashboard/TodayReservationSummaryCard';

const stats = [
	['전체 회원', '326명', Users],
	['오늘 예약', '12건', CalendarDays],
	['오늘 생일', '2명', Cake],
	['이번 달 신규', '17명', UserPlus],
] as const;

export default function Dashboard() {
	return (
		<>
			<div className="head">
				<div>
					<h1>대시보드</h1>
					<p className="muted">2026년 7월 23일 목요일 운영 현황입니다.</p>
				</div>

				<Link className="btn btn-primary" href="/admin/reservations">
					예약 등록
				</Link>
			</div>

			<div className="stats">
				{stats.map(([label, value, Icon]) => (
					<article className="card stat" key={label}>
						<span>
							<Icon />
						</span>
						<div>
							<small>{label}</small>
							<strong>{value}</strong>
						</div>
					</article>
				))}
			</div>

			<div className="today-next-action">
				<NextActionTodayWidget />
			</div>

			<div className="grid">
				<TodayReservationSummaryCard />

				<div className="side-column">
					<RecentActivityWidget />

					<article className="card block">
						<h2>빠른 메뉴</h2>
						<div className="quick">
							<Link href="/admin/members">회원 등록</Link>
							<Link href="/admin/reservations">예약 관리</Link>
							<Link href="/admin/notices">공지 작성</Link>
							<Link href="/admin/ai">AI 문구 작성</Link>
						</div>

						<div className="notice">
							<b>센터 운영 안내</b>
							<p>예약 접수 후 전화로 확정 안내를 진행해 주세요.</p>
						</div>
					</article>
				</div>
			</div>

			<style jsx>{`
				.head {
					display: flex;
					align-items: center;
					justify-content: space-between;
					margin-bottom: 22px;
					gap: 16px;
				}

				.head h1 {
					margin: 0 0 7px;
				}

				.stats {
					display: grid;
					grid-template-columns: repeat(4, 1fr);
					gap: 16px;
				}

				.stat {
					padding: 21px;
					display: flex;
					gap: 14px;
					align-items: center;
				}

				.stat > span {
					display: grid;
					place-items: center;
					width: 46px;
					height: 46px;
					border-radius: 14px;
					background: var(--mint);
					color: var(--green);
				}

				.stat div {
					display: flex;
					flex-direction: column;
				}

				.stat small {
					color: var(--muted);
				}

				.stat strong {
					font-size: 25px;
					margin-top: 5px;
				}

				.grid {
					display: grid;
					grid-template-columns: 1.5fr 1fr;
					gap: 18px;
					margin-top: 18px;
				}

				.today-next-action {
					margin-top: 18px;
				}

				.side-column {
					display: grid;
					gap: 18px;
					align-content: start;
				}

				.block {
					padding: 24px;
				}

				.block h2 {
					margin-top: 0;
				}

				.quick {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 10px;
				}

				.quick a {
					background: var(--mint);
					color: var(--green);
					font-weight: 800;
					padding: 17px;
					border-radius: 13px;
				}

				.notice {
					margin-top: 18px;
					padding: 16px;
					border-radius: 14px;
					background: #f7f4e8;
				}

				.notice p {
					margin-bottom: 0;
					color: var(--muted);
				}

				@media (max-width: 1050px) {
					.stats {
						grid-template-columns: 1fr 1fr;
					}

					.grid {
						grid-template-columns: 1fr;
					}
				}

				@media (max-width: 560px) {
					.stats {
						grid-template-columns: 1fr;
					}

					.head {
						align-items: flex-start;
					}

					.head a {
						display: none;
					}

					.quick {
						grid-template-columns: 1fr;
					}
				}
			`}</style>
		</>
	);
}
