const getFixture = require("../custom-commands/getFixture");
const createOrg = require("../custom-commands/createOrg");
const addSocialToOrg = require("../custom-commands/addSocialToOrg");
const {LoginPage} = require("../pages/login");
exports.SetUpAndLoginAsEnterpriseUser = class SetUpAndLoginAsEnterpriseUser {
    async setUpAndLoginAsEnterpriseUser(org, page, user, networks) {
        const addFixture = new getFixture();
        const createNewOrg = new createOrg();
        const addSocialNetwork = new addSocialToOrg();
        const loginPage = new LoginPage(page);
        await addFixture.command(user, 'enterprise', false, 300);

        for (const [key, value] of networks.entries()) {
            console.log(`Key: ${key}, Value: ${value}`);
            await addFixture.command(`${value}`, `${key}`, false, 300);
        }

        await createNewOrg.command(org);

        for (const [key, value] of networks.entries()) {
            console.log(`Key: ${key}, Value: ${value}`);
            await addSocialNetwork.command(`${value}`);
        }

        await loginPage.signInSkipOnboarding(user);
    }
}
