const events = require('events');
const Organizations = require('hsapi').organizationsService;
const OrganizationMembers = require('hsapi').organizationMembersService;

const { tops_skyline, testOrgPrefix, isOrgSafeToDelete } = require('../globals.js');

class createOrg extends events.EventEmitter {
    constructor() {
        super();
        this.step = '';
    }

    hasResponseErrors(res) {
        if (typeof res !== 'object') {
            console.log('Unable to parse response object.');
            return true;
        }
        // Check for errors in the body and non-200 status codes.
        return ((res.body && res.body.errors) || (res.statusCode && res.statusCode !== 200));
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
                if (!this.hasResponseErrors(r)) {
                    console.log(true, `${successMsg}`);
                } else {
                    if (r.statusCode === 404 && r.method === 'DELETE') {
                        console.log(`\x1b[31mWARNING: [404] Org does not exist. url: ${r.url} \x1b[0m`);
                    }
                    else {
                        console.log(false, JSON.stringify(r, null, 2));
                    }
                }
            });
        }
        catch (err) {
            console.log(false, JSON.stringify(err));
        }
    }

    async command(name) {
        let createdOrg = {};
        let orgName = testOrgPrefix + name;

        try {
            if (!name || typeof name !== 'string') {
                throw new Error('Please enter a name for the organization.');
            }
            
            let u = (global.fixture)[0];
            
            let pwTestMemberId = parseInt(u.memberId);
            console.log("payment member", pwTestMemberId)
            let orgs = new Organizations(tops_skyline);
            let organizationMembers = new OrganizationMembers(tops_skyline);

            this.step = 'Checking user presence in existing Organizations.';
            let existingOrgs = await organizationMembers.getMemberOrgs(pwTestMemberId);

            if (typeof existingOrgs !== 'object') {
                console.log(false, `Failed to retrieve user organizations. Response: ${JSON.stringify(existingOrgs)}`);
            }

            if (existingOrgs.data.length > 0) {
                let existingOrgData = Object.values(existingOrgs.data);
    
                console.log(`Member is already in ${existingOrgData.length} orgs. Removing orgs before creating new one`);
    
                let deletedOrgs = existingOrgData.map((org) => {
                    if (isOrgSafeToDelete(org, pwTestMemberId)) {
                        console.log(`Deleting Org ${org.name}: / Org Id: ${org.id} / Payment Member Id: ${org.paymentMemberId}`);
                        return orgs.deleteOrganization(org.id, pwTestMemberId);
                    } else {
                        throw new Error(`Org safety check failed: Skipping org ${org.id} deletion`);
                    }
                });
    
                this.step = 'Deleting Organizations';
                let deleted = await Promise.all(deletedOrgs);
                this.checkResponse(deleted, 'Hootsuite organizations deleted.');
            }

            this.step = 'Creating new Organization';
            try {
                createdOrg = await orgs.createOrganization(orgName, pwTestMemberId);
                console.log(`Org Name: ${orgName} created successfully. / Org Id: ${createdOrg.id} / Payment Member Id: ${createdOrg.paymentMemberId}`);

                //Create an array to store team details
                createdOrg.teams = [];
                createdOrg.pwTestMemberId = pwTestMemberId;
            } catch (orgError) {
                console.log(orgError)
            }

            if (typeof callback === 'function') {
                callback.call(this, member);
            }
        } catch (err) {
            console.assert(err, 'Organization created successfully.')
        } finally {
            //Update global storage with organization array so that tearDown() can access it.
            if (!global.organization) {
                global.organization = []
            }
            global.organization.push(createdOrg);
            this.emit('complete');
        }
    }
};

module.exports = createOrg;
