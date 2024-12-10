const getFixture = require('../custom-commands/getFixture');
const createOrg = require('../custom-commands/createOrg');
const addSocialToOrg = require('../custom-commands/addSocialToOrg');

exports.SetUpEnterpriseUser = class SetUpEnterpriseUser {
	/**
     * @param {string} org      Name of the organization
     * @param {string} user      Name of the enterprise test user that is used to login. Eg: 'internal_comment_drafts'
     * @param {Object} networks  All the social networks in object format
	 * @param {string} customType  Type of the custom account type to pick from @see {accounts.js} , Defaults to 'plan_create_enterprise'.
	 * 							   Usage example: await userSetUp.setUpEnterpriseUser(orgName, 'identity_overview_user', accounts, 'identity_enterprise')
     */
	async setUpEnterpriseUser(org, user, networks, customType = 'plan_create_enterprise') {
		const addFixture = new getFixture();
		const createNewOrg = new createOrg();
		const addSocialNetwork = new addSocialToOrg();

		try {
			await addFixture.command(user, customType, false, 300);
		} catch (addFixtureError) {
			console.error(`Error while adding fixture for ${user} with ${customType}: ${addFixtureError}`);
			throw addFixtureError;
		}

		const keys = Object.getOwnPropertyNames(networks);
		for (const key of keys) {
			for (const account_name of networks[key]) {
				try {
					console.log(`Account_type: ${key}, Account_name: ${account_name}`);
					await addFixture.command(`${account_name}`, `${key}`, false, 300);
				} catch (addFixtureError) {
					console.error(`Error while adding fixture for ${account_name} with ${key}: ${addFixtureError}`);
					throw addFixtureError;
				}
			}
		}

		try {
			await createNewOrg.command(org);
		} catch (createOrgError) {
			console.error(`Error while creating organization ${org}: ${createOrgError}`);
			throw createOrgError;
		}

		for (const key of keys) {
			for (const account_name of networks[key]) {
				try {
					console.log(`Account_type: ${key}, Account_name: ${account_name}`);
					await addSocialNetwork.command(`${account_name}`);
				} catch (addSocialNetworkError) {
					console.error(`Error while adding social network ${account_name}: ${addSocialNetworkError}`);
					throw addSocialNetworkError;
				}
			}
		}
	}
};
