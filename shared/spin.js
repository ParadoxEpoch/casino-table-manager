import anime from "https://cdn.jsdelivr.net/npm/animejs@3.0.1/+esm";

var currentBallRotation = 0;
var currentWheelRotation = 0;
var currentWheelIndex = 0;
var isRotating = false;
const rouletteWheelNumbers = [
	0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
	16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const getRouletteWheelNumber = (index) => rouletteWheelNumbers[index >= 0 ? index % 37 : 37 - Math.abs(index % 37)];

const getRouletteWheelColor = (index) => {
	const i = index >= 0 ? index % 37 : 37 - Math.abs(index % 37);
	return i == 0 ? "green" : i % 2 == 0 ? "black" : "red";
};

export async function moveToNumber(number) {
	number = parseInt(number);
	const index = rouletteWheelNumbers.indexOf(number);
	if (index === -1) {
		console.error("Number not found on the wheel");
		return;
	}
	const currentNumber = getRouletteWheelNumber(currentWheelIndex);
	const currentPosIndex = rouletteWheelNumbers.indexOf(currentNumber);
	// Calculate the distance to move
	const distance = (index - currentPosIndex) * -1;

	if (Math.abs(distance) === 0) return;

	console.log("Distance to move:", distance);
	await startRotation(distance, 0);
};

export async function startRotation(speed, duration = 5000) {
	return new Promise((resolve, reject) => {
		if (isRotating) return reject("Wheel is already spinning");

		// Speed should already be an integer, but in case this method is manually called with a float, round it
		speed = Math.round(speed);

		console.log("Started spin with speed:", speed);

		isRotating = true;

		const bezier = [0.165, 0.84, 0.44, 1.005];

		const newWheelIndex = currentWheelIndex - speed;
		const result = getRouletteWheelNumber(newWheelIndex);
		const resultColor = getRouletteWheelColor(newWheelIndex);

		(() => {
			const newRotation = currentWheelRotation + (360 / 37) * speed;
			//console.log(getRouletteWheelNumber(currentWheelIndex), "---> ", result);
			var myAnimation = anime({
				targets: [".layer-2", ".layer-4"],
				rotate: function () {
					return newRotation;
				},
				duration: function () {
					return duration;
				},
				loop: 1,
				// easing: "cubicBezier(0.010, 0.990, 0.855, 1.010)",
				easing: `cubicBezier(${bezier.join(",")})`,
				// easing: "cubicBezier(0.000, 1.175, 0.980, 0.990)",
				complete: (...args) => {
					currentWheelRotation = newRotation;
					currentWheelIndex = newWheelIndex;
				},
			});
		})();

		(() => {
			const newRotation = -4 * 360 + currentBallRotation;
			var myAnimation1 = anime({
				targets: ".ball-container",
				translateY: [
					{ value: 0, duration: (duration * 0.4) },
					{ value: 20, duration: (duration * 0.2) },
					{ value: 25, duration: (duration * 0.25) },
					{ value: 70, duration: (duration * 0.2) },
				],
				rotate: [{ value: newRotation, duration: (duration * 0.8) }],
				duration: function () {
					return (duration * 0.8); // anime.random(800, 1400);
				},
				loop: 1,
				easing: `cubicBezier(${bezier.join(",")})`,
				complete: () => {
					currentBallRotation = newRotation;
					resolve({
						number: result,
						color: resultColor,
					});
					isRotating = false;
				},
			});
		})();

	});
}