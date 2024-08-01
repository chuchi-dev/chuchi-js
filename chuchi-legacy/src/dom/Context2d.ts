const TWO_PI = 2 * Math.PI;

export default class Context2d {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	dpi: number;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.dpi = Math.ceil(window.devicePixelRatio);
	}

	get width(): number {
		return this.canvas.clientWidth;
	}

	set width(width: number) {
		this.canvas.width = width * this.dpi;
		this.canvas.style.width = width + 'px';
	}

	get height(): number {
		return this.canvas.clientHeight;
	}

	set height(height: number) {
		this.canvas.height = height * this.dpi;
		this.canvas.style.height = height + 'px';
	}

	updateSize(width: number = null, height: number = null) {
		this.width = width === null ? this.width : width;
		this.height = height === null ? this.height : height;
		this.ctx.scale(this.dpi, this.dpi);
	}

	get font(): string {
		return this.ctx.font;
	}

	set font(f: string) {
		this.ctx.font = f;
	}

	get fillStyle(): string {
		return this.ctx.fillStyle + '';
	}

	set fillStyle(style: string) {
		this.ctx.fillStyle = style;
	}

	get strokeStyle(): string {
		return this.ctx.strokeStyle + '';
	}

	set strokeStyle(style: string) {
		this.ctx.strokeStyle = style;
	}

	get lineWidth(): number {
		return this.ctx.lineWidth;
	}

	set lineWidth(w: number) {
		this.ctx.lineWidth = w;
	}

	clearRect(x: number, y: number, width: number, height: number) {
		this.ctx.clearRect(x, y, width, height);
	}

	clearAll() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	rect(x: number, y: number, width: number, height: number) {
		this.ctx.rect(x, y, width, height);
	}

	circle(x: number, y: number, radius: number) {
		this.ctx.beginPath();
		this.ctx.arc(x, y, radius, 0, TWO_PI);
	}

	// todo maybe we should create a new struct
	// which will have a moveTo lineTo Arc Close
	beginPath() {
		this.ctx.beginPath();
	}

	closePath() {
		this.ctx.closePath();
	}

	moveTo(x: number, y: number) {
		this.ctx.moveTo(x, y);
	}

	lineTo(x: number, y: number) {
		this.ctx.lineTo(x, y);
	}

	// arc(x, y, radius, startAngle, endAngle) {
	// 	this.ctx.arc(x, y, radius, startAngle, endAngle);
	// }

	fill() {
		this.ctx.fill();
	}

	stroke() {
		this.ctx.stroke();
	}

	fillRect(x: number, y: number, width: number, height: number) {
		this.ctx.fillRect(x, y, width, height);
	}

	strokeRect(x: number, y: number, width: number, height: number) {
		this.ctx.strokeRect(x, y, width, height);
	}

	fillCircle(x: number, y: number, radius: number) {
		this.circle(x, y, radius);
		this.fill();
	}

	strokeCircle(x: number, y: number, radius: number) {
		this.circle(x, y, radius);
		this.stroke();
	}

	strokeLine(sX: number, sY: number, eX: number, eY: number) {
		this.ctx.beginPath();
		this.ctx.moveTo(sX, sY);
		this.ctx.lineTo(eX, eY);
		this.ctx.stroke();
		this.ctx.closePath();
	}

	fillText(text: string, x: number, y: number) {
		this.ctx.fillText(text, x, y);
	}

	strokeText(text: string, x: number, y: number) {
		this.ctx.strokeText(text, x, y);
	}

	// See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
	drawImage(...args: any) {
		// @ts-ignore
		this.ctx.drawImage(...args);
	}
}
