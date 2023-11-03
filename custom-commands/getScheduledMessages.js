const events = require('events');
const { service_message_publishing } = require('../globals.js');
const MPS = require('hsapi').messagePublishingService;

/**
 * Get all scheduled messages directly through MPS. Useful for avoiding UI
 *
 * @param {number}      memberId            The ID of the member.
 * @param {string}      startTime           The start date of the schedule time.
 * @param {string}      endTime             The end date of the schedule time.
 * @param {number}      socialProfileIds    The ID of the social network.
 * @param {String}      state               The state of the  scheduled message.
 * @param {number}      limit               The limit for no of the scheduled messages.
 * @param {string}      apiAuthorizationValue API auth token of the member
 * @param {object}      callback  Optional callback with message data as argument
 *
 * @return {function} this      Returning this allows commands to be chained
 */

class getScheduledMessages extends events.EventEmitter {
    constructor() {
        super ();
    }

    async command(memberId, startTime, endTime, socialProfileIds, state, limit, apiAuthorizationValue) {
        const mps = new MPS(service_message_publishing);
        let messages = [];

        try {
            const data = await mps.getScheduledMessages(memberId, startTime, endTime, socialProfileIds, state, limit, "apiAuthorization=" + apiAuthorizationValue);

            if (!data) {
                throw new Error(`Request did not return scheduled messages. Error code ${data.errors[0].code}`)
            }

            if (data.messages.length === 0) {
                console.log('There are no scheduled messages for the given date range');
            }

            if (data.messages.length !== 0) {
                console.log('List of scheduled messages');
                messages = data.messages;
                data.messages.forEach((message) => {
                    console.log(`SN ID: ${message.socialProfile.id} / Message ID: ${message.id} / Text: ${message.text}`)
                });
            }

            if (typeof callback === 'function') {
                callback.call(this.data);
            }

        } catch (err) {
            console.assert(false, `Error retrieving scheduled message. ${err}`);
        } finally {
            this.emit('complete');
        }

        return messages;
    }
}

module.exports = getScheduledMessages;
