import {div, h2, li} from './lib/html.js';
import {animateTransform, circle, defs, line, svg, use} from './lib/svg.js';

const unix = () => (Date.now() / 1000) | 0,
      formatNumber = (n: number) => ((n | 0) + "").padStart(2, "0"),
      tickers: Clock[] = [];

setInterval(() => {
	const now = unix();
	for (const ticker of tickers) {
		ticker.tick(now);
	}
}, 1000);

export default class Clock {
	#node: HTMLLIElement;
	#time: HTMLDivElement;
	#offset: number;
	constructor(name: string, offset: number) {
		this.#offset = offset;
		const now = unix(),
		      begin = "-" + (now + offset);
		this.#node = li([
			h2(name),
			svg({"viewBox": "0 0 100 100"}, [
				defs(line({"id": "marker", "x1": 50, "x2": 50, "y1": 1, "y2": 10, "stroke": "#888"})),
				Array.from({"length": 12}, (_, n) => use({"href": "#marker", "transform": `rotate(${30 * n} 50 50)`})),
				circle({"cx": 50, "cy": 50, "r": 48, "fill": "none", "stroke": "currentColor", "stroke-width": 4}),
				line({"x1": 50, "y1": 50, "x2": 50, "y2": 20, "stroke": "currentColor", "stroke-width": 4, "stroke-linecap": "round"}, animateTransform({"attributeName": "transform", "attributeType": "XML", "type": "rotate", "from": "0 50 50", "to": "360 50 50", "dur": "12h", "repeatCount": "indefinite", begin})),
				line({"x1": 50, "y1": 50, "x2": 50, "y2": 10, "stroke": "currentColor", "stroke-width": 2, "stroke-linecap": "round"}, animateTransform({"attributeName": "transform", "attributeType": "XML", "type": "rotate", "from": "0 50 50", "to": "360 50 50", "dur": "1h", "repeatCount": "indefinite", begin})),
				line({"x1": 50, "y1": 50, "x2": 50, "y2": 5, "stroke": "#800", "stroke-width": 1, "stroke-linecap": "round"}, animateTransform({"attributeName": "transform", "attributeType": "XML", "type": "rotate", "from": "0 50 50", "to": "360 50 50", "dur": "60s", "repeatCount": "indefinite", begin})),
				circle({"cx": 50, "cy": 50, "r": 1, "fill": "#d4af37"})
			]),
			this.#time = div()
		]);
		tickers.push(this);
		this.tick(now);
	}
	get node() {
		return this.#node;
	}
	tick(now: number) {
		const timestamp = now + this.#offset;
		this.#time.textContent = `${formatNumber((timestamp % 86400) / 3600)}:${formatNumber((timestamp % 3600) / 60)}:${formatNumber(timestamp % 60)}`;
	}
	remove() {
		const pos = tickers.indexOf(this);
		if (pos >= 0) {
			tickers.splice(pos, 1);
		}
		this.#node.remove();
	}
}
