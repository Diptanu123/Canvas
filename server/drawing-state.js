class DrawingState {
  constructor() {
    this.rooms = new Map();
  }
  
  initRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        operations: [],
        currentIndex: -1
      });
    }
  }
  
  addOperation(roomId, operation) {
    this.initRoom(roomId);
    const room = this.rooms.get(roomId);
    
    room.operations = room.operations.slice(0, room.currentIndex + 1);
    room.operations.push(operation);
    room.currentIndex = room.operations.length - 1;
    
    return { operations: room.operations, index: room.currentIndex };
  }
  
  undo(roomId) {
    this.initRoom(roomId);
    const room = this.rooms.get(roomId);
    
    if (room.currentIndex > -1) {
      room.currentIndex--;
    }
    
    const operations = room.operations.slice(0, room.currentIndex + 1);
    return { operations, index: room.currentIndex };
  }
  
  redo(roomId) {
    this.initRoom(roomId);
    const room = this.rooms.get(roomId);
    
    if (room.currentIndex < room.operations.length - 1) {
      room.currentIndex++;
    }
    
    const operations = room.operations.slice(0, room.currentIndex + 1);
    return { operations, index: room.currentIndex };
  }
  
  clear(roomId) {
    this.initRoom(roomId);
    const room = this.rooms.get(roomId);
    
    room.operations = [];
    room.currentIndex = -1;
    
    return { operations: [], index: -1 };
  }
  
  getOperations(roomId) {
    this.initRoom(roomId);
    const room = this.rooms.get(roomId);
    return room.operations.slice(0, room.currentIndex + 1);
  }
}

module.exports = DrawingState;