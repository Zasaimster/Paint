var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

const colors = {
	default: '#000000',
	background: '#ffffff',
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
let offsetY = 4;

var pointsData = [];

const getNumberForHexCharacter = (val) => {
	switch (val) {
		case !isNaN(parseInt(val)):
			return parseInt(val);
		case 'a':
			return 10;
		case 'b':
			return 11;
		case 'c':
			return 12;
		case 'd':
			return 13;
		case 'e':
			return 14;
		case 'f':
			return 15;
		default:
			return 0;
	}
}

const convertColorToRGB = (color) => {
	let rgb = [];
	for(let i = 0, colorIndex = 1; i < 3; i++, colorIndex += 2) {
		rgb[i] = 16 * getNumberForHexCharacter(color.charAt(colorIndex)) + getNumberForHexCharacter(color.charAt(colorIndex + 1));
	}
	console.log('Current RGB colors:', rgb[0], rgb[1], rgb[2])


	return rgb[0].toString() + " " + rgb[1].toString() + " " + rgb[2].toString();
}

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
		document.getElementById('rgb-color-value').innerHTML =  'RGB: ' + convertColorToRGB(selectedColor);
		document.getElementById('hex-color-value').innerHTML =  'Hexadecimal: ' + selectedColor;
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
	const x = e.clientX - offsetX;
	const y = e.clientY + offsetY;

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
	const x = e.clientX - offsetX;
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
	const x = e.clientX - offsetX;
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

document.addEventListener('mousemove', (e) => {
	let cursor = document.querySelector('.custom-cursor');
	if(e.pageX < canvas.width && e.pageY < canvas.height){
	cursor.setAttribute('style', `top: ${e.pageY - 4}px;left:${e.pageX - 4}px`);
	}
})


canvas.addEventListener('mousemove', (e) => {
	console.log('in tge canvas one');
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
	ctx.moveTo(e.clientX - offsetX, e.clientY);
	console.log('MOUSE DOWN');

	switch (currentDrawingState) {
		case isDrawingCircle:
			pointsData.push({
				innerPoints: [
					{
						xPos: e.clientX - offsetX,
						yPos: e.clientY,
					},
				],
				type: 'ellipse',
				color: selectedColor,
			});
			break;
		case isDrawingRect:
			pointsData.push({
				innerPoints: [
					{
						xPos: e.clientX - offsetX,
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
						xPos: e.clientX - offsetX,
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
	canvas.width = window.innerWidth - offsetX;
	canvas.height = window.innerHeight;
	canvas.offsetWidth = offsetX;
};

window.addEventListener('load', () => {
	run();
});
