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

// Define tank, base, and tree arrays
let tanks = [];
let tankGhosts = [];
let bases = [];
let trees = [];

// Game timer
let timer = 0;
const timer_max = 250;
let tag_timer = timer_max;

const move_res_diag = 1.1; // Movement resolution in diagonal direction
const move_res = 1.6; // Movement resolution in horizontal/vertical direction
const msec_rate = 20; // Game refresh rate, in milliseconds

let do_check_move = false; // Track if we want to move an object
let valid_key = false; // Track if a valid game key is pressed
let play_status = false; // Track game mode, pause or play

class Sprite {
	constructor(props) {
		this.id = props.id;
		this.className = props.className;
		this.x = props.x;
		this.y = props.y;
		this.w = props.w;
		this.h = props.h;
		this.colX = props.colX; // Collision box x offset
		this.colY = props.colY; // Collision box y offset
		this.colW = props.colW; // Collision box width
		this.colH = props.colH; // Collision box height
		this.speed = props.speed;
		this.angle = props.angle;
		this.tagged = props.false;
		this.tagable = props.tagable;
	}

	update = function (updates) {
		this.x = updates.x;
		this.y = updates.y;
		this.speed = updates.speed;
		this.angle = updates.angle;
		this.w = updates.w;
		this.h = updates.h;
		this.tagged = updates.tagged;
	};

	draw = function (parent) {
		if (parent) {
			const spriteElement = document.createElement("div");
			spriteElement.id = this.id;
			spriteElement.style.left = this.x + "px";
			spriteElement.style.top = this.y + "px";
			spriteElement.className = this.className;
			parent.appendChild(spriteElement);
		}
	};
}

