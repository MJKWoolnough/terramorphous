import {HTTPRequest} from './lib/conn.js';

type Timezone = {
	abbreviation: string;
	dst: boolean;
	dst_offset: number;
	raw_offset: number;
	unixtime: number;
}

const server = "http://worldtimeapi.org/api/";

export const getZones = () => HTTPRequest<string[]>(`${server}/timezone`, {"response": "json", "checker": (zones: unknown): zones is string[] =>
	zones instanceof Array &&
	zones.every(zone => typeof zone === "string")
}),
getTimezoneData = (zone: string) => HTTPRequest<Timezone>(`${server}/timezone/${zone}`, {"response": "json", "checker": (timezone: unknown): timezone is Timezone =>
	timezone instanceof Object &&
	"abbreviation" in timezone && typeof timezone["abbreviation"] === "string" &&
	"dst" in timezone && typeof timezone["dst"] === "boolean" &&
	"dst_offset" in timezone && typeof timezone["dst_offset"] === "number" &&
	"raw_offset" in timezone && typeof timezone["raw_offset"] === "number" &&
	"unixtime" in timezone && typeof timezone["unixtime"] === "number"
});
