const events = require('events');
const { service_message_publishing } = require('../globals.js')
const MPS = require('hsapi').messagePublishingService;

class scheduleV3Message extends events.EventEmitter {
    constructor() {
        super();
    }

    async command(member, options, callback) {
        const mps = new MPS(service_message_publishing);

        try {
            const data = await mps.scheduleV3Message(member, options);

            if (!data || !data.messages || !data.messages[0].id) {
                throw new Error(`Request did not return a message ID. Error code ${data.errors[0].codes}`);
            }

            console.log(data !== undefined, `SN ID: ${data.messages[0].socialProfile.id} / Message ID: ${data.messages[0].id} / Text: ${data.messages[0].text}`);

            if (typeof callback === 'function') {
                callback.call(this, data);
            }
        } catch (err) {
            console.assert(false, `Error scheduling a message. ${err}`);
        } finally {
            this.emit('complete');
        }

        return this;
    }
}

module.exports = scheduleV3Message;
