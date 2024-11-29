const { test,expect } = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown.js');
const { LoginPage } = require('../../../../pages/login.js');
const {MemberOverViewPage} = require('../../../../pages/memberOverview');
const createUser = require('../../../../custom-commands/createUser');
const createTeam = require('../../../../custom-commands/createTeam');
const getFixture = require('../../../../custom-commands/getFixture');
const createOrg = require('../../../../custom-commands/createOrg');
const addSocialToOrg = require('../../../../custom-commands/addSocialToOrg');
const { SnProfilesSettingPage } = require('../../../../pages/snProfileSettings');
let email;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify team level custom approval settings', async ({page}) => {
	let orgName = 'CA_Team' + Math.floor(Math.random() * 10000);
	const createNewUser = new createUser();
	const addFixture = new getFixture();
	const createNewOrg = new createOrg();
	const createNewTeam = new createTeam();
	const loginPage = new LoginPage(page);
	const memberPage = new MemberOverViewPage(page);
	const snProfileSettings = new SnProfilesSettingPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('pw_ca_team', 'plan_create_enterprise', false, 300);
		await addFixture.command('ca_team_tw','twitter', false, 240);
		await createNewUser.command('pw_user_ca');
		await createNewOrg.command(orgName);
		const addSocialNetwork = new addSocialToOrg();
		await addSocialNetwork.command('ca_team_tw');
		email = global.member[1].email;
		await createNewTeam.command('Publish Team');
	});

	await test.step('Login in as test enterprise user', async () => {
		await loginPage.signIn('pw_ca_team');
	});

	await test.step('Navigate to user member page', async () => {
		await memberPage.visitMember();
	});

	await test.step('Add a new team member', async () => {
		await expect(memberPage.showTeamsBtn).toBeVisible();
		await memberPage.showTeamsBtn.click();
		await expect(memberPage.addMemberDropDownBtn).toBeVisible();
		await memberPage.addMemberDropDownBtn.click();
		await expect(memberPage.addNewMemberBtn).toBeVisible();
		await memberPage.addNewMemberBtn.click();
		await expect(memberPage.addMemberToOrgBtn).toBeVisible();
		await memberPage.emailInput.fill(email);
		await memberPage.inviteMessageInput.fill('Optional Message.');
	});

	await test.step('Add a new team member to team', async () => {
		page.on('dialog', async dialog => {
			await dialog.accept();
		});
		await expect(page.locator('._popupListTeam ._plusAction')).toBeVisible();
		await page.locator('._popupListTeam ._plusAction').click();
		await memberPage.teamSelector('Publish Team');
		await memberPage.createBtn.click();
		await expect(memberPage.invitePopup).not.toBeVisible();
	});

	await test.step('Go to member page', async () => {
		await memberPage.visitMember();
	});

	await test.step('Add team name to social network', async () => {
		await expect(snProfileSettings.selectSocialNetworksBtn).toBeVisible();
		await snProfileSettings.selectSocialNetworksBtn.click();
		await expect(snProfileSettings.selectTeamTab).toBeVisible();
		await snProfileSettings.selectTeamTab.click();
		await expect(snProfileSettings.addTeamPlusIcon).toBeVisible();
		await snProfileSettings.addTeamPlusIcon.click();
		await expect(snProfileSettings.selectTeamFromMenuDropDown).toBeVisible();
		await snProfileSettings.selectTeamFromMenuDropDown.click();
		await page.waitForTimeout(1000); // Wait for callout to disappear
	});

	await test.step('Adding team member as 1st level approval for social network', async () => {
		await snProfileSettings.openSnProfileSettingsTab();
		await snProfileSettings.verifyDefaultCustomApprovals();
		await snProfileSettings.selectEditCustomApprovalButton();
		await snProfileSettings.addFirstLevelCustomApproval('pw_user_ca - Publish Team');
		await snProfileSettings.saveFirstLevelCustomApproval();
	});
});
