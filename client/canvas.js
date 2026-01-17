class CanvasManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.currentPath = [];
    this.color = '#000000';
    this.brushSize = 3;
    this.tool = 'brush';
    
    this.setupCanvas();
    this.setupEventListeners();
  }
  
  setupCanvas() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }
  
  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  setupEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseleave', () => this.stopDrawing());
    
    this.canvas.addEventListener('touchstart', (e) => this.startDrawing(this.getTouchPos(e)));
    this.canvas.addEventListener('touchmove', (e) => this.draw(this.getTouchPos(e)));
    this.canvas.addEventListener('touchend', () => this.stopDrawing());
  }
  
  getTouchPos(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    return {
      clientX: touch.clientX,
      clientY: touch.clientY
    };
  }
  
  getCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
  
  startDrawing(e) {
    this.isDrawing = true;
    const { x, y } = this.getCoordinates(e);
    
    this.currentPath = [{ x, y }];
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    
    if (this.onDrawStart) {
      this.onDrawStart({ x, y, color: this.getDrawColor(), brushSize: this.brushSize });
    }
  }
  
  draw(e) {
    if (!this.isDrawing) return;
    
    const { x, y } = this.getCoordinates(e);
    this.currentPath.push({ x, y });
    
    this.ctx.strokeStyle = this.getDrawColor();
    this.ctx.lineWidth = this.brushSize;
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    
    if (this.onDraw) {
      this.onDraw({ x, y, color: this.getDrawColor(), brushSize: this.brushSize });
    }
    
    if (this.onCursorMove) {
      this.onCursorMove({ x, y });
    }
  }
  
  stopDrawing() {
    if (!this.isDrawing) return;
    
    this.isDrawing = false;
    
    if (this.onDrawEnd) {
      this.onDrawEnd({ path: this.currentPath });
    }
    
    this.currentPath = [];
  }
  
  getDrawColor() {
    return this.tool === 'eraser' ? '#ffffff' : this.color;
  }
  
  drawRemotePath(data) {
    this.ctx.strokeStyle = data.color;
    this.ctx.lineWidth = data.brushSize;
    this.ctx.lineTo(data.x, data.y);
    this.ctx.stroke();
  }
  
  startRemotePath(data) {
    this.ctx.beginPath();
    this.ctx.moveTo(data.x, data.y);
    this.ctx.strokeStyle = data.color;
    this.ctx.lineWidth = data.brushSize;
  }
  
  clearCanvas() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  setTool(tool) {
    this.tool = tool;
  }
  
  setColor(color) {
    this.color = color;
  }
  
  setBrushSize(size) {
    this.brushSize = size;
  }
}