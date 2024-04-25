const { test, expect } = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const {getObjectByName} = require('../../../globals');
const { LoginPage } = require('../../../pages/login');
const { ComposePage } = require('../../../pages/planandcreate/compose');
const { LinkPresetsCreatePage } = require('../../../pages/planandcreate/linkPresetsCreate');
const { LinkPresetsManagePage } = require('../../../pages/planandcreate/linkPresetsManage');
const createOrg = require('../../../custom-commands/createOrg');
const getFixture = require('../../../custom-commands/getFixture');
const URL = 'https://slack.com';
const TRACKER = 'Google Analytics';
const SHORTENER = 'Ow.ly';

/* Test to create and update link presets. */
test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Update link presets', async ({ page }) => {
	let linkPresetsOrg = 'PW_linkPreset_Org_'.concat(Math.floor(Math.random() * 1000));
	let presetName = `PW Link Preset ${Date.now()}`;
	let firstEdit = presetName.concat('--edit');
	let secondEdit = firstEdit.concat('--secondEdit');
	let linkPresetText = `Try link preset ${URL} ${Math.floor(Math.random() * 100)} `;

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const linkPresetCreatePage = new LinkPresetsCreatePage(page);
	const linkPresetsManagePage = new LinkPresetsManagePage(page);
	const createNewOrg = new createOrg();

	await test.step('Setup enterprise user & accounts', async () => {
		await addFixture.command('link_presets_update', 'enterprise_user_composer', true, 300);
		await createNewOrg.command(linkPresetsOrg);
	});

	await test.step('Login as enterprise user', async () => {
		await loginPage.signInSkipOnboarding('link_presets_update');

		const isViewVisible = await Promise.race([
			loginPage.streamsView.waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
			loginPage.welcomeSelector.waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
		]);

		expect(isViewVisible).toBeTruthy();
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select facebook page from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(getObjectByName(global.fixture, 'link_presets_update').facebookPage.username);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
	});

	await test.step('Write a message with link', async () => {
		await composePage.writeMessage(linkPresetText);
	});

	await test.step('Open link settings modal', async () => {
		await composePage.openLinkSettingsDialog();
		await expect(composePage.presetSelectDropdown).toBeVisible();
		await composePage.presetSelectDropdown.click();
	});

	await test.step('Select manage link presets', async () => {
		await expect(composePage.manageLinkPreset).toBeVisible();
		await composePage.manageLinkPreset.click();
	});

	await test.step('Open link settings management modal', async () => {
		await linkPresetsManagePage.clickCreateLinkPresetButton();
	});

	await test.step('Create a new link preset', async () => {
		await linkPresetCreatePage.setPresetName(presetName);
		await linkPresetCreatePage.setShortener(SHORTENER);
		await linkPresetCreatePage.clickCreateButton();
		await linkPresetsManagePage.verifyPresetInLinkSettings(presetName);
		await page.waitForTimeout(1000);
	});

	await test.step('Verify created preset in dropdown options', async () => {
		const createdLinkPreset = page.getByRole('option', { name: `${presetName}` });
		await linkPresetsManagePage.closeLinkPresetManage();

		await composePage.openLinkSettingsDialog();
		await expect(composePage.presetSelectDropdown).toBeVisible();
		await composePage.presetSelectDropdown.click();
		await expect(createdLinkPreset).toBeVisible();
		await expect(composePage.manageLinkPreset).toBeVisible();
		await composePage.manageLinkPreset.click();
	});

	await test.step('Edit the created preset', async () => {
		await linkPresetsManagePage.editPreset();
		await linkPresetCreatePage.setPresetName(`${firstEdit}`);
	});

	await test.step('Add a tracker to the preset', async () => {
		await linkPresetCreatePage.setTracker(TRACKER);
		await linkPresetCreatePage.setTrackingParameter(2, 'Social Network');
		await linkPresetCreatePage.clickApplyButton();
		await page.waitForTimeout(1000);
	});

	await test.step('Verify preset is updated in link settings area', async () => {
		await linkPresetsManagePage.verifyPresetInLinkSettings(firstEdit);
		await linkPresetsManagePage.closeLinkPresetManage();
	});

	await test.step('Select the new preset', async () => {
		const updatedLinkPreset = page.getByRole('option', { name: `${firstEdit}` });
		await composePage.openLinkSettingsDialog();
		await expect(composePage.presetSelectDropdown).toBeVisible();
		await composePage.presetSelectDropdown.click();
		await expect(updatedLinkPreset).toBeVisible();
		await updatedLinkPreset.click();
		await composePage.linkSettingsApplyButton.click();
	});

	await test.step('Verify link settings are applied', async () => {
		await composePage.verifyFacebookPreview(SHORTENER.toLowerCase());
		await expect(composePage.facebookPreviewText).not.toContainText(URL);
		await expect(composePage.shortenWithOwlyCaption).toContainText('--edit');
	});

	await test.step('Open manage presets area from composer', async () => {
		await expect(composePage.editAppliedLinkPreset).toBeVisible();
		await composePage.editAppliedLinkPreset.click();
		await expect(composePage.presetSelectDropdown).toBeVisible();
		await composePage.presetSelectDropdown.click();
		await expect(composePage.manageLinkPreset).toBeVisible();
		await composePage.manageLinkPreset.click();
	});

	await test.step('Change the tracking parameter', async () => {
		await linkPresetsManagePage.editPreset();
		await linkPresetCreatePage.setPresetName(`${secondEdit}`);
		await linkPresetCreatePage.setTrackingParameter(2, 'Social Profile');
		await linkPresetCreatePage.clickApplyButton();
		await page.waitForTimeout(1000);
	});

	await test.step('Verify preset is updated in link settings area', async () => {
		await linkPresetsManagePage.verifyPresetInLinkSettings(secondEdit);
		await linkPresetsManagePage.closeLinkPresetManage();
	});

	await test.step('Verify updated preset is applied on composer', async () => {
		await composePage.verifyFacebookPreview(SHORTENER.toLowerCase());
		await expect(composePage.shortenWithOwlyCaption).toContainText('--secondEdit');
	});
});
