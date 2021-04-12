var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

const colors = {
	default: '#000',
	background: '#fff',
	red: '#fc0303',
	green: '#00ff4c',
	blue: '#008cff',
};

let isPainting = false;

const drawingStates = {
	isFreeDrawing: 'isFreeDrawing',
	isDrawingCircle: 'isDrawingCircle',
	isDrawingRect: 'isDrawingRect',
};

let currentDrawingState = drawingStates.isFreeDrawing;
let selectedColor = colors.default;
let eraserColor = colors.background;
let startingX,
	startingY,
	endingX,
	endingY,
	previousX = 0,
	previousY = 0,
	currentX = 0,
	currentY = 0;
let offsetX = canvas.offsetLeft;
let offsetY = canvas.offsetHeight;

var pointsData = [];

document.querySelectorAll('.color-selector').forEach((colorSelector) => {
	console.log('in query selcetor');
	colorSelector.addEventListener('click', () => {
		switch (colorSelector.id) {
			case 'black-brush':
				selectedColor = colors.default;
				console.log('selecing black');
				break;
			case 'red-brush':
				selectedColor = colors.red;
				break;
			case 'green-brush':
				selectedColor = colors.green;
				break;
			case 'blue-brush':
				selectedColor = colors.blue;
				break;
			default:
				break;
		}
	});
});

document.querySelectorAll('.utility-button').forEach((utilityButton) => {
	utilityButton.addEventListener('click', () => {
		switch (utilityButton.id) {
			case 'eraser':
				selectedColor = colors.background;
				break;
			case 'undo':
				handleUndo();
				break;
			case 'circle':
				currentDrawingState = drawingStates.isDrawingCircle;
				break;
			case 'rect':
				currentDrawingState = drawingStates.isDrawingRect;
				break;
			case 'free-draw':
				currentDrawingState = drawingStates.isFreeDrawing;
				selectedColor = colors.default;
				break;
			default:
				break;
		}
	});
});

const handleFreeDraw = (e) => {
	const x = e.clientX;
	const y = e.clientY;

	ctx.lineTo(x, y);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(x, y);

	// if (previousX !== currentX && previousY !== currentY) {

	// }

	// ctx.beginPath();
	// ctx.moveTo(previousX, previousY);
	// ctx.lineTo(x, y);
	// ctx.stroke();

	let top = pointsData.pop();
	let innerPoints = top.innerPoints;
	innerPoints.push({
		xPos: x,
		yPos: y,
	});
	top = {
		...top,
		innerPoints,
	};

	pointsData.push(top);
};

const handleDrawingCircle = (e) => {
	console.log('in drawing circle');
	const x = e.clientX;
	const y = e.clientY;

	const xRadius = Math.abs(x - startingX) / 2;
	const yRadius = Math.abs(y - startingY) / 2;
	const xCenter = (x - startingX) / 2 + startingX;
	const yCenter = (y - startingY) / 2 + startingY;

	ctx.lineWidth = 5;
	ctx.lineCap = 'round';

	ctx.beginPath();
	ctx.ellipse(xCenter, yCenter, xRadius, yRadius, 0, 0, 2 * Math.PI);
	ctx.stroke();
};

const handleDrawingRect = (e) => {
	console.log('in drawing rect');
	const x = e.clientX;
	const y = e.clientY;

	const width = x - startingX;
	const height = y - startingY;

	ctx.lineWidth = 5;
	ctx.lineCap = 'round';

	ctx.beginPath();
	ctx.rect(startingX, startingY, width, height);
	ctx.stroke();
};

canvas.addEventListener('mousemove', (e) => {
	if (!isPainting) return;

	const {isFreeDrawing, isDrawingCircle, isDrawingRect} = drawingStates;

	ctx.lineWidth = 5;
	ctx.lineCap = 'round';

	ctx.strokeStyle = selectedColor;

	switch (currentDrawingState) {
		case isFreeDrawing:
			handleFreeDraw(e);
			break;
		case isDrawingCircle:
			handleDrawingCircle(e);
			break;
		case isDrawingRect:
			handleDrawingRect(e);
			break;
		default:
			break;
	}
});

canvas.addEventListener('mousedown', (e) => {
	isPainting = true;

	const {isFreeDrawing, isDrawingCircle, isDrawingRect} = drawingStates;

	ctx.beginPath();
	ctx.moveTo(e.clientX, e.clientY);

	switch (currentDrawingState) {
		case isDrawingCircle:
			startingX = e.clientX;
			startingY = e.clientY;
			break;
		case isDrawingRect:
			startingX = e.clientX;
			startingY = e.clientY;
			break;
		case isFreeDrawing:
			pointsData.push({
				innerPoints: [{
					xPos: e.clientX,
					yPos: e.clientY
				}],
				type: 'free-draw',
				color: selectedColor,
			});
		default:
			break;
	}
});

canvas.addEventListener('mouseup', (e) => {
	isPainting = false;

	console.log(pointsData);

	const {isFreeDrawing, isDrawingCircle, isDrawingRect} = drawingStates;

	switch (currentDrawingState) {
		case isDrawingCircle:
			endingX = e.clientX;
			endingY = e.clientY;
			break;
		case isDrawingRect:
			endingX = e.clientX;
			endingY = e.clientY;
			break;
		case isFreeDrawing:
			break;
		default:
			break;
	}
});

const handleUndo = () => {
	console.log('before: ', pointsData);
	pointsData.pop();

	redrawPoints();

	console.log('after: ', pointsData);
};

const redrawPoints = () => {
	ctx.clearRect(150, 0, canvas.width, canvas.height);

	if (pointsData.length === 0) {
		return;
	}

	for (var i = 0; i < pointsData.length; i++) {
		let point = pointsData[i];
		let innerPoints = pointsData[i].innerPoints;
		ctx.strokeStyle = point.color;

		for (var j = 0; j < innerPoints.length - 1; j++) {
			let currPoint = innerPoints[j];
			let nextPoint = innerPoints[j + 1];

			ctx.beginPath();
			ctx.moveTo(currPoint.xPos, currPoint.yPos);
			ctx.lineTo(nextPoint.xPos, nextPoint.yPos);
			ctx.stroke();

			// ctx.lineTo(currPoint.xPos, currPoint.yPos);
			// ctx.stroke();
			// ctx.beginPath();
			// ctx.moveTo(innerPoints[0].startX, innerPoints[0].startY);
		}

		//resets the path to avoid drawing the last stroke upon calling ctx.stroke() again
		//ctx.beginPath();
	}
};

/*
	ctx.lineTo(x, y);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(x, y);
*/

const run = () => {
	console.log('in run');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	
};

window.addEventListener('load', () => {
	run();
});
