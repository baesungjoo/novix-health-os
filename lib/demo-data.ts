export type Member = {
  id: number;
  name: string;
  phone: string;
  birthday: string;
  visits: number;
  interest: string;
  memo: string;
};

export type ReservationStatus = '대기' | '확정' | '완료' | '취소';

export type Reservation = {
  id: number;
  date: string;
  time: string;
  name: string;
  phone: string;
  status: ReservationStatus;
  memo: string;
};

export const members: Member[] = [
  { id: 1, name: '김영희', phone: '010-1234-5678', birthday: '1958-07-23', visits: 18, interest: '허리·관절', memo: '오전 방문 선호' },
  { id: 2, name: '박순자', phone: '010-2468-1357', birthday: '1962-08-02', visits: 11, interest: '수면·피로', memo: '건강강의 관심' },
  { id: 3, name: '이정희', phone: '010-7788-9900', birthday: '1955-09-14', visits: 27, interest: '혈액순환', memo: '화·목 방문' },
  { id: 4, name: '최미숙', phone: '010-8765-4321', birthday: '1965-10-29', visits: 5, interest: '어깨·목', memo: '신규 회원' },
];

export const reservations: Reservation[] = [
  { id: 1, date: '2026-07-23', time: '09:30', name: '김영희', phone: '010-1234-5678', status: '확정', memo: '체험 상담' },
  { id: 2, date: '2026-07-23', time: '11:00', name: '박순자', phone: '010-2468-1357', status: '대기', memo: '건강강의 문의' },
  { id: 3, date: '2026-07-23', time: '14:00', name: '이정희', phone: '010-7788-9900', status: '완료', memo: '재방문' },
];
