import {add, render} from './lib/css.js';
import {amendNode, clearNode} from './lib/dom.js';
import ready from './lib/load.js';
import {button, div, h1, h2, option, section, select, ul} from './lib/html.js';
import {NodeMap, node, stringSort} from './lib/nodes.js';
import {JSONSetting} from './lib/settings.js';
import {polygon, svg} from './lib/svg.js';
import Clock from './clock.js';
import {getTimezoneData, getZones} from './worldtime.js';

type TimeZone = {
	[node]: HTMLOptionElement;
	offset?: number;
	name: string;
	clock?: Clock;
}

const defaultTimeZones = new JSONSetting("timezones", ["Local", "Africa/Cairo", "America/Los_Angeles", "America/New_York", "Asia/Hong_Kong", "Europe/London"], (v: unknown): v is string[] => v instanceof Array && v.every(s => typeof s === "string")),
      zoneSorter = (a: {name: string}, b: {name: string}) => defaultTimeZones.value.indexOf(a.name) - defaultTimeZones.value.indexOf(b.name),
      fullList = new NodeMap<string, TimeZone, HTMLSelectElement>(select({"multiple": true, "size": 10}), (a, b) => a.name === "Local" ? -1 : b.name === "Local" ? 1 : stringSort(a.name, b.name)),
      selectedList = new NodeMap<string, TimeZone, HTMLSelectElement>(select({"size": 10}), zoneSorter),
      clockContainer = new NodeMap<string, Clock>(ul({"id": "clocks"}), zoneSorter),
      loadClock = (tz: TimeZone) => (tz.offset !== undefined ? Promise.resolve({
	"abbreviation": tz.name,
	"dst": false,
	"dst_offset": 0,
	"raw_offset": tz.offset,
	"unixtime": (Date.now() / 1000) | 0
      }) : getTimezoneData(tz.name)).then(data => {
		tz.clock = new Clock(tz.name, tz.offset = data.dst_offset + data.raw_offset);
		clockContainer.set(tz.name, tz.clock);
      }),
      selectZone = button({"title": "Select Time Zone(s)", "disabled": true, "onclick": () => {
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
      deselectZone = button({"title": "Deselect Time Zone", "disabled": true, "onclick": () => {
	for (const [zone, tz] of selectedList) {
		if (tz[node].selected) {
			selectedList.delete(zone);
			defaultTimeZones.value.splice(defaultTimeZones.value.indexOf(zone), 1);
			tz.clock?.remove();
			delete tz.clock;
			fullList.set(zone, tz);
			defaultTimeZones.save();
			clockContainer.delete(zone);
			return;
		}
	}
      }}, svg({"viewBox": "0 0 2 2"}, polygon({"points": "2,0 0,1 2,2", "fill": "currentColor"}))),
      moveZoneUp = button({"title": "Move Time Zone Up", "disabled": true, "onclick": () => {
	for (const [zone, tz] of selectedList) {
		if (tz[node].selected) {
			const pos = defaultTimeZones.value.indexOf(tz.name);
			if (pos > 0) {
				defaultTimeZones.value.splice(pos, 1);
				defaultTimeZones.value.splice(pos - 1, 0, zone);
				defaultTimeZones.save();
				selectedList.sort();
				clockContainer.clear();
				for (const [, tz] of selectedList) {
					loadClock(tz);
				}
			}
			return;
		}
	}
      }}, svg({"viewBox": "0 0 2 2"}, polygon({"points": "2,2 0,2 1,0", "fill": "currentColor"}))),
      moveZoneDown = button({"title": "Move Time Zone Down", "disabled": true, "onclick": () => {
	for (const [zone, tz] of selectedList) {
		if (tz[node].selected) {
			const pos = defaultTimeZones.value.indexOf(tz.name);
			if (pos < defaultTimeZones.value.length - 1) {
				defaultTimeZones.value.splice(pos, 1);
				defaultTimeZones.value.splice(pos + 1, 0, zone);
				defaultTimeZones.save();
				selectedList.sort();
				clockContainer.clear();
				for (const [, tz] of selectedList) {
					loadClock(tz);
				}
			}
			return;
		}
	}
      }}, svg({"viewBox": "0 0 2 2"}, polygon({"points": "0,0 2,0 1,2", "fill": "currentColor"})));

ready
.then(() => {
	fullList.set("", {
		[node]: option({"disabled": true}, "Loading..."),
		name: "",
	});
	clearNode(document.body, [
		h1({"title": "World Clock Viewer"}, "Terramorphous"),
		section({"id": "selector"}, [
			h2("Available Time Zone"),
			div(),
			h2("Selected Time Zone(s)"),
			div(),
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
		]),
		clockContainer[node],
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
	zones.push("Local");
	for (const zone of zones) {
		if (defaultTimeZones.value.includes(zone)) {
			const tz: TimeZone = {
				[node]: option(zone),
				offset: zone === "Local" ? 0 : undefined,
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
	"h1,h2": {
		"text-align": "center"
	},
	"#clocks": {
		"display": "grid",
		"list-style": "none",
		"padding": 0,
		"gap": "1em",
		"grid-template-columns": "repeat(auto-fill, minmax(auto, 20em))",
		" li": {
			" div": {
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
