import { io } from 'socket.io-client';

// SWITCHER: Frontend khud pata lagayega wo kahan run ho raha hai
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Agar local hai toh localhost:5000, warna latest working Render URL
const URL = isLocalhost 
    ? 'http://localhost:5000' 
    : 'https://syncspace-1fjm.onrender.com';

export const socket = io(URL, {
    autoConnect: false // Hum manual connect karenge jab zaroorat hogi
});