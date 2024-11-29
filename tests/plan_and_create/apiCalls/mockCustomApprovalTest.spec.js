const { test } = require('@playwright/test');
const createUser = require('../../../custom-commands/createUser');
const getFixture = require('../../../custom-commands/getFixture');
const tearDown = require('../../../custom-commands/tearDown');
const createOrg = require('../../../custom-commands/createOrg');
const addSocialToOrg = require('../../../custom-commands/addSocialToOrg');
const addUserToOrg = require('../../../custom-commands/addUserToOrg');
const modifySocialProfilePermissions = require('../../../custom-commands/modifySocialProfilePermissions');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Sample CA test: Add user & Update permissions : ', async ({ page }) => {
	let orgName = 'playwright_org_ca_' + Math.floor(Math.random() * 10000);
	const createNewUser = new createUser();
	const addFixture = new getFixture();
	const createNewOrg = new createOrg();
	const addSocialNetwork = new addSocialToOrg();
	const addUserToNewOrg = new addUserToOrg();
	const updateSNPermissions = new modifySocialProfilePermissions();

	await addFixture.command('pw_enterprise_test_ca', 'plan_create_enterprise', false, 300);
	await addFixture.command('test_x_acc1','twitter', false, 240);
	await createNewUser.command('pw_test_ca');
	await createNewOrg.command(orgName);
	await addUserToNewOrg.command('pw_test_ca');
	await addSocialNetwork.command('test_x_acc1');
	await updateSNPermissions.command('SN_LIMITED', 'test_x_acc1', 'pw_test_ca');

	await page.waitForTimeout(2000);
});
