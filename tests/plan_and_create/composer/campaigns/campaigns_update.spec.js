const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../../pages/login');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const createOrg = require('../../../../custom-commands/createOrg');
const addSocialToOrg = require('../../../../custom-commands/addSocialToOrg');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { MemberOverViewPage } = require('../../../../pages/memberOverview');
const { CampaignsCreatePage } = require('../../../../pages/planandcreate/campaignsCreate');
const { CampaignsManagePage } = require('../../../../pages/campaignsManage');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify campaign creation and edit it', async ({ page }) => {
	const addFixture = new getFixture();
	const createNewOrg = new createOrg();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const memberPage = new MemberOverViewPage(page);
	const campaignManagePage = new CampaignsManagePage(page);
	const campaignPage = new CampaignsCreatePage(page);

	const orgName = 'Campaign_Edit' + Math.floor(Math.random() * 10000);
	const campaign_name= `Campaign Edit ${Date.now()}`;

	await test.step('Setup test user and accounts', async () => {
		await addFixture.command('campaign_edit', 'plan_create_enterprise', false, 300);
		await addFixture.command('tw_acc','twitter', false, 300);
		await createNewOrg.command(orgName);
		const addSocialNetwork = new addSocialToOrg();
		await addSocialNetwork.command('tw_acc');
	});

	await test.step('Login as an enterprise user', async () => {
		await loginPage.signInSkipOnboarding('campaign_edit');
	});

	await test.step('Navigate to user member page', async () => {
		await memberPage.visitMember();
	});

	await test.step('Select campaign button on member page ', async () => {
		await memberPage.selectCampaignsButton();
	});

	await test.step('Open Campaigns create view', async () => {
		await expect(campaignManagePage.noCampaignsMessage).toBeVisible();
		await campaignManagePage.selectCreateCampaignButton();
	});

	await test.step('Set campaign name', async () => {
		await campaignPage.setCampaignName(campaign_name);
	});

	await test.step('Set the date range', async () => {
		await campaignPage.selectDefaultDateRange();
		await expect(await campaignPage.createButton).toBeEnabled();
	});

	await test.step('Create the campaign', async () => {
		await campaignPage.selectCreateCampaignButton();
	});

	await test.step('Verify campaign in list view', async () => {
		await campaignManagePage.verifyCampaignExists(campaign_name);
	});

	await test.step('Open the campaign update view', async () => {
		await campaignManagePage.editCampaign(campaign_name);
	});

	await test.step('Edit the campaign ', async () => {
		await campaignPage.setCampaignName(campaign_name + '--edit');
		await campaignPage.extendDateRange();
		await campaignPage.clickCreateCampaignButton();
	});

	await test.step('Verify campaign was updated', async () => {
		await campaignManagePage.verifyCampaignExists(campaign_name + '--edit');
	});

	await test.step('Archive the campaign', async () => {
		await campaignManagePage.toggleCampaignArchive(campaign_name + '--edit', true);
	});

	await test.step('Verify campaign was archived', async () => {
		await campaignManagePage.verifyCampaignArchiveStatus(campaign_name + '--edit');
		await page.waitForTimeout(2000);
	});

	await test.step('Un-archive the campaign', async () => {
		await campaignManagePage.toggleCampaignArchive(campaign_name + '--edit', false);
	});

	await test.step('Verify campaign was un-archived', async () => {
		await campaignManagePage.verifyCampaignArchiveStatus(campaign_name + '--edit', false);
	});

	await test.step('Open New Compose', async () => {
		await campaignManagePage.closeCampaignsManageModal();
		await composePage.selectComposeButton();
	});

	await test.step('Select campaign in NC dropdown', async () => {
		await composePage.openCampaignDropdown();
		await composePage.selectCampaign(campaign_name);
	});

	await test.step('Verify campaign in composer', async () => {
		await expect(composePage.campaignDropdown).toHaveText(campaign_name + '--edit');
	});
});
