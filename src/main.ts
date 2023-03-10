import {clearNode} from './lib/dom.js';
import ready from './lib/load.js';
import {option, select, ul} from './lib/html.js';
import {NodeMap, node} from './lib/nodes.js';
import Clock from './clock.js';
import {getTimezoneData, getZones} from './worldtime.js';

type TimeZone = {
	[node]: HTMLOptionElement;
	zone: string;
	clock?: Clock;
}

const defaultTimeZones = ["Africa/Cairo", "America/Los_Angeles", "America/New_York", "Asia/Hong_Kong", "Europe/London"],
      fullList = new NodeMap<string, TimeZone>(select({"multiple": true, "size": 10})),
      selectedList = new NodeMap<string, TimeZone>(select({"multiple": true, "size": 10})),
      clockContainer = ul(),
      loadClock = (tz: TimeZone) => getTimezoneData(tz.zone).then(data => {
		tz.clock = new Clock(tz.zone, data.dst_offset + data.raw_offset);
		clockContainer.append(tz.clock.node);
      });

ready
.then(() => {
	const local = new Clock("Local", 0);
	
	selectedList.set("Local", {
		[node]: option("Local"),
		zone: "Local",
		clock: local
	});
	clockContainer.append(local.node);
	fullList.set("", {
		[node]: option({"disabled": true}, "Loading..."),
		zone: "",
	});
	clearNode(document.body, [
		clockContainer,
		fullList[node],
		selectedList[node]
	]);
})
.then(getZones)
.then(zones => {
	fullList.delete("");
	for (const zone of zones) {
		if (defaultTimeZones.includes(zone)) {
			const tz: TimeZone = {
				[node]: option(zone),
				zone,
			      };
			selectedList.set(zone, tz);
			loadClock(tz);
		} else {
			fullList.set(zone, {
				[node]: option(zone),
				zone,
			});
		}
	}

})
.catch(() => clearNode(document.body, "Failed to get Time Data"));
