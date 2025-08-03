// backend/socket.js
// Tích hợp socket.io cho backend

const http = require('http');
const socketio = require('socket.io');

let ioInstance = null;
const userSocketMap = {};

function setupSocket(server) {
    const io = socketio(server, { cors: { origin: '*' } });
    ioInstance = io;

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        socket.on('join', (userId) => {
            socket.join(userId);
            userSocketMap[userId] = socket.id;
        });
        socket.on('disconnect', () => {
            for (const [userId, id] of Object.entries(userSocketMap)) {
                if (id === socket.id) delete userSocketMap[userId];
            }
        });
    });
}

function sendNotificationToUser(userId, notification) {
    if (ioInstance) {
        ioInstance.to(userId).emit('notification', notification);
    }
}

function sendNotificationToAll(notification) {
    if (ioInstance) {
        ioInstance.emit('notification', notification);
    }
}

module.exports = {
    setupSocket,
    sendNotificationToUser,
    sendNotificationToAll
};
