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
}
