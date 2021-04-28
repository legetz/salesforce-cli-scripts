const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

sqlite3.verbose();

export async function connect(database?: string) {
	if (!database) {
		database = "default";
	}
	const dbPath = `./db/${database}.db`;

	return open({
		filename: dbPath,
		driver: sqlite3.Database,
	});
}
