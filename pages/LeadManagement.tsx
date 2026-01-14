
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MOCK_LEADS } from '../constants';
import { geminiService, encode, decode, decodeAudioData } from '../services/geminiService';
import { Activity } from '../types';

// Predefined list of agents for assignment
const ACADEMY_AGENTS = [
  { id: '1', name: 'Sarah Admin', role: 'Admissions Head', initial: 'S', color: 'bg-blue-600' },
  { id: '2', name: 'Raj Consultant', role: 'Senior Counselor', initial: 'R', color: 'bg-emerald-600' },
  { id: '3', name: 'Amit Sharma', role: 'Placement Lead', initial: 'A', color: 'bg-indigo-600' },
  { id: '4', name: 'Neha Kapur', role: 'Grooming Expert', initial: 'N', color: 'bg-purple-600' },
];

const MOCK_ACTIVITIES: Record<string, Activity[]> = {
  '1': [
    { id: 'a1', leadId: '1', type: 'Call', description: 'Initial inquiry about course fees.', timestamp: '2024-01-02 10:30 AM', agent: 'Sarah Admin' },
    { id: 'a2', leadId: '1', type: 'Email', description: 'Sent brochure for Cabin Crew program.', timestamp: '2024-01-03 02:15 PM', agent: 'Sarah Admin' },
    { id: 'a3', leadId: '1', type: 'Meeting', description: 'Counseling session completed. Student is positive.', timestamp: '2024-01-15 11:00 AM', agent: 'Raj Consultant' },
  ],
  '2': [
    { id: 'b1', leadId: '2', type: 'Call', description: 'Inquired via website. Callback scheduled.', timestamp: '2024-01-10 09:00 AM', agent: 'System' },
  ],
  '3': [
    { id: 'c1', leadId: '3', type: 'Email', description: 'Requested details on IATA certification.', timestamp: '2023-12-26 11:20 AM', agent: 'Raj Consultant' },
    { id: 'c2', leadId: '3', type: 'Call', description: 'Followed up on registration forms.', timestamp: '2024-01-14 04:30 PM', agent: 'Raj Consultant' },
  ]
};

const LeadManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All Sources');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [aiStrategy, setAiStrategy] = useState<string | null>(null);
  const [aiNextSteps, setAiNextSteps] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'activity' | 'ai'>('info');
  
  // Selection State
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showCourseFilter, setShowCourseFilter] = useState(false);

  // Extract unique options for filters
  const uniqueSources = useMemo(() => {
    const sources = MOCK_LEADS.map(lead => lead.source);
    return ['All Sources', ...Array.from(new Set(sources))];
  }, []);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(MOCK_LEADS.map(lead => lead.status)));
  }, []);

  const uniqueCourses = useMemo(() => {
    return Array.from(new Set(MOCK_LEADS.map(lead => lead.courseInterest)));
  }, []);

  // Filter leads logic
  const filteredLeads = useMemo(() => {
    return MOCK_LEADS.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.courseInterest.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSource = sourceFilter === 'All Sources' || lead.source === sourceFilter;
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(lead.status);
      const matchesCourse = selectedCourses.length === 0 || selectedCourses.includes(lead.courseInterest);
      
      return matchesSearch && matchesSource && matchesStatus && matchesCourse;
    });
  }, [searchQuery, sourceFilter, selectedStatuses, selectedCourses]);

  const toggleSelectLead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.size === filteredLeads.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const handleBulkAction = (action: string) => {
    setBulkActionOpen(false);
    if (action === 'Assign Agent') {
      setShowAssignModal(true);
    } else {
      alert(`Performing "${action}" on ${selectedLeadIds.size} leads.`);
      setSelectedLeadIds(new Set());
    }
  };

  const confirmAgentAssignment = () => {
    if (!selectedAgentId) return;
    const agentName = ACADEMY_AGENTS.find(a => a.id === selectedAgentId)?.name;
    alert(`Successfully assigned ${selectedLeadIds.size} leads to ${agentName}.`);
    
    // Reset state
    setSelectedLeadIds(new Set());
    setShowAssignModal(false);
    setSelectedAgentId(null);
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const toggleCourse = (course: string) => {
    setSelectedCourses(prev => 
      prev.includes(course) ? prev.filter(c => c !== course) : [...prev, course]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSourceFilter('All Sources');
    setSelectedStatuses([]);
    setSelectedCourses([]);
    setSelectedLeadIds(new Set());
  };

  const handleLeadClick = async (lead: any) => {
    setSelectedLead(lead);
    setAiStrategy(null);
    setAiNextSteps([]);
    setCompletedSteps(new Set());
    setLoading(true);
    setActiveTab('info');
    try {
      const responseText = await geminiService.solveComplexProblem(
        `Provide a high-conversion sales closing strategy AND exactly 3 specific next-step actions for this student lead.
        
        Lead Details:
        - Name: ${lead.name}
        - Current Status: ${lead.status}
        - Interested In: ${lead.courseInterest}
        - CRM Notes: ${lead.notes}
        
        Format your response precisely like this:
        STRATEGY: [One paragraph strategy]
        NEXT STEPS:
        1. [Step 1]
        2. [Step 2]
        3. [Step 3]`
      );
      
      const strategyPart = responseText?.split('NEXT STEPS:')[0]?.replace('STRATEGY:', '')?.trim();
      const nextStepsPart = responseText?.split('NEXT STEPS:')[1]?.trim();
      const steps = nextStepsPart ? nextStepsPart.split('\n').map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(Boolean) : [];
      
      setAiStrategy(strategyPart || "Maintain frequent follow-ups highlighting placement records.");
      setAiNextSteps(steps.length ? steps.slice(0, 3) : [
        "Schedule a final placement counseling call.",
        "Share success stories of alumni in international airlines.",
        "Invite to our upcoming grooming workshop."
      ]);
    } catch (err) {
      setAiStrategy("Emphasize career placement records with international airlines.");
      setAiNextSteps([
        "Follow up on grooming standards inquiry.",
        "Provide EMI options for course fees.",
        "Invite for a campus visit."
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeech = async () => {
    if (!aiStrategy || speaking) return;
    setSpeaking(true);
    try {
      const audioData = await geminiService.speak(aiStrategy.slice(0, 400));
      if (audioData) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        const decodedBytes = decode(audioData);
        const audioBuffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
      }
    } catch (err) {
      console.error('TTS failed', err);
    } finally {
      setSpeaking(false);
    }
  };

  const toggleStepDone = (idx: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const getStepIcon = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('call') || t.includes('phone')) return '📞';
    if (t.includes('email') || t.includes('mail')) return '✉️';
    if (t.includes('counsel') || t.includes('meeting') || t.includes('talk')) return '🤝';
    if (t.includes('visit') || t.includes('campus') || t.includes('center')) return '🏫';
    if (t.includes('form') || t.includes('emi') || t.includes('fee') || t.includes('document')) return '📄';
    if (t.includes('workshop') || t.includes('training') || t.includes('grooming')) return '🎓';
    if (t.includes('success') || t.includes('alumni') || t.includes('placement')) return '🏆';
    return '⚡';
  };

  const currentActivities = selectedLead ? (MOCK_ACTIVITIES[selectedLead.id] || []) : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Assign Agent Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Assign Staff</h3>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Assigning {selectedLeadIds.size} leads to a counselor</p>
            </div>

            <div className="space-y-3 mb-10">
              {ACADEMY_AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                    selectedAgentId === agent.id 
                      ? 'bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-100' 
                      : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white shadow-sm transition-transform group-hover:scale-110 ${agent.color}`}>
                    {agent.initial}
                  </div>
                  <div className="flex-1">
                    <p className={`font-black text-sm transition-colors ${selectedAgentId === agent.id ? 'text-blue-700' : 'text-slate-900'}`}>{agent.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{agent.role}</p>
                  </div>
                  {selectedAgentId === agent.id && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px]">✓</div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setShowAssignModal(false); setSelectedAgentId(null); }}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAgentAssignment}
                disabled={!selectedAgentId}
                className="flex-[2] py-4 bg-[#d91b1b] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Lead Center</h2>
          <p className="text-slate-500 font-medium">Precision filtering for elite sales performance.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">Export Leads</button>
          <button className="bg-[#1b4fd9] text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">Import CSV</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {selectedLeadIds.size > 0 && (
            <div className="bg-blue-600 text-white p-4 rounded-3xl shadow-xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-4 ml-2">
                <span className="text-xs font-black uppercase tracking-widest">{selectedLeadIds.size} Selected</span>
                <button onClick={toggleSelectAll} className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-xl hover:bg-white/30 transition-all">
                  {selectedLeadIds.size === filteredLeads.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button 
                    onClick={() => setBulkActionOpen(!bulkActionOpen)}
                    className="bg-white text-blue-600 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2"
                  >
                    Bulk Actions <span>{bulkActionOpen ? '▴' : '▾'}</span>
                  </button>
                  {bulkActionOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-40 text-slate-900 animate-in fade-in slide-in-from-bottom-2">
                      <button onClick={() => handleBulkAction('Change Status')} className="w-full px-5 py-3 text-left text-xs font-bold hover:bg-slate-50 transition-colors border-b border-slate-50">Change Status</button>
                      <button onClick={() => handleBulkAction('Assign Agent')} className="w-full px-5 py-3 text-left text-xs font-bold hover:bg-slate-50 transition-colors border-b border-slate-50">Assign Agent</button>
                      <button onClick={() => handleBulkAction('Add Note')} className="w-full px-5 py-3 text-left text-xs font-bold hover:bg-slate-50 transition-colors border-b border-slate-50">Add Note</button>
                      <button onClick={() => setSelectedLeadIds(new Set())} className="w-full px-5 py-3 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors">Cancel</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
             <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-4 flex-1">
                  <input 
                    type="checkbox" 
                    checked={selectedLeadIds.size === filteredLeads.length && filteredLeads.length > 0} 
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search name, email, or course..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 pl-11 pr-6 py-3.5 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none font-medium transition-all" 
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="bg-white border border-slate-200 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    {uniqueSources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                  <button 
                    onClick={resetFilters}
                    className="bg-slate-900 text-white px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Reset
                  </button>
                </div>
             </div>

             <div className="flex flex-wrap gap-4 pt-2">
                <div className="relative">
                  <button 
                    onClick={() => { setShowStatusFilter(!showStatusFilter); setShowCourseFilter(false); }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
                      selectedStatuses.length > 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    Status {selectedStatuses.length > 0 && `(${selectedStatuses.length})`}
                    <span>{showStatusFilter ? '▴' : '▾'}</span>
                  </button>
                  {showStatusFilter && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-100 rounded-3xl shadow-2xl z-30 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {uniqueStatuses.map(status => (
                          <label key={status} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={selectedStatuses.includes(status)} 
                              onChange={() => toggleStatus(status)}
                              className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button 
                    onClick={() => { setShowCourseFilter(!showCourseFilter); setShowStatusFilter(false); }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
                      selectedCourses.length > 0 ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    Courses {selectedCourses.length > 0 && `(${selectedCourses.length})`}
                    <span>{showCourseFilter ? '▴' : '▾'}</span>
                  </button>
                  {showCourseFilter && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-100 rounded-3xl shadow-2xl z-30 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {uniqueCourses.map(course => (
                          <label key={course} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={selectedCourses.includes(course)} 
                              onChange={() => toggleCourse(course)}
                              className="w-4 h-4 rounded-md border-slate-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-xs font-bold text-slate-700 group-hover:text-red-600 transition-colors leading-tight">{course}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
                  {selectedStatuses.map(s => (
                    <span key={s} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 animate-in zoom-in-50">
                      {s} <button onClick={() => toggleStatus(s)} className="hover:text-blue-800">×</button>
                    </span>
                  ))}
                  {selectedCourses.map(c => (
                    <span key={c} className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 animate-in zoom-in-50">
                      {c.split(' ')[0]} <button onClick={() => toggleCourse(c)} className="hover:text-red-800">×</button>
                    </span>
                  ))}
                </div>
             </div>
          </div>
          
          <div className="space-y-3 h-[calc(100vh-320px)] overflow-y-auto pr-2 custom-scrollbar">
            {filteredLeads.map((lead) => (
              <div 
                key={lead.id} 
                onClick={() => handleLeadClick(lead)}
                className={`p-6 rounded-[32px] border transition-all cursor-pointer group flex items-start gap-6 ${
                  selectedLead?.id === lead.id ? 'bg-white border-blue-500 shadow-xl ring-4 ring-blue-50' : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center h-full self-center">
                  <input 
                    type="checkbox" 
                    checked={selectedLeadIds.has(lead.id)} 
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSelectLead(lead.id, {} as any)}
                    className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5 flex gap-4 items-center">
                    <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-white shadow-sm ${
                      lead.status === 'Trial Flight' || lead.status === 'Counseling' ? 'bg-green-500' : 
                      lead.status === 'Closed Won' ? 'bg-blue-600' :
                      'bg-slate-200 text-slate-500'
                    }`}>
                      {lead.name[0]}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-black text-slate-900 text-base truncate group-hover:text-blue-600 transition-colors">{lead.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{lead.courseInterest}</p>
                    </div>
                  </div>
                  <div className="col-span-3 text-left">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-0.5">Source</span>
                    <p className="text-xs font-bold text-slate-600">{lead.source}</p>
                  </div>
                  <div className="col-span-4 flex flex-col items-end gap-1">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      lead.status === 'New' ? 'bg-blue-50 text-blue-600' : 
                      lead.status === 'Trial Flight' || lead.status === 'Counseling' ? 'bg-emerald-50 text-emerald-600' : 
                      lead.status === 'Negotiation' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {lead.status === 'Demo' ? 'Counseling' : lead.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">₹{(lead.estimatedValue / 100000).toFixed(1)}L</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-[500px]">
          {selectedLead ? (
            <div className="bg-white rounded-[48px] border border-slate-100 p-8 shadow-2xl sticky top-8 space-y-6 animate-in fade-in zoom-in-95 duration-300 h-[calc(100vh-120px)] flex flex-col">
              <div className="text-center flex-shrink-0">
                <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white mx-auto flex items-center justify-center text-3xl font-black mb-3 shadow-xl border-4 border-white">
                  {selectedLead.name[0]}
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedLead.name}</h3>
                <div className="flex items-center justify-center gap-2 mt-0.5 mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedLead.source}</span>
                  <span className="text-slate-200">•</span>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{selectedLead.status === 'Demo' ? 'Counseling' : selectedLead.status}</span>
                </div>
                
                <div className="flex justify-center gap-2 mb-6">
                   <a href={`tel:${selectedLead.phone}`} className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.21 2.2z"/></svg>
                   </a>
                   <a href={`mailto:${selectedLead.email}`} className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                   </a>
                </div>
              </div>

              <div className="flex border-b border-slate-100 flex-shrink-0">
                {(['info', 'activity', 'ai'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
                      activeTab === tab ? 'border-red-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-6">
                {activeTab === 'info' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Lead Notes</h4>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed italic bg-slate-50 p-4 rounded-2xl border-l-4 border-slate-200">
                        "{selectedLead.notes}"
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Created At</span>
                        <span className="text-xs font-bold text-slate-900">{selectedLead.createdAt}</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Last Contact</span>
                        <span className="text-xs font-bold text-slate-900">{selectedLead.lastContacted}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Communication History</h4>
                    <div className="relative space-y-6 pl-4 border-l-2 border-slate-100 ml-2">
                      {currentActivities.map((act) => (
                        <div key={act.id} className="relative group">
                          <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                            act.type === 'Call' ? 'bg-blue-500' : act.type === 'Meeting' ? 'bg-emerald-500' : 'bg-red-500'
                          }`} />
                          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{act.type}</span>
                              <span className="text-[9px] font-bold text-slate-400">{act.timestamp}</span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 mb-2">{act.description}</p>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Agent: {act.agent}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'ai' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
                      <div className="flex justify-between items-center mb-4 relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm shadow-inner">✨</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Strategy Engine</span>
                        </div>
                        <button 
                          onClick={handleSpeech} 
                          disabled={loading || !aiStrategy}
                          className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${speaking ? 'text-yellow-400' : 'text-blue-400 hover:text-white disabled:opacity-30'}`}
                        >
                          {speaking ? '🔊' : '🔈'}
                        </button>
                      </div>
                      {loading ? (
                        <div className="space-y-3 animate-pulse">
                          <div className="h-2 bg-white/10 rounded w-full" />
                          <div className="h-2 bg-white/10 rounded w-4/5" />
                        </div>
                      ) : (
                        <p className="text-xs font-bold leading-relaxed text-slate-300 relative z-10">
                          {aiStrategy || "Analyzing lead potential..."}
                        </p>
                      )}
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> 
                        AI-Suggested Next Steps
                      </h4>
                      <div className="space-y-2">
                        {aiNextSteps.map((step, idx) => {
                          const isDone = completedSteps.has(idx);
                          return (
                            <div 
                              key={idx} 
                              className={`bg-white border p-4 rounded-2xl flex items-center gap-4 group transition-all relative overflow-hidden ${
                                isDone 
                                  ? 'border-emerald-100 opacity-60 bg-emerald-50/20' 
                                  : 'border-slate-100 hover:border-blue-500/50 hover:shadow-sm'
                              }`}
                            >
                              <button 
                                onClick={() => toggleStepDone(idx)}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg transition-all shadow-sm ${
                                  isDone 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                                }`}
                              >
                                {isDone ? '✓' : getStepIcon(step)}
                              </button>
                              <div className="flex-1">
                                <p className={`text-xs font-bold transition-all ${isDone ? 'text-emerald-800 line-through' : 'text-slate-700'} leading-snug`}>
                                  {step}
                                </p>
                              </div>
                              <button 
                                onClick={() => toggleStepDone(idx)}
                                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-all ${
                                  isDone 
                                    ? 'bg-emerald-100 text-emerald-600' 
                                    : 'bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white'
                                }`}
                              >
                                {isDone ? 'Completed' : 'Done'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2 pt-4 flex-shrink-0 border-t border-slate-100">
                 <button className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg">
                    📅 Schedule Session
                 </button>
                 <button className="w-full bg-[#d91b1b] text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                    ✈️ Finalize Enrollment
                 </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-[48px] border border-dashed border-slate-200 h-[calc(100vh-120px)] flex flex-col items-center justify-center text-center p-12">
               <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center text-3xl mb-6 shadow-inner text-slate-300 animate-pulse">👤</div>
               <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-tight">Lead Intelligence</h3>
               <p className="text-slate-400 text-[10px] font-bold max-w-[200px] leading-relaxed uppercase tracking-wider">Select a prospect to unlock strategy and activity logs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadManagement;
