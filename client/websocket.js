class WebSocketManager {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.reconnectInterval = 3000;
    this.handlers = {};
    this.connect();
  }
  
  connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('Connected to server');
        if (this.handlers.onConnect) {
          this.handlers.onConnect();
        }
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('Disconnected from server');
        if (this.handlers.onDisconnect) {
          this.handlers.onDisconnect();
        }
        setTimeout(() => this.connect(), this.reconnectInterval);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Connection error:', error);
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }
  
  handleMessage(data) {
    const { type } = data;
    
    if (this.handlers[type]) {
      this.handlers[type](data);
    }
  }
  
  on(event, handler) {
    this.handlers[event] = handler;
  }
  
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
  
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}