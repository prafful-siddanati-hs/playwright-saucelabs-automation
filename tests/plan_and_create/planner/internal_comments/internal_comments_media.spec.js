/* Test to verify internal comments can accept Image,Video & PDF files */
const { test, expect} = require('@playwright/test');
const { SetUpEnterpriseUser } = require('../../../../custom-commands/setUpEnterpriseUser');
const { LoginPage } = require('../../../../pages/login');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const { getObjectByName } = require('../../../../globals');
const { formatISO, addDays } = require('date-fns');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message');
const tearDown = require('../../../../custom-commands/tearDown');

const scheduleDate = addDays(new Date(), 1);
let enterpriseUserMemberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify internal comments can accept Image,Video & PDF files', async ({page}) => {
	let orgName = 'internal_comments_media_org_' + Math.floor(Math.random() * 10000);
	const scheduledText = 'Attach media to internal comments ' + Math.floor(Math.random() * 10000);
	const commentText = 'This is an internal comment with media attachment ';
	let accounts = {
		twitter: []
	};
	accounts.twitter.push('tw_internal_comments_media');

	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);
	const setUpEnterpriseUser = new SetUpEnterpriseUser();
	const createScheduleMessage = new scheduleV3Message();

	await test.step('Setup user & accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'internal_comment_media', accounts);
		enterpriseUserMemberId = global.member[0].memberId;
	});

	await test.step('Login as enterprise user', async () => {
		await loginPage.signInSkipOnboarding('internal_comment_media');
	});

	await test.step('Dismiss enterprise user onboarding modals', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Hide native posts & recommended times', async () => {
		await plannerPage.hideNativePosts(enterpriseUserMemberId);
		await plannerPage.hideRecommendedTimes(enterpriseUserMemberId);
	});

	await test.step('Schedule a post for enterprise user', async () => {
		await createScheduleMessage.command(
			parseInt(enterpriseUserMemberId, 10),
			{
				messages: [
					{
						socialProfileId: getObjectByName(global.fixture, 'tw_internal_comments_media').socialProfile.socialProfileId,
						text: scheduledText,
						scheduledSendTime: formatISO(scheduleDate),
					}
				]
			}
		);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
		await expect(plannerPage.approvalstab).toBeVisible(); // Check to make sure entitlement check completes
	});

	await test.step('Verify internal comments is available for enterprise user', async () => {
		await plannerPage.showPreviewPane(scheduledText);
		await plannerPage.verifyTextInPreviewPane(scheduledText);
		await expect(plannerPage.internalCommentsTab).toBeVisible();
		await plannerPage.internalCommentsTab.click();
		await expect(page.getByText('Comments will only be seen by you and your teammates. They won\'t be published.')).toBeVisible();
	});

	await test.step('Type an internal comment', async () => {
		await expect(plannerPage.internalCommentTextArea).toBeVisible();
		await plannerPage.internalCommentTextArea.click();
		await expect(plannerPage.saveInternalComment).toBeDisabled(); // Save button should be disabled
		await plannerPage.internalCommentTextArea.fill(commentText);
	});

	await test.step('Add diffrent types of media and save the internal comment', async () => {
		const filesToUpload = [ // Fixed file paths to avoid uploading large files
			'test_data/publisher/images/Art.png',
			'test_data/publisher/giphy/stay_cool.gif',
			'test_data/publisher/pdfs/single_page.pdf'
		];
		await expect(plannerPage.addInternalCommentMedia).toBeVisible();
		for (const file of filesToUpload) {
			await page.setInputFiles('[data-testid="Editor"] input[type="file"]', file);
		}
		await expect(page.locator('[aria-label="Loading"]').last()).not.toBeVisible();
		await expect(page.locator('[data-testid="Editor"] [role="group"]')).toHaveCount(3);
		await expect(plannerPage.saveInternalComment, {delay: 1500}).toBeEnabled(); // A short delay to make sure media finishes uploading
		await plannerPage.saveInternalComment.click();
	});

	await test.step('Verify attachments and actions in internal comment', async () => {
		await expect(plannerPage.internalCommentMediaDownloadButton).toHaveCount(3);
		await expect(plannerPage.internalCommentMediaDeleteButton).toHaveCount(3);
		await plannerPage.internalCommentMediaDeleteButton.first().click();
		await expect(page.getByRole('heading', { name: 'Delete this media?' })).toBeVisible();
		await expect(page.getByText('Are you sure you want to delete this media? This can\'t be undone.')).toBeVisible();
		await expect(plannerPage.deleteConfirmationButton).toBeVisible();
		await plannerPage.deleteConfirmationButton.click();
		await expect(page.locator('[data-testid="Attachment"]')).toHaveCount(2);
	});
});
