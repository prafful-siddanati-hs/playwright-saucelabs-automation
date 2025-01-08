const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../../pages/login');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const createOrg = require('../../../../custom-commands/createOrg');
const addSocialToOrg = require('../../../../custom-commands/addSocialToOrg');
const { TagManagerPage } = require('../../../../pages/tagManager');
const { TagComponentPage } = require('../../../../pages/planandcreate/tagComponent');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { MemberOverViewPage } = require('../../../../pages/memberOverview');
const { CampaignsCreatePage } = require('../../../../pages/planandcreate/campaignsCreate');
const { CampaignsManagePage } = require('../../../../pages/campaignsManage');

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
	const tagsComponent = new TagComponentPage(page);
	const tagsManager = new TagManagerPage(page);

	const orgName = 'Campaign_Tags' + Math.floor(Math.random() * 10000);
	const campaign_name= `Campaign with Tags ${Date.now()}`;
	const tag1 = 'Campaigns Tag1';
	const tag2 = 'Campaigns Tag2';

	await test.step('Setup test user and accounts', async () => {
		await addFixture.command('campaign_tags', 'plan_create_enterprise', false, 300);
		await addFixture.command('tw1','twitter', false, 300);
		await createNewOrg.command(orgName);
		const addSocialNetwork = new addSocialToOrg();
		await addSocialNetwork.command('tw1');
	});

	await test.step('Login as an enterprise user', async () => {
		await loginPage.signInSkipOnboarding('campaign_tags');
	});

	await test.step('Navigate to user member page', async () => {
		await memberPage.visitMember();
	});

	await test.step('Create new tags from member page', async () => {
		await tagsManager.visitTagManager();
		await tagsManager.openCreateTagModal();
		await tagsManager.inputTagNameOnCreateModal(tag1);
		await tagsManager.clickCreateButtonOnCreateTagModal();
		await tagsManager.waitForCreateTagModalToClose();
		await tagsManager.openCreateTagModal();
		await tagsManager.inputTagNameOnCreateModal(tag2);
		await tagsManager.clickCreateButtonOnCreateTagModal();
		await tagsManager.waitForCreateTagModalToClose();
		await tagsManager.closeTagManager();
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

	await test.step('Add tags to campaign', async () => {
		await tagsComponent.clickAddTagButton();
		await tagsComponent.clickTagInputButton();
		await tagsComponent.selectTagOnCampaignPage(tag1);
		await tagsComponent.selectTagOnCampaignPage(tag2);
		await expect(page.locator(`//*[contains(@class, "-tagEditArea")]//*[contains(@class, "vk-PillsInputWrapper")]//*[text()="${tag1}"]`)).toBeVisible();
		await expect(page.locator(`//*[contains(@class, "-tagEditArea")]//*[contains(@class, "vk-PillsInputWrapper")]//*[text()="${tag2}"]`)).toBeVisible();
	});

	await test.step('Delete a tag', async () => {
		await tagsComponent.removeTagOnCampaignPage(tag1);
		await expect(page.locator(`//*[contains(@class, "-tagEditArea")]//*[contains(@class, "vk-PillsInputWrapper")]//*[text()="${tag1}"]`)).not.toBeVisible();
		await expect(page.locator(`//*[contains(@class, "-tagEditArea")]//*[contains(@class, "vk-PillsInputWrapper")]//*[text()="${tag2}"]`)).toBeVisible();
		await expect(tagsComponent.manageTagsButton).toBeVisible();
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

	await test.step('Verify campaign in selected', async () => {
		await expect(composePage.campaignDropdown).toHaveText(campaign_name);
		await expect(tagsComponent.tagDisplayArea).toHaveText(tag2);
	});
});
