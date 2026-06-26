import { io } from 'socket.io-client';

const URL = 'https://syncspace-wo8l.onrender.com';
export const socket = io(URL, {
    autoConnect: false // Hum manual connect karenge jab zaroorat hogi
});