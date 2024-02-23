const events = require('events');
const { service_drafts } = require('../globals.js');
const DRAFT = require('hsapi').draftsService;

/**
 * Get all draft messages directly through DRAFT. Useful for avoiding UI
 *
 * @param {number}      memberId            The ID of the member
 * @param {object}      callback  Optional callback with draft data as argument
 * @return {function} this      Returning this allows commands to be chained
 */

class getDrafts extends events.EventEmitter {
	constructor() {
		super ();
	}

	async command(memberId, callback) {
		let draft = new DRAFT(service_drafts);
		let drafts = [];

		try {
			const data = await draft.getDrafts(memberId);

			if (!data) {
				throw new Error(`Request did not return draft messages. Error code ${data.errors[0].codes}`);
			}

			if (data.drafts.length === 0) {
				console.log('There are no draft messages for given member Id');
			}

			if (data.drafts.length !== 0) {
				console.log('Residual draft messages');
				drafts = data.drafts;
				data.drafts.forEach((d) => {
					console.log(`SN ID: ${d.socialProfileIds} / Draft ID: ${d.draft.id} / Text: ${d.draft.message.text}`);
				});
			}

			if (typeof callback === 'function') {
				callback.call(this.data);
			}

		} catch (err) {
			console.assert(false, `Error retrieving draft messages. ${err}`);
		} finally {
			this.emit('complete');
		}

		return drafts;
	}
}

module.exports = getDrafts;
