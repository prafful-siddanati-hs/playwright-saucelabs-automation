//This test is to verify creation of drafts using multiple networks
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const {ComposePage} = require('../../../../pages/planandcreate/compose');
const {getObjectByName, plan_create} = require('../../../../globals');
const {LoginPage} = require('../../../../pages/login');
const getFixture = require('../../../../custom-commands/getFixture');
const {DraftsPage} = require('../../../../pages/planandcreate/drafts');
let twProfile, igProfile, userName, memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Create draft with multiple networks using composer', async ({ page }) => {
	const draftText = plan_create.getComposeMessage() + ' ' + Math.floor(Math.random() * 100);

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const draftsPage = new DraftsPage(page);

	await test.step('Setup user', async () => {
		await addFixture.command('draft_message', 'pro_user_composer', true, 300);
		twProfile = getObjectByName(global.fixture, 'draft_message').twitter.username;
		igProfile = getObjectByName(global.fixture, 'draft_message').instagramBusiness.username;
		userName = getObjectByName(global.fixture, 'draft_message').username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login in as pro user', async () => {
		await loginPage.signIn('draft_message');
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

	await test.step('Select twitter and instagram accounts from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twProfile);
		await composePage.selectSocialProfile(igProfile);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
	});

	await test.step('Compose message and save as draft', async () => {
		await composePage.writeMessage(draftText);
		await composePage.verifyTwitterPreview(draftText);
		await composePage.verifyInstagramPreview(draftText);
		await composePage.saveDraft();
	});

	await test.step('Verify draft preview on drafts page and edit it from side pane', async () => {
		await expect(page.getByTestId('DraftsProfileIcon')).toHaveText('2');
		await draftsPage.verifyDraftMessage(twProfile, draftText, userName);
		await draftsPage.cardList.first().click();
		await expect(draftsPage.editButtonOnSidePane).toBeVisible();
		await draftsPage.editButtonOnSidePane.click();
	});

	await test.step('Verify draft preview on composer and upload video file', async () => {
		await composePage.verifyTwitterPreview(draftText);
		await composePage.verifyInstagramPreview(draftText);
		await composePage.uploadMediaFile('test_data/publisher/videos/', 'test_data/publisher/videos/video_2.mp4');
		await expect(composePage.mediaOverLay).toBeVisible();
		await expect(composePage.twitterVideoPreviewSelector).toBeVisible();
		await composePage.verifyInstagramReelVideoPreview();
	});

	await test.step('Save changes and verify draft changes', async () => {
		await composePage.saveChanges();
		await draftsPage.verifyDraftMessage(twProfile, draftText, userName);
		await expect(page.locator('.rc-Planner [data-testid="DetailPaneRenderer"] .vk-VideoContainer')).toBeVisible();
	});

	await test.step('Delete created draft via API', async () => {
		await draftsPage.deleteDraftsViaApi(memberId);
		await page.waitForTimeout(500);
	});
});
