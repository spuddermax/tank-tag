// Set the game parameters
const numTanks = 2;
const numTrees = 100;

const mapWidth = 1920;
const mapHeight = 1080;
const mapBorder = 20;
const tankWidth = 50;
const tankHeight = 50;
const baseWidth = 400;
const baseHeight = 400;
const ghostWidth = 3;

const treeWidth = 172;
const treeHeight = 335;
const treeTrunkWidth = 10;
const treeTrunkHeight = 10;
const treeTrunkXOffset = 58;
const treeTrunkYOffset = 176;
const treeTypes = 7;

const baseSeparation = 400;

// Define the audio settings
const engineIdleTimeout = 4000;
const backgroundSounds = new Audio("sound/forest-wind-and-birds.mp3");
backgroundSounds.loop = true;

// Define tank, base, and tree arrays
let tanks = [];
let tankGhosts = [];
let bases = [];
let trees = [];

// timers
const taggedFadeTime = 4000;
const timerMax = 250;
let tagTimer = timerMax;
let timer = 0;

const moveResDiag = 1.1; // Movement resolution in diagonal direction
const moveRes = 1.6; // Movement resolution in horizontal/vertical direction
const msecRate = 20; // Game refresh rate, in milliseconds

let doCheckMove = false; // Track if we want to move an object
let validKey = false; // Track if a valid game key is pressed
let playStatus = false; // Track game mode, pause or play

