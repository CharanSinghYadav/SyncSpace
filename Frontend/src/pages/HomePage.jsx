import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const HomePage = () => {
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const joinRoom = (e) => {
        e.preventDefault();
        if (!roomId || !username) return;
        navigate(`/room/${roomId}`, { state: { username } });
    };

    return (
        <div className="flex items-center justify-center h-screen bg-[#090D16] text-slate-100 selection:bg-blue-600 font-sans antialiased">
            {/* Subtle Ambient Studio Light */}
            <div className="absolute w-[600px] h-[350px] bg-blue-600/10 blur-[160px] rounded-full pointer-events-none -z-10" />

            {/* Changed width to be responsive on mobile */}
            <form onSubmit={joinRoom} className="bg-[#101623] p-8 rounded-xl flex flex-col gap-6 w-full max-w-sm mx-4 md:mx-0 border border-[#1F2937] shadow-xl">
                
                {/* BRANDING */}
                <div className="flex flex-col items-center gap-2 mb-1">
                    <img src={logo} alt="SyncSpace" className="w-10 h-10 object-contain mb-1" />
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        SyncSpace Cloud
                    </h1>
                    <p className="text-xs text-slate-400 font-normal text-center">
                        Real-time collaborative developer workspace
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-mono uppercase text-slate-400 font-medium tracking-wider">Workspace ID</label>
                        <input 
                            type="text" 
                            placeholder="e.g. interview-101" 
                            className="w-full px-3 py-2 rounded-lg bg-[#090D16] text-xs text-slate-200 placeholder-slate-600 border border-[#1F2937] outline-none focus:border-blue-500 transition-colors"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-mono uppercase text-slate-400 font-medium tracking-wider">Display Name</label>
                        <input 
                            type="text" 
                            placeholder="enter your name..." 
                            className="w-full px-3 py-2 rounded-lg bg-[#090D16] text-xs text-slate-200 placeholder-slate-600 border border-[#1F2937] outline-none focus:border-blue-500 transition-colors"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                </div>

                <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer">
                    Join Workspace
                </button>
            </form>
        </div>
    );
};

export default HomePage;