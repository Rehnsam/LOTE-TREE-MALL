
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Home', path: '/', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
    )},
    { name: 'Leads', path: '/leads', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
    )},
    { name: 'Pipeline', path: '/pipeline', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
    )},
    { name: 'Reports', path: '/reports', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
    )},
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 aviation-gradient text-white flex flex-col shadow-2xl z-20">
        <div className="p-10">
          <Link to="/" className="block transform hover:scale-105 transition-transform">
            <Logo />
          </Link>
          <div className="mt-8 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Systems Online</p>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-4 rounded-3xl transition-all duration-300 group ${
                location.pathname === item.path
                  ? 'bg-white text-slate-900 shadow-xl shadow-black/10 font-black'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`transition-colors ${location.pathname === item.path ? 'text-[#d91b1b]' : 'group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span className="text-sm tracking-wide uppercase font-bold">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-8">
          <div className="bg-slate-800/50 p-6 rounded-[32px] border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#d91b1b] flex items-center justify-center text-white font-black shadow-lg">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black text-white truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{user?.role || 'Academy Staff'}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-white/5 active:scale-95"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#f8fafc] relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        
        <div className="p-10 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
