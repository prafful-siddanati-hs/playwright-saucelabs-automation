const MPS = require('hsapi').messagePublishingService;
const { service_message_publishing } = require('../globals.js')


async function scheduleV3Message(member, options) {
    
    const mps = new MPS(service_message_publishing);

    try {
        const data = await mps.scheduleV3Message(member, options);

        if (!data || !data.messages || !data.messages[0].id) {
            throw new Error(`Request did not return a message ID. Error code ${data.errors[0].codes}`);
        }

        console.assert(data !== undefined, `SN ID: ${data.messages[0].socialProfile.id} / Message ID: ${data.messages[0].id} / Text: ${data.messages[0].text}`);

        return data;
    } catch (err) {
        console.assert(false, `Error scheduling a message. ${err}`);
    }
}

module.exports = scheduleV3Message;
