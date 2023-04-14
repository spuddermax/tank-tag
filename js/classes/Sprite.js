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
		this.lastDriveTime = performance.now();
	}

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

	// Set the debugging stats
	setStats = function () {
		$(`#${this.id}_x_pos`).html(`${Math.floor(this.x)}`);
		$(`#${this.id}_y_pos`).html(`${Math.floor(this.y)}`);
		$(`#${this.id}_angle`).html(`${this.angle}`);
	};
}
