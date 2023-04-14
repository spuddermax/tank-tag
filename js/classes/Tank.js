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
		console.log(`setTagged ${this.tankId}`);
		$(".tank").removeClass("tagged");

		for (let i = 0; i < tanks.length; i++) {
			tanks[i].tagged = false;
		}

		this.tagged = true;

		$(`.tag_timer_${this.tankId}`).fadeIn(500);
		$(`.tank_${this.tankId}`).addClass("tagged");

		if (playStatus) {
			sendToBase(this.id);
		}
		tagTimer = timerMax;
	};
}

// make the class available in the global scope
window.Tank = Tank;
