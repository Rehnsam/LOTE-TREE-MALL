
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Reports: React.FC = () => {
  const sourceData = [
    { name: 'Instagram Ads', value: 45 },
    { name: 'Website SEO', value: 30 },
    { name: 'Referrals', value: 15 },
    { name: 'Direct Inquiry', value: 10 },
  ];

  const coursePopularityData = [
    { name: 'Cabin Crew', count: 45 },
    { name: 'Ground Handling', count: 32 },
    { name: 'Travel & Tourism', count: 28 },
    { name: 'Hospitality Exec', count: 20 },
    { name: 'Customer Service', count: 15 },
  ];

  const COLORS = ['#0f172a', '#3b82f6', '#eab308', '#ef4444'];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Hospitality Analytics</h2>
          <p className="text-slate-500 font-medium">Placement metrics and lead conversion for travel management programs.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">Download PDF</button>
          <select className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-red-500 shadow-sm cursor-pointer">
            <option>Current Quarter</option>
            <option>Last 30 Days</option>
            <option>Full Year</option>
          </select>
        </div>
      </header>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Revenue Card */}
        <div className="md:col-span-12 bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h3 className="text-3xl font-black mb-2 tracking-tight">Total Enrollment Revenue</h3>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Academy Revenue (Current FY - INR)</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-5xl md:text-6xl font-black text-yellow-500 tracking-tighter">₹45,50,000</p>
              <div className="flex items-center justify-center md:justify-end gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-sm font-black text-emerald-400 uppercase tracking-widest">↑ 12% Goal Achieved</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]" />
        </div>

        {/* Funnel Section */}
        <div className="md:col-span-7 bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Enrollment Funnel</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conversion stage efficiency</p>
            </div>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-widest">Live Tracking</span>
          </div>
          <div className="space-y-8 flex-1 flex flex-col justify-center">
            {[
              { label: 'Total Enquiries', count: 120, pct: 100, color: '#0f172a' },
              { label: 'Screened/Contacted', count: 84, pct: 70, color: '#1e293b' },
              { label: 'Counseling & Grooming', count: 42, pct: 35, color: '#3b82f6' },
              { label: 'Final Interview', count: 24, pct: 20, color: '#6366f1' },
              { label: 'Enrolled', count: 18, pct: 15, color: '#d91b1b' },
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{step.label}</span>
                  <span className="text-xs font-black text-slate-900">{step.count} ({step.pct}%)</span>
                </div>
                <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{ width: `${step.pct}%`, backgroundColor: step.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Popularity Section (NEW) */}
        <div className="md:col-span-5 bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-100">
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Top Course Interests</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Demand based on enquiries</p>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coursePopularityData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }} 
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                  {coursePopularityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#d91b1b' : '#1b4fd9'} opacity={1 - (index * 0.15)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Section */}
        <div className="md:col-span-12 lg:col-span-6 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Lead Source Impact</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Marketing channel performance</p>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="center" 
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Marketing ROI Info Card */}
        <div className="md:col-span-12 lg:col-span-6 bg-blue-600 rounded-[40px] p-10 text-white flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-4 tracking-tight leading-none">Marketing ROI Analytics</h3>
            <p className="text-blue-100 text-sm font-medium leading-relaxed opacity-80 mb-8">
              Digital campaigns on Instagram are outperforming traditional website SEO by 15%. Recommend reallocating 10% of the Q3 budget to social-first enrollment workshops.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-200 mb-1">CPL (Avg)</p>
                <p className="text-xl font-black">₹420</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-200 mb-1">CAC (Avg)</p>
                <p className="text-xl font-black">₹3,250</p>
              </div>
            </div>
          </div>
          <button className="relative z-10 w-full bg-white text-blue-600 font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl mt-8 hover:bg-blue-50 transition-colors shadow-lg">
            View Marketing Details
          </button>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
};

export default Reports;
