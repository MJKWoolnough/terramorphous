import {add, render} from './lib/css.js';
import {amendNode, clearNode} from './lib/dom.js';
import ready from './lib/load.js';
import {button, div, option, select, ul} from './lib/html.js';
import {NodeMap, node} from './lib/nodes.js';
import {JSONSetting} from './lib/settings.js';
import {polygon, svg} from './lib/svg.js';
import Clock from './clock.js';
import {getTimezoneData, getZones} from './worldtime.js';

type TimeZone = {
	[node]: HTMLOptionElement;
	name: string;
	clock?: Clock;
}

const defaultTimeZones = new JSONSetting("timezones", ["Local", "Africa/Cairo", "America/Los_Angeles", "America/New_York", "Asia/Hong_Kong", "Europe/London"], (v: unknown): v is string[] => v instanceof Array && v.every(s => typeof s === "string")),
      zoneSorter = (a: {name: string}, b: {name: string}) => defaultTimeZones.value.indexOf(a.name) - defaultTimeZones.value.indexOf(b.name),
      fullList = new NodeMap<string, TimeZone, HTMLSelectElement>(select({"multiple": true, "size": 10})),
      selectedList = new NodeMap<string, TimeZone, HTMLSelectElement>(select({"size": 10}), zoneSorter),
      clockContainer = new NodeMap<string, Clock>(ul({"id": "clocks"}), zoneSorter),
      loadClock = (tz: TimeZone) => getTimezoneData(tz.name).then(data => {
		tz.clock = new Clock(tz.name, data.dst_offset + data.raw_offset);
		clockContainer.set(tz.name, tz.clock);
      }),
      selectZone = button({"disabled": true, "onclick": () => {
	for (const [zone, tz] of fullList) {
		if (tz[node].selected) {
			fullList.delete(zone);
			defaultTimeZones.value.push(zone);
			selectedList.set(zone, tz);
			loadClock(tz);
		}
	}
	defaultTimeZones.save();
      }}, svg({"viewBox": "0 0 2 2"}, polygon({"points": "0,0 2,1 0,2", "fill": "currentColor"}))),
      deselectZone = button({"disabled": true}, svg({"viewBox": "0 0 2 2"}, polygon({"points": "2,0 0,1 2,2", "fill": "currentColor"}))),
      moveZoneUp = button({"disabled": true}, svg({"viewBox": "0 0 2 2"}, polygon({"points": "2,2 0,2 1,0", "fill": "currentColor"}))),
      moveZoneDown = button({"disabled": true}, svg({"viewBox": "0 0 2 2"}, polygon({"points": "0,0 2,0 1,2", "fill": "currentColor"})));

ready
.then(() => {
	const local = new Clock("Local", 0);
	
	selectedList.set("Local", {
		[node]: option("Local"),
		name: "Local",
		clock: local
	});
	clockContainer.set("Local", local);
	fullList.set("", {
		[node]: option({"disabled": true}, "Loading..."),
		name: "",
	});
	clearNode(document.body, [
		clockContainer[node],
		div({"id": "selector"}, [
			fullList[node],
			div([
				selectZone,
				deselectZone,
			]),
			selectedList[node],
			div([
				moveZoneUp,
				moveZoneDown
			])
		])
	]);
	amendNode(document.head, render());
})
.then(getZones)
.then(zones => {
	fullList.delete("");
	amendNode(selectZone, {"disabled": false});
	amendNode(deselectZone, {"disabled": false});
	amendNode(moveZoneUp, {"disabled": false});
	amendNode(moveZoneDown, {"disabled": false});
	for (const zone of zones) {
		if (defaultTimeZones.value.includes(zone)) {
			const tz: TimeZone = {
				[node]: option(zone),
				name: zone,
			      };
			selectedList.set(zone, tz);
			loadClock(tz);
		} else {
			fullList.set(zone, {
				[node]: option(zone),
				name: zone,
			});
		}
	}
})
.catch(() => clearNode(document.body, "Failed to get Time Data"));

add({
	"#clocks": {
		"display": "grid",
		"list-style": "none",
		"padding": 0,
		"gap": "1em",
		"grid-template-columns": "repeat(auto-fill, minmax(auto, 20em))",
		" li": {
			" div, h2": {
				"text-align": "center",
			}
		}
	},
	"#selector": {
		"position": "relative",
		"display": "grid",
		"grid-template-columns": "auto 3em auto 3em",
		">div": {
			"height": "100%",
			">button": {
				"display": "block",
				"height": "50%",
				"padding": "0.5em",
				"margin": "0 auto",
				">svg": {
					"width": "2em",
					"height": "2em",
				}
			}
		}
	}
});
