const { test, expect} = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const {ComposePage} = require('../../../pages/planandcreate/compose');
const {getObjectByName, plan_create} = require('../../../globals');
const {LoginPage} = require('../../../pages/login');
const getFixture = require('../../../custom-commands/getFixture');
const {DraftPage} = require('../../../pages/planandcreate/drafts');
let profile, userName, memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Create and edit draft using composer', async ({ page }) => {
	const draftText = plan_create.getComposeMessage() + ' ' + Math.floor(Math.random() * 100);
	const draftUpdate = 'Update ' + Math.floor(Math.random() * 1000);

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const draftPage = new DraftPage(page);

	await test.step('Setup user', async () => {
		await addFixture.command('draft_message', 'pro_user_composer', true, 300);
		profile = getObjectByName(global.fixture, 'draft_message').twitter.username;
		userName = getObjectByName(global.fixture, 'draft_message').username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login in as pro user', async () => {
		await loginPage.signIn('draft_message');
	});

	await test.step('Delete residual draft messages via API', async () => {
		await draftPage.deleteDraftsViaApi(memberId);
	});

	await test.step('Navigate to drafts page', async () => {
		await draftPage.visit();
		await expect(draftPage.draftItem).toHaveCount(0);
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select twitter profile from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(profile);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
	});

	await test.step('Compose and save as draft', async () => {
		await composePage.writeMessage(draftText);
		await composePage.verifyTwitterPreview(draftText);
		await composePage.saveDraft();
	});

	await test.step('Verify and edit the draft', async () => {
		await draftPage.verifyDraftMessage(profile, draftText, userName);
		await draftPage.editDraftByContent(draftText);
		await composePage.updateDraft(draftUpdate);
		await composePage.verifyTwitterPreview(draftUpdate);
		await composePage.saveChanges();
	});

	await test.step('Verify the updated draft and delete it', async () => {
		await draftPage.verifyDraftMessage(profile, draftUpdate, userName);
		await draftPage.showPreviewPane(draftUpdate);
		await draftPage.deleteDraft(draftUpdate);
	});
});