function buildAssets() {
	// Stop all playing audio asynchronously
	for (let i = 0; i < tanks.length; i++) {
		tanks[i].audio.engineIdle.pause();
		tanks[i].audio.engineIdle.currentTime = 0;
		tanks[i].audio.engineStart.pause();
		tanks[i].audio.engineStart.currentTime = 0;
		tanks[i].audio.engineStop.pause();
		tanks[i].audio.engineStop.currentTime = 0;
	}

	// clear the arrays, and the canvas_0 and canvas_1 elements
	tanks = [];
	tankGhosts = [];
	bases = [];
	trees = [];

	const canvas0 = document.getElementById("canvas_0");
	const canvas1 = document.getElementById("canvas_1");
	canvas0.innerHTML = "";
	canvas1.innerHTML = "";

	const mapPortions = 1 / numTanks;
	const portionWidth = mapWidth * mapPortions;

	// build the tanks and bases
	for (let i = 0; i < numTanks; i++) {
		let baseX = 0;
		let baseY = 0;

		let baseCollision = true;
		let attempts = 0;

		// check for collisiions between bases and only set baseX and baseY
		// if there is no collision
		while (baseCollision) {
			attempts++;
			baseX =
				Math.floor(
					Math.random() * (portionWidth - baseWidth - mapBorder * 2)
				) +
				i * portionWidth; // subtract the base width to ensure it doesn't go outside the map
			baseY = Math.floor(
				Math.random() * (mapHeight - baseHeight - mapBorder * 2)
			); // subtract the base height to ensure it doesn't go outside the map
			baseCollision = checkArrayCollision(bases, {
				colX: baseX,
				colY: baseY,
				colW: baseWidth,
				colH: baseHeight,
			});

			// if we've tried to place the base 50 times, just place it anyway
			if (attempts > 50) {
				break;
			}
		}

		const base = new Sprite({
			id: `base_${i}`,
			className: "base",
			x: baseX,
			y: baseY,
			w: baseWidth,
			h: baseHeight,
			colX: baseX,
			colY: baseY,
			colW: baseWidth,
			colH: baseHeight,
			speed: 0,
			angle: 0,
			tagged: false,
			tagable: false,
		});

		base.draw(document.getElementById("canvas_0"));
		base.draw(document.getElementById("canvas_1"));
		bases.push(base);

		// Move the tag_timer to the tank base
		$(`.tag_timer_${i}`).css("top", baseY + 46);
		$(`.tag_timer_${i}`).css("left", baseX + baseWidth / 2 - 30);

		// Create the tank
		const tank = new Tank({
			id: `tank_${i}`,
			tankId: i,
			className: `tank_${i} tank rotate-135`,
			x: baseX + baseWidth / 2 - tankWidth / 2,
			y: baseY + baseHeight / 2 - tankHeight / 2,
			w: tankWidth,
			h: tankHeight,
			colX: baseX + baseWidth / 2 - tankWidth / 2,
			colY: baseY + baseHeight / 2 - tankHeight / 2,
			colW: tankWidth,
			colH: tankHeight,
			speed: 0,
			angle: 135,
			tagged: false,
			tagable: true,
		});
		tank.draw(document.getElementById("canvas_0"));
		tank.draw(document.getElementById("canvas_1"));
		tanks.push(tank);

		// Create the tank ghost
		const tankGhost = new Sprite({
			id: `tank_${i}_ghost`,
			className: `tank_${i}_ghost tank_ghost rotate-135`,
			x: baseX + baseWidth / 2 - tankWidth / 2 - ghostWidth / 2,
			y: baseY + baseHeight / 2 - tankHeight / 2 - ghostWidth / 2,
			w: tankWidth + ghostWidth * 2,
			h: tankHeight + ghostWidth * 2,
			colX: 0,
			colY: 0,
			colW: 0,
			colH: 0,
			speed: 0,
			angle: 135,
			tagged: false,
			tagable: false,
		});
		tankGhost.draw(document.getElementById(`canvas_${i}`));
		tankGhosts.push(tankGhost);
		// Change html in the ghost to say "Player i"
		$(`#tank_${i}_ghost`).html(`Player ${i + 1}`);
	}

	// Create the trees.
	for (let i = 0; i < numTrees; i++) {
		let treeX = 0;
		let treeY = 0;

		let baseCollision = true;
		let attempts = 0;

		while (baseCollision) {
			attempts++;
			treeX = Math.floor(Math.random() * (mapWidth + treeWidth)); // subtract the base width to ensure it doesn't go outside the map
			treeY = Math.floor(Math.random() * (mapHeight + treeHeight)); // subtract the base height to ensure it doesn't go outside the map

			baseCollision = checkArrayCollision(bases, {
				colX: treeX - treeWidth + treeTrunkXOffset,
				colY: treeY - treeHeight + treeTrunkYOffset,
				colW: treeTrunkWidth,
				colH: treeTrunkHeight,
			});
			// if we've tried to place the tree 10 times, just place it anyway
			if (attempts > 10) {
				break;
			}
		}

		// Assign the class a number between 1 and 5.
		const treeClass = Math.floor(Math.random() * treeTypes) + 1;

		const tree = new Sprite({
			id: `tree_${i}`,
			className: `tree_${treeClass} tree`,
			x: treeX - treeWidth,
			y: treeY - treeHeight,
			w: treeWidth,
			h: treeHeight,
			colX: treeX - treeWidth + treeTrunkXOffset,
			colY: treeY - treeHeight + treeTrunkYOffset,
			colW: treeTrunkWidth,
			colH: treeTrunkHeight,
			speed: 0,
			angle: 0,
			tagable: false,
		});
		tree.draw(document.getElementById("canvas_0"));
		tree.draw(document.getElementById("canvas_1"));
		trees.push(tree);
	}
}

// Initialize the game
function init() {
	buildAssets();
	stopGame();
	$(".paused").show();
	tagTimer = timerMax;
	$(".global_tag_timer").html(Math.ceil(tagTimer / 50));

	// Initialize tank stats
	tanks[0].setStats();
	tanks[1].setStats();

	$(".canvas").css("width", mapWidth - mapBorder * 2);
	$(".canvas").css("height", mapHeight - mapBorder * 2);

	$(".tank, .tank_ghost").css("width", tankWidth);
	$(".tank, .tank_ghost").css("height", tankHeight);

	// Set the ghost border width css
	$(".tank_ghost").css("border-width", ghostWidth);

	// Set the canvas border width css
	$(".canvas").css("border-width", mapBorder);

	const rand = Math.floor(Math.random() * 2);
	$(`.tag_timer`).hide();
	$(`.tag_timer_${rand}`).fadeIn(500);
	tanks[rand].setTagged();

	document.onkeydown = keyListener;
	playStatus = false;
	setScroll(tanks[0].x, tanks[0].y, tanks[0].id);
	setScroll(tanks[1].x, tanks[1].y, tanks[1].id);

	// if (window.innerHeight === screen.height) {
	// 	console.log("Browser is in full-screen mode");
	// } else {
	// 	console.log("Browser is not in full-screen mode");
	// }
}

