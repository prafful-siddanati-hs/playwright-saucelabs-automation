const { expect } = require('@playwright/test');
const {getRandomMediaFile} = require('../../globals');
const {join} = require('node:path');
const getScheduledMessages = require('../../custom-commands/getScheduledMessages');
const deleteScheduledMessageById = require('../../custom-commands/deleteScheduledMesssagesById');
const { addMonths, startOfMonth, addDays, formatISO} = require('date-fns');
const assert = require('assert');

exports.ComposePage = class ComposePage {
	constructor(page) {
		this.page = page;
		this.composeButton = page.getByLabel('Composer', { exact: true });
		this.postButton = page.locator('div.animated-secondary').getByLabel('Post');
		this.composeScreen = page.locator('#fullScreenComposerMountPoint .vk-ComposerModal');
		this.profileDropDown = page.locator('[aria-label="Select a social account (required)"]');
		this.snContentItems = page.locator('.vk-ComposerModal .vk-ContentItems');
		this.snPilltext = page.locator('.vk-ComposerModal .vk-PillText');
		this.postToWrapper = page.locator('.vk-PostToWrapper');
		this.profileListItemTitle = page.locator('.vk-ComposerModal .vk-ProfileListItemTitle');
		this.composerHeader = page.locator('.vk-ComposerHeader');
		this.previewNetworkType = page.locator('.vk-ComposerModal .vk-MessagePreviewHeader .vk-NetworkType');
		this.genericPreviewSingleImage = page.locator('.vk-ComposerModal .vk-GenericPreview .vk-MediaImg');
		this.twitterPreviewSingleImage = page.locator('.vk-ComposerModal .vk-TwitterPreview .vk-MediaImg');
		this.facebookPreviewSingleImage = page.locator('.vk-ComposerModal .vk-FacebookPreview .vk-MediaImg');
		this.messageArea = page.getByTestId('MessageEditArea').getByLabel('Text');
		this.scheduleLaterButton = page.getByRole('button', { name: 'Schedule for later' });
		this.scheduleDone = page.getByRole('button', { name: 'Done' });
		this.scheduleDoneButton = page.getByTestId('schedule-post-done-btn');
		this.scheduleButton = page.locator('button.vk-EditFooterScheduleButton');
		this.saveChangesButton = page.getByRole('button', { name: 'Save changes' });
		this.postNowButton = page.getByRole('button', { name: 'Post now', exact: true });
		this.saveToContentLibraryButton = page.getByRole('button', { name: 'Save to content library' });
		this.openCalendarButton = page.getByLabel('Open calendar');
		this.nextMonthButton = page.getByLabel('Go to next month');
		this.firstDayOfNextMonth = page.locator('(//button[contains(@class, "rdp-day") and text()="1"])[1]');
		this.mediaOverLay = page.locator('.vk-ComposerModal .vk-MediaAttachmentThumbnailCard');
		this.twitterVideoPreviewSelector = page.locator('.vk-ComposerModal .vk-TwitterPreview .vk-VideoContainer');
		this.facebookVideoPreviewSelector = page.locator('.vk-ComposerModal .vk-FacebookPreview .vk-VideoContainer .vk-VideoPlayer');
		this.instagramReelVideoPreviewSelector = page.getByTestId('preview-container').locator('.vk-InstagramReelPreview .vk-StreamlinedVideo');
		this.genericPreviewText = page.locator('.vk-ComposerModal .vk-GenericPreview .vk-PreviewMessageText');
		this.twitterPreviewText = page.locator('.vk-ComposerModal .vk-TwitterPreview .vk-ContentBody');
		this.facebookPreviewText = page.locator('.vk-ComposerModal .vk-FacebookPreview .vk-ContentBody');
		this.facebookMessageLink = page.locator('.vk-FacebookPreview .vk-ContentBody a');
		this.facebookLinkPreviewTitle = page.locator('.rc-Composer .vk-FacebookPreview .vk-MessageLinkPreview .vk-LinkPreviewTitle');
		this.facebookLinkPreviewSource = page.locator('.rc-Composer .vk-FacebookPreview .vk-MessageLinkPreview .vk-Source');
		this.instagramPreviewText = page.locator('.vk-ComposerModal').getByTestId('preview-container').getByLabel('Instagram post preview');
		this.instagramReelPreviewText = page.locator('.vk-ComposerModal').getByTestId('preview-container').locator('.vk-InstagramReelPreview');
		this.linkedInPreviewText = page.locator('.vk-ComposerModal .vk-LinkedInPreview .vk-ContentBody');
		this.linkedInMentionLink = page.locator('.vk-ComposerModal .vk-LinkedInPreview .vk-ContentBody .vk-MessageMention');
		this.exitButton = page.getByRole('button', { name: 'Exit tutorial' });
		this.feCallOuts = page.locator('#fe-lib-async-callouts-container>div>div>div>div[type="success"]');
		this.moreButton = page.getByLabel('more', { exact: true });
		this.saveDraftFromDropdown = page.getByRole('button', { name: 'Save as draft', exact: true });
		this.mediaLibraryButton = page.getByLabel('Media library', { exact: true });
		this.mediaLibraryCloseButton = page.getByRole('button', { name: 'Close media library'});
		this.termsOfServiceWall = page.locator('.vk-TermsOfServiceWall button');
		this.mediaLibraryRetryError= page.getByTestId('MediaLibraryErrorRetry');
		this.mediaSearchBox = page.getByPlaceholder('Search media');
		this.loadingBars = page.locator('[data-testid="bouncing-bars-loader-wrapper"]');
		this.mediaContent = page.locator('.-mediaContent');
		this.firstImage = page.locator('.-mediaRow');
		this.mediaThumbnail = page.locator('.rc-MediaLibrary .-mediaContainer .MediaThumbnail');
		this.mentionsList = page.locator('.vk-NewMentionsList');
		this.twitterTab = page.getByLabel('Twitter content');
		this.linkedInTab = page.getByLabel('LinkedIn content');
		this.facebookPageTab =  page.getByLabel('Facebook content');
		this.videoRemoveButton = page.locator('.rc-Composer .videoThumbnail .vk-MediaThumbnailDelete');
		this.exitComposerButton = page.getByLabel('Exit Composer');
		this.discardPost = page.getByRole('button', { name: 'Discard post' });
		this.addTrackingButton = page.getByRole('button', { name: 'Add tracking' });
		this.linkSettingsModal = page.getByLabel('Apply Link Settings modal');
		this.presetSelectDropdown = page.getByTestId('Preset-select');
		this.linkSettingsNoTracker = page.getByText('Tracking: No Tracking');
		this.linkSettingsNoShortner = page.getByText('Shortener: No Shortener');
		this.customizePresetButton = page.getByTestId('CustomizePresetButton');
		this.linkSettingsShortenerDropdown = page.getByLabel('No Shortener');
		this.linkSettingsTrackerDropdown = page.getByLabel('No Tracking');
		this.linkSettingsCutomTracker = page.getByRole('option', { name: 'Custom' });
		this.trackingParametersTable = page.getByTestId('TrackingParametersTable');
		this.linkSettingsAddParameterButton = page.getByTestId('AddParameterButton');
		this.linkShortener = page.getByTestId('Ow.ly-select-item');
		this.linkSettingsApplyButton = page.getByTestId('ApplyPresetButton');

	}
	async selectComposeButton() {
		await expect(this.composeButton).toBeVisible();
		await this.composeButton.click();
		await this.composeButton.click();
		await this.postButton.click();
		await expect(this.composeScreen).toBeVisible();
	}

	async selectSocialProfile(name) {
		const profileSelectorItem = this.page.getByTestId('MessageEditArea').getByText(`${name}`).first();

		await profileSelectorItem.click();
		await this.verifySocialProfileSelected(name);
	}

	async uploadMediaFile(testDataImagesFolder) {
		try {
			const randomFile = await getRandomMediaFile(testDataImagesFolder);
			const filePath = join(testDataImagesFolder, randomFile);

			await this.page.setInputFiles('.vk-MediaUpload input[type="file"]', filePath);
			await expect(this.mediaOverLay).toBeVisible();
		} catch (error) {
			console.error('Error:', error);
		}
	}

	async writeMessage(message) {
		await this.page.keyboard.press('Escape');
		await this.messageArea.click();
		await this.page.keyboard.type(message);
		await expect(this.page.locator('.vk-Loader')).toHaveCount(0);
	}

	async schedule() {
		await this.scheduleLaterButton.click();
		await this.scheduleDone.click();
		await this.scheduleButton.click();
		await expect(this.scheduleButton).not.toBeVisible();
		await expect(this.feCallOuts).toHaveCount(1);
	}

	async sendNow() {
		await this.postNowButton.click();
		await expect(this.postNowButton).not.toBeVisible();
		await expect(this.composeScreen).not.toBeVisible();
		await expect(this.feCallOuts).toHaveCount(1);
	}

	async verifySocialProfileSelected(name) {
		const pillText = this.page.locator(`//*[contains(@class, "vk-PillText") and text()="${name}"]`);
		await expect(pillText).toBeVisible();
		await expect(this.page.locator('.vk-Loader')).toHaveCount(0);
	}

	async verifyGenericPreview(text) {
		await expect(this.genericPreviewText).toContainText(`${text}`);
	}

	async verifyGenericImagePreview() {
		await expect(this.genericPreviewSingleImage).toHaveJSProperty('complete', true);
		await expect(this.genericPreviewSingleImage).not.toHaveJSProperty('naturalWidth', 0);
	}

	async verifyTwitterPreview(text) {
		await expect(this.twitterPreviewText).toContainText(`${text}`);
	}

	async verifyTwitterVideoPreview() {
		await expect(this.twitterVideoPreviewSelector).toHaveCount(1);
	}

	async verifyTwitterImagePreview() {
		await expect(this.twitterPreviewSingleImage).toHaveJSProperty('complete', true);
		await expect(this.twitterPreviewSingleImage).not.toHaveJSProperty('naturalWidth', 0);
	}

	async verifyFacebookImagePreview() {
		await expect(this.facebookPreviewSingleImage).toHaveJSProperty('complete', true);
		await expect(this.facebookPreviewSingleImage).not.toHaveJSProperty('naturalWidth', 0);
	}

	async verifyFacebookVideoPreview() {
		await expect(this.facebookVideoPreviewSelector).toHaveCount(1);
	}

	async verifyFacebookPreview(text) {
		await expect(this.facebookPreviewText).toContainText(`${text}`);
	}

	async verifyLinkInFacebookPagePreview(text) {
		await expect(this.facebookMessageLink).toBeVisible();
		expect(await this.facebookMessageLink.getAttribute('href')).toContain(text);
		expect(await this.facebookMessageLink.innerText()).toContain(text);
	}

	async verifyInstagramPreview(text) {
		await expect(this.instagramPreviewText).toContainText(`${text}`);
		await expect(this.previewNetworkType).toContainText('Instagram Post');
	}

	async verifyInstagramReelPreview(text) {
		await expect(this.instagramReelPreviewText).toContainText(`${text}`);
	}

	async verifyInstagramReelVideoPreview() {
		await expect(this.previewNetworkType).toContainText('Instagram Reel');
		await expect(this.instagramReelVideoPreviewSelector).toHaveCount(1);
		await this.page.waitForLoadState('domcontentloaded');
	}

	async verifyLinkedInPreview(text) {
		await expect(this.linkedInPreviewText).toContainText(`${text}`);
	}

	async verifyLinkedInMentionPreview(mentionName) {
		await this.linkedInMentionLink.isVisible();
		assert((await this.linkedInMentionLink.textContent()).includes(mentionName), 'Mention name not found on LinkedIn preview');
		assert((await this.linkedInMentionLink.getAttribute('href')).includes('https://www.linkedin.com/company'), 'Incorrect href value in LinkedIn preview');
	}

	async selectMessageScheduleDate() {
		await this.scheduleLaterButton.click();
		await expect(this.openCalendarButton).toHaveCount(1);
		await this.openCalendarButton.hover();
		await this.openCalendarButton.click();
		await this.nextMonthButton.click();
		await this.firstDayOfNextMonth.click();
		await this.scheduleDoneButton.click();
		await this.scheduleButton.click();
		await expect(this.scheduleButton).not.toBeVisible();
		await expect(this.feCallOuts).not.toBeVisible();
	}

	async updateDraft(text) {
		await this.messageArea.locator('div').nth(2).click();
		await this.messageArea.fill(text);
	}

	async saveChanges(){
		await this.saveChangesButton.click();
		await expect(this.composeScreen).not.toBeVisible();
	}

	async saveDraft() {
		await this.saveDraftFromDropdown.click();
		await expect(this.composeScreen).not.toBeVisible();
	}

	async saveToContentLibrary() {
		await this.moreButton.click();
		await expect(this.saveToContentLibraryButton).toBeVisible();
		await this.saveToContentLibraryButton.click();
	}

	async openMediaLibrary() {
		await this.mediaLibraryButton.click();
		await this.page.waitForTimeout(1000);
		if (await this.termsOfServiceWall.isVisible()) {
			await this.termsOfServiceWall.click();
		}
		await expect(this.mediaLibraryRetryError).not.toBeVisible(); //Ensure a media library error is not displayed.
	}

	async searchMediaLibrary(searchTerm) {
		await this.mediaSearchBox.click();
		await this.mediaSearchBox.fill(searchTerm);
	}

	async attachImageFromMediaLibrary(numImages) {
		let randomImage;
		await expect(this.mediaContent).toBeVisible();
		await expect(this.firstImage.nth(0)).toBeVisible();
		for (let i = 0; i < numImages; i ++) {
			randomImage = Math.floor(Math.random() * 15) + 1;
			const image = await this.mediaThumbnail.nth(randomImage);
			if (await image.isVisible()) {
				await image.click();
				await this.page.waitForTimeout(1000);
			}
		}
	}

	async closeMediaLibrary() {
		await this.mediaLibraryCloseButton.click();
	}

	async selectMention(mentionName) {
		const mentionItem = this.page.locator('div').filter({hasText: new RegExp(`^${mentionName}$`)});

		await this.mentionsList.isVisible();
		await mentionItem.isVisible();
		await mentionItem.click();
	}

	async openLinkSettingsDialog() {
		await expect(this.addTrackingButton).toBeVisible();
		await this.addTrackingButton.click();
		await expect(this.linkSettingsModal).toBeVisible();
	}

	async closeComposer() {
		await this.exitComposerButton.click();
		await expect(this.discardPost).toBeVisible();
		await this.discardPost.click();
	}

	async deleteComposeScheduledMessagesForNextMonthViaAPI(memberId) {
		const getAllScheduledMessages = new getScheduledMessages();
		const deleteScheduledMessages = new deleteScheduledMessageById();
		const nextMonthStart = startOfMonth(addMonths(new Date(), 1));
		let startTime = nextMonthStart;
		let endTime = addDays(nextMonthStart, 9); // 10th day of the month

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
