/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, UploadCloud, Activity, StopCircle, Play, Settings2, BarChart2 } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoogleGenAI } from '@google/genai';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODELS = [
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

const MAGICS = [
  { id: 'Semantic Audit', type: 'radar' },
  { id: 'Schema Align', type: 'bar' },
  { id: 'Anomaly Probe', type: 'area' },
  { id: 'Style Uniform', type: 'line' },
  { id: 'Dependency Map', type: 'radar' },
  { id: 'Entity Extractor', type: 'bar' }
];

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function App() {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [model, setModel] = useState<string>(MODELS[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [prompt, setPrompt] = useState<string>("Create a comprehensive summary that include all previous created markdown in markdown in 3000~4000 words. Ending with 20 comprehensive follow up questions.");
  
  const [output, setOutput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<{time: string, msg: string, type: string}[]>([
    { time: new Date().toLocaleTimeString(), msg: '[SYSTEM] Command Center Ready.', type: 'info' }
  ]);
  
  const [metrics, setMetrics] = useState({
    consistency: 98.4,
    density: 'High',
    risk: 0.02,
    flux: 1.2
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [activeMagic, setActiveMagic] = useState<string | null>(null);
  const [magicData, setMagicData] = useState<any[]>([]);

  const addLog = (msg: string, type: 'info' | 'warn' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      addLog(`[FILES] Added ${newFiles.length} documents to context queue.`, 'info');
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      addLog('[SYSTEM] Execution aborted by user.', 'warn');
      setIsGenerating(false);
    }
  };

  const generateOutput = async () => {
    if (files.length === 0 && prompt.trim() === '') {
      addLog('[ERROR] Need files or prompt to proceed.', 'error');
      return;
    }
    
    setIsGenerating(true);
    setOutput('');
    setActiveMagic(null);
    addLog(`[SYSTEM] Initializing ${model} Context...`, 'info');
    
    // Animate metrics while generating
    const metricInterval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        consistency: Math.min(99.9, Math.max(90, prev.consistency + (Math.random() * 2 - 1))),
        risk: Math.max(0.01, prev.risk + (Math.random() * 0.02 - 0.01)),
        flux: Math.max(0.8, prev.flux + (Math.random() * 0.4 - 0.2))
      }));
    }, 500);

    abortControllerRef.current = new AbortController();

    try {
      addLog(`[STAGE 1] Formatting files for processing...`, 'info');
      const parts: any[] = [];
      
      for (const file of files) {
        addLog(`  -> Encoding ${file.name}...`, 'info');
        const b64 = await fileToBase64(file);
        let mimeType = file.type || 'application/octet-stream';
        if (file.name.endsWith('.md')) mimeType = 'text/markdown';
        if (file.name.endsWith('.epub')) mimeType = 'application/epub+zip';

        parts.push({
          inlineData: {
            mimeType,
            data: b64
          }
        });
      }

      addLog(`[STAGE 2] Submitting to AI Model...`, 'info');
      const systemPrompt = `You are a Senior Regulatory Analyst and Nordic Data Assistant. Output Language: ${language === 'zh' ? 'Traditional Chinese (zh-TW)' : 'English'}. The user has provided some files and a task. Please follow their instructions carefully. Ensure professional, technical tone.`;
      
      parts.push({ text: prompt });
      
      const stream = await ai.models.generateContentStream({
        model: model,
        contents: parts,
        config: {
          systemInstruction: systemPrompt
        }
      });

      addLog(`[STAGE 3] Receiving synthesis...`, 'info');

      for await (const chunk of stream) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }
        setOutput(prev => prev + chunk.text);
      }

      if (!abortControllerRef.current?.signal.aborted) {
        addLog(`[SUCCESS] Synthesis complete.`, 'success');
      }

    } catch (e: any) {
      if (e.name === 'AbortError') {
        addLog(`[WARN] Stream stopped manually.`, 'warn');
      } else {
        addLog(`[ERROR] ${e.message}`, 'error');
        console.error(e);
      }
    } finally {
      clearInterval(metricInterval);
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const executeMagic = async (magicName: string, magicType: string) => {
    setActiveMagic(magicName);
    addLog(`[MAGIC] Executing ${magicName}...`, 'info');
    
    const fakeData = Array.from({length: 6}).map((_, i) => ({
      subject: `Entity ${i+1}`,
      A: Math.floor(Math.random() * 100) + 20,
      B: Math.floor(Math.random() * 100) + 10,
      fullMark: 150,
      name: `T${i+1}`,
      value: Math.floor(Math.random() * 800) + 200,
    }));
    
    setMagicData(fakeData);
    addLog(`[MAGIC] ${magicName} Data extracted. Visualization Ready.`, 'success');
  };

  // Auto-scroll logs
  const logEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-full h-screen bg-[#f0f2f5] font-sans flex overflow-hidden text-[#1a1a1a]">
      {/* LEFT SIDEBAR: CONFIGURATION */}
      <aside className="w-80 bg-[#0F4C81] text-white p-6 flex flex-col gap-6 shadow-xl z-20 shrink-0 overflow-y-auto hidden-scrollbar">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#BB2649] rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">Ω</div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">OMC v7.0</h1>
            <p className="text-[10px] opacity-70 uppercase tracking-widest mt-1">Nordic Command Center</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-semibold text-[#F5DF4D] block mb-2 tracking-wider">Active Model</label>
            <div className="relative">
              <select 
                value={model} 
                onChange={e => setModel(e.target.value)}
                className="w-full appearance-none bg-white/10 rounded border border-white/20 p-3 text-xs cursor-pointer hover:bg-white/20 transition-colors focus:outline-none focus:ring-1 focus:ring-[#F5DF4D]"
              >
                {MODELS.map(m => (
                  <option key={m} value={m} className="bg-[#0F4C81] text-white">{m}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 opacity-50 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
             <label className="text-[10px] uppercase font-semibold text-[#F5DF4D] block mb-2 tracking-wider">Context Source</label>
             <label className="block p-4 border-2 border-dashed border-white/20 rounded-lg text-center hover:border-[#F5DF4D] cursor-pointer transition-colors relative overflow-hidden group bg-black/10">
                <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                <UploadCloud className="w-5 h-5 mx-auto mb-2 opacity-60 group-hover:opacity-100 transition-opacity text-[#F5DF4D]" />
                <p className="text-xs mb-1 font-medium group-hover:text-[#F5DF4D] transition-colors">Upload Documents</p>
                <p className="text-[10px] opacity-60">PDF, DOCX, EPUB, TXT, JSON</p>
             </label>
             {files.length > 0 && (
               <div className="mt-2 text-[10px] opacity-80 max-h-20 overflow-y-auto hidden-scrollbar">
                 {files.map((f, i) => <div key={i} className="truncate pb-1 border-b border-white/10">📄 {f.name}</div>)}
               </div>
             )}
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-[#F5DF4D] block mb-2 tracking-wider">Output Language</label>
            <div className="grid grid-cols-2 gap-1 bg-black/20 p-1 rounded">
              <button
                onClick={() => setLanguage('zh')}
                className={`text-xs py-1.5 rounded font-bold transition-all border ${language === 'zh' ? 'bg-[#F5DF4D] text-[#0F4C81] border-[#F5DF4D] shadow-sm' : 'text-white/70 border-transparent hover:bg-white/10'}`}
              >
                繁體中文
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`text-xs py-1.5 rounded font-bold transition-all border ${language === 'en' ? 'bg-[#F5DF4D] text-[#0F4C81] border-[#F5DF4D] shadow-sm' : 'text-white/70 border-transparent hover:bg-white/10'}`}
              >
                ENGLISH
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-[#F5DF4D] block mb-2 tracking-wider flex items-center gap-2">
              <Settings2 className="w-3 h-3 text-[#F5DF4D]" /> System Prompt
            </label>
            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full h-32 bg-white/5 rounded border border-white/10 p-3 text-xs resize-none focus:outline-none focus:border-[#F5DF4D] transition-colors text-white placeholder-white/30"
              placeholder="Enter your system instructions and summary configurations here..."
            />
          </div>
        </div>

        <div className="mt-auto pt-4 space-y-3">
          {isGenerating ? (
            <button 
              onClick={handleStop}
              className="w-full bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2 py-4 rounded-lg font-bold text-sm shadow-lg tracking-wide transition-colors"
            >
              <StopCircle className="w-5 h-5" /> STOP EXECUTION
            </button>
          ) : (
            <button 
              onClick={generateOutput}
              className="w-full bg-[#BB2649] hover:bg-[#a11f3d] flex items-center justify-center gap-2 py-4 rounded-lg font-bold text-sm shadow-lg tracking-wide transition-colors"
            >
              <Play className="w-4 h-4 fill-current" /> GENERATE
            </button>
          )}
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* TOP BAR: PULSE METRICS */}
        <header className="h-28 border-b border-gray-300 bg-white grid grid-cols-4 shrink-0 shadow-sm z-10">
          <div className="border-r border-gray-100 p-5 flex flex-col justify-center">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mb-1">Consistency Index</span>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-light text-[#0F4C81] transition-all duration-300">{metrics.consistency.toFixed(1)}<span className="text-sm opacity-50">%</span></span>
              <div className={`w-2 h-2 rounded-full mb-2 ${isGenerating ? 'bg-green-500 animate-pulse' : 'bg-green-600'}`}></div>
            </div>
          </div>
          <div className="border-r border-gray-100 p-5 flex flex-col justify-center">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mb-1">Compliance Density</span>
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-light ${isGenerating ? 'text-[#BB2649] animate-pulse' : 'text-[#0F4C81]'}`}>
                {isGenerating ? 'Updating...' : metrics.density}
              </span>
            </div>
          </div>
          <div className="border-r border-gray-100 p-5 flex flex-col justify-center">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mb-1">Risk Vectors</span>
            <div className="flex items-end gap-2 text-[#BB2649]">
              <span className="text-3xl font-light transition-all duration-300">{metrics.risk.toFixed(2)}</span>
            </div>
          </div>
          <div className="p-5 flex flex-col justify-center">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mb-1">Optimization Flux</span>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-light text-[#0F4C81] transition-all duration-300">{metrics.flux.toFixed(2)}<span className="text-sm opacity-50">/tok</span></span>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <section className="flex-1 flex overflow-hidden">
          {/* LOG VIEW (MONO) */}
          <div className="w-1/3 p-4 border-r border-gray-200 flex flex-col bg-[#fbfbfb]">
            <h2 className="text-[10px] font-black uppercase tracking-wider mb-3 flex items-center gap-2 text-[#0F4C81]">
              <Activity className="w-3 h-3 text-[#BB2649]" />
              Temporal Log Stream
            </h2>
            <div className="flex-1 bg-[#1a1c1e] rounded p-3 font-mono text-[10px] overflow-y-auto hidden-scrollbar shadow-inner flex flex-col gap-1.5">
              {logs.map((log, i) => (
                <div key={i} className={`leading-relaxed ${
                  log.type === 'error' ? 'text-red-400 font-bold' : 
                  log.type === 'warn' ? 'text-[#F5DF4D]' : 
                  log.type === 'success' ? 'text-green-400 font-bold' : 
                  'text-gray-400'
                }`}>
                  <span className="opacity-40 inline-block w-16">[{log.time}]</span> {log.msg}
                </div>
              ))}
              {isGenerating && (
                <div className="text-[#BB2649] animate-[pulse_1s_ease-in-out_infinite] mt-2 font-bold tracking-widest bg-white/5 py-1 px-2 rounded w-max">...AWAITING SIGNAL...</div>
              )}
              <div ref={logEndRef} />
            </div>
          </div>

          {/* AI MAGICS & PREVIEW */}
          <div className="w-2/3 p-6 flex flex-col gap-6 overflow-y-auto bg-white/80 scroll-smooth">
            <div className="flex items-center justify-between shrink-0">
              <h2 className="text-[10px] font-black uppercase tracking-wider text-gray-400">WOW AI Magics</h2>
              <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-1 rounded border border-gray-200">Requires Completed Context</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 shrink-0">
              {MAGICS.map((magic) => (
                <button 
                  key={magic.id} 
                  onClick={() => executeMagic(magic.id, magic.type)}
                  disabled={isGenerating || !output}
                  className={`p-3 border rounded text-left transition-all ${
                    isGenerating || !output ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-100' :
                    activeMagic === magic.id ? 'bg-[#0F4C81] border-[#0F4C81] text-white shadow-md' :
                    'bg-white border-gray-200 hover:border-[#BB2649] hover:shadow-sm group'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-[9px] font-bold uppercase transition-colors ${activeMagic === magic.id ? 'text-blue-300' : 'text-gray-400'}`}>Interactive</p>
                    <BarChart2 className={`w-3 h-3 ${activeMagic === magic.id ? 'text-[#F5DF4D]' : 'text-gray-400 group-hover:text-[#BB2649]'}`} />
                  </div>
                  <p className={`text-xs font-bold transition-colors ${activeMagic === magic.id ? 'text-white' : 'text-[#0F4C81] group-hover:text-[#BB2649]'}`}>{magic.id}</p>
                </button>
              ))}
            </div>

            {/* VISUALIZATION PANEL */}
            {activeMagic && (
              <div className="w-full h-72 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg shadow-sm p-4 animate-in fade-in zoom-in duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#BB2649]/5 rounded-bl-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#0F4C81]/5 rounded-tr-full pointer-events-none"></div>
                
                <h3 className="text-[10px] font-bold uppercase text-[#0F4C81] mb-2">{activeMagic} Visualization</h3>
                <ResponsiveContainer width="100%" height="90%">
                  {MAGICS.find(m => m.id === activeMagic)?.type === 'radar' ? (
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={magicData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fill: '#6b7280'}} />
                      <Radar name="Metric A" dataKey="A" stroke="#BB2649" fill="#BB2649" fillOpacity={0.4} />
                      <Radar name="Metric B" dataKey="B" stroke="#0F4C81" fill="#0F4C81" fillOpacity={0.4} />
                      <Tooltip />
                    </RadarChart>
                  ) : MAGICS.find(m => m.id === activeMagic)?.type === 'bar' ? (
                    <BarChart data={magicData} margin={{top: 10, right: 10, bottom: 0, left: -20}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="name" tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="value" fill="#0F4C81" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <AreaChart data={magicData} margin={{top: 10, right: 10, bottom: 0, left: -20}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="name" tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Area type="monotone" dataKey="value" stroke="#F5DF4D" fill="#BB2649" strokeWidth={3} fillOpacity={0.2} />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}

            <div className="flex-1 bg-white border border-gray-200 shadow-sm rounded-lg p-8 relative min-h-[400px]">
              {!output && !isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-lg">
                  <Activity className="w-12 h-12 mb-4 opacity-20 text-[#0F4C81]" />
                  <p className="text-sm font-medium text-[#0F4C81]">Awaiting Execution Command</p>
                  <p className="text-xs opacity-60 mt-1">Upload files, configure logic, and press Generate</p>
                </div>
              )}
              
              <div className="prose prose-sm md:prose-base prose-slate max-w-none prose-headings:font-bold prose-headings:text-[#0F4C81] prose-a:text-[#BB2649] prose-img:rounded-xl">
                <Markdown remarkPlugins={[remarkGfm]}>{output}</Markdown>
              </div>
              
              {isGenerating && (
                <div className="mt-8 space-y-4 opacity-70">
                  <div className="h-3 w-3/4 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse"></div>
                  <div className="h-3 w-full bg-gradient-to-r from-gray-200 to-gray-100 rounded"></div>
                  <div className="h-3 w-5/6 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse delay-150"></div>
                  <div className="h-3 w-4/5 bg-gradient-to-r from-gray-200 to-gray-100 rounded"></div>
                </div>
              )}

              {output && (
                <div className="sticky bottom-0 mt-8 w-full bg-white/90 backdrop-blur border-t border-gray-100 pt-4 flex justify-end pb-2">
                  <div className="bg-[#F5DF4D] text-[#0F4C81] px-4 py-2 rounded text-[10px] font-black uppercase shadow-sm flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    {output.split(/\s+/).length} Words Synthesized
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FOOTER STATUS */}
        <footer className="h-10 border-t border-gray-200 px-6 flex items-center justify-between text-[10px] text-gray-500 font-medium shrink-0 bg-[#fbfbfb]">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-[#F5DF4D] animate-pulse drop-shadow-[0_0_4px_rgba(245,223,77,0.8)]' : 'bg-green-500 drop-shadow-[0_0_4px_rgba(34,197,94,0.8)]'}`}></span>
              {isGenerating ? 'PROCESSING KNOWLEDGE GRAPH' : 'AGENT IDLE'}
            </span>
            <span className="uppercase font-bold tracking-widest">SESSION: {model}</span>
          </div>
          <div className="flex items-center gap-4">
            {output && <span>ARTIFACT: <strong className="text-[#0F4C81]">LOCKED</strong></span>}
            <span className="font-mono">{new Date().toLocaleTimeString()}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
