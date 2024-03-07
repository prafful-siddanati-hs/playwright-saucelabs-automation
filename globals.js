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
	// Check whether HSAPI responded with error
	hasResponseErrors: function (res) {
		if (typeof res !== 'object') {
			console.log('Unable to parse response object.');
			return true;
		}
		// Check for errors in the body and non-200 status codes.
		return ((res.body && res.body.errors) || (res.statusCode && res.statusCode !== 200));
	},

	plan_create: {
		getComposeMessage: function () {
			const MESSAGE = [
				'Draft',
				'Compose',
				'D$a#t_',
				'C@mP0se',
				'12abXY!%',
				'comporTeste'
			];
			return MESSAGE[Math.floor(Math.random() * MESSAGE.length)];
		},

		mediaSearchTerms: function () {
			const SEARCH_TERM = ['dog', 'owl', 'snow', 'music', 'nature', 'bee'];
			return SEARCH_TERM[Math.floor(Math.random() * SEARCH_TERM.length)];
		},
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
     * Function to add data from createTeam to organization in global storage.
     *
     * @param {string}     globalData      Data pushed to Playwright's global.organization
     * @param {string}     organization    Name of the organization you are adding to.
     * @param {object}     team            Team to add.
     * @return {object}    storage         All accounts or the specified account.
     */
	addTeam: function (globalData, organization, team) {
		let orgFound = false;
		for (let i = 0; i < globalData.length; i++) {
			if (globalData[i].name === organization) {
				globalData[i].teams.push(team);
				orgFound = true;
				break;
			}
		}

		if(!orgFound) {
			console.log('Unable to find global organization object to add a team to.');
		}
	}
};
