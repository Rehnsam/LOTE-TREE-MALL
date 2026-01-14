
import React, { useState, useRef, useEffect } from 'react';
import { geminiService, decode, decodeAudioData, encode } from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';

interface Message {
  role: 'user' | 'ai';
  content: string;
  sources?: { title: string; uri: string }[];
  image?: string;
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'voice' | 'search' | 'image'>('chat');
  const [isLive, setIsLive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchHistory, setSearchHistory] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Image Configs
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [baseImage, setBaseImage] = useState<string | null>(null);

  // Live Voice Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const toggleOpen = () => setIsOpen(!isOpen);

  const QUICK_SEARCHES = [
    "DGCA Cabin Crew Medicals",
    "AAI Ground Handling Policy",
    "Grooming Standards CAR",
    "Dangerous Goods Training",
    "Airport Security Pass Rules"
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBaseImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() && !baseImage) return;
    
    const userMsg = textToSend;
    if (activeTab === 'search') {
      setSearchHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    } else {
      setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    }
    
    setInput('');
    setLoading(true);

    try {
      if (activeTab === 'image') {
        let resultImage;
        if (baseImage) {
          resultImage = await geminiService.editAviationImage(baseImage.split(',')[1], userMsg);
        } else {
          if (imageSize !== '1K') {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
              await (window as any).aistudio.openSelectKey();
            }
          }
          resultImage = await geminiService.generateAviationImage(userMsg, aspectRatio, imageSize);
        }
        
        if (resultImage) {
          setMessages(prev => [...prev, { 
            role: 'ai', 
            content: "I've processed your aviation visual request.", 
            image: resultImage 
          }]);
        }
        setBaseImage(null);
      } else if (activeTab === 'search') {
        const result = await geminiService.searchAviationInfo(userMsg);
        setSearchHistory(prev => [...prev, { 
          role: 'ai', 
          content: result.text, 
          sources: result.sources 
        }]);
      } else {
        const isRegulationQuery = /dgca|aai|regulation|rule|car |circular|medical|exam|policy|protocol/i.test(userMsg);
        if (isRegulationQuery) {
          const result = await geminiService.searchAviationInfo(userMsg);
          setMessages(prev => [...prev, { 
            role: 'ai', 
            content: result.text, 
            sources: result.sources 
          }]);
        } else {
          const responseText = await geminiService.solveComplexProblem(userMsg);
          setMessages(prev => [...prev, { role: 'ai', content: responseText as string }]);
        }
      }
    } catch (err) {
      const errorMsg: Message = { role: 'ai', content: "I encountered an error. Please try again or check your API key settings." };
      if (activeTab === 'search') setSearchHistory(prev => [...prev, errorMsg]);
      else setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const startLive = async () => {
    if (isLive) return;
    setIsLive(true);
    
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    sessionPromiseRef.current = geminiService.connectLive({
      onopen: () => {
        const source = audioContextRef.current!.createMediaStreamSource(stream);
        const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
        scriptProcessor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const l = inputData.length;
          const int16 = new Int16Array(l);
          for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
          const pcmBlob = {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
          };
          sessionPromiseRef.current.then((session: any) => {
            session.sendRealtimeInput({ media: pcmBlob });
          });
        };
        source.connect(scriptProcessor);
        scriptProcessor.connect(audioContextRef.current!.destination);
      },
      onmessage: async (message: LiveServerMessage) => {
        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio && outAudioContextRef.current) {
          nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outAudioContextRef.current.currentTime);
          const audioBuffer = await decodeAudioData(decode(base64Audio), outAudioContextRef.current, 24000, 1);
          const source = outAudioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(outAudioContextRef.current.destination);
          source.start(nextStartTimeRef.current);
          nextStartTimeRef.current += audioBuffer.duration;
          sourcesRef.current.add(source);
        }
        if (message.serverContent?.interrupted) {
          sourcesRef.current.forEach(s => s.stop());
          sourcesRef.current.clear();
          nextStartTimeRef.current = 0;
        }
      },
      onerror: (e) => console.error("Live Error", e),
      onclose: () => setIsLive(false),
    });
  };

  const stopLive = () => {
    setIsLive(false);
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then((s: any) => s.close());
    }
    audioContextRef.current?.close();
    outAudioContextRef.current?.close();
  };

  const currentDisplayMessages = activeTab === 'search' ? searchHistory : messages;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-[450px] h-[650px] bg-white rounded-[40px] shadow-2xl border border-slate-200 mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="aviation-gradient p-6 text-white flex justify-between items-center">
            <div>
              <h4 className="font-black text-lg flex items-center gap-2 tracking-tight">
                <span className="text-yellow-500">✨</span> Vision AI Hub
              </h4>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Sales, DGCA/AAI & Creative</p>
            </div>
            <button onClick={toggleOpen} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">✕</button>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-50 border-b border-slate-200 p-2 gap-2">
            {(['chat', 'voice', 'search', 'image'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${
                  activeTab === tab ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Image Config Bar */}
          {activeTab === 'image' && (
            <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400">Aspect Ratio</label>
                <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="w-full text-[10px] font-bold bg-white border border-slate-200 rounded-lg p-1">
                  <option>1:1</option><option>3:4</option><option>4:3</option><option>16:9</option><option>9:16</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400">Quality</label>
                <select value={imageSize} onChange={e => setImageSize(e.target.value)} className="w-full text-[10px] font-bold bg-white border border-slate-200 rounded-lg p-1">
                  <option>1K</option><option>2K</option><option>4K</option>
                </select>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {activeTab === 'voice' ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center transition-all duration-500 ${isLive ? 'bg-red-500 shadow-xl shadow-red-500/30 scale-110' : 'bg-slate-100 shadow-inner'}`}>
                   <span className="text-4xl">{isLive ? '🎙️' : '🔇'}</span>
                </div>
                <div className="space-y-2">
                  <h5 className="font-black text-slate-900 text-lg uppercase tracking-tight">{isLive ? 'Listening...' : 'Ready for Takeoff'}</h5>
                  <p className="text-xs text-slate-500 font-medium max-w-[250px]">Real-time DGCA compliance & hospitality sales coaching.</p>
                </div>
                <button
                  onClick={isLive ? stopLive : startLive}
                  className={`px-10 py-4 rounded-3xl font-black text-sm uppercase tracking-widest transition-all ${
                    isLive ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-900 text-white shadow-xl hover:scale-105 active:scale-95'
                  }`}
                >
                  {isLive ? 'End Session' : 'Start Live Audio'}
                </button>
              </div>
            ) : (
              <>
                {currentDisplayMessages.length === 0 && (
                  <div className="text-center py-12 space-y-6">
                    <p className="text-slate-300 text-3xl opacity-20 font-black italic uppercase tracking-[0.2em]">{activeTab}</p>
                    {activeTab === 'search' && (
                      <div className="space-y-4">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-8">Quick Regulatory Search</p>
                        <div className="flex flex-wrap justify-center gap-2 px-4">
                          {QUICK_SEARCHES.map((q, i) => (
                            <button 
                              key={i} 
                              onClick={() => handleSendMessage(q)}
                              className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-4 py-2 rounded-full hover:bg-slate-200 transition-all border border-slate-200"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-slate-400 text-xs font-bold px-8 leading-relaxed">
                      {activeTab === 'image' ? "Upload/Generate pro visuals." : 
                       activeTab === 'search' ? "Query official DGCA/AAI documents & circulars." : 
                       "Ask about crew medicals, airport security, or enrollment strategies."}
                    </p>
                  </div>
                )}
                {currentDisplayMessages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[90%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${
                      m.role === 'user' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {m.content}
                    </div>
                    {m.image && (
                      <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200 shadow-lg group relative">
                        <img src={m.image} alt="AI Generated" className="w-full h-auto max-h-64 object-contain bg-slate-900" />
                        <button 
                          onClick={() => setBaseImage(m.image!)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest"
                        >
                          Use as Base for Edits
                        </button>
                      </div>
                    )}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.sources.map((source, si) => (
                          <a 
                            key={si}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-black uppercase border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            🔗 {source.title.length > 25 ? source.title.substring(0, 25) + '...' : source.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 p-4 rounded-3xl flex items-center gap-3">
                       <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                       <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75" />
                       <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input Area */}
          {activeTab !== 'voice' && (
            <div className="p-6 border-t border-slate-100 flex flex-col gap-3">
              {baseImage && (
                <div className="flex items-center gap-3 bg-blue-50 p-2 rounded-xl">
                  <img src={baseImage} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 text-[10px] font-bold text-blue-700">Image loaded for editing</div>
                  <button onClick={() => setBaseImage(null)} className="text-blue-700 font-bold">✕</button>
                </div>
              )}
              <div className="flex gap-3">
                {activeTab === 'image' && (
                  <label className="bg-slate-100 w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-all">
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    🖼️
                  </label>
                )}
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder={
                    activeTab === 'image' ? (baseImage ? "How to edit?" : "Describe image...") : 
                    activeTab === 'search' ? "Search regulations (e.g. DGCA CAR 1.2)..." :
                    "Query DGCA rules or closing tips..."
                  }
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={loading}
                  className="bg-[#d91b1b] text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-red-500/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {activeTab === 'search' ? '🔍' : '✈️'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={toggleOpen}
        className={`w-16 h-16 aviation-gradient rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-90 ${isOpen ? 'ring-4 ring-white shadow-blue-500/20' : ''}`}
      >
        <span className="text-3xl text-yellow-500">{isOpen ? '✨' : '👨‍✈️'}</span>
      </button>
    </div>
  );
};

export default AIAssistant;
