let canvas;
let ws;
let userId;
let userColor;
let users = new Map();

function init() {
  canvas = new CanvasManager('drawingCanvas');
  
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;
  ws = new WebSocketManager(wsUrl);
  
  setupToolbar();
  setupWebSocketHandlers();
  setupCanvasHandlers();
}

function setupToolbar() {
  const toolButtons = document.querySelectorAll('.tool-btn');
  toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      toolButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      canvas.setTool(btn.dataset.tool);
    });
  });
  
  const colorPicker = document.getElementById('colorPicker');
  colorPicker.addEventListener('input', (e) => {
    canvas.setColor(e.target.value);
  });
  
  const brushSize = document.getElementById('brushSize');
  const brushSizeValue = document.getElementById('brushSizeValue');
  brushSize.addEventListener('input', (e) => {
    const size = e.target.value;
    canvas.setBrushSize(parseInt(size));
    brushSizeValue.textContent = size;
  });
  
  document.getElementById('undoBtn').addEventListener('click', () => {
    ws.send({ type: 'undo', userId });
  });
  
  document.getElementById('redoBtn').addEventListener('click', () => {
    ws.send({ type: 'redo', userId });
  });
  
  document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('Clear the entire canvas for everyone?')) {
      ws.send({ type: 'clear', userId });
    }
  });
}

function setupWebSocketHandlers() {
  ws.on('onConnect', () => {
    updateConnectionStatus(true);
  });
  
  ws.on('onDisconnect', () => {
    updateConnectionStatus(false);
  });
  
  ws.on('init', (data) => {
    userId = data.userId;
    userColor = data.color;
    
    data.users.forEach(uid => {
      if (uid !== userId) {
        users.set(uid, { color: generateUserColor() });
      }
    });
    
    updateUserCount();
    
    if (data.operations && data.operations.length > 0) {
      canvas.redrawAll(data.operations);
    }
  });
  
  ws.on('userJoined', (data) => {
    users.set(data.userId, { color: data.color });
    updateUserCount();
  });
  
  ws.on('userLeft', (data) => {
    users.delete(data.userId);
    removeCursor(data.userId);
    updateUserCount();
  });
  
  ws.on('stroke', (data) => {
    canvas.drawStroke(data);
  });
  
  ws.on('undo', (data) => {
    canvas.redrawAll(data.operations);
  });
  
  ws.on('redo', (data) => {
    canvas.redrawAll(data.operations);
  });
  
  ws.on('clear', (data) => {
    canvas.clearCanvas();
  });
  
  ws.on('cursor', (data) => {
    updateCursor(data.userId, data.x, data.y);
  });
}

function setupCanvasHandlers() {
  canvas.onStrokeComplete = (stroke) => {
    ws.send({
      type: 'stroke',
      userId,
      ...stroke
    });
  };
  
  canvas.onCursorMove = (coords) => {
    ws.send({
      type: 'cursor',
      userId,
      ...coords
    });
  };
}

function updateCursor(uid, x, y) {
  const cursorsContainer = document.getElementById('cursors');
  let cursor = document.getElementById(`cursor-${uid}`);
  
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.id = `cursor-${uid}`;
    cursor.className = 'cursor';
    cursor.style.backgroundColor = users.get(uid)?.color || '#000';
    cursorsContainer.appendChild(cursor);
  }
  
  cursor.style.left = `${x}px`;
  cursor.style.top = `${y}px`;
}

function removeCursor(uid) {
  const cursor = document.getElementById(`cursor-${uid}`);
  if (cursor) {
    cursor.remove();
  }
}

function updateUserCount() {
  document.getElementById('userCount').textContent = users.size + 1;
}

function updateConnectionStatus(connected) {
  const status = document.getElementById('connectionStatus');
  status.textContent = connected ? 'Connected' : 'Disconnected';
  status.className = connected ? 'status-connected' : 'status-disconnected';
}

function generateUserColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  return colors[Math.floor(Math.random() * colors.length)];
}

document.addEventListener('DOMContentLoaded', init);