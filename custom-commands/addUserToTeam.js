const events = require('events');
const TeamMembers = require('hsapi').teamMembersService;

const { tops_skyline, hasResponseErrors, getObjectByName } = require('../globals');

/**
 * @param  {string}    user           Hootsuite core user
 * @param {string}     team           Hootsuite team you want to add to (optional)
 * @param  {string}    organization   Organization object or ID (optional)
 *
 * @return {function}  this           Allows to chain commands
 */

class addUserToTeam extends events.EventEmitter {
    constructor() {
        super();
        this.step = '';
    }

    /**
    * @param {object}   response     Response coming from hsapi
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

    async command(user, team, organization) {
        let u;
        let t;
        let o;

        try {
            if ((!user) && global.member.length === 0) {
                throw new Error('No user found. You can create one with createUser.');
            }

            if (typeof user === 'string') {
                u = getObjectByName(global.member, user);
            } else {
                u = global.menber[0];
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

            let teams = o.teams;
            if (!team && teams.length === 0) {
                throw new Error('No Hootsuite team. You can create one using createTeam.');
            }

            if (typeof team === 'string') {
                t = teams.find((item) => {
                    return item.name === team;
                });

                if (t === -1) {
                    throw new Error(`Unable to find team: ${team}.`);
                }
            } else {
                t = teams[0];
            }

            let teamMembers = new TeamMembers(tops_skyline);
            this.step = 'Adding member to the team';
            let teamMember = await teamMembers.addTeamMember(parseInt(o.paymentMemberId), parseInt(t.id), [u.memberId]);
            this.checkResponse(teamMember, `${u.email} added to ${t.name}.`);

        } catch (err) {
            console.log(err === null, `Failed to add member to team: ${JSON.stringify(err)}`);
        } finally {
            this.global.addTeamMember(o.name, t.name, u);
            this.emit('complete');
        }
        return this;
    }
};

module.exports = addUserToTeam;
