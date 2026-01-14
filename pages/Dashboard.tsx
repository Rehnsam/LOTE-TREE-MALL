
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { geminiService } from '../services/geminiService';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [aiInsight, setAiInsight] = useState<string>('Analyzing enrollment trends...');
  const [quickTip, setQuickTip] = useState<string>('');
  
  const stats = [
    { label: 'New Enquiries', value: '42', change: '+14', color: 'blue' },
    { label: 'Pipeline', value: '₹45 Lakhs', change: '+12%', color: 'red' },
    { label: 'Closures', value: '18', change: '85%', color: 'green' },
    { label: 'Grooming Sessions', value: '8', change: 'Today', color: 'yellow' },
  ];

  const chartData = [
    { name: 'Mon', leads: 4 }, { name: 'Tue', leads: 7 }, { name: 'Wed', leads: 5 },
    { name: 'Thu', leads: 12 }, { name: 'Fri', leads: 9 }, { name: 'Sat', leads: 15 },
    { name: 'Sun', leads: 8 },
  ];

  const tasks = [
    { id: 1, title: 'Call Ananya Sharma', sub: 'Cabin Crew Inquiry - Follow up', time: '09:30 AM', type: 'call' },
    { id: 2, title: 'Review Priya Iyer Documents', sub: 'Ground Staff Eligibility Check', time: '11:00 AM', type: 'doc' },
    { id: 3, title: 'Interview: Rahul Varma', sub: 'Grooming Assessment - Travel Dept', time: '02:30 PM', type: 'interview' },
  ];

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const [insight, tip] = await Promise.all([
          geminiService.analyzePerformance({ totalLeads: 142, conversionRate: 24, totalRevenue: 1200000 }), 
          geminiService.getQuickFeedback("Short sales motivation for an Indian aviation hospitality academy.")
        ]);
        setAiInsight(insight);
        setQuickTip(tip || '');
      } catch (err) {
        setAiInsight("Positive recruitment trends in hospitality. Focus on airline cabin crew hiring seasons.");
      }
    };
    fetchInsight();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vision Hospitality Hub</h1>
          <p className="text-slate-500 font-medium">Empowering the next generation of aviation service leaders.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">Report Center</button>
          <button className="bg-[#d91b1b] text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-red-500/20 hover:scale-105 transition-all">+ New Lead</button>
        </div>
      </div>

      {quickTip && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-3xl shadow-xl flex items-center gap-4 text-white">
          <div className="bg-white/20 p-2 rounded-xl text-xl">🏨</div>
          <p className="font-bold text-sm">Vision AI: "{quickTip}"</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">{stat.label}</span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-slate-900">{stat.value}</span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                stat.color === 'red' ? 'bg-red-50 text-red-600' : 
                stat.color === 'green' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
              }`}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-[#d91b1b]">👗</span> Scheduled Sessions
            </h3>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl group hover:bg-slate-100 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl shadow-sm">
                      {task.type === 'call' ? '📞' : task.type === 'doc' ? '📄' : '✨'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{task.title}</p>
                      <p className="text-xs text-slate-500 font-medium">{task.sub}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{task.time}</p>
                    <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Launch Action</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black text-slate-900">Weekly Enquiry Volume</h3>
               <select className="text-xs font-bold bg-slate-100 border-none rounded-xl px-3 py-1.5 outline-none">
                 <option>Leads Generated</option>
                 <option>Enrollments</option>
               </select>
             </div>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                   <YAxis hide />
                   <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
                   <Bar dataKey="leads" radius={[8, 8, 8, 8]} barSize={28}>
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={index === 5 ? '#d91b1b' : '#1b4fd9'} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 blur-3xl rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl">✨</span>
                <h4 className="font-black text-lg tracking-tight">Hospitality Strategy</h4>
              </div>
              <div className="text-slate-300 text-sm leading-relaxed font-medium mb-8 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {aiInsight}
              </div>
              <button className="w-full bg-[#d91b1b] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all">Placement Analytics</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
