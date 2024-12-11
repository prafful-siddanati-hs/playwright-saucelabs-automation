/* Test to verify user can be mentioned in internal comments */
const { test,expect } = require('@playwright/test');
const { SetUpEnterpriseUser } = require('../../../../custom-commands/setUpEnterpriseUser');
const createUser = require('../../../../custom-commands/createUser');
const addUserToOrg = require('../../../../custom-commands/addUserToOrg');
const modifySocialProfilePermissions = require('../../../../custom-commands/modifySocialProfilePermissions');
const { getObjectByName } = require('../../../../globals');
const { formatISO, addDays } = require('date-fns');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message');
const { LoginPage } = require('../../../../pages/login');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const { HomePage } = require('../../../../pages/homepage');
const tearDown = require('../../../../custom-commands/tearDown');

const scheduleDate = addDays(new Date(), 1);
let coreUserMemberId, coreUserFullName, enterpriseUsername, enterpriseUserMemberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify user can be mentioned in internal comments', async ({ page }) => {
	const setUpEnterpriseUser = new SetUpEnterpriseUser();
	const createNewUser = new createUser();
	const addUserToNewOrg = new addUserToOrg();
	const updateSNPermissions = new modifySocialProfilePermissions();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const homePage = new HomePage(page);

	let orgName = 'internal_comments_user_mention_org_' + Math.floor(Math.random() * 10000);
	let accounts = {
		plan_create_facebookpage: ['fb_internal_comments_mention']
	};
	const scheduleText = 'Mention a user in internal comments ';
	const commentText = 'Mention a user in this comment ';

	await test.step('Setup user & accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'internal_comments_mention_user', accounts);
		await createNewUser.command('internal_comments_user');
		await addUserToNewOrg.command('internal_comments_user', orgName);
		await updateSNPermissions.command('SN_LIMITED', 'fb_internal_comments_mention', 'internal_comments_user');
		coreUserMemberId = global.member[1].memberId;
		coreUserFullName = global.member[1].fullName;
		enterpriseUserMemberId = global.member[0].memberId;
		enterpriseUsername = global.member[0].username;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInSkipOnboarding('internal_comments_user');
	});

	await test.step('Hide native posts & recommended times', async () => {
		await plannerPage.hideNativePosts(coreUserMemberId);
		await plannerPage.hideRecommendedTimes(coreUserMemberId);
	});

	await test.step('Schedule a post', async () => {
		await createScheduleMessage.command(
			parseInt(coreUserMemberId, 10),
			{
				messages: [
					{
						socialProfileId: getObjectByName(global.fixture, `${accounts.plan_create_facebookpage}`).socialProfile.socialProfileId,
						text: scheduleText,
						scheduledSendTime: formatISO(scheduleDate),
					}
				]
			}
		);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled post is visible', async () => {
		await plannerPage.verifyScheduledMessageInCurrentOrNextWeek(scheduleText);
	});

	await test.step('Verify internal comments is available for user inside org', async () => {
		await plannerPage.showPreviewPane(scheduleText);
		await plannerPage.verifyTextInPreviewPane(scheduleText);
		await expect(plannerPage.internalCommentsTab).toBeVisible();
		await plannerPage.internalCommentsTab.click();
		await expect(page.getByText('Comments will only be seen by you and your teammates. They won\'t be published.')).toBeVisible();
	});

	await test.step('Type an internal comment with a user mention', async () => {
		await expect(plannerPage.internalCommentTextArea).toBeVisible();
		await plannerPage.internalCommentTextArea.click();
		await expect(plannerPage.saveInternalComment).toBeDisabled(); // Save button should be disabled
		await plannerPage.internalCommentTextArea.click();
		await plannerPage.internalCommentTextArea.pressSequentially(commentText.concat(`@${enterpriseUsername}`));
	});

	await test.step('Verify user mention is highlighted and save it', async () => {
		const mentionElement = page.locator('.mention');
		await expect(page.getByRole('option', { name: `${enterpriseUsername}` }).locator('div').first()).toBeVisible();
		await page.keyboard.press('Enter');
		await expect(mentionElement).toHaveText(`@${enterpriseUsername}`);

		const mentionColor = await mentionElement.evaluate((el) => {
			return window.getComputedStyle(el).color;
		});
		expect(mentionColor).toBe('rgb(31, 96, 201)');

		await expect(plannerPage.saveInternalComment).toBeEnabled();
		await plannerPage.saveInternalComment.click();
	});

	await test.step('Verify internal comment is successfully added', async () => {
		await expect(page.getByText(commentText.concat(`@${enterpriseUsername}`))).toBeVisible();
		await expect(plannerPage.editInternalComment).toBeVisible();
		await expect(plannerPage.copyInternalCommentLink).toBeVisible();
		await expect(plannerPage.deleteInternalComment).toBeVisible();
	});

	await test.step('Logout from pro user', async () => {
		await loginPage.logout();
	});

	await test.step('Login as enterprise user', async () => {
		await loginPage.signInSkipOnboarding('internal_comments_mention_user');
	});

	await test.step('Hide native posts', async () => {
		await plannerPage.hideNativePosts(enterpriseUserMemberId);
		await plannerPage.hideRecommendedTimes(enterpriseUserMemberId);
	});

	await test.step('Check in-product notification is received for internal comments', async () => {
		await expect(homePage.showMoreOptions).toBeVisible();
		await homePage.showMoreOptions.click();
		await expect(homePage.productNotificationsButton).toBeVisible();
		await homePage.productNotificationsButton.click();
		await page.getByText(`${coreUserFullName} mentioned you in a comment`).first().click();
	});

	await test.step('Ensure the mentioned used is correct', async () => {
		const mentionElement = page.getByTestId('Mention');
		await expect(plannerPage.internalCommentsTab).toBeVisible();
		await plannerPage.internalCommentsTab.click();
		await expect(page.getByTestId('Comment').getByText(`${coreUserFullName}`)).toBeVisible();
		await expect(page.getByText(commentText.concat(`@${enterpriseUsername}`))).toBeVisible();
		await expect(mentionElement).toHaveText(`@${enterpriseUsername}`);

		const mentionColor = await mentionElement.evaluate((el) => {
			return window.getComputedStyle(el).color;
		});
		expect(mentionColor).toBe('rgb(31, 96, 201)');
	});

	await test.step('Ensure that actions are restricted for non-author', async () => {
		await expect(plannerPage.copyInternalCommentLink).toBeVisible(); // Only copy link should be visible for non-author
		await expect(plannerPage.editInternalComment).not.toBeVisible();
		await expect(plannerPage.deleteInternalComment).not.toBeVisible();
	});
});
