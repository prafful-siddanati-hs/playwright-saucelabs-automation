const events = require('events');
const SocialProfiles = require('hsapi').som;
let MemberPermissions = require('hsapi').topsService;

const { som_bridge, tops_skyline, hasResponseErrors, getObjectByName } = require('../globals.js');

/**
* Function to change the users permissions on a social profile within an Enterprise Org.
*
* @param   {string}        permissionPreset   The permissions you want to change the user to. E.g. SN_LIMITED
* @param   {string|object} socialProfile      The social profile you are changing.
* @param   {string|object} member             The hootsuite member who's permissions you are changing.
*
* @return  {function}  this Returning this allows commands to be chained
*/

class modifySocialProfilePermissions extends events.EventEmitter {
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

		response.forEach((r) => {
			if (!hasResponseErrors(r)) {
				console.log(true, `${successMsg}`);
			} else {
				console.log(false, JSON.stringify(r, null, 2));
			}
		});
	}

	async command(permissionPreset, socialProfile, member) {
		let socialProfiles = new SocialProfiles(som_bridge);
		let memberPermissions = new MemberPermissions(tops_skyline);
		let permissionPresets = [
			'SN_LIMITED',
			'SN_DEFAULT',
			'SN_ADVANCED'
		];

		if (permissionPresets.indexOf(permissionPreset) === -1) {
			throw new Error(`'${permissionPreset}' is not a valid preset. Options are ${permissionPresets}`);
		}

		if (global.organization.length === 0) {
			throw new Error('You need an organization to use permissions. Call createOrg() first.');
		}

		if ((!member) && (global.member.length === 0)) {
			throw new Error('No member specified.');
		}

		//Member can be specified by name or by passing in member object.
		let user;

		if (typeof member === 'string') {
			user = getObjectByName(global.member, member);
		} else {
			throw new Error('Unexpected type of member. Should be a string.');
		}

		if (!socialProfile) {
			throw new Error('No social profile specified.');
		}

		//Social Profile can be specified by name or by passing the fixture object.
		let profile;

		if (typeof socialProfile === 'string') {
			profile = getObjectByName(global.fixture, socialProfile).socialProfile;
		} else {
			throw new Error('Unexpected type for social profile. Should be object or string.');
		}

		let optionalData = {
			userId: profile.userId
		};

		try {
			console.log(`Modifying ${user.name}(${user.memberId})'s permissions for ${profile.username}`);

			this.step = 'Get social profile';
            
			let socialProfileResult = await socialProfiles.getSocialProfile(profile.type, optionalData);
                
			this.checkResponse(socialProfileResult, 'Found social profile');

			this.step = 'Changing permissions for social profile';
            
			let socialProfileId = socialProfileResult[Object.keys(socialProfileResult)[0]].socialProfileId;
			let memberResult = memberPermissions.editSocialProfilePermissions(parseInt(user.memberId), parseInt(socialProfileId), {permissionPreset: permissionPreset});
			this.checkResponse(memberResult, `Changed permissions to ${permissionPreset}`);
		} catch (err) {
			console.log(`\nERROR: ${err}.\n`);
		} finally {
			this.emit('complete');
		}
		return this;
	}
}

module.exports = modifySocialProfilePermissions;
