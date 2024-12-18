const events = require('events');
const SocialProfiles = require('hsapi').som;

const { som_bridge, testOrgPrefix, hasResponseErrors, getObjectByName  } = require('../globals.js');

/**
 * @param  {string}    socialProfile   Social Network name, eg. acc1 in .getFixture('acc1', 'twitter', true))
 * @param  {string}    organization    Organization to add to, defaults to first added. (optional)
 *
 * @return {function}  this         Allows to chain commands
 */

class addSocialToOrg extends events.EventEmitter {
	constructor() {
		super();
		this.step = '';
	}

	async command(socialProfile, organization) {
		let s;
		let o;
		let response = [];

		try {
			if (!socialProfile || typeof (socialProfile) != 'string') {
				throw new Error('Please specify a social profile to add to the organization.');
			}

			s = getObjectByName(global.fixture, socialProfile);

			if (!s.isSocialProfile) {
				throw new Error('Fixture specified is not a Social Profile.');
			}

			if ((!organization) && (global.organization.length === 0)){
				throw new Error('No organization found. Please create one using createOrg().');
			}

			if (typeof organization === 'string') {
				let orgName = testOrgPrefix + organization;
				o = getObjectByName(global.organization, orgName);
			} else {
				o = global.organization[0];
			}

			let socialProfiles = new SocialProfiles(som_bridge);

			console.log('Adding social profile to organization:');

			response = await socialProfiles.addSocialProfile(
				s.socialProfile.userId,
				s.socialProfile.username,
				s.socialProfile.type,
				s.socialProfile.auth1,
				s.socialProfile.auth2,
				{
					organizationId: o.id,
					externalId: s.socialProfile.userId
				});
		} catch (err) {
			console.log('Error adding social network to org:', JSON.stringify(err));
			throw new Error(err);
		} finally {
			if (!hasResponseErrors(response)) {
				s.socialProfile.socialProfileId = response.socialProfileId;
				s.socialProfile.isSecurePost = response.isSecurePost;
				s.socialProfile.isReauthRequired = response.isReauthRequired;
				console.log(true, `Social profile ${s.socialProfile.username} has been added to ${o.name} with Org Id: ${o.id}`);
			} else {
				console.log('Error adding social network to org:', JSON.stringify(response));
			}
			this.emit('Complete');
		}
		return this;
	}
}

module.exports = addSocialToOrg;
