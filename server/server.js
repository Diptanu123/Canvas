const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const RoomManager = require('./rooms');
const DrawingState = require('./drawing-state');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const roomManager = new RoomManager();
const drawingState = new DrawingState();

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

wss.on('connection', (ws) => {
  const userId = generateUserId();
  const userColor = generateRandomColor();
  
  ws.userId = userId;
  ws.roomId = 'default';
  
  roomManager.addUser(ws.roomId, userId, ws);
  
  ws.send(JSON.stringify({
    type: 'init',
    userId: userId,
    color: userColor,
    users: roomManager.getUsers(ws.roomId),
    history: drawingState.getHistory(ws.roomId)
  }));
  
  broadcastToRoom(ws.roomId, {
    type: 'userJoined',
    userId: userId,
    color: userColor
  }, userId);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(ws, data);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
  
  ws.on('close', () => {
    roomManager.removeUser(ws.roomId, userId);
    broadcastToRoom(ws.roomId, {
      type: 'userLeft',
      userId: userId
    });
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function handleMessage(ws, data) {
  const { type } = data;
  
  switch (type) {
    case 'drawStart':
    case 'draw':
    case 'drawEnd':
      drawingState.addStroke(ws.roomId, data);
      broadcastToRoom(ws.roomId, data, ws.userId);
      break;
      
    case 'undo':
      const undoState = drawingState.undo(ws.roomId);
      broadcastToRoom(ws.roomId, {
        type: 'undo',
        userId: data.userId,
        historyIndex: undoState.index
      });
      break;
      
    case 'redo':
      const redoState = drawingState.redo(ws.roomId);
      broadcastToRoom(ws.roomId, {
        type: 'redo',
        userId: data.userId,
        historyIndex: redoState.index
      });
      break;
      
    case 'clear':
      drawingState.clear(ws.roomId);
      broadcastToRoom(ws.roomId, {
        type: 'clear',
        userId: data.userId
      });
      break;
      
    case 'cursor':
      broadcastToRoom(ws.roomId, {
        type: 'cursor',
        userId: ws.userId,
        x: data.x,
        y: data.y
      }, ws.userId);
      break;
  }
}

function broadcastToRoom(roomId, message, excludeUserId = null) {
  const users = roomManager.getRoomConnections(roomId);
  const messageStr = JSON.stringify(message);
  
  users.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.userId !== excludeUserId) {
      client.send(messageStr);
    }
  });
}

function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateRandomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  return colors[Math.floor(Math.random() * colors.length)];
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});