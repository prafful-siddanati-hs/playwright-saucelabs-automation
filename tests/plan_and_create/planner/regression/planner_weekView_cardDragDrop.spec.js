// @ts-check
const { test } = require('@playwright/test');
const { formatISO, startOfWeek, addWeeks } = require('date-fns');
const {LoginPage} = require('../../../../pages/login');
const {PlannerPage} = require('../../../../pages/planandcreate/planner');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message');
const createUser = require('../../../../custom-commands/createUser');
const getFixture = require('../../../../custom-commands/getFixture');
const {getObjectByName} = require('../../../../globals');
const tearDown = require('../../../../custom-commands/tearDown');


/** @type {import('@playwright/test').Page} */
test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify that planner cards can be dragged and dropped to a different time slot in the week view', async ({page}) => {
	const createNewUser = new createUser();
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);
	const createScheduleMessage = new scheduleV3Message();

	const scheduleTime = startOfWeek(addWeeks(new Date(), 1)); //Schedule for first day of next week
	const composeText = `test drag and drop card on planner week view ${Date.now()}`;

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('dnd_user', 'professional');
		await addFixture.command('twitter_dnd','twitter', true, 300);
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInAsProUser('dnd_user');
	});

	await test.step('Create a scheduled message', async () => {
		await createScheduleMessage.command(
			parseInt(global.member[0].memberId, 10),
			{
				messages: [
					{
						socialProfileId: getObjectByName(global.fixture, 'twitter_dnd').socialProfile.socialProfileId,
						text: composeText,
						scheduledSendTime: formatISO(scheduleTime)
					}
				]
			}
		);
	});

	await test.step('Navigate to planner & switch to expanded view', async () => {
		await plannerPage.visit();
		await plannerPage.switchToExpandedView(global.member[0].memberId);
	});

	await test.step('Verify drag and drop of cards on week view', async () => {
		await plannerPage.dragAndDropCard(composeText, scheduleTime.getHours(), global.member[0].memberId);
	});
});
