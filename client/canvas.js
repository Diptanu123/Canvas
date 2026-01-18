class CanvasManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.currentStroke = null;
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
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (imageData.width > 0) {
      this.ctx.putImageData(imageData, 0, 0);
    }
    
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }
  
  setupEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDrawing) {
        this.draw(e);
      }
      if (this.onCursorMove) {
        const coords = this.getCoordinates(e);
        this.onCursorMove(coords);
      }
    });
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseleave', () => this.stopDrawing());
    
    this.canvas.addEventListener('touchstart', (e) => this.startDrawing(this.getTouchPos(e)));
    this.canvas.addEventListener('touchmove', (e) => this.draw(this.getTouchPos(e)));
    this.canvas.addEventListener('touchend', () => this.stopDrawing());
  }
  
  getTouchPos(e) {
    e.preventDefault();
    const touch = e.touches[0];
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
    
    this.currentStroke = {
      points: [{ x, y }],
      color: this.getDrawColor(),
      brushSize: this.brushSize
    };
    
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.strokeStyle = this.currentStroke.color;
    this.ctx.lineWidth = this.currentStroke.brushSize;
  }
  
  draw(e) {
    if (!this.isDrawing) return;
    
    const { x, y } = this.getCoordinates(e);
    this.currentStroke.points.push({ x, y });
    
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }
  
  stopDrawing() {
    if (!this.isDrawing) return;
    
    this.isDrawing = false;
    
    if (this.onStrokeComplete && this.currentStroke) {
      this.onStrokeComplete(this.currentStroke);
    }
    
    this.currentStroke = null;
  }
  
  getDrawColor() {
    return this.tool === 'eraser' ? '#ffffff' : this.color;
  }
  
  drawStroke(stroke) {
    if (!stroke || !stroke.points || stroke.points.length === 0) return;
    
    this.ctx.beginPath();
    this.ctx.strokeStyle = stroke.color;
    this.ctx.lineWidth = stroke.brushSize;
    
    this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    
    for (let i = 1; i < stroke.points.length; i++) {
      this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    
    this.ctx.stroke();
  }
  
  clearCanvas() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  redrawAll(operations) {
    this.clearCanvas();
    operations.forEach(op => {
      if (op.type === 'stroke') {
        this.drawStroke(op);
      }
    });
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