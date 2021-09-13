import Drop from "./Drop";
import { 
	RYTHM_SHORT, RYTHM_LONG, RYTHM_THRESHOLD, LIGHT_COLORS,
	PLAYBOARD_HEIGHT, NOTE_PREVIEW_TIME,
} from 'config/settings';

const DROP_HEIGHT = PLAYBOARD_HEIGHT;
const DROP_SPEED = DROP_HEIGHT / NOTE_PREVIEW_TIME;

export default class Track {
	ansi: String;
	noteType: String;
	leftOffset: Number;
	size: Number;
	drops: Array<Drop>;
	pressedDrop: Drop = null;
	onClickResult: () => String;

	constructor({ansi, type, leftOffset, size}) {
		this.ansi = ansi;
		this.noteType = type;
		this.leftOffset = leftOffset;
		this.size = size;
		this.drops = [];
	}

	addDrop(duration, speed) {
		let type = duration > RYTHM_THRESHOLD ? RYTHM_LONG : RYTHM_SHORT;
		this.drops.push(new Drop({
			type,
			x: this.leftOffset,
			y: 0,
			// y: DROP_HEIGHT,
			radius: this.size,
			length: type === RYTHM_LONG ? duration*DROP_SPEED : 0,
			speed: DROP_SPEED*speed,
			color: this.noteType === 'white' ? LIGHT_COLORS[0] : LIGHT_COLORS[6],
		}));
	}

	checkDropDie() {
		if (this.drops.length === 0) {
			return;
		}
		let drop = this.drops[0];
		if (drop.endY > DROP_HEIGHT) {
			this.drops.shift();
		}
	}

	draw(context, deltaTime) {
		this.drops.forEach(drop => {
			drop.update(deltaTime);
			drop.draw(context);
		});

		this.checkDropDie();
	}

	clean() {
		this.drops = [];
		this.pressedDrop = null;
	}
}