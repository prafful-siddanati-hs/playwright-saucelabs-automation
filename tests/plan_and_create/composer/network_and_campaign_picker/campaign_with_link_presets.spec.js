const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const {plan_create} = require('../../../../globals');
let firstCampaign;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Campaign with link presets validations', async ({ page }) => {
	const composeText = `Text with link ${plan_create.getRandomUrl()}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('campaign_with_link_presets', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('campaign_with_link_presets');
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select test org from org picker', async () => {
		const orgName = await page.locator('//*[contains(@class,"vk-ComposerModal")]//*[contains(@data-testid,"list-item-clickable")]//*[@title and contains(text(),"Prafful\'s Test Org")]');

		await expect(page.locator('.vk-ComposerModal [data-testid="dropdown-container"]').first()).toBeVisible();
		await page.locator('.vk-ComposerModal [data-testid="dropdown-container"]').first().click();
		await orgName.click();
	});

	await test.step('Select first campaign from campaign picker', async () => {
		await expect(composePage.campaignPicker).toBeVisible();
		await composePage.campaignPicker.click();
		firstCampaign = await composePage.campaignListBuuton.first().innerText();
		await expect(composePage.campaignListBuuton.first()).toBeVisible();
		await composePage.campaignListBuuton.first().click();
		await expect(composePage.campaignSelected).toHaveText(firstCampaign);
	});

	await test.step('Select twitter account from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile('DeauthedTestAcc');
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
	});

	await test.step('Verify preview with text containing link', async () => {
		await composePage.writeMessage(composeText);
		await composePage.verifyTwitterPreview('Text with link');
		await composePage.verifyLinkInTwitterPreview('https://ow.ly');
	});
});
