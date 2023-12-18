/**
 * Organization must belong to Enterprise and Pro accounts listed in fixtures/accounts.js.
 */
const events = require('events');
const OrganizationMembers = require('hsapi').organizationMembersService;

const { tops_skyline, hasResponseErrors, getObjectByName } = require('../globals');

/**
 * @param  {string}    user           Hootsuite core user (optional)
 * @param  {string}    organization   Organization object or ID (optional)
 *
 * @return {function}  this           Allows to chain commands
 */

class addUserToOrg extends events.EventEmitter {
    constructor() {
        super();
        this.step = '';
    }

    /**
    * @param {object}   response     Response comming from hsapi
    *
    * @param {string}   successMsg   This message is shown in case api call succeeds
    */

    checkResponse(response, successMsg) {
        if (this.step && this.step !== '') {
            console.log(`${this.step}:`);
        }

        if (!Array.isArray(response)) {
            response = [response];
        }
        try {
            response.forEach(r => {
                if (!hasResponseErrors(r)) {
                    console.log(true, `${successMsg}`);
                } else {
                    console.log(false, JSON.stringify(r, null, 2));
                }
            });
        } catch (err) {
            console.log(false, JSON.stringify(err));
        }
    }

    async command(user, organization) {
        let u;
        let o;

        try {
            if (!user) {
                throw new Error('Please specify a user to add to the organization.');
            }

            if ((!organization) && (global.organization.length === 0)) {
                throw new Error('No organization found. Please create one using createOrg().');
            }

            if (typeof organization === 'string') {
                let orgName = testOrgPrefix + organization;
                o = getObjectByName(global.organization, orgName);
            } else {
                o = global.organization[0];
            }

            if (typeof user === 'string') {
                u = getObjectByName(global.member, user);
            } else {
                u = global.menber[0];
            }

            let orgMembers = new OrganizationMembers(tops_skyline);

            this.step = 'Adding Hootsuite member to organization';

            let orgMember = await orgMembers.addMemberToOrg(parseInt(o.paymentMemberId), parseInt(u.memberId), parseInt(o.id));

            this.checkResponse(orgMember, `Member: ${u.name} added to the org: ${o.name}`);
        } catch (err) {
            console.log(err === null, `Failed to add user to the specified org: ${JSON.stringify(err)}`);
        } finally {
            this.emit('complete');
        }
        return this;
    }
};

module.exports = addUserToOrg;