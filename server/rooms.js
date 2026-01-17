class RoomManager {
  constructor() {
    this.rooms = new Map();
  }
  
  addUser(roomId, userId, connection) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Map());
    }
    
    this.rooms.get(roomId).set(userId, {
      connection,
      joinedAt: Date.now()
    });
  }
  
  removeUser(roomId, userId) {
    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).delete(userId);
      
      if (this.rooms.get(roomId).size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }
  
  getUsers(roomId) {
    if (!this.rooms.has(roomId)) {
      return [];
    }
    
    return Array.from(this.rooms.get(roomId).keys());
  }
  
  getRoomConnections(roomId) {
    if (!this.rooms.has(roomId)) {
      return [];
    }
    
    return Array.from(this.rooms.get(roomId).values()).map(user => user.connection);
  }
  
  getUserCount(roomId) {
    return this.rooms.has(roomId) ? this.rooms.get(roomId).size : 0;
  }
}

module.exports = RoomManager;