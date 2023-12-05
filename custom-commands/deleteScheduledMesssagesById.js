const events = require('events');
const { service_message_publishing } = require('../globals.js')
const MPS = require('hsapi').messagePublishingService;

/**
 * Get all scheduled messages directly through MPS. Useful for avoiding UI
 *
 * @param {number}      memberId            The ID of the member.
 * @param {number}      messageId           The ID of the scheduled message.
 * @param {string}      apiAuthorizationValue API auth token of the member
 * @param {object}      callback  Optional callback with message data as argument
 *
 * @return {function} this      Returning this allows commands to be chained
 */

class deleteScheduledMessageById extends events.EventEmitter {
    constructor() {
        super ();
    }

    async command(member, messageId, callback) {
        const mps = new MPS(service_message_publishing);

        try {
            const data = await mps.deleteScheduledMessageById(member, messageId);

            if (data) {
                throw new Error(`Request did not delete scheduled message. Error code ${data.errors[0].codes}`);
            }

            if (typeof callback === 'function') {
                callback.call(this.data);
            }

        } catch (err) {
            console.assert(false, `Error deleting scheduled message. ${err}`);
        } finally {
            this.emit('complete');
        }

        return this;
    }
}

module.exports = deleteScheduledMessageById;
