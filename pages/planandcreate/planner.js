const { expect } = require('@playwright/test');
const { format, formatISO, addDays, startOfWeek, addWeeks, subDays } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');
const deleteScheduledMessageById = require('../../custom-commands/deleteScheduledMesssagesById');
const getScheduledMessages = require('../../custom-commands/getScheduledMessages');
const timeZone = 'America/Toronto';

exports.PlannerPage = class PlannerPage {
	constructor(page) {
		this.page = page;
		this.plannerButton = page.getByLabel('Planner', { exact: true });
		this.deleteButton = page.getByTestId('DeleteButton');
		this.sidePaneCloseButton = page.getByTestId('CloseButton');
		this.deletePostButton = page.getByRole('button', { name: 'Delete post' });
		this.addMediaButton = page.getByTestId('ContentButton');
		this.termsOfServiceWall = page.locator('.vk-TermsOfServiceWall button');
		this.firstFreeImage = page.locator('.-mediaRow img[draggable="true"]').first();
		this.draftCard = page.getByText('No account');
		this.closeSaveDraftPopup = page.locator('#DraftSavedPopover [aria-label="Close Draft saved"]');
		this.viewWeekToggle = page.locator('.vk-Planner .vk-ViewToggleBar [aria-label= "View weekly planner"]');
		this.navigateToNextWeek = page.locator('.vk-Planner .vk-NextButton');
		this.editButton = page.getByTestId('EditButton');
		this.moreActions = page.getByLabel('More actions');
		this.duplicateButton = page.locator('//*[contains(@class,"vk-AdditionalActions")]//*[text()="Duplicate"]');
		this.exitOnboardingPopover = page.locator('#walkthrough-root .vk-OnboardingPopoverExit');
		this.linkedinPreviewPdf = page.locator('.vk-Planner .vk-DetailPane .vk-LinkedInPreview .vk-PdfContainer .vk-PdfDocument');
	}

	async visit() {
		await this.page.goto('/dashboard#/planner');
	}

	async selectWeekView() {
		await this.viewWeekToggle.click();
	}

	async loadLazyRenderedCards(hour) {
		await this.page.evaluate(isExpanded => {
			const row = document.querySelector(isExpanded ? `[data-hour="${hour}"]` : '.vk-Row');
			// Cards are lazy rendered, so we need to scroll up for the cards to render
			row?.scrollIntoView({ block: 'start', behavior: 'instant' });
		});
		this.page.locator(`[data-hour="${hour}"]`).hover();
	}

	async hideNativePosts(memberId) {
		this.page.evaluate(function (id) {
			return (window.localStorage.setItem(`${id}.pnc_preferences_is_native_posts_shown_filter`, 'false'));
		}, [memberId]);

	}

	//This can be used to prevent planner from auto scrolling to a recommended time slot.
	async hideRecommendedTimes(memberId) {
		this.page.evaluate(function (id) {
			return (window.localStorage.setItem(`${id}.pnc_preferences_is_recommended_times_to_post_shown_filter`, 'false'));
		}, [memberId]);
	}

	async switchToExpandedView(memberId) {
		this.page.evaluate(function (id) {
			return (window.localStorage.setItem(`${id}.pnc_preferences_last_used_week_filter`, 'WEEK_EXPANDED'));
		}, [memberId]);
	}

	async verifyScheduledMessage(text, hour) {
		if (hour) {
			await this.loadLazyRenderedCards(hour);
		}
		await expect(this.page.getByText(text)).toBeVisible();
	}

	async showPreviewPane(text) {
		await this.page.getByText(text).click();
	}

	async verifyTextInPreviewPane(text) {
		const previewPaneMessageText = this.page.getByTestId('Preview').getByText(text);
		await expect(previewPaneMessageText).toBeVisible();
	}

	async verifyPDFInPreviewPane() {
		await expect(this.page.getByTestId('Preview')).toBeVisible();
		await expect(this.linkedinPreviewPdf).toBeVisible();
	}

	async editFromPreviewPane() {
		await expect(this.editButton).toBeVisible();
		await this.editButton.click();
	}

	async duplicateFromPreviewPane() {
		await this.moreActions.click();
		await expect(this.duplicateButton).toBeVisible();
		await this.duplicateButton.click();
	}

	async weekViewPostCountHeader(num) {
		const postCountHeader = this.page.locator(`//*[contains(@data-testid,"NumContent")][text()=${num}]`);
		await postCountHeader.isVisible();
	}

	async dragAndDropCard(message, hour, id) {
		const nextDayDate = format(utcToZonedTime(addDays(startOfWeek(addWeeks(new Date(), 1)), 1), timeZone), 'eeee, d MMMM');
		const nextDayTime = format(utcToZonedTime(addDays(startOfWeek(addWeeks(new Date(), 1)), 1), timeZone), 'ha');

		await this.hideNativePosts(id);
		await this.hideRecommendedTimes(id);
		await expect(this.page.getByLabel('Next week')).toBeVisible();
		await this.navigateToNextWeek.click();
		await this.loadLazyRenderedCards(hour);
		await expect(this.page.getByText(message)).toBeVisible();

		const source = this.page.getByText(message);
		const destination = this.page.getByRole('gridcell', { name: `0 posts, ${nextDayDate} at ${nextDayTime}` });
		await this.page.waitForTimeout(1500);

		await source.hover();
		await this.page.mouse.down();

		await destination.hover();
		await destination.hover();
		await destination.hover();

		await this.page.mouse.up();
		await this.page.waitForTimeout(1500);

		await this.page.getByText(message).click();

		await this.deleteButton.click();
		await this.deletePostButton.click();
		await this.page.waitForTimeout(1000);
		await expect(this.page.getByText(message)).not.toBeVisible();
	}

	async dragAndDropMedia() {
		const nextDayDate = format(utcToZonedTime(addDays(new Date(), 1), timeZone), 'eeee, d MMMM');

		await this.addMediaButton.click();
		await this.termsOfServiceWall.click();

		await this.page.waitForLoadState('domcontentloaded');
		await expect(this.firstFreeImage).toHaveJSProperty('complete', true);
		await expect(this.firstFreeImage).not.toHaveJSProperty('naturalWidth', 0);

		const source = this.firstFreeImage;
		const destination = this.page.getByRole('gridcell', { name: `0 posts, ${nextDayDate} at 12AM` });

		await source.dragTo(destination);

		await this.page.waitForTimeout(2000);
		await expect(this.closeSaveDraftPopup).toBeVisible();
		await this.sidePaneCloseButton.click();
		await expect(this.draftCard).toBeVisible();
		await this.draftCard.click();

		await this.deleteButton.click();
		await this.deletePostButton.click();
		await this.page.waitForTimeout(1000);
	}

	async deleteScheduleMessagesViaAPI(memberId) {
		const getAllScheduledMessages = new getScheduledMessages();
		const deleteScheduledMessages = new deleteScheduledMessageById();
		const startTime = subDays(new Date(), 5);
		const endTime = addDays(new Date(), 15);
		let messagesToDelete = [];
		/* Get list of messages & delete them by messageId */
		await getAllScheduledMessages.command(
			parseInt(memberId, 10),
			formatISO(startTime),
			formatISO(endTime),
			NaN,
			'SCHEDULED',
			15).then(
			response =>
				messagesToDelete = response);

		let messageIdsToDelete = messagesToDelete.map(message => Number(message.id));

		if (messageIdsToDelete.length !== 0) {
			console.log('Deleting scheduled messages');
			for (const messageId of messageIdsToDelete) {
				console.log(`Deleting message ID: ${messageId}`);
				await deleteScheduledMessages.command(parseInt(memberId, 10), messageId);
			}
		}
	}

};
