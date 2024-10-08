const {test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const {DraftsPage} = require('../../../../pages/planandcreate/drafts');
let memberId, userName;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Save draft with mixed media using composer', async ({page}) => {
	const mediaText = `Test mixed media ${Math.floor(Math.random() * 100)}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const draftsPage = new DraftsPage(page);

	await test.step('Setup user', async () => {
		await addFixture.command('draft_mixed_media', 'pro_user_composer', true, 300);
		memberId = global.member[0].memberId;
		userName = getObjectByName(global.fixture, 'draft_mixed_media').username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('draft_mixed_media');
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

	await test.step('Attach image and gif from media library', async () => {
		await composePage.openMediaLibrary();
		await composePage.attachImageFromMediaLibrary(1);
		await expect(composePage.mediaOverLay).toHaveCount(1);
		await composePage.selectGiphyInMediaLibrary();
		await composePage.attachImageFromMediaLibrary(1);
		await expect(composePage.mediaOverLay).toHaveCount(2);
	});

	await test.step('Upload a video and verify its preview', async () => {
		await composePage.uploadMediaFile('test_data/publisher/videos/', 'test_data/publisher/videos/video_2.mp4');
		await expect(composePage.mediaOverLay).toHaveCount(3);
	});

	await test.step('Write a message, close media library and verify preview', async () => {
		await composePage.writeMessage(mediaText);
		await composePage.closeMediaLibrary();
		await composePage.verifyGenericPreview(mediaText);
		await composePage.verifyGenericImagePreview();
	});

	await test.step('Save draft and verify it on drafts page', async () => {
		await composePage.saveDraft();
		await expect(draftsPage.draftItem).toHaveCount(1);
		await expect(draftsPage.userName).toContainText('No account');
		await expect(draftsPage.summary).toContainText(mediaText);
		await expect(page.getByTestId('CreationDetails')).toContainText(userName);
	});

	await test.step('Select created draft and verify its preview on side pane', async () => {
		await draftsPage.cardList.first().click();
		await expect(draftsPage.editButtonOnSidePane).toBeVisible();
		await expect(draftsPage.previewMessageText).toHaveText(mediaText);
		await expect(draftsPage.previewMedia).toBeVisible();
	});

	await test.step('Delete created draft via API', async () => {
		await draftsPage.deleteDraftsViaApi(memberId);
		await page.waitForTimeout(500);
	});
});
