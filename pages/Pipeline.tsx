
import React from 'react';
import { LeadStatus } from '../types';
import { MOCK_LEADS } from '../constants';

const STAGES: LeadStatus[] = ['New', 'Contacted', 'Demo', 'Negotiation', 'Closed Won'];

const Pipeline: React.FC = () => {
  const getLeadsInStage = (stage: LeadStatus) => MOCK_LEADS.filter(l => l.status === stage || (stage === 'Demo' && l.status === 'Counseling'));

  return (
    <div className="space-y-6 overflow-hidden h-full flex flex-col">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Hospitality Pipeline (INR)</h2>
        <p className="text-slate-500">Monitor career path enrollment from enquiry to training.</p>
      </header>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full pb-4">
          {STAGES.map((stage) => {
            const leads = getLeadsInStage(stage);
            const totalValue = leads.reduce((sum, l) => sum + l.estimatedValue, 0);

            return (
              <div key={stage} className="flex-shrink-0 w-80 bg-slate-100/50 rounded-2xl p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    {stage === 'Demo' ? 'Counseling' : stage} 
                    <span className="bg-slate-200 px-2 py-0.5 rounded text-xs text-slate-500">{leads.length}</span>
                  </h4>
                  <p className="text-xs font-bold text-slate-500">₹{(totalValue / 1000).toFixed(0)}K</p>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                  {leads.map((lead) => (
                    <div key={lead.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-red-500 transition-colors cursor-grab active:cursor-grabbing">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-sm text-slate-900">{lead.name}</p>
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold">HOSP</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3 truncate">{lead.courseInterest}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-900">₹{lead.estimatedValue.toLocaleString()}</span>
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">{lead.name[0]}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 text-sm">
                      Empty stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Pipeline;
