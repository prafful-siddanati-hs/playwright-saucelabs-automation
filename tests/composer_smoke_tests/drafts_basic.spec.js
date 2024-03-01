const { test, expect} = require('@playwright/test');
const tearDown = require('../../custom-commands/tearDown');
const {ComposePage} = require('../../pages/planandcreate/compose');
const {getObjectByName, plan_create} = require('../../globals');
const {LoginPage} = require('../../pages/login');
const createUser = require('../../custom-commands/createUser');
const getFixture = require('../../custom-commands/getFixture');
const {DraftPage} = require('../../pages/planandcreate/drafts');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Create and edit draft using composer', async ({ page }) => {
	const draftText = plan_create.getComposeMessage() + ' ' + Math.floor(Math.random() * 1000);
	const draftUpdate = 'Update ' + Math.floor(Math.random() * 1000);

	const createNewUser = new createUser();
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const draftPage = new DraftPage(page);

	await createNewUser.command('pw_draft', 'professional');
	await addFixture.command('draft_message','twitter', true, 180);

	const profile = getObjectByName(global.fixture, 'draft_message').username;
	const memberId = global.member[0].memberId;

	await loginPage.signIn('pw_draft');
	await loginPage.verifySocialNetwork(profile);
	await draftPage.deleteDraftsViaApi(memberId);

	await draftPage.visit();
	await expect(draftPage.draftItem).toHaveCount(0);

	console.log(draftText, 'text');

	await composePage.selectComposeButton();
	await composePage.exitButton.click();
	await composePage.verifySocialProfileSelected(profile);
	await composePage.writeMessage(draftText);
	await composePage.verifyTwitterPreview(draftText);
	await composePage.saveDraft();

	await draftPage.verifyDraftMessage(profile, draftText, 'pw_draft');
	await draftPage.editDraftByContent(draftText);
	await composePage.updateDraft(draftUpdate);
	await composePage.saveChanges();

	await draftPage.verifyDraftMessage(profile, draftUpdate, 'pw_draft');
	await draftPage.showPreviewPane(draftUpdate);
	await draftPage.deleteDraft(draftUpdate);
});
