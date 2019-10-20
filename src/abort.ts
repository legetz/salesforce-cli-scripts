require('dotenv').config()
import { doLogin, checkBulkJob, abortBulkJob } from './salesforce';

export const abortOpenJobs: any = async () => {
	// Login to Salesforce
	try {
		console.log('Login to Salesforce')
		const session: any = await doLogin()
		console.log('Successfully logged into instance ' + session.instanceUrl)
	} catch (ex) {
		console.log('ERROR: Failed to login Salesforce')
		throw (ex)
	}

	// You need to first feed the list of job ID's
	// Follow steps at: https://medium.com/@successengineer/how-to-export-bulk-data-load-jobs-data-in-salesforce-600de5608f83
	// Use also Chrome extension "ColumnCopy"

	const jobList = [
		'7501v00000QbmFl',
		'7501v00000QBIUo',
		'7501v00000QBIUK',
	]

	// Loop through all jobs
	for (let jobId of jobList) {
		try {
			/*
			console.log(`Aborting open BULK job with ID ${jobId}`)
			await abortBulkJob(jobId)
			*/
			
			console.log(`Getting details of job ${jobId}`)
			let job: any

			try {
				job = await checkBulkJob(jobId)
			} catch (ex) {
				console.log('Skipping, did not receive job details')
				console.log(ex)
				continue
			}

			if(job.state === 'Open' && job.numberBatchesTotal == '0') {
				console.log(`Aborting open BULK job (zero batches) with ID ${jobId}`)
				await abortBulkJob(jobId)
			} else {
				console.log(`Skipping abort job with ID ${jobId}`)
			}
		} catch (ex) {
			console.log('ERROR: Failed to abort job')
			console.log(ex)
		}
	}
}

abortOpenJobs()