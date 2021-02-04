import { Connection } from 'jsforce';

let sfConn: any = new Connection({
    version: '45.0',
    oauth2: {
        loginUrl: process.env.SF_URL
    }
})

sfConn.bulk.pollTimeout = 60000 * 15 // 15 minute timeout for BULK API

export function doLogin() {
    return new Promise(async function (resolve, reject) {
        sfConn.login(process.env.SF_USER, process.env.SF_PASS, async function (err: any, userInfo: any) {
            if (err || !userInfo) {
                reject(err)
            } else {
                let sessionData = {
                    "accessToken": sfConn.accessToken,
                    "instanceUrl": sfConn.instanceUrl,
                    "userId": userInfo.id,
                }
                resolve(sessionData)
            }
        })
    })
}

export function checkBulkJob(jobId: string) {
    return new Promise(async function (resolve, reject) {
        try {
            const job: any = await sfConn.bulk.job(jobId).check()
            resolve(job)
        } catch(err) {
            reject(err)
        }
    })
}

export function abortBulkJob(jobId: string) {
    return new Promise(async function (resolve, reject) {
        try {
            const job: any = await sfConn.bulk.job(jobId).abort()
            resolve(job)
        } catch(err) {
            reject(err)
        }
    })
}

export function updateBulk(tableName: string, records: any[]) {
	return new Promise ((resolve, reject) => {
		let returnMap: any = {}
		sfConn.sobject(tableName).updateBulk(
			records,
			function(err: any, rets: any[]) {
				if (err) { 
					reject(err) 
				} else {
					for (var i=0; i < rets.length; i++) {
						if(rets[i].success) {
							//console.log("Upsert " + rets[i].id)
							returnMap[rets[i].id] = rets[i].success
						} else {
                            if(!rets[i].id) {
                                rets[i].id = records[i].Id;
                            }
                            console.log(`ERROR, Line ${i}: ${JSON.stringify(rets[i])}`)
                        }
					}
					resolve(returnMap)
				}
			}
		)
	})
}

export function updateBulkCsv(tableName: string, filepath: string) {
	return new Promise ((resolve, reject) => {
        const csvFileIn = require('fs').createReadStream(filepath);

		let returnMap: any = {}
		sfConn.bulk.load(
            tableName,
            "update",
			csvFileIn,
			function(err: any, rets: any[]) {
				if (err) { 
					reject(err) 
				} else {
					for (var i=0; i < rets.length; i++) {
						if(rets[i].success) {
							//console.log("Upsert " + rets[i].id)
							returnMap[rets[i].id] = rets[i].success
						} else {
                            console.log(`ERROR, Line ${i}: ${JSON.stringify(rets[i])}`)
                        }
					}
					resolve(returnMap)
				}
			}
		)
	})
}

export function getCases() {
	return new Promise (async function (resolve, reject) {
        const records: any = []
        
        const fs = require('fs');
        try {
            await sfConn.bulk.query("SELECT Id FROM Case")
            .stream().pipe(fs.createWriteStream('./cases.csv'));
            resolve()
        } catch (e) {
            reject(e)
        }
	})
}