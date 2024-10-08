//This test to verify the draft creation with instagram account along with collaborator and media
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const {ComposePage} = require('../../../../pages/planandcreate/compose');
const {getObjectByName, plan_create} = require('../../../../globals');
const {LoginPage} = require('../../../../pages/login');
const getFixture = require('../../../../custom-commands/getFixture');
const {DraftsPage} = require('../../../../pages/planandcreate/drafts');

let profile, userName, memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Create IGB draft with media and collaborators', async ({ page }) => {
	const draftText = plan_create.getComposeMessage() + ` ${Math.floor(Math.random() * 100)}`;

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const draftsPage = new DraftsPage(page);

	await test.step('Setup user', async () => {
		await addFixture.command('draft_collab', 'pro_user_composer', true, 300);
		profile = getObjectByName(global.fixture, 'draft_collab').instagramBusiness.username;
		userName = getObjectByName(global.fixture, 'draft_collab').username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login in as pro user', async () => {
		await loginPage.signIn('draft_collab');
	});

	await test.step('Delete residual draft messages via API', async () => {
		await draftsPage.deleteDraftsViaApi(memberId);
	});

	await test.step('Navigate to drafts page', async () => {
		await draftsPage.visit();
		await expect(draftsPage.draftItem).toHaveCount(0);
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select instagram profile from profile picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(profile);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Write a message and verify instagram preview', async () => {
		await composePage.writeMessage(draftText);
		await composePage.verifyInstagramPreview(draftText);
	});

	await test.step('Upload an image file and verify media preview', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images', 'test_data/publisher/images/coffee.jpg');
		await expect(composePage.instagramPreviewSingleImage).toBeVisible();
	});

	await test.step('Add collaborator to message', async () => {
		await expect(composePage.inputCollaborators).toBeVisible();
		await composePage.inputCollaborators.pressSequentially('test');
		await composePage.inputCollaborators.press('Enter');
		await expect(composePage.collaboratorPill).toHaveText('test');
	});

	await test.step('Select save as draft and verify its preview on drafts page', async () => {
		await composePage.saveDraft();
		await expect(draftsPage.draftItem).toHaveCount(1);
		await draftsPage.verifyDraftMessage(profile, draftText, userName);
	});

	await test.step('Select created draft and verify its preview on side pane', async () => {
		await draftsPage.cardList.first().click();
		await expect(draftsPage.instagramPreviewText).toHaveText(draftText);
		await expect(draftsPage.instagramPreviewMedia).toBeVisible();
		await expect(draftsPage.instagramCollaborators).toHaveText('test');
	});

	await test.step('Edit draft to verify if collaborator is persisted', async () => {
		await expect(draftsPage.editButtonOnSidePane).toBeVisible();
		await draftsPage.editButtonOnSidePane.click();
		await expect(composePage.instagramPreviewSingleImage).toBeVisible();
		await expect(composePage.collaboratorPill).toHaveText('test');
		await expect(composePage.saveDraftButton).not.toBeVisible();
		await expect(composePage.scheduleLaterButton).toBeVisible();
		await expect(composePage.postButton).toBeVisible();
		await composePage.saveChanges();
	});

	await test.step('Delete created draft via API', async () => {
		await draftsPage.deleteDraftsViaApi(memberId);
		await page.waitForTimeout(500);
	});
});
