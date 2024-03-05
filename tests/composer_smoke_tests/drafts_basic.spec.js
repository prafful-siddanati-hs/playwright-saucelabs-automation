const { test, expect} = require('@playwright/test');
const tearDown = require('../../custom-commands/tearDown');
const {ComposePage} = require('../../pages/planandcreate/compose');
const {getObjectByName, plan_create} = require('../../globals');
const {LoginPage} = require('../../pages/login');
const getFixture = require('../../custom-commands/getFixture');
const {DraftPage} = require('../../pages/planandcreate/drafts');

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

	await addFixture.command('draft_message', 'pro_user_composer', true, 300);

	const profile = getObjectByName(global.fixture, 'draft_message').twitter.username;
	const userName = getObjectByName(global.fixture, 'draft_message').username;
	const memberId = global.member[0].memberId;

	await loginPage.signIn('draft_message');
	await expect(page.getByRole('heading', { name: 'Welcome back,' })).toBeVisible();
	await draftPage.deleteDraftsViaApi(memberId);

	await draftPage.visit();
	await expect(draftPage.draftItem).toHaveCount(0);

	await composePage.selectComposeButton();
	await composePage.selectSocialProfile(profile);
	await composePage.verifySocialProfileSelected(profile);
	await composePage.writeMessage(draftText);
	await composePage.verifyTwitterPreview(draftText);
	await composePage.saveDraft();

	await draftPage.verifyDraftMessage(profile, draftText, userName);
	await draftPage.editDraftByContent(draftText);
	await composePage.updateDraft(draftUpdate);
	await composePage.saveChanges();

	await draftPage.verifyDraftMessage(profile, draftUpdate, userName);
	await draftPage.showPreviewPane(draftUpdate);
	await draftPage.deleteDraft(draftUpdate);
});
