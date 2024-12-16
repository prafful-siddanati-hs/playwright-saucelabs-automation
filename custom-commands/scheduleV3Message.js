const events = require('events');
const { service_message_publishing } = require('../globals.js');
const MPS = require('hsapi').messagePublishingService;

/**
 * Schedule a v3.0 message directly through MPS. Useful for avoiding UI
 * operations in tests that require scheduled messages.
 *
 * @param {number}    memberId    ID of the member creating the message
 * @param {object}    options   Message options (text, social profiles, etc.)
 * @param {object}    callback  Optional callback with message data as argument
 *
 * @return {function} this      Returning this allows commands to be chained
 */

class scheduleV3Message extends events.EventEmitter {
	constructor() {
		super();
	}

	async command(memberId, options, callback) {
		const mps = new MPS(service_message_publishing);

		try {
			const data = await mps.scheduleV3Message(memberId, options);

			if (!data || !data.messages || !data.messages[0].id) {
				throw new Error(`Request did not return a message ID. Error code ${data.errors[0].codes}`);
			}

			data.messages.forEach((message) => {
				console.log(`SN ID: ${message.socialProfile.id} / Message ID: ${message.id} / Text: ${message.text}`);
			});

			if (typeof callback === 'function') {
				callback.call(this, data);
			}

		} catch (err) {
			console.assert(false, `Error scheduling a message. ${err}`);
			throw new Error(err);
		} finally {
			this.emit('complete');
		}

		return this;
	}
}

module.exports = scheduleV3Message;
