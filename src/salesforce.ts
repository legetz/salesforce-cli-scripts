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