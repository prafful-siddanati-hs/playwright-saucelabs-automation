const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const {plan_create} = require('../../../../globals');

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
		const orgName = page.getByRole('gridcell', { name: 'Prafful\'s Test Org' });

		await expect(page.locator('.vk-ComposerModal [data-testid="connected-org-picker-dropdown"]').first()).toBeVisible();
		await page.locator('.vk-ComposerModal [data-testid="connected-org-picker-dropdown"]').first().click();
		await orgName.click();
		await page.waitForTimeout(500); // wait for the org to load
		await expect(composePage.emptyThreadsPreview).toBeVisible();
	});

	await test.step('Verify preview with text containing link', async () => {
		await composePage.writeMessage(composeText);
		await composePage.verifyThreadsPreview('Text with link');
		await composePage.verifyLinkInThreadsPreview('https://ow.ly');
	});
});
