const { request} = require('playwright');
const { getUnixTime } = require('date-fns');
const { service_scheduled_data, service_message_review } = require('../globals');

const toEpoch = (t) => {
	const defaultTime = new Date();
	defaultTime.setMinutes(defaultTime.getMinutes() - 20);
	return getUnixTime(t || defaultTime);
};

/**
* @param {string} memberId ID of the member
* @param {string} messageId ID of the message
* @param {string} postStatus Status of the post
* @param {string} timeStamp Optional timestamp. Default is 20 minutes before current time
*
* @return {object} responseJson
*/

exports.ModifyScheduledPostStatus = class ModifyScheduledPostStatus {
	async updatePostStatus(memberId, messageId, postStatus, timeStamp = null) {
		const commonReqBody = {
			timeslot: toEpoch(timeStamp),
			modifiedUser: memberId,
			modifiedDate: toEpoch(new Date()),
		};

		const statusEndpoints = {
			FAILED: `${service_scheduled_data}/sched/messages/${messageId}`,
			PUBLISHED: `${service_scheduled_data}/sched/messages/${messageId}`,
			REJECTED: `${service_message_review}/v2.0/reviewMessages/${messageId}/review`,
			EXPIRED: `${service_message_review}/reviewMessages/${messageId}/expire`,
		};

		const endPoint = statusEndpoints[postStatus];
		if (!endPoint) {
			throw new Error(`Invalid post status: ${postStatus}`);
		}

		let reqBody = {};

		const statusRequestBodies = {
			FAILED: {
				...commonReqBody,
				socialNetworkResponse: { httpResponseCode: 400 },
			},
			PUBLISHED: commonReqBody,
			REJECTED: {
				id: parseInt(messageId, 10),
				status: 'REJECTED',
				sequenceNumber: 1,
				reasons: `Testing reject status on ${new Date()}`,
			},
			EXPIRED: {
				sequenceNumber: 1,
				reason: `Testing expired status on ${new Date()}`,
			},
		};

		reqBody = statusRequestBodies[postStatus] || reqBody;

		try {
			const apiRequestContext = await request.newContext();
			const response = await apiRequestContext.put(endPoint, {
				headers: {
					'X-As-Member-Id': String(memberId),
					'Content-Type': 'application/json;charset=UTF-8',
				},
				data: reqBody,
			});

			if (response.status() !== 200) {
				console.error(`Error changing status for message ${messageId}: ${response.status()} - ${await response.text()}`);
				throw new Error(`Error while changing status of scheduled message: ${response.status()} - ${await response.text()}`);
			}
			const responseJson = await response.json();
			console.log(`Successfully changed status for message ${messageId}`);
			return responseJson;
		} catch (statusUpdateError) {
			console.error(`Failed to change status for message ${messageId}:`, statusUpdateError);
			throw statusUpdateError;
		}
	}
};
