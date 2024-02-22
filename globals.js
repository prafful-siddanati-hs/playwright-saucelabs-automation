// globals.js

module.exports = {
    som: 'https://som-staging.hootops.com:504',
    som_bridge: 'https://som-staging.hootops.com:504',
    tops_skyline: 'https://organization.staging.hootops.com',
    broker_member_service: 'https://member.staging.hootops.com',
    service_message_publishing: 'https://message-publishing.staging.hootops.com',
    service_drafts: 'https://drafts.staging.hootops.com',
    service_trail: 'https://trail.staging.hootops.com',
    launch_url_cms: 'https://www-staging.hootsuite.com',
    login_url: 'https://staging.hootsuite.com/login?lang=en',
    defaultPassword: 'Passw0rd',
    testOrgPrefix: 'TEMP_ORG_',
    isOrgSafeToDelete: function (org, memberId, testOrgPrefix) {
        const DO_NOT_DELETE_STAGING_ORG = [1866699];

        let orgInWhiteList = DO_NOT_DELETE_STAGING_ORG.includes(org.id);
        let orgNameHasPrefix = org.name.startsWith(testOrgPrefix);
        let isOrgOwner = org.paymentMemberId === memberId;

        if ((!orgInWhiteList) && orgNameHasPrefix && isOrgOwner) {
            return true;
        } else {
            console.log(`!!!ORG SAFETY CHECK FAILED!!! orgInWhiteList: ${orgInWhiteList} orgNameHasPrefix: ${orgNameHasPrefix} isOrgOwner: ${isOrgOwner}`);
            return false;
        }
    },
    // Check whether or not HSAPI responded with error
    hasResponseErrors: function (res) {
        if (typeof res !== 'object') {
            console.log('Unable to parse response object.');
            return true;
        }
        // Check for errors in the body and non-200 status codes.
        return ((res.body && res.body.errors) || (res.statusCode && res.statusCode !== 200));
    },
    /**
         * Function to get object from Playwright's global storage
         *
         * @param {string}     globalData  Data pushed to Playwright's global storage. Ex: global.fixture, global.organization etc
         * @param {string}     name        Name of the socialProfile/Org you want to get. Example: 'acc1','playwright_org_'
         * @return {object}    storage     Returns socialProfile/organization object from global storage pushed at the end of getFixture()/createOrg()
    */
    getObjectByName: function(globalData, name) {
        for (let i = 0; i < globalData.length; i++) {
            if (globalData[i].name === name) {
                return globalData[i];
            }
        }
        return `No object data found for ${name}`;
    },

    /**
     * Function to add a team into an organization.
     *
     * @param {string}     organization    Name of the organization you are adding to.
     * @param {object}     team            Team to add.
     * @return {object}    storage         All accounts or the specified account.
     */
    addTeam: function (globalData, organization, team) {

        for (let i = 0; i < globalData.length; i++) {
            if (globalData[i].organization === organization) {
                return globalData[i];
            } else {
                return 'Unable to find global organization object to add team to.';
            }
        }

        globalData.teams.push(team);
    },

    /**
     * Function to add a member into a team.
     *
     * @param {string}     organization    Name of the organization you are adding to.
     * @param {string}     team            Team to add to.
     * @param {object}     member          Member to add.
     * @return {object}    storage         All accounts or the specified account.
     */
    addTeamMember: function (organization, team, member) {
        let i = arr.findIndex((item) => {
            return item.name === organization;
        });

        if (i === -1) {
            throw new Error('Unable to find global organization object to add member to.');
        }

        let j = arr[i].teams.findIndex((item) => {
            return item.name === team;
        });

        if (j === -1) {
            throw new Error('Unable to find global team object to add member to.');
        }

        arr[i].teams[j].members.push(member);
    }
};
