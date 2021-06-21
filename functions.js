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
};

export function convertColorToRGB(color){
	let rgb = [];
	for (let i = 0, colorIndex = 1; i < 3; i++, colorIndex += 2) {
		rgb[i] =
			16 * getNumberForHexCharacter(color.charAt(colorIndex)) +
			getNumberForHexCharacter(color.charAt(colorIndex + 1));
	}
	console.log('Current RGB colors:', rgb[0], rgb[1], rgb[2]);

	return (
		rgb[0].toString() + ' ' + rgb[1].toString() + ' ' + rgb[2].toString()
	);
};
