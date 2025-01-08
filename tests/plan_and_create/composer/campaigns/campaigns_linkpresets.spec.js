const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../../pages/login');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const createOrg = require('../../../../custom-commands/createOrg');
const addSocialToOrg = require('../../../../custom-commands/addSocialToOrg');
const {getObjectByName} = require('../../../../globals');
const {PlannerPage} = require('../../../../pages/planandcreate/planner');
const {ComposePage} = require('../../../../pages/planandcreate/compose');
const {MemberOverViewPage} = require('../../../../pages/memberOverview');
const {CampaignsCreatePage} = require('../../../../pages/planandcreate/campaignsCreate');
const {CampaignsManagePage} = require('../../../../pages/campaignsManage');
const { LinkPresetsCreatePage } = require('../../../../pages/planandcreate/linkPresetsCreate');

const CREATE_LINK_PRESET = '+ Create a new preset';
const LINK_SHORTENER = 'Ow.ly';
const URL = 'http://blog.hootsuite.com';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify campaign creation along with link presets', async ({ page }) => {
	const addFixture = new getFixture();
	const createNewOrg = new createOrg();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const memberPage = new MemberOverViewPage(page);
	const campaignManagePage = new CampaignsManagePage(page);
	const campaignPage = new CampaignsCreatePage(page);
	const linkPresetsCreatePage = new LinkPresetsCreatePage(page);

	const orgName = 'Campaign_Creation_link_presets' + Math.floor(Math.random() * 10000);
	const campaign_name= `Link_presets ${Date.now()}`;
	const composeText = `Campaigns Test Message ${URL} ${Date.now()}`;
	const presetName= `Campaigns preset ${Date.now()}`;

	await test.step('Setup test user and accounts', async () => {
		await addFixture.command('campaign_link_presets', 'plan_create_enterprise', false, 300);
		await addFixture.command('tw_acc1','twitter', false, 300);
		await createNewOrg.command(orgName);
		const addSocialNetwork = new addSocialToOrg();
		await addSocialNetwork.command('tw_acc1');
	});

	await test.step('Login as an enterprise user', async () => {
		await loginPage.signInSkipOnboarding('campaign_link_presets');
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

	await test.step('Create and add a link preset', async () => {
		await campaignPage.clickLinkPresetsDropdown();
		await campaignPage.selectLinkPresetByName(CREATE_LINK_PRESET);
		await linkPresetsCreatePage.setPresetName(presetName);
		await linkPresetsCreatePage.clickLinkShortenerDropdown();
		await linkPresetsCreatePage.selectMenuItemByName(LINK_SHORTENER);
		await linkPresetsCreatePage.clickLinkTrackerDropdown();
		await linkPresetsCreatePage.selectMenuItemByName('Custom');
		await linkPresetsCreatePage.clickSubmitButton();
		await campaignPage.clickLinkPresetsDropdown();
		await campaignPage.selectLinkPresetByName(presetName);
	});

	await test.step('Create the campaign', async () => {
		await campaignPage.selectCreateCampaignButton();
	});

	await test.step('Verify campaign in list view', async () => {
		await campaignManagePage.verifyCampaignExists(campaign_name);
	});

	await test.step('Close campaign page and Navigate to composer', async () => {
		await campaignManagePage.closeCampaignsManageModal();
		await memberPage.visitMember();
		await composePage.selectComposeButton();
	});

	await test.step('Select campaign in NC dropdown', async () => {
		await composePage.openCampaignDropdown();
		await composePage.selectCampaign(campaign_name);
	});

	await test.step('Verify campaign in composer', async () => {
		await expect(composePage.campaignDropdown).toHaveText(campaign_name);
	});

	await test.step('Verify twitter account is selected', async () => {
		await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, 'tw_acc1').username);
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(composeText);
		await composePage.verifyTwitterPreview('Campaigns Test Message');
	});

	await test.step('Verify campaign was selected', async () => {
		await expect(composePage.campaignDropdown).toHaveText(campaign_name);
		await expect(composePage.editCustomLinkSettingsButton).toBeVisible();
	});
});
