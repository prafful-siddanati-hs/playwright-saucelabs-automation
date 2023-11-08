const events = require('events');
const { service_drafts } = require('../globals.js');
const DRAFT = require('hsapi').draftsService;

/**
 * Get all scheduled messages directly through MPS. Useful for avoiding UI
 *
 * @param {number}      memberId              The ID of the member
 * @param {string}      draftId               The ID of the draft message
 * @param {string}      apiAuthorizationValue API auth token of the member
 * @param {object}      callback  Optional    callback with message data as argument
 *
 * @return {function} this      Returning this allows commands to be chained
 */
class deleteDraftById extends events.EventEmitter {
    constructor() {
        super ();
    }

    async command(memberId, draftId, apiAuthorizationValue) {
        let draft = new DRAFT(service_drafts);

        try {
            const data = await draft.deleteDraftById(memberId, draftId,"apiAuthorization=" + apiAuthorizationValue);

            if (!data.id) {
                throw new Error(`Request did not delete draft message. Error code ${data.body.details[0].value}`);
            }

            if (typeof callback === 'function') {
                callback.call(this.data);
            }

        } catch (err) {
            console.assert(false, `Error deleting draft message. ${err}`);
        } finally {
            this.emit('complete');
        }

        return this;
    }
}

module.exports = deleteDraftById;
