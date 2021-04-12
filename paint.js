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
	const x = e.clientX;
	const y = e.clientY;

	let top = pointsData.pop();
	let innerPoints = top.innerPoints;
	redrawPoints();

	const startX = innerPoints[0].xPos;
	const startY = innerPoints[0].yPos;

	const xRadius = Math.abs(x - startX) / 2;
	const yRadius = Math.abs(y - startY) / 2;
	const cX = (x - startX) / 2 + startX;
	const cY = (y - startY) / 2 + startY;

	ctx.lineWidth = 5;
	ctx.lineCap = 'round';

	ctx.beginPath();
	ctx.ellipse(cX, cY, xRadius, yRadius, 0, 0, 2 * Math.PI);
	ctx.stroke();

	innerPoints.pop();
	//save the starting coordinate in the 0th index
	innerPoints.push({
		xPos: startX,
		yPos: startY,
		cX,
		cY,
		xRadius,
		yRadius,
	});
	//newInnerPoints = getEllipsePoints(newInnerPoints, cX, cY, xRadius, yRadius);
	top = {
		...top,
		innerPoints,
	};

	pointsData.push(top);
};

/* const getEllipsePoints = (arr, cX, cY, rX, rY) => {
	for (var theta = 0; theta < 2 * Math.PI; theta += 0.01) {
		var xPos = cX + rX * Math.cos(theta);
		var yPos = cY - rY * Math.sin(theta);
		arr.push({
			xPos,
			yPos,
		});
	}

	return arr;
};
*/

const handleDrawingRect = (e) => {
	const x = e.clientX;
	const y = e.clientY;

	let top = pointsData.pop();
	redrawPoints();

	const startX = top.innerPoints[0].xPos;
	const startY = top.innerPoints[0].yPos;

	const width = x - startX;
	const height = y - startY;

	ctx.lineWidth = 5;
	ctx.lineCap = 'round';

	ctx.beginPath();
	ctx.rect(startX, startY, width, height);
	ctx.stroke();

	// let innerPoints = top.innerPoints;
	let newInnerPoints = getRectanglePoints(startX, startY, width, height);
	top = {
		...top,
		innerPoints: newInnerPoints,
	};

	pointsData.push(top);
};

const getRectanglePoints = (startX, startY, width, height) => {
	//insert points from top left -> top right -> bottom right -> bottom left -> top left
	let innerPoints = [];
	innerPoints.push({
		xPos: startX,
		yPos: startY,
	});
	innerPoints.push({
		xPos: startX + width,
		yPos: startY,
	});
	innerPoints.push({
		xPos: startX + width,
		yPos: startY + height,
	});
	innerPoints.push({
		xPos: startX,
		yPos: startY + height,
	});
	innerPoints.push({
		xPos: startX,
		yPos: startY,
	});

	return innerPoints;
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
	console.log('MOUSE DOWN');

	switch (currentDrawingState) {
		case isDrawingCircle:
			pointsData.push({
				innerPoints: [
					{
						xPos: e.clientX,
						yPos: e.clientY,
					},
				],
				type: 'ellipse',
				color: selectedColor,
			});
			break;
		case isDrawingRect:
			// startingX = e.clientX;
			// startingY = e.clientY;
			pointsData.push({
				innerPoints: [
					{
						xPos: e.clientX,
						yPos: e.clientY,
					},
				],
				type: 'rectangle',
				color: selectedColor,
			});
			break;
		case isFreeDrawing:
			pointsData.push({
				innerPoints: [
					{
						xPos: e.clientX,
						yPos: e.clientY,
					},
				],
				type: 'free-draw',
				color: selectedColor,
			});
		default:
			break;
	}
});

canvas.addEventListener('mouseup', (e) => {
	isPainting = false;

	//console.log(pointsData);

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

		var j = point.type === 'ellipse' ? 1 : 0;
		
		if (point.type === 'ellipse') {
			const {cX, cY, xRadius, yRadius} = innerPoints[0];
			ctx.beginPath();
			ctx.ellipse(cX, cY, xRadius, yRadius, 0, 0, 2 * Math.PI);
			ctx.stroke();
			continue;
		}

		for (j; j < innerPoints.length - 1; j++) {
			let currPoint = innerPoints[j];
			let nextPoint = innerPoints[j + 1];

			ctx.beginPath();
			ctx.moveTo(currPoint.xPos, currPoint.yPos);
			ctx.lineTo(nextPoint.xPos, nextPoint.yPos);
			ctx.stroke();
		}
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