// Check for collisions between two objects
function checkArrayCollision(array, obj) {
	let collision = false;
	for (let i = 0; i < array.length; i++) {
		if (array[i].id === obj.id) continue;
		if (checkObjectCollision(array[i], obj)) {
			// console.log(
			// 	"collision detected: " + array[i].id + " and " + obj.id
			// );
			if (
				array[i].className.includes("tank") &&
				obj.className.includes("tank") &&
				obj.tagged &&
				array[i].tagable &&
				tagTimer <= 0
			) {
				// console.log(
				// 	"tank collision detected: " + array[i].id + " and " + obj.id
				// );
				if (!checkArrayCollision(bases, array[i])) {
					array[i].setTagged();
				} else {
					// console.log("base collision detected");
				}
			}
			collision = true;
			break;
		}
	}
	return collision;
}

// Check for collisions between two objects
function checkObjectCollision(obj1, obj2) {
	// check for horizontal overlap
	if (
		obj1.colX < obj2.colX + obj2.colW &&
		obj1.colX + obj1.colW > obj2.colX
	) {
		// check for vertical overlap
		if (
			obj1.colY < obj2.colY + obj2.colH &&
			obj1.colY + obj1.colH > obj2.colY
		) {
			// collision detected
			return true;
		}
	}
	// no collision detected
	return false;
}

// Scroll the map
function setScroll(pos_left, pos_top, view_id) {
	//console.log(`set_scroll: ${pos_left}, ${pos_top}, ${view_id}`);

	// Set pos_left and pos_top to the center of the visible container
	var new_left = pos_left - $("#container_" + view_id).width() / 2;
	var new_top = pos_top - $("#container_" + view_id).height() / 2;

	if (new_left < 0) {
		new_left = 0;
	}
	if (new_top < 0) {
		new_top = 0;
	}

	$("#container_" + view_id)
		.scrollLeft(new_left)
		.scrollTop(new_top);
}

function togglePause() {
	playStatus ? stopGame() : startGame();
	$(".paused").toggle();
}

