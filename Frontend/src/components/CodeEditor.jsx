import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { socket } from '../socket.js';

const CODEX_LANG_MAP = { javascript: "js", python: "py", cpp: "cpp", java: "java" };

const CodeEditor = ({ roomId }) => {
    const [activeTab, setActiveTab] = useState("code");
    const [code, setCode] = useState("// Welcome to SyncSpace PRO\n// Start collaborating in real-time...\nconsole.log('Hello from Jaipur! 🚀');");
    const [language, setLanguage] = useState("javascript");
    
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    
    const [showAdmin, setShowAdmin] = useState(false);
    const [stats, setStats] = useState({ executions: 12, memory: "42 MB", uptime: "99.9%" });

    useEffect(() => {
        socket.on('code-update', (newCode) => setCode(newCode));
        socket.on('receive-output', (sharedOutput) => setOutput(sharedOutput));
        socket.on('stats-update', (newStats) => setStats(newStats));

        return () => { 
            socket.off('code-update'); 
            socket.off('receive-output'); 
            socket.off('stats-update');
        };
    }, []);

    const handleEditorChange = (value) => {
        setCode(value);
        socket.emit('code-change', { roomId, newCode: value }); 
    };

    const runCode = async () => {
        if (language === "markdown") {
            setOutput("Doc Mode active. Switch to a programming language to execute.");
            return;
        }

        setIsRunning(true);
        setOutput("Executing via proxy...");

        try {
            // 🔥 Fixed backend API URL to the working one
            const response = await fetch("https://syncspace-wo8l.onrender.com/run-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language })
            });

            const data = await response.json();
            const result = data.output || data.error || "Execution completed (No console output)";
            
            setOutput(result);
            socket.emit('sync-output', { roomId, output: result });
            setStats(prev => ({ ...prev, executions: prev.executions + 1 }));

        } catch (error) {
            setOutput(`Network Error: Proxy Server unreachable (${error.message})`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#090D16] font-sans relative">
            
            {/* MINIMALIST ADMIN MODAL */}
            {showAdmin && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
                    <div className="bg-[#101623] border border-[#1F2937] w-full max-w-sm rounded-xl shadow-2xl p-5">
                        <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#1F2937]">
                            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                                Telemetry Analytics
                            </h2>
                            <button onClick={() => setShowAdmin(false)} className="text-slate-500 hover:text-slate-300 text-xs font-mono">[CLOSE]</button>
                        </div>
                        
                        <div className="space-y-3 font-mono text-xs">
                            <div className="bg-[#090D16] p-3 rounded border border-[#1F2937] flex justify-between items-center">
                                <span className="text-slate-400">CLUSTER STATUS</span>
                                <span className="text-emerald-400 font-semibold">HEALTHY</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#090D16] p-3 rounded border border-[#1F2937] flex flex-col">
                                    <span className="text-slate-500 text-[10px]">TOTAL RUNS</span>
                                    <span className="text-lg font-bold text-slate-200 mt-0.5">{stats.executions}</span>
                                </div>
                                <div className="bg-[#090D16] p-3 rounded border border-[#1F2937] flex flex-col">
                                    <span className="text-slate-500 text-[10px]">UPTIME</span>
                                    <span className="text-lg font-bold text-slate-200 mt-0.5">{stats.uptime}</span>
                                </div>
                            </div>

                            <div className="bg-[#090D16] p-3 rounded border border-[#1F2937] flex justify-between items-center">
                                <span className="text-slate-400">REDIS CACHE</span>
                                <span className="text-slate-300">{stats.memory}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDITOR TOOLBAR (Responsive Overflow) */}
            <div className="h-12 shrink-0 border-b border-[#1F2937] px-2 md:px-4 flex items-center justify-between bg-[#101623] overflow-x-auto overflow-y-hidden no-scrollbar">
                
                {/* TAB SWITCHER */}
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    <div className="flex bg-[#090D16] p-1 rounded-lg border border-[#1F2937]">
                        <button 
                            onClick={() => setActiveTab("code")} 
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${activeTab === "code" ? "bg-[#1F2937] text-white" : "text-slate-400 hover:text-slate-200"}`}
                        >
                            Editor
                        </button>
                        <button 
                            onClick={() => setActiveTab("whiteboard")} 
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${activeTab === "whiteboard" ? "bg-[#1F2937] text-white" : "text-slate-400 hover:text-slate-200"}`}
                        >
                            Canvas
                        </button>
                    </div>

                    <button 
                        onClick={() => setShowAdmin(true)}
                        className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors cursor-pointer mr-2 md:mr-0"
                    >
                        Metrics
                    </button>
                </div>

                {/* RIGHT CONTROLS */}
                {activeTab === "code" && (
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                        <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)} 
                            className="bg-[#090D16] text-xs font-mono text-slate-300 border border-[#1F2937] rounded-md px-2.5 py-1 outline-none cursor-pointer focus:border-blue-500 transition-colors"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                            <option value="markdown">Markdown</option>
                        </select>

                        <button 
                            onClick={runCode} 
                            disabled={isRunning || language === "markdown"} 
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${isRunning ? 'bg-slate-800 text-slate-500 border border-slate-700' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'}`}
                        >
                            {isRunning ? "Running..." : "Run"}
                        </button>
                    </div>
                )}

                {activeTab === "whiteboard" && (
                    <span className="text-[10px] md:text-[11px] font-mono text-slate-500 pr-2 md:pr-0 shrink-0">EXCALIDRAW://SANDBOX</span>
                )}
            </div>

            {/* CONDITIONAL CANVAS */}
            {activeTab === "code" ? (
                <>
                    <div className="h-[70%] min-h-0 w-full border-b border-[#1F2937]">
                        <Editor height="100%" width="100%" theme="vs-dark" language={language} value={code} onChange={handleEditorChange} options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: "on", padding: { top: 16 } }} />
                    </div>
                    <div className="h-[30%] min-h-0 w-full bg-[#090D16] p-3 flex flex-col font-mono pb-16 md:pb-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#1F2937]/60 mb-2 shrink-0">
                            <span className="text-[11px] text-slate-500">OUTPUT</span>
                            <button onClick={() => setOutput("")} className="text-[11px] text-slate-600 hover:text-slate-400 cursor-pointer">Clear</button>
                        </div>
                        <div className="flex-1 overflow-y-auto text-xs text-slate-300 whitespace-pre-wrap leading-relaxed selection:bg-blue-500 selection:text-white pr-2">
                            {output || 'Ready to execute.'}
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ height: "calc(100vh - 3.5rem)", width: "100%", backgroundColor: "#121212" }}>
                    <iframe src="https://excalidraw.com" width="100%" height="100%" style={{ border: "none" }} title="SyncSpace Whiteboard" />
                </div>
            )}

        </div>
    );
};

export default CodeEditor;