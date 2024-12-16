//Test to duplicate apost in planner with tags
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture.js');
const createOrg = require('../../../../custom-commands/createOrg.js');
const addSocialToOrg = require('../../../../custom-commands/addSocialToOrg.js');
const { getObjectByName } = require('../../../../globals.js');
const { LoginPage } = require('../../../../pages/login.js');
const { PlannerPage } = require('../../../../pages/planandcreate/planner.js');
const { ComposePage } = require('../../../../pages/planandcreate/compose.js');
const { TagComponentPage } = require('../../../../pages/planandcreate/tagComponent');
const tearDown = require('../../../../custom-commands/tearDown.js');

let memberId, fbAccount;
test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Duplicate a post in planner with tags', async ({ page }) => {
	const addFixture = new getFixture();
	const createNewOrg = new createOrg();
	const addSocialNetwork = new addSocialToOrg();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);
	const composePage = new ComposePage(page);
	const tagComponentPage = new TagComponentPage(page);

	let orgName = 'DuplicatePost_' + Math.floor(Math.random() * 10000);
	let tagText = 'Schedule a post to duplicate and include tags ' + Math.floor(Math.random() * 1000);
	let tag1 = 'PlannerTag1';
	let tag2 = 'PlannerTag2';

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('duplicate_post', 'plan_create_enterprise', false, 300);
		await addFixture.command('fb_duplicatePost', 'plan_create_facebookpage', false, 300);
		await createNewOrg.command(orgName);
		await addSocialNetwork.command('fb_duplicatePost');
		memberId = global.member[0].memberId;
		fbAccount = getObjectByName(global.fixture, 'fb_duplicatePost').socialProfile.username;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInSkipOnboarding('duplicate_post');
	});

	await test.step('Hide native posts & recommended times', async () => {
		await plannerPage.hideNativePosts(memberId);
		await plannerPage.hideRecommendedTimes(memberId);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
		await composePage.verifySocialProfileSelected(fbAccount);
	});

	await test.step('Upload an image', async () => {
		await expect(composePage.emptyFacebookPreview).toBeVisible();
		await composePage.uploadMediaFile('test_data/publisher/images');
		await expect(composePage.facebookPreviewSingleImage, 'Facebook preview is updated with image').toBeVisible();
		await expect(composePage.facebookPreviewSingleImage).toHaveAttribute('src', /staging/);
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(tagText);
		await composePage.verifyFacebookPreview(tagText);
	});

	await test.step('Open manage tags page', async () => {
		await tagComponentPage.selectEditTagsButton();
		await tagComponentPage.selectManageTagsButton();
	});

	await test.step(`Create ${tag1} from tag manager`, async () => {
		await tagComponentPage.openCreateTagModal();
		await tagComponentPage.enterTagName(tag1);
		await tagComponentPage.clickTagModalCreateButton();
	});

	await test.step(`Create ${tag2} from tag manager`, async () => {
		await tagComponentPage.openCreateTagModal();
		await tagComponentPage.enterTagName(tag2);
		await tagComponentPage.clickTagModalCreateButton();
		await tagComponentPage.closeTagManager();
	});

	await test.step('Add tags to the post', async () => {
		await tagComponentPage.tagInputArea.click();
		await tagComponentPage.selectTag(tag1);
		await expect(tagComponentPage.inputTag).toContainText(tag1);
		await tagComponentPage.selectTag(tag2);
		await tagComponentPage.dismissTagPopoverList();
		await tagComponentPage.selectApplyTagButton();
	});

	await test.step('Schedule the post', async () => {
		await composePage.schedule();
	});

	await test.step('Verify scheduled message in planner', async () => {
		await plannerPage.verifyScheduledMessageInCurrentOrNextWeek(tagText);
		await expect(composePage.feCallOuts).not.toBeVisible();
	});

	await test.step('Duplicate the scheduled message', async () => {
		await plannerPage.showPreviewPane(tagText);
		await page.waitForTimeout(1500);
		await plannerPage.duplicateFromPreviewPane();
	});

	await test.step('Verify preview on composer', async () => {
		await expect(composePage.composeScreen).toBeVisible();
		await composePage.verifyFacebookPreview(tagText);
	});

	await test.step('Verify image & tags retained when duplicating a post', async () => {
		await expect(tagComponentPage.tagDisplayArea).toHaveText(`${tag1}, ${tag2}`);
		await expect(composePage.facebookPreviewSingleImage).toHaveAttribute('src', /staging/);
	});

	await test.step('Close the duplicate post', async () => {
		await composePage.exitComposer();
		await expect(composePage.confirmationCancelButton).toBeVisible();
		await composePage.confirmationCancelButton.click();
	});

	await test.step('Delete the post', async () => {
		await plannerPage.deleteFromPreviewPane();
	});
});