function keyListener(e) {
	// If playStatus is false and key is not 32, return
	if (
		!playStatus &&
		e.keyCode !== 32 &&
		e.keyCode !== 73 &&
		e.keyCode !== 71 &&
		e.keyCode !== 82
	)
		return;

	const validKeys = {
		73: () => {
			var current_height = $("#instructions").height();
			current_height === 200
				? $("#instructions").animate({ height: "20px" }, 500)
				: $("#instructions").animate({ height: "200px" }, 500);
		},
		32: () => {
			togglePause();
		},
		87: () => {
			if (tagTimer > 0 && tanks[0].tagged) return;
			tanks[0].lastDriveTime = performance.now();
			if (tanks[0].speed !== 0) tanks[0].queueEngineStop();
			tanks[0].speed++;
			tanks[0].speed = Math.min(1, tanks[0].speed);
			tanks[0].queueEngineStart();
		},
		83: () => {
			if (tagTimer > 0 && tanks[0].tagged) return;
			tanks[0].lastDriveTime = performance.now();
			tanks[0].speed--;
			if (tanks[0].speed === 0) tanks[0].queueEngineStop();
			if (tanks[0].speed !== 0) tanks[0].queueEngineStart();
			tanks[0].speed = Math.max(-1, tanks[0].speed);
		},
		68: () => {
			tanks[0].angle = (tanks[0].angle + 45) % 360;
			$(".tank_0, .tank_0_ghost").css(
				"transform",
				`rotate(${tanks[0].angle}deg)`
			);
			tanks[0].setStats();
		},
		65: () => {
			tanks[0].angle = (tanks[0].angle - 45 + 360) % 360;
			$(".tank_0, .tank_0_ghost").css(
				"transform",
				`rotate(${tanks[0].angle}deg)`
			);
			tanks[0].setStats();
		},
		38: () => {
			if (tagTimer > 0 && tanks[1].tagged) return;
			tanks[1].lastDriveTime = performance.now();
			if (tanks[1].speed !== 0) {
				tanks[1].queueEngineStop();
			}
			tanks[1].speed = Math.min(1, tanks[1].speed + 1);
			tanks[1].queueEngineStart();
		},
		40: () => {
			if (tagTimer > 0 && tanks[1].tagged) return;
			tanks[1].speed = Math.max(-1, tanks[1].speed - 1);
			if (tanks[1].speed === 0) {
				tanks[1].queueEngineStop();
			} else {
				tanks[1].queueEngineStart();
			}
		},
		39: () => {
			tanks[1].angle = (tanks[1].angle + 45) % 360;
			$(".tank_1, .tank_1_ghost").css(
				"transform",
				`rotate(${tanks[1].angle}deg)`
			);
			tanks[1].setStats();
		},
		37: () => {
			// console.log("turn left 1");
			tanks[1].angle = (tanks[1].angle - 45 + 360) % 360;
			$(".tank_1, .tank_1_ghost").css(
				"transform",
				`rotate(${tanks[1].angle}deg)`
			);
			tanks[1].setStats();
		},
		71: () => {
			$(".tank_0_ghost, .tank_1_ghost").toggle();
		},
		// When r key is pressed, show an alert to ask if the user wants to restart the game by calling init()
		82: () => {
			if (confirm("Are you sure you want to restart?")) {
				init();
			}
		},
	};
	const func = validKeys[e.keyCode];
	if (func) {
		func();
		validKey = true;
	}
}

// Loop the game
function playGame() {
	tanks[0].checkMove();
	tanks[1].checkMove();

	$("#timer").html(timer);
	$("#tag_timer").html(tagTimer);
	$(".global_tag_timer").html(Math.ceil(tagTimer / 50));

	if (tagTimer > 0) {
		tagTimer--;
	} else if ($(".tag_timer").is(":visible")) {
		$(".tag_timer").fadeOut(1000);
	}

	if (playStatus) {
		// Loop again
		timer = setTimeout("playGame()", msecRate);
	}
}

// Pause the game
function stopGame() {
	playStatus = false;
	backgroundSounds.pause();
	// Pause the engineIdle sound for each tank
	for (var i = 0; i < tanks.length; i++) {
		if (tanks[i].speed !== 0) {
			if (!tanks[i].audio.engineIdle.paused)
				tanks[i].audio.engineIdle.pause();
			else if (!tanks[i].audio.engineStart.paused)
				tanks[i].audio.engineStart.pause();
		}
	}
}

// Start the game
function startGame() {
	playStatus = true;
	backgroundSounds.play();

	for (var i = 0; i < tanks.length; i++) {
		if (tanks[i].speed !== 0) {
			tanks[i].audio.engineIdle.play();
		}
	}

	playGame();
}

window.addEventListener("resize", function (event) {
	// Move the tanks to the new scroll position
	for (var i = 0; i < tanks.length; i++) {
		// console.log("resize tank " + i + "");
		setScroll(tanks[i].x, tanks[i].y, tanks[i].id);
	}
	// if (window.innerHeight === screen.height) {
	// 	// console.log("Browser is in full-screen mode");
	// } else {
	// 	// console.log("Browser is not in full-screen mode");
	// }
});

// togglePause() when the user clicks on the pause button
$("body").click(function () {
	togglePause();
});
