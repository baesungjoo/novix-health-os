'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CalendarDays, Megaphone, Images, Bot, Settings, LogOut, HeartPulse, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const menu = [
  ['/admin', '대시보드', LayoutDashboard],
  ['/admin/members', '회원관리', Users],
  ['/admin/reservations', '예약관리', CalendarDays],
  ['/admin/notices', '공지사항', Megaphone],
  ['/admin/gallery', '갤러리', Images],
  ['/admin/ai', 'AI 도우미', Bot],
  ['/admin/settings', '설정', Settings],
] as const;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('novix-auth') !== 'ok') router.replace('/login');
  }, [router]);

  const logout = () => {
    localStorage.removeItem('novix-auth');
    router.push('/login');
  };

  return (
    <div className="shell">
      <aside className={open ? 'side open' : 'side'}>
        <div className="brand">
          <HeartPulse size={25} />
          <div><b>NOVIX Health OS</b><small>3H 영도센터</small></div>
          <button className="close" onClick={() => setOpen(false)}><X /></button>
        </div>

        <nav>
          {menu.map(([href, label, Icon]) => {
            const active = href === '/admin' ? path === href : path.startsWith(href);
            return (
              <Link key={href} href={href} className={active ? 'nav active' : 'nav'} onClick={() => setOpen(false)}>
                <Icon size={19} /><span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <button className="logout" onClick={logout}><LogOut size={18} />로그아웃</button>
      </aside>

      <main className="main">
        <header className="top">
          <button className="hamb" onClick={() => setOpen(true)}><Menu /></button>
          <div><b>건강을 배우고, 함께 실천하는 공간</b><span>부산 영도 건강문화센터</span></div>
          <span className="admin-badge">관리자</span>
        </header>
        <section className="content">{children}</section>
      </main>

      <style jsx>{`
        .shell{min-height:100vh}
        .side{position:fixed;inset:0 auto 0 0;width:250px;background:#123f30;color:#fff;padding:22px 16px;display:flex;flex-direction:column;z-index:20}
        .brand{display:flex;gap:11px;align-items:center;padding:5px 8px 24px}
        .brand div{display:flex;flex-direction:column}
        .brand small{opacity:.72;margin-top:3px}
        nav{display:grid;gap:4px}
        .nav{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;color:#dfeee7;font-weight:700;text-decoration:none;white-space:nowrap}
        .nav:hover,.nav.active{background:#fff;color:#123f30}
        .logout{margin-top:auto;display:flex;gap:10px;align-items:center;padding:12px;border:0;border-radius:12px;background:rgba(255,255,255,.1);color:#fff;cursor:pointer}
        .main{margin-left:250px}
        .top{height:76px;background:#fff;border-bottom:1px solid #e4ece8;padding:0 28px;position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:16px}
        .top div{display:flex;flex-direction:column;gap:4px}
        .top span{font-size:13px;color:var(--muted)}
        .admin-badge{color:var(--green)!important;background:#e8f5ee;border-radius:999px;padding:7px 11px;font-weight:700}
        .content{padding:28px}
        .hamb,.close{display:none;background:none;border:0;cursor:pointer}
        @media(max-width:800px){
          .side{transform:translateX(-100%);transition:.2s}
          .side.open{transform:none}
          .close,.hamb{display:block}
          .close{margin-left:auto;color:white}
          .main{margin-left:0}
          .top{padding:0 16px}
          .content{padding:18px}
          .top div b{font-size:14px}
          .top div span{display:none}
        }
      `}</style>
    </div>
  );
}
