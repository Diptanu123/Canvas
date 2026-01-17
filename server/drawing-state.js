class DrawingState {
  constructor() {
    this.rooms = new Map();
  }
  
  initRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        strokes: [],
        history: [],
        historyIndex: -1
      });
    }
  }
  
  addStroke(roomId, strokeData) {
    this.initRoom(roomId);
    const room = this.rooms.get(roomId);
    
    if (strokeData.type === 'drawEnd') {
      room.history = room.history.slice(0, room.historyIndex + 1);
      room.history.push([...room.strokes]);
      room.historyIndex = room.history.length - 1;
    }
    
    room.strokes.push(strokeData);
  }
  
  undo(roomId) {
    this.initRoom(roomId);
    const room = this.rooms.get(roomId);
    
    if (room.historyIndex > 0) {
      room.historyIndex--;
      room.strokes = [...room.history[room.historyIndex]];
    }
    
    return { index: room.historyIndex, strokes: room.strokes };
  }
  
  redo(roomId) {
    this.initRoom(roomId);
    const room = this.rooms.get(roomId);
    
    if (room.historyIndex < room.history.length - 1) {
      room.historyIndex++;
      room.strokes = [...room.history[room.historyIndex]];
    }
    
    return { index: room.historyIndex, strokes: room.strokes };
  }
  
  clear(roomId) {
    this.initRoom(roomId);
    const room = this.rooms.get(roomId);
    
    room.strokes = [];
    room.history = [[]];
    room.historyIndex = 0;
  }
  
  getHistory(roomId) {
    this.initRoom(roomId);
    return this.rooms.get(roomId).strokes;
  }
}

module.exports = DrawingState;