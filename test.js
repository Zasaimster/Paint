function find(arr) {
    let stringMap = new Map();
    var highestOccurrences = 0;

    for (var i = 0; i < arr.length; i++) {
        let curr = arr[i];

        //add string to a map. If it already exists, increment its value by 1. Otherwise, initalize it to 1.
        if (stringMap.has(curr)) {
            stringMap.set(curr, stringMap.get(curr) + 1);
        } else {
            stringMap.set(curr, 1);
        }

        //if the current string has occurred the most amount of times, set its occurrences to 'highestOccurrences'
    }

    var ansArr = [];

    //for each string that occurred "highestOccurences" amount of times, add that to the answer array
    for (let [key, val] of stringMap) {
        if (val > 1) {
            ansArr.push(key);
        }
    }

    return ansArr;

}

function test() {
    console.log("base")
    var input = [
		'ACEA',
		'Advanced',
		'Continuing',
		'Education',
		'Association',
		'ACEA',
		'Advanced',
	];
    var output = find(input);
    console.log(output)

    console.log("empty case")
    var input = [];
    var output = find(input);
    console.log(output)

    console.log("new")
    var input = ["AB", "BC", "CD", "CD", "BC", "AB", "Advanced", "AB", "AB"];
    var output = find(input);
    console.log(output)

    console.log("nodup")
    var input = ['AB', 'BC', 'CD'];
	var output = find(input);
    console.log(output)
}

test();