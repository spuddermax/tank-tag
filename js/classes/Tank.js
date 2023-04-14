// Tank class extends the Sprite class
class Tank extends Sprite {
	constructor(props) {
		//console.log("Tank constructor");
		super(props);
		this.tagable = true;
		this.tankId = props.tankId;
		this.lastDriveTime = performance.now();
		this.audio = {
			engineIdle: new Audio("sound/engine_idle.mp3"),
			engineStart: new Audio("sound/engine_start1.mp3"),
			engineStop: new Audio("sound/engine_stop1.mp3"),
		};

		this.audio.engineStart.addEventListener("ended", () => {
			this.audio.engineIdle.loop = true;
			if (playStatus) this.audio.engineIdle.play();
		});
		this.audio.engineIdle.addEventListener("pause", () => {
			console.log("engineIdle paused");
			if (playStatus) this.audio.engineStop.play();
		});
		this.audio.engineIdle.addEventListener("ended", () => {
			console.log("engineIdle ended");
			this.audio.engineStop.play();
		});
	}
	move = function () {
		// Move the tank object
		$("." + this.id).animate(
			{
				left: "" + this.x + "px",
				top: "" + this.y + "px",
			},
			1
		);
		// Move the corresponding tankGhost object
		$("." + this.id + "_ghost").animate(
			{
				left: "" + this.x - ghostWidth / 2 + "px",
				top: "" + this.y - ghostWidth / 2 + "px",
			},
			1
		);

		setScroll(this.x, this.y, this.id);
	};

	// Set the tagged tank
	setTagged = function () {
		//console.log(`setTagged ${this.tankId}`);
		$(".tank").removeClass("tagged");

		for (let i = 0; i < tanks.length; i++) {
			tanks[i].tagged = false;
		}

		this.tagged = true;

		$(`.tag_timer_${this.tankId}`).fadeIn(500);
		$(`.tank_${this.tankId}`).addClass("tagged");

		if (playStatus) {
			this.sendToBase();
		}
		tagTimer = timerMax;
	};

	sendToBase = function () {
		console.log("send_to_base(" + this.tankId + ")");
		const baseX = bases[this.tankId].x + baseWidth / 2 - tankWidth / 2;
		const baseY = bases[this.tankId].y + baseHeight / 2 - tankHeight / 2;
		this.x = baseX;
		this.y = baseY;
		this.colX = baseX;
		this.colY = baseY;
		this.speed = 0;

		$(`#tank_${this.tankId}`).css("opacity", 0);
		$(`#container_tank_${this.tankId}`).css("opacity", 0);

		this.move();
		this.queueEngineStop(0);

		$(`#tank_${this.tankId}`).animate({ opacity: 1 }, taggedFadeTime);
		$(`#container_tank_${this.tankId}`).animate({ opacity: 1 }, 2000);
	};

	queueEngineStop = function (timeout) {
		// console.log(`queueEngineStop for tank ${tank.id}`);
		// console.log(`tank.speed: ${tank.speed}`);
		if (timeout === undefined) {
			timeout = engineIdleTimeout;
		}
		setTimeout(() => {
			const lastDriveTime = performance.now() - this.lastDriveTime;
			if (lastDriveTime > engineIdleTimeout && this.speed === 0) {
				this.audio.engineIdle.pause();
				this.audio.engineIdle.currentTime = 0;
			}
		}, timeout);
	};

	queueEngineStart = function () {
		if (
			this.speed !== 0 &&
			this.audio.engineStart.paused &&
			this.audio.engineIdle.paused
		) {
			this.audio.engineStart.play();
		}
	};

	// See if an object needs to move
	checkMove = function () {
		// If tag_timer is greater than zero and the tank is tagged, return
		if (tagTimer > 0 && this.tagged) return;

		var curr_x = this.x;
		var curr_y = this.y;

		if (this.speed != 0) {
			// Move the tank
			if (this.speed == 1) {
				// forward
				if (this.angle == 0) {
					// North
					this.y -= moveRes * 2;
				} else if (this.angle == 45) {
					// Northeast
					this.y -= moveResDiag * 2;
					this.x += moveResDiag * 2;
				} else if (this.angle == 90) {
					// East
					this.x += moveRes * 2;
				} else if (this.angle == 135) {
					// Southeast
					this.x += moveResDiag * 2;
					this.y += moveResDiag * 2;
				} else if (this.angle == 180) {
					// South
					this.y += moveRes * 2;
				} else if (this.angle == 225) {
					// Southwest
					this.x -= moveResDiag * 2;
					this.y += moveResDiag * 2;
				} else if (this.angle == 270) {
					// West
					this.x -= moveRes * 2;
				} else if (this.angle == 315) {
					// Northwest
					this.x -= moveResDiag * 2;
					this.y -= moveResDiag * 2;
				}
			} else if (this.speed == -1) {
				// backward
				if (this.angle == 0) {
					// South
					this.y += moveRes;
				} else if (this.angle == 45) {
					// Southwest
					this.y += moveResDiag;
					this.x -= moveResDiag;
				} else if (this.angle == 90) {
					// West
					this.x -= moveRes;
				} else if (this.angle == 135) {
					// Northwest
					this.x -= moveResDiag;
					this.y -= moveResDiag;
				} else if (this.angle == 180) {
					// North
					this.y -= moveRes;
				} else if (this.angle == 225) {
					// Northeast
					this.x += moveResDiag;
					this.y -= moveResDiag;
				} else if (this.angle == 270) {
					// East
					this.x += moveRes;
				} else if (this.angle == 315) {
					// Southeast
					this.x += moveResDiag;
					this.y += moveResDiag;
				}
			}

			// Check for canvas boundary collision
			if (this.x < 0) {
				this.x = 0;
			} else if (this.x > mapWidth - tankWidth - mapBorder * 2) {
				this.x = mapWidth - tankWidth - mapBorder * 2;
			}
			if (this.y < 0) {
				this.y = 0;
			} else if (this.y > mapHeight - tankHeight - mapBorder * 2) {
				this.y = mapHeight - tankHeight - mapBorder * 2;
			}

			// Set tank collision x and y
			this.colX = this.x;
			this.colY = this.y;

			// Check object against all others for collisions
			if (
				checkArrayCollision(trees, this) ||
				checkArrayCollision(tanks, this)
			) {
				this.x = curr_x;
				this.y = curr_y;
			} else {
				this.move();
				this.setStats();
			}
		}
	};
}
