const events = require('events');
const {service_trail} = require("../globals");
const TRAIL = require('hsapi').trailService;

/**
 * Create campaign directly through Trail. Useful for avoiding UI
 * operations in tests that require scheduled messages with campaign.
 *
 * @param {number}    member    ID of the member creating the campaign
 * @param {object}    options   Campaign options (orgId, campaign name, etc.)
 * @param {string}    apiAuthorizationValue API auth token of the member
 * @param {object}    callback  Optional callback with campaign data as argument
 *
 * @return {function} this      Returning this allows commands to be chained
 */

class createCampaign extends events.EventEmitter {
    constructor() {
        super();
    }

    async command(memberId, options, apiAuthorizationValue, callback) {
        const trail = new TRAIL(service_trail);

        try {
            const data = await trail.createCampaign(memberId, options, "apiAuthorization=" + apiAuthorizationValue);

            if (!data || data.statusCode > 200) {
                throw new Error(`Request did not return a campaign ID. Error code ${data.errors[0].errorCode}`);
            }

            console.log(data !== undefined, `CAMPAIGN ID: ${data.id} / CAMPAIGN Name: ${data.name}`);

            if (typeof callback === 'function') {
                callback.call(this.data);
            }

        } catch (err) {
            console.assert(false, `Error creating a campaign. ${err}`);
        } finally {
            this.emit('complete');
        }

        return this;
    }
}

module.exports = createCampaign;
