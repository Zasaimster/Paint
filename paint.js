const sizeSlider = document.getElementById('size-slider')
const hexInput = document.getElementById('hex-code-input')

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

const colors = {
	default: '#000000',
	background: '#ffffff',
	red: '#ff5959',
	green: '#1cd446',
	blue: '#0080c4',
};

let isPainting = false;

const drawingStates = {
	isFreeDrawing: 'isFreeDrawing',
	isDrawingCircle: 'isDrawingCircle',
	isDrawingRect: 'isDrawingRect',
	isErasing: 'isErasing'
};

let currentDrawingState = drawingStates.isFreeDrawing;
let selectedColor = colors.default;
let lastSelectedColor = colors.default;
let eraserColor = colors.background;
let penThickness = 10;

let startingX,
	startingY,
	endingX,
	endingY,
	previousX = 0,
	previousY = 0,
	currentX = 0,
	currentY = 0;
let offsetX = canvas.offsetLeft;
let offsetY = 0;

var pointsData = [];

const getNumberForHexCharacter = (val) => {
	console.log(val)
	console.log(!isNaN(parseInt(val)))
	let x = parseInt(val)
	if(x >= 0 && x <= 9) {
		return x;
	}
	switch (val) {
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
			return -1;
	}
}

const convertColorToRGB = () => {
	let rgb = [];
	for(let i = 0, colorIndex = 1; i < 3; i++, colorIndex += 2) {
		rgb[i] = 16 * getNumberForHexCharacter(color.charAt(colorIndex)) + getNumberForHexCharacter(color.charAt(colorIndex + 1));
	}

	return rgb[0].toString() + " " + rgb[1].toString() + " " + rgb[2].toString();
}

const setRgbHexValues = (color) => {
	document.getElementById('rgb-color-value').innerHTML = 'RGB: ';
	document.getElementById('rgb-color-value').insertAdjacentHTML('beforeend', `<b>${convertColorToRGB(selectedColor)}</b>`)

	document.getElementById('hex-color-value').innerHTML =  'Hex: ';
	document.getElementById('hex-color-value').insertAdjacentHTML('beforeend', `<b>${selectedColor}</b>`)
}

document.querySelectorAll('.color-selector').forEach((colorSelector) => {
	console.log('in query selcetor');
	colorSelector.addEventListener('click', () => {
		switch (colorSelector.id) {
			case 'black-brush':
				selectedColor = colors.default;
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
		if(currentDrawingState === drawingStates.isErasing){
			currentDrawingState = drawingStates.isFreeDrawing
		}
		setRgbHexValues()
	});
});

const setButtonColor = (type) => {
	if(type === 'undo') {
		return;
	}
	let allInputs = document.getElementsByClassName('utility-button');
	for(let input of allInputs){
		input.setAttribute('style', 'border: 2px solid #2b2b2b')
		console.log(input)
	}
	document.getElementById(type).setAttribute('style', 'border: 2px solid #007ee0');
}

document.querySelectorAll('.utility-button').forEach((utilityButton) => {
	utilityButton.addEventListener('click', () => {
		switch (utilityButton.id) {
			case 'eraser':
				lastSelectedColor = selectedColor;
				selectedColor = colors.background;
				currentDrawingState = drawingStates.isErasing;
				setButtonColor('eraser');
				break;
			case 'undo':
				handleUndo();
				setButtonColor('undo');
				break;
			case 'circle':
				if(currentDrawingState === drawingStates.isErasing) {
					selectedColor = lastSelectedColor;
				}
				currentDrawingState = drawingStates.isDrawingCircle;
				setButtonColor('circle');
				break;
			case 'rect':
				if(currentDrawingState === drawingStates.isErasing) {
					selectedColor = lastSelectedColor;
				}
				currentDrawingState = drawingStates.isDrawingRect;
				setButtonColor('rect');
				break;
			case 'free-draw':
				selectedColor = currentDrawingState === drawingStates.isErasing ? lastSelectedColor : selectedColor;
				currentDrawingState = drawingStates.isFreeDrawing;
				setButtonColor('free-draw');
				break;
			default:
				break;
		}
	});
});

sizeSlider.addEventListener('input', () => {
	console.log('in input')
	penThickness = parseInt(sizeSlider.value);
	ctx.lineWidth = penThickness;

	document.getElementById('range-text').firstChild.data = "Pen Size: " + penThickness

	let pen = document.querySelector('circle');

	pen.setAttribute('cx', 0)
	pen.setAttribute('cy', 0);
	pen.setAttribute('r', penThickness/2);

	console.log(penThickness)
	document.querySelector('svg').setAttribute('width', penThickness * 5);
	document.querySelector('svg').setAttribute('height', penThickness * 5);
})

hexInput.addEventListener('keypress', (e) => {
	if(e.key == "Enter") {
		let val = hexInput.value;
		if(val.length != 6) {
			alert('Please enter a 6 character long hex value')
			hexInput.value = ""
			return;
		}
		for(let i = 0; i < 6; i++) {
			if(getNumberForHexCharacter(val.charAt(i)) == -1) {
				console.log(getNumberForHexCharacter(val.charAt(i)))
				alert('Please enter a valid hex value that contains only digits 0-9 or letters a-f')
				hexInput.value = ""
				return;
			}
		}

		selectedColor = '#' + hexInput.value;
		setRgbHexValues()
		hexInput.value = ""
	}
})



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

	ctx.lineWidth = penThickness;
	ctx.lineCap = 'round';

	ctx.strokeStyle = selectedColor;
	
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

	ctx.lineWidth = penThickness;
	ctx.lineCap = 'round';

	ctx.strokeStyle = selectedColor;

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
	let cursor = document.querySelector('.custom-cursor #pen-cursor');
	let circle = cursor.children[0].children[0]

	if(e.pageX > offsetX + penThickness/2){
		cursor.setAttribute('style', 'visibility: visible');

		cursor.setAttribute('style', `top: ${e.pageY - penThickness}px;left:${e.pageX - penThickness}px`);
		let strokeColor = currentDrawingState === drawingStates.isErasing ? '#ff66e5' : 'black'
		circle.setAttribute('stroke', strokeColor)

		canvasMouseMove(e);

	} else {
		cursor.setAttribute('style', 'visibility: hidden')
	}
})

document.addEventListener('mousedown', (e) => {
	if(e.pageX > offsetX + penThickness/2) {
		e.preventDefault();
		canvasMouseDown(e);
	}
})

document.addEventListener('mouseup', (e) => {
	if (e.pageX > offsetX + penThickness / 2) {
		e.preventDefault();
		canvasMouseUp(e);
	}
});

const canvasMouseMove = e => {
	if (!isPainting) return;

	const {isFreeDrawing, isDrawingCircle, isDrawingRect, isErasing} =
		drawingStates;


	switch (currentDrawingState) {
		case isErasing:
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
}

const canvasMouseDown = e => {
	isPainting = true;

	const {isFreeDrawing, isDrawingCircle, isDrawingRect, isErasing} =
		drawingStates;


	ctx.lineWidth = penThickness;
	ctx.lineCap = 'round';

	ctx.strokeStyle = selectedColor;

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
				width: penThickness

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
				width: penThickness,
			});
			break;
		case isErasing:
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
				width: penThickness,
			});
		default:
			break;
	}
}

const canvasMouseUp = e => {
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
}

const handleUndo = () => {
	//console.log('before: ', pointsData);
	pointsData.pop();

	redrawPoints();

	//console.log('after: ', pointsData);
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
		ctx.lineWidth = point.width;

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
