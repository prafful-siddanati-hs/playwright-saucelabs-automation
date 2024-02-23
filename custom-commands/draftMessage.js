const events = require('events');
const { service_drafts } = require('../globals.js');
const DRAFT = require('hsapi').draftsService;

/**
 * Draft a message directly through DRAFTS. Useful for avoiding UI
 * operations in tests that require draft messages.
 *
 * @param {number}    member    ID of the member creating the draft message
 * @param {object}    options   Draft options (text, social profiles, etc.)
 * @param {object}    callback  Optional callback with message data as argument
 *
 * @return {function} this      Returning this allows commands to be chained
 */

class draftMessage extends events.EventEmitter {
	constructor() {
		super ();
	}

	async command(memberId, options, callback) {
		let draft = new DRAFT(service_drafts);

		try {
			const data = await draft.draftMessage(memberId, options);
			if (!data || !data.draft || !data.draft.id) {
				throw new Error(`Request did not return draft messages. Error code ${data.errors[0].codes}`);
			}

			console.log(data !== undefined, `SN ID: ${data.draft.message.messages[0].snId} / Draft ID: ${data.draft.id} / Text: ${data.draft.message.text}`);

			if (typeof callback === 'function') {
				callback.call(this.data);
			}

		} catch (err) {
			console.assert(false, `Error while drafting a message. ${err}`);
		} finally {
			this.emit('complete');
		}

		return this;
	}
}

module.exports = draftMessage;
