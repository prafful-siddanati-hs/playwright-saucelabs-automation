const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { ManageCampaignsPage } = require('../../../../pages/planandcreate/manageCampaigns');
let firstCampaign, secondCampaign;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Campaigns picker validation', async ({ page }) => {
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const manageCampaignsPage = new ManageCampaignsPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('campaign_picker', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('campaign_picker');
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select first campaign from campaign picker', async () => {
		await expect(composePage.campaignPicker).toBeVisible();
		await composePage.campaignPicker.click();
		firstCampaign = await composePage.campaignListBuuton.first().innerText();
		await expect(composePage.campaignListBuuton.first()).toBeVisible();
		await composePage.campaignListBuuton.first().click();
		await expect(composePage.campaignSelected).toHaveText(firstCampaign);
	});

	await test.step('Select second campaign from campaign picker', async () => {
		await expect(composePage.campaignPicker).toBeVisible();
		await composePage.campaignPicker.click();
		secondCampaign = await composePage.campaignListBuuton.nth(1).innerText();
		await expect(composePage.campaignListBuuton.nth(1)).toBeVisible();
		await composePage.campaignListBuuton.nth(1).click();
		await expect(composePage.campaignSelected).toHaveText(secondCampaign);
	});

	await test.step('Select manage campaign button from campaign picker', async () => {
		await expect(composePage.campaignPicker).toBeVisible();
		await composePage.campaignPicker.click();
		await expect(composePage.manageCampaignsButton).toBeVisible();
		await composePage.manageCampaignsButton.click();
	});

	await test.step('Verify manage campaign view', async () => {
		await expect(manageCampaignsPage.manageCampaignsView).toBeVisible();
		await expect(manageCampaignsPage.createCampaignButton).toBeVisible();
	});

});
