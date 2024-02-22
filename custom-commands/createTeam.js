const events = require('events');
const Teams = require('hsapi').teamsService;
const {hasResponseErrors, tops_skyline, testOrgPrefix, getObjectByName, addTeam} = require("../globals");

/**
 * Creates a new member object in member service, dashboard, and billing service and adds user to globals.
 *
 * @param {string}    name                      Name of the team, e.g. playwright_team_name
 * @param {string}    organization              Organization name (optional)
 *
 * @return {function} this                      Returning this allows commands to be chained
 */

class createTeam extends events.EventEmitter {
    constructor() {
        super();
        this.step = '';
    }

    checkResponse(response, successMsg) {
        if (this.step && this.step !== '') {
            console.log(`${this.step}:`);
        }

        if (!Array.isArray(response)) {
            response = [response];
        }
        try {
            response.forEach((r) => {
                if (!hasResponseErrors(r)) {
                    console.log(true, `${successMsg}`);
                } else {
                        console.log(false, JSON.stringify(r, null, 2));
                    }
            });
        }
        catch (err) {
            console.log(false, JSON.stringify(err));
        }
    }

    async command(name, organization) {
        if (!name) {
            throw new Error('In createTeam, name parameter is required.');
        }

        if (global.organization.length === 0){
            throw new Error('No organization found. Run createOrg function first.');
        }

        let o;
        let t;

        if (typeof organization === 'string') {
            let orgName = testOrgPrefix + organization;
            o = getObjectByName(global.organization, orgName);
        } else {
            o = global.organization[0];
        }

        let teams = new Teams(tops_skyline);

        try {
            this.step = 'Creating team';

            let body = {
                name: name,
                organizationId: o.id
            };

            let team = await teams.createNewTeam(parseInt(o.paymentMemberId), body);
            this.checkResponse(team, `Team ${team.name} created. / Team Id: ${team.id}`);

            team.members = []; // Create an array to store members in.
            t = team;

        } catch (err) {
            throw new Error(`Failed to create team: ${JSON.stringify(err)}`);
        } finally {
            //Update organization object in global storage to include team details.
            addTeam(global.organization, o.name, t);
            this.emit('complete');
        }
        return this;
    }
}

module.exports = createTeam;
