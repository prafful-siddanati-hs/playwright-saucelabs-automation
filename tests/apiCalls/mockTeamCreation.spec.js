const { test } = require('@playwright/test');
const getFixture = require('../../custom-commands/getFixture');
const tearDown = require('../../custom-commands/tearDown');
const createOrg = require('../../custom-commands/createOrg');
const createTeam = require('../../custom-commands/createTeam');
const addSocialToOrg = require('../../custom-commands/addSocialToOrg');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Create a team for enterprise user', async ({ page }) => {
	let orgName = 'pw_team_org_' + Math.floor(Math.random() * 10000);
	const addFixture = new getFixture();
	const createNewOrg = new createOrg();
	const createNewTeam = new createTeam();
	const addSocialNetwork = new addSocialToOrg();

	await addFixture.command('pw_team_test', 'enterprise', false, 240);
	await addFixture.command('test_x_team','twitter', false, 300);
	await createNewOrg.command(orgName);
	await createNewTeam.command('PW_TEAM');
	await addSocialNetwork.command('test_x_team');

	await page.waitForTimeout(2000);
});
