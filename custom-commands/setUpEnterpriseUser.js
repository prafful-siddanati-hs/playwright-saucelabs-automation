const getFixture = require("../custom-commands/getFixture");
const createOrg = require("../custom-commands/createOrg");
const addSocialToOrg = require("../custom-commands/addSocialToOrg");

exports.SetUpEnterpriseUser = class SetUpEnterpriseUser {
    /**
     * @param {string} org      Name of the organization
     * @param {string} user      Name of the enterprise user
     * @param {Object} networks  All the social networks in object format
     */
    async setUpEnterpriseUser(org, user, networks) {
        const addFixture = new getFixture();
        const createNewOrg = new createOrg();
        const addSocialNetwork = new addSocialToOrg();
        await addFixture.command(user, 'enterprise', false, 300);
        const keys = Object.getOwnPropertyNames(networks);

        for (const key of keys) {
            for (const account_name of networks[key]) {
                console.log(`Account_type: ${key}, Account_name: ${account_name}`);
                await addFixture.command(`${account_name}`, `${key}`, false, 300);
            }
        }

        await createNewOrg.command(org);

        for (const key of keys) {
            for (const account_name of networks[key]) {
                console.log(`Account_type: ${key}, Account_name: ${account_name}`);
                await addSocialNetwork.command(`${account_name}`);
            }
        }
    }
}