function buildAssets() {
	// clear the arrays
	tanks = [];
	tankGhosts = [];
	bases = [];
	trees = [];

	// build the tanks and bases
	for (let i = 0; i < numTanks; i++) {
		let baseX = 0;
		let baseY = 0;

		let baseCollision = true;
		let attempts = 0;

		// check for collisiions between bases and only set baseX and baseY if there is no collision
		while (baseCollision) {
			attempts++;
			baseX = Math.floor(Math.random() * (mapWidth - baseWidth)); // subtract the base width to ensure it doesn't go outside the map
			baseY = Math.floor(Math.random() * (mapHeight - baseHeight)); // subtract the base height to ensure it doesn't go outside the map
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
		base.draw(document.getElementById("canvas_2"));
		bases.push(base);

		// Move the tag_timer to the tank base
		$(`#tag_timer_${i}`).css("top", baseY + 46);
		$(`#tag_timer_${i}`).css("left", baseX + baseWidth / 2 - 30);

		// Create the tank
		const tank = new Sprite({
			id: `tank_${i}`,
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
		//tank.draw(document.getElementById("canvas_2"));
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
			tagged: false,
			tagable: false,
		});
		tree.draw(document.getElementById("canvas_0"));
		tree.draw(document.getElementById("canvas_1"));
		//tree.draw(document.getElementById("canvas_2"));
		trees.push(tree);
	}
}
// Base walls
//var base_1_wall_1 = new Tank('50',365,0,0,0,35,275,true);
//var base_1_wall_2 = new Tank('51',0,365,0,0,275,35,true);

// Initialize the game
function init() {
	buildAssets();

	// Initialize tank stats
	set_stats(tanks[0]);
	set_stats(tanks[1]);

	$(".canvas").css("width", mapWidth - mapBorder * 2);
	$(".canvas").css("height", mapHeight - mapBorder * 2);

	$(".tank, .tank_ghost").css("width", tankWidth);
	$(".tank, .tank_ghost").css("height", tankHeight);

	// Set the ghost border width css
	$(".tank_ghost").css("border-width", ghostWidth);

	// Set the canvas border width css
	$(".canvas").css("border-width", mapBorder);

	var rand = Math.floor(Math.random() * 2);
	$(`.tag_timer`).hide();
	$(`#tag_timer_${rand}`).fadeIn(500);
	set_tagged("tank_" + rand);

	document.onkeydown = keyListener;
	play_status = false;
	set_scroll(tanks[0].x, tanks[0].y, tanks[0].id);
	set_scroll(tanks[1].x, tanks[1].y, tanks[1].id);

	if (window.innerHeight === screen.height) {
		console.log("Browser is in full-screen mode");
	} else {
		console.log("Browser is not in full-screen mode");
	}
}

// Set the tagged tank
function set_tagged(tank_id) {
	//console.log("set_tagged(" + tank_id + ")");

	$(".tank").removeClass("tagged");

	if (tanks[0].id == tank_id) {
		tanks[0].tagged = true;
		tanks[1].tagged = false;
		$(".tank_0").addClass("tagged");
		$("#tag_timer_0").fadeIn(500);
	} else if (tanks[1].id == tank_id) {
		tanks[0].tagged = false;
		tanks[1].tagged = true;
		$(".tank_1").addClass("tagged");
		$("#tag_timer_1").fadeIn(500);
	}

	if (play_status) {
		send_to_base(tank_id);
	}
	tag_timer = timer_max;
}

function send_to_base(tank_id) {
	console.log("send_to_base(" + tank_id + ")");
	if (tanks[0].id == tank_id) {
		tanks[0].x = bases[0].x + baseWidth / 2 - tankWidth / 2;
		tanks[0].y = bases[0].y + baseHeight / 2 - tankHeight / 2;
		tanks[0].colX = bases[0].x + baseWidth / 2 - tankWidth / 2;
		tanks[0].colY = bases[0].y + baseHeight / 2 - tankHeight / 2;
		tanks[0].speed = 0;

		// Set the container_tank_1 to 0 opacity
		$("#tank_0").css("opacity", 0);
		$("#container_tank_0").css("opacity", 0);

		move_tank(tanks[0]);

		$("#tank_0").animate({ opacity: 1 }, 4000);
		$("#container_tank_0").animate({ opacity: 1 }, 2000);
	} else if (tanks[1].id == tank_id) {
		tanks[1].x = bases[1].x + baseWidth / 2 - tankWidth / 2;
		tanks[1].y = bases[1].y + baseHeight / 2 - tankHeight / 2;
		tanks[1].colX = bases[1].x + baseWidth / 2 - tankWidth / 2;
		tanks[1].colY = bases[1].y + baseHeight / 2 - tankHeight / 2;
		tanks[1].speed = 0;

		$("#tank_1").css("opacity", 0);
		$("#container_tank_1").css("opacity", 0);

		move_tank(tanks[1]);

		$("#tank_1").animate({ opacity: 1 }, 4000);
		$("#container_tank_1").animate({ opacity: 1 }, 2000);
	}
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
				tag_timer <= 0
			) {
				console.log(
					"tank collision detected: " + array[i].id + " and " + obj.id
				);
				set_tagged(array[i].id);
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

// Move an object
function move_tank(tank_obj) {
	// Move the tank object
	$("." + tank_obj.id).animate(
		{
			left: "" + tank_obj.x + "px",
			top: "" + tank_obj.y + "px",
		},
		1
	);
	// Move the corresponding tankGhost object
	$("." + tank_obj.id + "_ghost").animate(
		{
			left: "" + tank_obj.x - ghostWidth / 2 + "px",
			top: "" + tank_obj.y - ghostWidth / 2 + "px",
		},
		1
	);

	set_scroll(tank_obj.x, tank_obj.y, tank_obj.id);
}

// Scroll the map
function set_scroll(pos_left, pos_top, view_id) {
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

// See if an object needs to move
function check_move(tank_obj) {
	// If tag_timer is greater than zero and the tank is tagged, return
	if (tag_timer > 0 && tank_obj.tagged) return;

	var curr_x = tank_obj.x;
	var curr_y = tank_obj.y;

	if (tank_obj.speed != 0) {
		// Move the tank
		if (tank_obj.speed == 1) {
			// forward
			if (tank_obj.angle == 0) {
				// North
				tank_obj.y -= move_res * 2;
			} else if (tank_obj.angle == 45) {
				// Northeast
				tank_obj.y -= move_res_diag * 2;
				tank_obj.x += move_res_diag * 2;
			} else if (tank_obj.angle == 90) {
				// East
				tank_obj.x += move_res * 2;
			} else if (tank_obj.angle == 135) {
				// Southeast
				tank_obj.x += move_res_diag * 2;
				tank_obj.y += move_res_diag * 2;
			} else if (tank_obj.angle == 180) {
				// South
				tank_obj.y += move_res * 2;
			} else if (tank_obj.angle == 225) {
				// Southwest
				tank_obj.x -= move_res_diag * 2;
				tank_obj.y += move_res_diag * 2;
			} else if (tank_obj.angle == 270) {
				// West
				tank_obj.x -= move_res * 2;
			} else if (tank_obj.angle == 315) {
				// Northwest
				tank_obj.x -= move_res_diag * 2;
				tank_obj.y -= move_res_diag * 2;
			}
		} else if (tank_obj.speed == -1) {
			// backward
			if (tank_obj.angle == 0) {
				// South
				tank_obj.y += move_res;
			} else if (tank_obj.angle == 45) {
				// Southwest
				tank_obj.y += move_res_diag;
				tank_obj.x -= move_res_diag;
			} else if (tank_obj.angle == 90) {
				// West
				tank_obj.x -= move_res;
			} else if (tank_obj.angle == 135) {
				// Northwest
				tank_obj.x -= move_res_diag;
				tank_obj.y -= move_res_diag;
			} else if (tank_obj.angle == 180) {
				// North
				tank_obj.y -= move_res;
			} else if (tank_obj.angle == 225) {
				// Northeast
				tank_obj.x += move_res_diag;
				tank_obj.y -= move_res_diag;
			} else if (tank_obj.angle == 270) {
				// East
				tank_obj.x += move_res;
			} else if (tank_obj.angle == 315) {
				// Southeast
				tank_obj.x += move_res_diag;
				tank_obj.y += move_res_diag;
			}
		}

		// Check for canvas boundary collision
		if (tank_obj.x < 0) {
			tank_obj.x = 0;
		} else if (tank_obj.x > mapWidth - tankWidth - mapBorder * 2) {
			tank_obj.x = mapWidth - tankWidth - mapBorder * 2;
		}
		if (tank_obj.y < 0) {
			tank_obj.y = 0;
		} else if (tank_obj.y > mapHeight - tankHeight - mapBorder * 2) {
			tank_obj.y = mapHeight - tankHeight - mapBorder * 2;
		}

		// Set tank collision x and y
		tank_obj.colX = tank_obj.x;
		tank_obj.colY = tank_obj.y;

		// Check object against all others for collisions
		if (
			checkArrayCollision(trees, tank_obj) ||
			checkArrayCollision(tanks, tank_obj)
		) {
			tank_obj.x = curr_x;
			tank_obj.y = curr_y;
		} else {
			move_tank(tank_obj);
			set_stats(tank_obj);
		}
	}
}

// Set the debugging stats
function set_stats(tank_obj) {
	// console.log(
	// 	`set_stats: ${tank_obj.id} ${tank_obj.x} ${tank_obj.y} ${tank_obj.angle}`
	// );

	$(`#${tank_obj.id}_x_pos`).html(`${Math.floor(tank_obj.x)}`);
	$(`#${tank_obj.id}_y_pos`).html(`${Math.floor(tank_obj.y)}`);
	$(`#${tank_obj.id}_angle`).html(`${tank_obj.angle}`);
}

function keyListener(e) {
	const validKeys = {
		73: () => {
			var current_height = $("#instructions").height();
			current_height === 200
				? $("#instructions").animate({ height: "20px" }, 500)
				: $("#instructions").animate({ height: "200px" }, 500);
		},
		32: () => {
			play_status ? stop_game() : start_game();
			$(".paused").toggle();
		},
		38: () => {
			//console.log("forward 0");
			tanks[0].speed++;
			tanks[0].speed = Math.min(1, tanks[0].speed);
		},
		40: () => {
			//console.log("back 0");
			tanks[0].speed--;
			tanks[0].speed = Math.max(-1, tanks[0].speed);
		},
		39: () => {
			//console.log("turn right 0");
			tanks[0].angle = (tanks[0].angle + 45) % 360;
			$(".tank_0, .tank_0_ghost").css(
				"transform",
				`rotate(${tanks[0].angle}deg)`
			);
			set_stats(tanks[0]);
		},
		37: () => {
			//console.log("turn left 0");
			tanks[0].angle = (tanks[0].angle - 45 + 360) % 360;
			$(".tank_0, .tank_0_ghost").css(
				"transform",
				`rotate(${tanks[0].angle}deg)`
			);
			set_stats(tanks[0]);
		},
		87: () => {
			//console.log("forward 1");
			tanks[1].speed++;
			tanks[1].speed = Math.min(1, tanks[1].speed);
		},
		83: () => {
			//console.log("back 1");
			tanks[1].speed--;
			tanks[1].speed = Math.max(-1, tanks[1].speed);
		},
		68: () => {
			//console.log("turn right 1");
			tanks[1].angle = (tanks[1].angle + 45) % 360;
			$(".tank_1, .tank_1_ghost").css(
				"transform",
				`rotate(${tanks[1].angle}deg)`
			);
			set_stats(tanks[1]);
		},
		65: () => {
			//console.log("turn left 1");
			tanks[1].angle = (tanks[1].angle - 45 + 360) % 360;
			$(".tank_1, .tank_1_ghost").css(
				"transform",
				`rotate(${tanks[1].angle}deg)`
			);
			set_stats(tanks[1]);
		},
		71: () => {
			//console.log("toggle ghosts");
			$(".tank_0_ghost, .tank_1_ghost").toggle();
		},
	};

	const func = validKeys[e.keyCode];
	if (func) {
		func();
		valid_key = true;
	}
}

// Loop the game
function play_game() {
	check_move(tanks[0], tanks[1]);
	check_move(tanks[1], tanks[0]);

	$("#timer").html(timer);
	$("#tag_timer").html(tag_timer);
	$(".global_tag_timer").html(Math.ceil(tag_timer / 50));

	if (tag_timer > 0) {
		tag_timer--;
	} else if ($(".tag_timer").is(":visible")) {
		$(".tag_timer").fadeOut(1000);
	}

	if (play_status) {
		// Loop again
		timer = setTimeout("play_game()", msec_rate);
	}
}

// Pause the game
function stop_game() {
	play_status = false;
}

// Start the game
function start_game() {
	play_status = true;
	play_game();
}

window.addEventListener("resize", function (event) {
	// for each tank in tanks[], run the set_scroll(tank_obj.x, tank_obj.y, tank_obj.id);
	for (var i = 0; i < tanks.length; i++) {
		console.log("resize tank " + i + "");
		set_scroll(tanks[i].x, tanks[i].y, tanks[i].id);
	}
	if (window.innerHeight === screen.height) {
		console.log("Browser is in full-screen mode");
	} else {
		console.log("Browser is not in full-screen mode");
	}
});
