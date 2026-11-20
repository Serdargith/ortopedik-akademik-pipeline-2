import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Loader2, 
  Copy, 
  ChevronRight,
  Database,
  BarChart3,
  FileText,
  Search,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Variable,
  Upload,
  FileSpreadsheet,
  Settings2,
  Cpu,
  Download,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle
} from 'docx';
import { STEPS, STEP_PROMPTS, DATA_CONTEXT } from './constants';
import { Step, StepOutput, StepStatus, StepStatuses, AppState } from './types';
import { callAI, AIProvider } from './services/ai';
import { detectSubspecialty, SUBSPECIALTY_PROFILES, OrthopedicSubspecialty } from './lib/subspecialty-detector';
import { selectReportingGuideline, CHECKLIST_ITEMS } from './lib/reporting-guidelines';
import { fetchLiteratureBundle, LiteratureBundle } from './lib/literature-engine';

const MODELS: Record<AIProvider, string[]> = {
  gemini: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  openrouter: [
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen-2.5-7b-instruct:free',
    'nvidia/llama-3.1-nemotron-70b-instruct',
    'google/gemma-2-9b-it:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    'huggingfaceh4/zephyr-7b-beta:free',
    'openchat/openchat-7b:free'
  ],
  groq: [
    'llama-3.3-70b-versatile', 
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
    'deepseek-r1-distill-llama-70b'
  ]
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepOutputs, setStepOutputs] = useState<StepOutput>({});
  const [stepStatuses, setStepStatuses] = useState<StepStatuses>({});
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [statusText, setStatusText] = useState<string>('Ready');
  const [topic, setTopic] = useState<string>('WHO 2020 Cartilage Tumors');
  const [customDataContext, setCustomDataContext] = useState<string>(DATA_CONTEXT);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  // New State
  const [subspecialty, setSubspecialty] = useState<OrthopedicSubspecialty>('oncology');
  const [reportingGuideline, setReportingGuideline] = useState<string>('STROBE');
  const [literatureBundle, setLiteratureBundle] = useState<LiteratureBundle | null>(null);
  const [targetJournal, setTargetJournal] = useState<string>('');
  const [showLiterature, setShowLiterature] = useState<boolean>(false);

  // AI Settings
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [model, setModel] = useState<string>(MODELS.gemini[0]);
  const [showManuscript, setShowManuscript] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const generateDocx = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: topic.toUpperCase(),
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: "ABSTRACT",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun(stepOutputs[18] || "Abstract not generated yet.")],
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: "INTRODUCTION",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun(stepOutputs[12] || "Introduction not generated yet.")],
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: "METHODS",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun(stepOutputs[13] || "Methods not generated yet.")],
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: "RESULTS",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun(stepOutputs[14] || "Results not generated yet.")],
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: "DISCUSSION",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun(stepOutputs[15] || "Discussion not generated yet.")],
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: "LIMITATIONS",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun(stepOutputs[16] || "Limitations not generated yet.")],
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: "CONCLUSION",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun(stepOutputs[17] || "Conclusion not generated yet.")],
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: "REFERENCES",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun(stepOutputs[11] || "References not generated yet.")],
            spacing: { after: 400 }
          }),
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${topic.replace(/\s+/g, '_')}_Manuscript.docx`);
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setModel(MODELS[provider][0]);
  }, [provider]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        // Convert to a structured string format for the AI
        const formattedData = (data as any[][]).map((row: any[]) => row.join(', ')).join('\n');
        const dataSummary = `
DATASET: ${file.name}
Row count: ${data.length}
Columns: ${(data[0] as any[])?.join(', ')}

