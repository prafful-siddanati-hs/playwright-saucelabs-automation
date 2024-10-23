const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { TagComponentPage } = require('../../../../pages/planandcreate/tagComponent');
const getFixture = require('../../../../custom-commands/getFixture');
const {DraftsPage} = require('../../../../pages/planandcreate/drafts');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Create draft for FB and LI with target audience', async ({ page }) => {
	const composeBasicText = 'Test FB and LI Target' + ` ${Math.floor(Math.random() * 100)}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const tagComponentPage = new TagComponentPage(page);
	const draftsPage = new DraftsPage(page);
	const fbAccount = 'Hoot_LT';
	const liCompanyAccount = 'DevtestCo';

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('draft_target', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro test user', async () => {
		await loginPage.signInAsProUser('draft_target');
	});

	await test.step('Navigate to drafts page', async () => {
		await draftsPage.visit();
		await expect(page.locator('.vk-Planner [aria-label="Post volume graphs"]')).toBeVisible();
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select linkedin and facebook accounts from profile picker', async () => {
		await composePage.profileDropDown.hover();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.searchSocialProfile(fbAccount);
		await composePage.searchSocialProfile(liCompanyAccount);
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyLinkedInPreview).toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
	});

	await test.step('Write a message and verify linkedin and facebook preview', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyFacebookPreview(composeBasicText);
		await composePage.verifyLinkedInPreview(composeBasicText);
	});

	await test.step('Add tag to draft message', async () => {
		await tagComponentPage.selectEditTagsButton();
		await tagComponentPage.selectTag('a');
		await tagComponentPage.dismissTagPopoverList();
		await tagComponentPage.selectApplyTagButton();
		await expect(tagComponentPage.tagDisplayArea).toHaveText('a');
	});

	await test.step('Select facebook tab and add FB target audience', async () => {
		await expect(composePage.facebookPageTab).toBeVisible();
		await composePage.facebookPageTab.click();
		await composePage.selectAddFBTargetAudienceButton();
		await composePage.setFBCountryTargetAudience('Canada');
		await composePage.selectApplyTargetAudienceButton();
		await expect(composePage.appliedTargetValue).toContainText('Canada');
	});

	await test.step('Select linkedin tab and add li target audience', async () => {
		await expect(composePage.linkedInTab).toBeVisible();
		await composePage.linkedInTab.click();
		await composePage.selectAddLITargetAudienceButton();
		await composePage.setLIAudienceLanguage('English');
		await expect(composePage.targetingEditModalAddButton).toBeVisible();
		await composePage.targetingEditModalAddButton.click();
		await expect(composePage.appliedTargetValue).toContainText('English');
	});

	await test.step('Save as draft and verify its preview on draft page', async () => {
		await composePage.saveDraft();
		await expect(draftsPage.summary.first()).toContainText(composeBasicText);
	});

	await test.step('Select created draft and verify its preview on side pane', async () => {
		await draftsPage.cardList.first().click();
		await expect(draftsPage.previewMessageText).toHaveText(composeBasicText);
		await expect(draftsPage.tagContainerText).toHaveText('a');
	});

	await test.step('Delete draft from side pane', async () => {
		await expect(draftsPage.deleteButtonOnSidePane).toBeVisible();
		await draftsPage.deleteButtonOnSidePane.click();
		await draftsPage.confirmationModalSubmitButton.click();
		await page.waitForTimeout(500);
	});
});
