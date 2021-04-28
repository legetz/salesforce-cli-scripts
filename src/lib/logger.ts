/*
  Initial code from https://github.com/gulpjs/gulp-util/blob/v3.0.6/lib/log.js
 */
const chalk = require("chalk");
const timestamp = require("time-stamp");

function getTimestamp(error: boolean): string {
	const timeNow = timestamp("YYYY-MM-DD HH:mm:ss");

	if (error === true) return "[" + chalk.red(timeNow) + "]";

	return "[" + chalk.green(timeNow) + "]";
}

export function log(input: any) {
	const time = getTimestamp(false);
	console.log(time + " " + input);
}

export function error(input: any) {
	const time = getTimestamp(true);
	console.error(time + " " + input);
}
