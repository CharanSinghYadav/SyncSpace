import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import { socket } from '../socket';
import logo from '../assets/logo.png';

const RoomPage = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [clients, setClients] = useState([]); 
    const [messages, setMessages] = useState([]);
    const [currentMsg, setCurrentMsg] = useState('');
    const chatEndRef = useRef(null); 

    // 🔥 MOBILE VIEW STATE ADDED (editor or chat)
    const [mobileView, setMobileView] = useState("editor");

    const username = location.state?.username;

    useEffect(() => {
        if (!username) { navigate('/'); return; }
        socket.connect();
        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('join-room', { roomId, username });
        });
        socket.on('joined-clients', (clientsList) => setClients(clientsList));
        socket.on('receive-message', (data) => setMessages((prev) => [...prev, data]));
        socket.on('disconnect', () => setIsConnected(false));

        return () => {
            socket.off('connect'); socket.off('joined-clients');
            socket.off('receive-message'); socket.off('disconnect');
            socket.disconnect();
        };
    }, [roomId, username, navigate]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!currentMsg.trim()) return;
        const msgData = {
            roomId, username, text: currentMsg,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, msgData]);
        socket.emit('send-message', msgData);
        setCurrentMsg('');
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-[#090D16] text-slate-100 overflow-hidden font-sans antialiased relative">
            
            {/* MINIMALIST HEADER */}
            <header className="h-14 shrink-0 border-b border-[#1F2937] px-3 md:px-5 flex items-center justify-between bg-[#101623]">
                
                {/* LEFT BRANDING */}
                <div className="flex items-center gap-2 md:gap-3">
                    <img src={logo} alt="SyncSpace" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                    <div className="flex items-center gap-1 md:gap-2">
                        <span className="font-semibold text-xs md:text-sm tracking-tight text-white">SyncSpace</span>
                        <span className="text-[9px] md:text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">PRO</span>
                    </div>
                </div>

                {/* CENTER: METADATA */}
                <div className="hidden md:flex items-center gap-2 bg-[#090D16] px-3 py-1 rounded-md border border-[#1F2937]">
                    <span className="text-[11px] text-slate-400 font-mono">SPACE://</span>
                    <span className="text-[11px] font-mono font-medium text-slate-200">{roomId}</span>
                </div>

                {/* RIGHT: CONNECTION TELEMETRY */}
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="text-[10px] md:text-[11px] font-mono text-slate-400">{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
                </div>
            </header>

            {/* WORKSPACE BODY */}
            <div className="flex flex-1 min-h-0 w-full relative">
                
                {/* LEFT EDITOR CANVAS (Mobile Toggle Applied) */}
                <div className={`w-full md:w-3/4 md:border-r border-[#1F2937] h-full min-w-0 min-h-0 ${mobileView === "editor" ? "flex flex-col" : "hidden md:flex"}`}>
                    <CodeEditor roomId={roomId} />
                </div>

                {/* RIGHT COLLABORATION SIDEBAR (Mobile Toggle Applied) */}
                <div className={`w-full md:w-1/4 bg-[#101623] h-full min-w-0 min-h-0 pb-16 md:pb-0 ${mobileView === "chat" ? "flex flex-col" : "hidden md:flex"}`}>
                    
                    {/* MEMBERS LIST */}
                    <div className="p-4 shrink-0 border-b border-[#1F2937]">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-mono uppercase text-slate-400 font-medium">Connected ({clients.length})</span>
                        </div>
                        <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                            {clients.map((client) => (
                                <div key={client.socketId} className="text-xs px-2.5 py-1.5 rounded-md flex items-center justify-between bg-[#090D16] border border-[#1F2937]/60">
                                    <div className="flex items-center gap-2 truncate">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                        <span className="text-slate-300 truncate">{client.username}</span>
                                    </div>
                                    {client.username === username && (
                                        <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">YOU</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CHAT SECTION */}
                    <div className="flex-1 min-h-0 p-4 overflow-y-auto flex flex-col gap-3">
                        {messages.length === 0 ? (
                            <p className="text-center text-xs text-slate-600 my-auto font-mono">No messages yet.</p>
                        ) : (
                            messages.map((m, index) => (
                                <div key={index} className={`flex flex-col ${m.username === username ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-baseline gap-1.5 mb-1">
                                        <span className="text-[11px] text-slate-400 font-medium">{m.username === username ? 'You' : m.username}</span>
                                        <span className="text-[9px] font-mono text-slate-600">{m.time}</span>
                                    </div>
                                    <div className={`px-3 py-2 rounded-lg max-w-[85%] break-words text-xs leading-relaxed ${
                                        m.username === username ? 'bg-blue-600 text-white' : 'bg-[#090D16] border border-[#1F2937] text-slate-300'
                                    }`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* CHAT INPUT */}
                    <form onSubmit={handleSendMessage} className="p-3 shrink-0 border-t border-[#1F2937] bg-[#101623]">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Type a message..." 
                                className="flex-1 bg-[#090D16] border border-[#1F2937] rounded-lg text-xs text-slate-200 px-3 py-2 outline-none focus:border-blue-500 placeholder-slate-600 transition-colors"
                                value={currentMsg}
                                onChange={(e) => setCurrentMsg(e.target.value)}
                            />
                            <button type="submit" className="bg-[#1F2937] hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer">
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* 🔥 FLOATING ACTION BUTTON (ONLY VISIBLE ON MOBILE) */}
            <button
                onClick={() => setMobileView(prev => prev === "editor" ? "chat" : "editor")}
                className="md:hidden fixed bottom-5 right-5 z-50 bg-blue-600 hover:bg-blue-500 text-white font-mono text-[11px] uppercase tracking-wider font-bold px-4 py-3 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] border border-blue-400/40 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
                {mobileView === "editor" ? (
                    <>
                        <span className="text-sm">💬</span> 
                        <span>Chat</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse ml-1"></span>
                    </>
                ) : (
                    <>
                        <span className="text-sm">💻</span> 
                        <span>Code</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default RoomPage;