DATA SAMPLE (First 10 rows):
${formattedData.split('\n').slice(0, 10).join('\n')}
        `;
        
        setCustomDataContext(dataSummary);
        
        // Auto-detect subspecialty
        const detected = detectSubspecialty(file.name + " " + (data[0] as any[])?.join(' '));
        setSubspecialty(detected);
        setReportingGuideline(selectReportingGuideline(file.name));
        
        setIsUploading(false);
        setStatusText('Data Loaded');
      } catch (error) {
        console.error("File parsing error:", error);
        setIsUploading(false);
        setStatusText('Error loading file');
      }
    };
    reader.readAsBinaryString(file);
  };

  const runPipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);
    const outputs: StepOutput = {};
    setStepOutputs({});
    setStepStatuses({});
    setStatusText('Running');

    let currentLitBundle = literatureBundle;

    for (let i = 0; i < STEPS.length; i++) {
      const step = STEPS[i];
      setCurrentStep(step.id);
      setStepStatuses(prev => ({ ...prev, [step.id]: 'running' }));
      setStatusText(`Step ${step.id}/20`);

      try {
        // Step 10: Fetch real literature if not already fetched
        if (step.id === 10 && !currentLitBundle) {
          setStatusText('Searching Literature...');
          const bundle = await fetchLiteratureBundle(topic, subspecialty);
          setLiteratureBundle(bundle);
          currentLitBundle = bundle;
        }

        let systemPrompt = STEP_PROMPTS[i];
        const profile = SUBSPECIALTY_PROFILES[subspecialty];
        
        // Replace placeholders
        systemPrompt = systemPrompt
          .replace(/{SUBSPECIALTY_LABEL}/g, profile.label)
          .replace(/{OUTCOME_SCALES}/g, profile.outcomeScales.join(', '))
          .replace(/{STATISTICAL_PRIORITIES}/g, profile.statisticalPriorities.join('; '))
          .replace(/{REPORTING_GUIDELINE}/g, reportingGuideline)
          .replace(/{TARGET_JOURNAL}/g, targetJournal || profile.targetJournals[0])
          .replace(/{TARGET_JOURNALS_FOR_SUBSPECIALTY}/g, profile.targetJournals.join(', '))
          .replace(/{REPORTING_CHECKLIST_ITEMS}/g, CHECKLIST_ITEMS[reportingGuideline as any]?.join('\n- ') || '');

        if (currentLitBundle) {
          const articleLimit = provider === 'openrouter' ? 2 : 15;
          systemPrompt = systemPrompt
            .replace(/{LITERATURE_BUNDLE_JSON}/g, JSON.stringify(currentLitBundle.pubmedArticles.slice(0, articleLimit)))
            .replace(/{LITERATURE_BUNDLE_SUMMARY}/g, currentLitBundle.pubmedArticles.slice(0, 5).map(a => `${a.title} (${a.year}) [PMID: ${a.pmid}]`).join('\n'))
            .replace(/{N_PUBMED}/g, String(currentLitBundle.pubmedArticles.length))
            .replace(/{N_SCOPUS}/g, String(currentLitBundle.scopusArticles.length))
            .replace(/{N_TOTAL}/g, String(currentLitBundle.totalFound))
            .replace(/{SEARCH_STRATEGY}/g, currentLitBundle.searchStrategy)
            .replace(/{RETRIEVED_AT}/g, currentLitBundle.retrievedAt);
        }

        const contextLimit = provider === 'openrouter' ? 250 : 500;
        let contextParts = [customDataContext.slice(0, contextLimit)];

        // Refined context selection to save tokens
        let ctxStepIds: number[] = [];
        if (step.id > 3 && step.id <= 9) {
          ctxStepIds = [1, 3]; // Data understanding and Study design
        } else if (step.id >= 10 && step.id <= 12) {
          ctxStepIds = [1, 3]; // Intro needs design and data context
        } else if (step.id === 13) {
          ctxStepIds = [1, 3, 5, 6]; // Methods needs stats plan
        } else if (step.id === 14) {
          ctxStepIds = [1, 3, 4, 5, 6, 8, 9, 13]; // Results needs stats and methods
        } else if (step.id >= 15) {
          // Discussion and beyond need most things, but we'll be selective
          ctxStepIds = [1, 3, 4, 6, 9, 10, 11, 12, 13, 14];
        }
        
        const additionalSteps = step.id >= 18 ? [15, 17] : []; // Abstract needs discussion/conclusion
        
        const uniqueStepIds = Array.from(new Set([...ctxStepIds, ...additionalSteps]));
        
        uniqueStepIds.forEach(id => {
          if (outputs[id]) {
            // Even more aggressive reduction for OpenRouter
            const sliceLimit = provider === 'openrouter' ? 200 : 400;
            contextParts.push(`\n[STEP ${id} OUTPUT]:\n${outputs[id].slice(0, sliceLimit)}`);
          }
        });

        const userPrompt = contextParts.join('\n');
        const output = await callAI(provider, systemPrompt, userPrompt, model);
        
        outputs[step.id] = output;
        setStepOutputs({ ...outputs });
        setStepStatuses(prev => ({ ...prev, [step.id]: 'done' }));

        // Add a small delay between steps to prevent rate limiting
        if (i < STEPS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error in step ${step.id}:`, error);
        outputs[step.id] = `[ERROR: ${error instanceof Error ? error.message : String(error)}]`;
        setStepOutputs({ ...outputs });
        setStepStatuses(prev => ({ ...prev, [step.id]: 'error' }));
      }
    }

    setIsRunning(false);
    setStatusText('Completed ✓');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStepIcon = (id: number) => {
    const status = stepStatuses[id];
    if (status === 'done') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === 'running') return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    if (status === 'error') return <AlertCircle className="w-4 h-4 text-rose-500" />;
    return <Circle className="w-4 h-4 text-slate-300" />;
  };

  const SubspecialtyBadge = ({ domain }: { domain: OrthopedicSubspecialty }) => {
    const profile = SUBSPECIALTY_PROFILES[domain];
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">
          {profile.label}
        </span>
      </div>
    );
  };

  const LiteraturePanel = () => {
    if (!literatureBundle) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-blue-600" />
            Real Literature (PubMed + Scopus)
          </h3>
          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {literatureBundle.totalFound} articles found
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {literatureBundle.pubmedArticles.slice(0, 10).map((art, idx) => (
            <div key={idx} className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm hover:border-blue-200 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">PubMed</span>
                <span className="text-[9px] text-slate-400">{art.year}</span>
              </div>
              <h4 className="text-[11px] font-semibold text-slate-800 leading-tight mb-2">{art.title}</h4>
              <p className="text-[10px] text-slate-500 italic mb-2">{art.journal}</p>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-400">PMID: {art.pmid}</span>
                {art.doi && <span className="text-[9px] text-slate-400">DOI: {art.doi}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const filteredSteps = () => {
    if (selectedStepId) return STEPS.filter(s => s.id === selectedStepId);
    if (activeTab === 'all') return STEPS.filter(s => stepOutputs[s.id] || stepStatuses[s.id] === 'running');
    if (activeTab === 'tables') return STEPS.filter(s => [4, 5, 6, 7, 8].includes(s.id) && (stepOutputs[s.id] || stepStatuses[s.id] === 'running'));
    if (activeTab === 'manuscript') return STEPS.filter(s => [13, 14, 15, 16, 17, 18].includes(s.id) && (stepOutputs[s.id] || stepStatuses[s.id] === 'running'));
    if (activeTab === 'review') return STEPS.filter(s => [19, 20].includes(s.id) && (stepOutputs[s.id] || stepStatuses[s.id] === 'running'));
    return [];
  };

  const progress = (Object.keys(stepOutputs).length / 20) * 100;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">Orthopedic Pipeline</h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Academic IMRaD Gen</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{Object.keys(stepOutputs).length} / 20 Steps</span>
              <div className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded-full border border-emerald-100">
                {statusText}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Topic Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Research Topic</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter orthopedic topic..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Subspecialty Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subspecialty</label>
            <select 
              value={subspecialty}
              onChange={(e) => setSubspecialty(e.target.value as OrthopedicSubspecialty)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
            >
              {Object.entries(SUBSPECIALTY_PROFILES).map(([id, p]) => (
                <option key={id} value={id}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Pipeline Steps */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pipeline Progress</label>
            <div className="space-y-1">
              {['A', 'B', 'C', 'D', 'E'].map(phase => {
                const phaseSteps = STEPS.filter(s => s.phase === phase);
                const phaseNames: Record<string, string> = {
                  A: 'Phase A · Data',
                  B: 'Phase B · Stats',
                  C: 'Phase C · Methods',
                  D: 'Phase D · Writing',
                  E: 'Phase E · Quality'
                };
                return (
                  <div key={phase} className="mb-4 last:mb-0">
                    <div className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      {phaseNames[phase]}
                    </div>
                    {phaseSteps.map(step => (
                      <button
                        key={step.id}
                        onClick={() => {
                          setSelectedStepId(step.id);
                          setActiveTab('all');
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${
                          selectedStepId === step.id 
                            ? 'bg-emerald-50 border border-emerald-100 shadow-sm' 
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          stepStatuses[step.id] === 'done' ? 'bg-emerald-500 text-white' : 
                          stepStatuses[step.id] === 'running' ? 'bg-blue-500 text-white animate-pulse' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          {stepStatuses[step.id] === 'done' ? '✓' : step.id}
                        </div>
                        <span className={`text-[11px] flex-1 truncate text-left ${
                          selectedStepId === step.id ? 'text-emerald-900 font-bold' : 'text-slate-600 font-medium'
                        }`}>
                          {step.name}
                        </span>
                        {getStepIcon(step.id)}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Settings2 className="w-3.5 h-3.5" />
            AI Settings
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isRunning || isUploading}
            className="w-full py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400 text-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            Upload Excel
          </button>
          
          <button
            onClick={runPipeline}
            disabled={isRunning || isUploading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Pipeline
              </>
            )}
          </button>

          {customDataContext !== DATA_CONTEXT && (
            <button
              onClick={() => {
                setCustomDataContext(DATA_CONTEXT);
                setStatusText('Ready');
              }}
              disabled={isRunning}
              className="w-full py-1.5 px-4 text-slate-400 hover:text-slate-600 text-[10px] font-medium flex items-center justify-center gap-1 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to Default Data
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        <header className="h-14 border-b border-slate-200 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-6">
            {[
              { id: 'all', label: 'All Steps', icon: LayoutDashboard },
              { id: 'tables', label: 'Tables', icon: BarChart3 },
              { id: 'manuscript', label: 'Manuscript', icon: FileText },
              { id: 'literature', label: 'Literature', icon: Search },
              { id: 'review', label: 'Review', icon: ShieldCheck },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedStepId(null);
                }}
                className={`h-14 flex items-center gap-2 text-[11px] font-bold transition-all relative px-1 ${
                  activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" 
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <SubspecialtyBadge domain={subspecialty} />
            
            <div className="h-6 w-px bg-slate-200 mx-1" />

            <button
              onClick={() => setShowManuscript(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[10px] font-bold transition-all shadow-sm"
              title="Preview Manuscript"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              PREVIEW
            </button>

            <button
              onClick={generateDocx}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm"
              title="Download Word Document"
            >
              <Download className="w-3.5 h-3.5" />
              DOWNLOAD .DOCX
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500">
              <Cpu className="w-3 h-3 text-emerald-500" />
              {provider.toUpperCase()} · {model.split('/').pop()}
            </div>
          </div>
        </header>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
              >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-emerald-600" />
                    AI Configuration
                  </h3>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Provider</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['gemini', 'openrouter', 'groq'] as AIProvider[]).map(p => (
                        <button
                          key={p}
                          onClick={() => setProvider(p)}
                          className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                            provider === p 
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' 
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Model Selection</label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      {MODELS[provider].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-800 leading-relaxed">
                      Ensure that the API key for your chosen provider is defined in the <strong>.env</strong> file.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                  >
                    Save and Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Manuscript Preview Modal */}
        <AnimatePresence>
          {showManuscript && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-slate-200"
              >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Manuscript Preview</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Academic Word Document Format</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={generateDocx}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download .docx
                    </button>
                    <button 
                      onClick={() => setShowManuscript(false)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-12 bg-slate-100/50">
                  <div className="max-w-3xl mx-auto bg-white shadow-xl border border-slate-200 p-16 min-h-full font-serif text-slate-800 leading-relaxed">
                    <h1 className="text-2xl font-bold text-center mb-12 uppercase tracking-tight leading-tight">
                      {topic}
                    </h1>

                    <section className="mb-10">
                      <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-widest">Abstract</h2>
                      <div className="text-sm whitespace-pre-wrap">
                        {stepOutputs[18] || <span className="text-slate-400 italic">Abstract not yet generated...</span>}
                      </div>
                    </section>

                    <section className="mb-10">
                      <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-widest">Introduction</h2>
                      <div className="text-sm whitespace-pre-wrap">
                        {stepOutputs[12] || <span className="text-slate-400 italic">Introduction not yet generated...</span>}
                      </div>
                    </section>

                    <section className="mb-10">
                      <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-widest">Methods</h2>
                      <div className="text-sm whitespace-pre-wrap">
                        {stepOutputs[13] || <span className="text-slate-400 italic">Methods not yet generated...</span>}
                      </div>
                    </section>

                    <section className="mb-10">
                      <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-widest">Results</h2>
                      <div className="text-sm whitespace-pre-wrap">
                        {stepOutputs[14] || <span className="text-slate-400 italic">Results not yet generated...</span>}
                      </div>
                    </section>

                    <section className="mb-10">
                      <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-widest">Discussion</h2>
                      <div className="text-sm whitespace-pre-wrap">
                        {stepOutputs[15] || <span className="text-slate-400 italic">Discussion not yet generated...</span>}
                      </div>
                    </section>

                    <section className="mb-10">
                      <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-widest">Limitations</h2>
                      <div className="text-sm whitespace-pre-wrap">
                        {stepOutputs[16] || <span className="text-slate-400 italic">Limitations not yet generated...</span>}
                      </div>
                    </section>

                    <section className="mb-10">
                      <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-widest">Conclusion</h2>
                      <div className="text-sm whitespace-pre-wrap">
                        {stepOutputs[17] || <span className="text-slate-400 italic">Conclusion not yet generated...</span>}
                      </div>
                    </section>

                    <section className="mb-10">
                      <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-widest">References</h2>
                      <div className="text-sm whitespace-pre-wrap">
                        {stepOutputs[11] || <span className="text-slate-400 italic">References not yet generated...</span>}
                      </div>
                    </section>
                  </div>
                </div>

                <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center">
                  <p className="text-[10px] text-slate-500 font-medium italic">
                    Note: This is a real-time preview. Tables and figures are represented by their textual descriptions.
                  </p>
                  <button
                    onClick={() => setShowManuscript(false)}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                  >
                    Close Preview
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={contentRef}>
          {filteredSteps().length === 0 && !isRunning && (
            <div className="max-w-3xl mx-auto text-center py-12">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                {customDataContext === DATA_CONTEXT ? (
                  <FileText className="w-8 h-8 text-emerald-600" />
                ) : (
                  <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                Universal Orthopedic Academic Pipeline
              </h2>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed max-w-xl mx-auto">
                A 20-step sequential AI pipeline that accepts any orthopedic research topic or dataset and produces a complete, publication-ready IMRaD manuscript.
              </p>
              
              <div className="grid grid-cols-3 gap-6 mb-10">
                {[
                  { label: 'Subspecialty', value: SUBSPECIALTY_PROFILES[subspecialty].label, icon: Users, color: 'text-slate-600', bg: 'bg-slate-50' },
                  { label: 'Reporting', value: reportingGuideline, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Literature', value: literatureBundle ? `${literatureBundle.totalFound} Articles` : 'Not Searched', icon: Search, color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} p-5 rounded-2xl border border-white shadow-sm`}>
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <div className="text-base font-bold text-slate-900">{stat.value}</div>
                  </div>
                ))}
              </div>

              {customDataContext !== DATA_CONTEXT && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left max-w-2xl mx-auto">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-500" />
                    Dataset Context Loaded
                  </h4>
                  <pre className="text-[10px] text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 overflow-x-auto font-mono leading-relaxed max-h-40 overflow-y-auto">
                    {customDataContext}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-5 gap-2">
                {[
                  { phase: 'Phase A', name: 'Data Engineering', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                  { phase: 'Phase B', name: 'Statistical Analysis', color: 'bg-blue-50 text-blue-700 border-blue-100' },
                  { phase: 'Phase C', name: 'Methodology', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
                  { phase: 'Phase D', name: 'Manuscript Writing', color: 'bg-amber-50 text-amber-700 border-amber-100' },
                  { phase: 'Phase E', name: 'Quality Assurance', color: 'bg-rose-50 text-rose-700 border-rose-100' }
                ].map((p, i) => (
                  <div key={i} className={`p-2 rounded-lg border ${p.color} text-center`}>
                    <div className="text-[10px] font-bold mb-0.5">{p.phase}</div>
                    <div className="text-[9px] leading-tight opacity-80">{p.name}</div>
                  </div>
                ))}
              </div>
              
              <p className="mt-8 text-xs text-slate-400">
                Click the button in the bottom left corner to start the pipeline.
              </p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {filteredSteps().map((step) => (
              <motion.section
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold">
                      STEP {step.id}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-800">{step.name}</h3>
                    {stepStatuses[step.id] === 'running' && (
                      <span className="flex items-center gap-1.5 text-[10px] font-medium text-blue-600">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                        Generating...
                      </span>
                    )}
                  </div>
                  {stepOutputs[step.id] && (
                    <button 
                      onClick={() => copyToClipboard(stepOutputs[step.id])}
                      className="p-1.5 hover:bg-white rounded-md text-slate-400 hover:text-emerald-600 transition-colors border border-transparent hover:border-slate-200"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="p-5">
                  {stepOutputs[step.id] ? (
                    <div className="prose prose-slate prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed text-xs bg-slate-50 p-4 rounded-lg border border-slate-100">
                        {stepOutputs[step.id]}
                      </pre>
                    </div>
                  ) : stepStatuses[step.id] === 'running' ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
                      <p className="text-xs font-medium">Analyzing and generating content...</p>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-300 italic text-xs">
                      This step has not been run yet.
                    </div>
                  )}
                </div>
              </motion.section>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
