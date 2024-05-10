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
		this.postButton = page.locator('div.animated-secondary button[aria-label=\'Post\']');
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
		this.twitterPreviewMediaContainer = page.locator('.vk-ComposerModal .vk-TwitterPreview .vk-MediaContainer');
		this.facebookPreviewSingleImage = page.locator('.vk-ComposerModal .vk-FacebookPreview .vk-MediaImg');
		this.facebookPreviewMediaContainer = page.locator('.vk-ComposerModal .vk-FacebookPreview .vk-MediaContainer');
		this.messageArea = page.getByTestId('MessageEditArea').getByLabel('Text');
		this.scheduleLaterButton = page.getByRole('button', { name: 'Schedule for later' });
		this.scheduleDone = page.getByRole('button', { name: 'Done' });
		this.scheduleDoneButton = page.getByTestId('schedule-post-done-btn');
		this.scheduleButton = page.locator('button.vk-EditFooterScheduleButton');
		this.saveChangesButton = page.getByRole('button', { name: 'Save changes' });
		this.saveEditsButton = page.getByRole('button', { name: 'Save edits' });
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
		this.basePreviewLayout = page.locator('.vk-PreviewBaseLayout');
		this.twitterPreviewText = page.locator('.vk-ComposerModal .vk-TwitterPreview .vk-ContentBody');
		this.facebookPreviewText = page.locator('.vk-ComposerModal .vk-FacebookPreview .vk-ContentBody');
		this.twitterMessageLink = page.locator('.rc-Composer .vk-TwitterPreview .vk-ContentBody a');
		this.twitterLinkPreviewTitle = page.locator('.rc-Composer .vk-TwitterPreview .vk-MessageLinkPreview .vk-LinkPreviewTitle');
		this.twitterLinkPreviewSource = page.locator('.rc-Composer .vk-TwitterPreview .vk-MessageLinkPreview .vk-Source');
		this.facebookMessageLink = page.locator('.rc-Composer .vk-FacebookPreview .vk-ContentBody .vk-MessageLink');
		this.facebookLinkPreviewTitle = page.locator('.rc-Composer .vk-FacebookPreview .vk-MessageLinkPreview .vk-LinkPreviewTitle');
		this.facebookLinkPreviewSource = page.locator('.rc-Composer .vk-FacebookPreview .vk-MessageLinkPreview .vk-Source');
		this.instagramPreviewText = page.locator('.vk-ComposerModal').getByTestId('preview-container').getByLabel('Instagram post preview');
		this.instagramReelPreviewText = page.locator('.vk-ComposerModal').getByTestId('preview-container').locator('.vk-InstagramReelPreview');
		this.linkedInPreviewText = page.locator('.vk-ComposerModal .vk-LinkedInPreview .vk-ContentBody');
		this.linkedInMessageLink = page.locator('.rc-Composer .vk-LinkedInPreview .vk-ContentBody a');
		this.linkedinLinkPreviewTitle = page.locator('.rc-Composer .vk-LinkedInPreview .vk-MessageLinkPreview .vk-LinkPreviewTitle');
		this.linkedinLinkPreviewSource = page.locator('.rc-Composer .vk-LinkedInPreview .vk-MessageLinkPreview .vk-Source');
		this.linkedInMentionLink = page.locator('.vk-ComposerModal .vk-LinkedInPreview .vk-ContentBody .vk-MessageMention');
		this.linkedInPdfPreview = page.locator('.vk-ComposerModal .vk-LinkedInPreview .vk-PdfContainer .vk-PdfDocument');
		this.facebookMentionLink = page.locator('.vk-ComposerModal .vk-FacebookPreview .vk-ContentBody .vk-MessageMention');
		this.twitterHashtagLink = page.locator('.vk-TwitterPreview .vk-ContentBody .vk-MessageHashtag');
		this.tiktokHashtagLink = page.locator('.vk-TikTokPreview .vk-MessageText .vk-MessageHashtag');
		this.instagramHashtagLink = page.locator('.vk-InstagramReelPreview .vk-MessageHashtag');
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
		this.altTextButton = page.getByLabel('Edit alternative text');
		this.editImageButton = page.getByLabel('Edit image');
		this.editVideButton = page.getByLabel('Edit video');
		this.mentionsList = page.locator('.vk-NewMentionsList');
		this.twitterTab = page.getByLabel('Twitter content');
		this.linkedInTab = page.getByLabel('LinkedIn content');
		this.facebookPageTab =  page.getByLabel('Facebook content');
		this.tiktokTab = page.getByLabel('TikTok content');
		this.instagramTab = page.getByLabel('Instagram content');
		this.videoRemoveButton = page.locator('.rc-Composer .videoThumbnail .vk-MediaThumbnailDelete');
		this.imageRemoveButton = page.locator('.rc-Composer .imageThumbnail .vk-MediaThumbnailDelete');
		this.pdfRemoveButton = page.locator('.rc-Composer .pdfThumbnail .vk-MediaThumbnailDelete');
		this.discardPost = page.getByRole('button', { name: 'Discard post' });
		this.addTrackingButton = page.getByRole('button', { name: 'Add tracking' });
		this.linkSettingsModal = page.getByLabel('Apply Link Settings modal');
		this.presetSelectDropdown = page.getByTestId('Preset-select');
		this.linkSettingsNoTracker = page.getByText('Tracking: No Tracking');
		this.linkSettingsNoShortner = page.getByText('Shortener: No Shortener');
		this.customizePresetButton = page.locator('//*[@aria-label="Apply Link Settings modal"]//*[text()="Customize"]', {locationStrategy: 'xpath'});
		this.linkSettingsShortenerDropdown = page.getByLabel('No Shortener');
		this.linkSettingsTrackerDropdown = page.getByLabel('No Tracking');
		this.linkSettingsCutomTracker = page.getByRole('option', { name: 'Custom' });
		this.trackingParametersTable = page.getByTestId('TrackingParametersTable');
		this.linkSettingsAddParameterButton = page.getByTestId('AddParameterButton');
		this.parameterName = page.getByTestId('CompoundParameterNameInput-0');
		this.parameterValue = page.getByTestId('CompoundParameterValueInput-0-0');
		this.linkShortener = page.getByTestId('Ow.ly-select-item');
		this.manageLinkPreset = page.getByRole('option', { name: 'Manage link presets' });
		this.shortenWithOwlyCaption = page.getByTestId('owlyText').locator('div');
		this.editAppliedLinkPreset = page.getByTestId('MessageEditArea').getByRole('button', { name: 'Edit' });
		this.selectLinkDropdown = page.getByTestId('Select a link-select').locator('div').first();
		this.linkShortener = page.getByTestId('Ow.ly-select-item');
		this.linkSettingsApplyButton = page.locator('//*[@aria-label="Apply Link Settings modal"]//*[text()="Apply"]', {locationStrategy: 'xpath'});
		this.badLinkThumbnailWarning = page.getByRole('heading', { name: 'This website is preventing us from displaying image previews. Please upload a custom thumbnail.' });
		this.twitterLinkPreviewCustomizationInfo = page.getByRole('heading', { name: 'Link preview customization is not supported by Twitter' });
		this.twitterCharacterLimitError = page.getByTestId('banner-container').locator('div').filter({ hasText: 'Your text exceeds the character limit for Twitter' }).first();
		this.saveChangesModal = page.getByRole('heading', { name: 'Save your changes?' });
	}

	async selectComposeButton() {
		await this.page.waitForSelector('button.vk-NewPostButton');
		const composeHandle = await this.page.$('button.vk-NewPostButton');

		if (composeHandle) {
			await composeHandle.click();
			console.log('Compose Button clicked!');
		} else {
			console.log('Compose Button not found!');
		}

		await this.postButton.click();
		await expect(this.composeScreen, 'should be navigated to composer full screen').toBeVisible();
	}

	async selectSocialProfile(name) {
		const profileSelectorItem = this.page.getByTestId('MessageEditArea').getByText(`${name}`).first();

		await profileSelectorItem.click();
		await this.verifySocialProfileSelected(name);
	}

	/**
	 * Uploads a media file to the page.If `filePath` is not provided, a random media file from `testDataFolder` will be selected.
	*/
	async uploadMediaFile(testDataFolder, filePath = '') {
		try {
			if (filePath === '') {
				const randomFile = await getRandomMediaFile(testDataFolder);
				filePath = join(testDataFolder, randomFile);
			}

			await this.page.setInputFiles('.vk-MediaUpload input[type="file"]', filePath);
			//Handle cases when more than one media file is uploaded
			const mulitpleMediaOverlays = Array.from(await this.mediaOverLay);
			await Promise.all(mulitpleMediaOverlays.map(async (overlay) => {
				await expect(overlay, 'Media overlay should be visible').toBeVisible();
			}));
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
		await expect(this.scheduleButton, 'Schedule button should be visible').toBeVisible();
		await this.scheduleDoneButton.hover();
		await this.scheduleDoneButton.click();
		await this.scheduleButton.click();
		await expect(this.scheduleButton, 'Schedule message failed from composer').not.toBeVisible();
		await expect(this.feCallOuts).toHaveCount(1);
	}

	async sendNow() {
		await this.postNowButton.click();
		await expect(this.postNowButton, 'Send now message failed from composerBC').not.toBeVisible();
		await expect(this.composeScreen).not.toBeVisible();
		await expect(this.feCallOuts).toHaveCount(1);
	}

	async verifySocialProfileSelected(name) {
		const pillText = this.page.locator(`//*[contains(@class, "vk-PillText") and text()="${name}"]`);
		await expect(pillText, 'Social network is not selected').toBeVisible();
		await expect(this.page.locator('.vk-Loader')).toHaveCount(0);
	}

	async verifyGenericPreview(text) {
		await expect(this.genericPreviewText, 'Generic preview is not updated with text message on composer').toContainText(`${text}`);
	}

	async verifyGenericImagePreview() {
		await expect(this.genericPreviewSingleImage, 'Generic preview is not updated with image on composer').toHaveJSProperty('complete', true);
		await expect(this.genericPreviewSingleImage).not.toHaveJSProperty('naturalWidth', 0);
	}

	async verifyTwitterPreview(text) {
		await expect(this.twitterPreviewText, 'Twitter preview is not updated with text message on composer').toContainText(`${text}`);
	}

	async verifyTwitterVideoPreview() {
		await expect(this.twitterVideoPreviewSelector, 'Twitter preview is not updated with video on composer').toHaveCount(1);
	}

	async verifyTwitterImagePreview() {
		const isImageVisible = await Promise.race([
			this.twitterPreviewSingleImage.waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
			this.twitterPreviewMediaContainer.waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
		]);

		expect(isImageVisible).toBeTruthy();
	}

	async verifyFacebookImagePreview() {
		const isImageVisible = await Promise.race([
			this.facebookPreviewSingleImage.waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
			this.facebookPreviewMediaContainer.waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
		]);

		expect(isImageVisible).toBeTruthy();
	}

	async verifyFacebookVideoPreview() {
		await expect(this.facebookVideoPreviewSelector, 'Facebook preview is not updated with video on composer').toHaveCount(1);
	}

	async verifyFacebookPreview(text) {
		await expect(this.facebookPreviewText, 'Facebook preview is not updated with text on composer').toContainText(`${text}`);
	}

	async verifyLinkInTwitterPreview(text) {
		await expect(this.twitterMessageLink, 'Twitter preview is not updated with link preview on composer').toBeVisible();
		expect(await this.twitterMessageLink.getAttribute('href')).toContain(text);
		expect(await this.twitterMessageLink.innerText()).toContain(text);
	}

	async verifyLinkInFacebookPagePreview(text) {
		await expect(this.facebookMessageLink, 'Facebook preview is not updated with link preview on composer').toBeVisible();
		expect(await this.facebookMessageLink.getAttribute('href')).toContain(text);
		expect(await this.facebookMessageLink.innerText()).toContain(text);
	}

	async verifyInstagramPreview(text) {
		await expect(this.instagramPreviewText, 'Instagram post preview is not updated with text on composer').toContainText(`${text}`);
		await expect(this.previewNetworkType).toContainText('Instagram Post');
	}

	async verifyInstagramReelPreview(text) {
		await expect(this.instagramReelPreviewText, 'Instagram reel preview is not updated with text on composer').toContainText(`${text}`);
	}

	async verifyInstagramReelVideoPreview() {
		await expect(this.previewNetworkType, 'Instagram reel preview is not updated with video on composer').toContainText('Instagram Reel');
		await expect(this.instagramReelVideoPreviewSelector).toHaveCount(1);
		await this.page.waitForLoadState('domcontentloaded');
	}

	async verifyLinkedInPreview(text) {
		await expect(this.linkedInPreviewText, 'Linkedin preview is not updated with text on composer').toContainText(`${text}`);
	}

	async verifyFacebookMentionPreview(mentionName) {
		await this.facebookMentionLink.isVisible();
		assert((await this.facebookMentionLink.textContent()).includes(mentionName), 'Mention name not found on Facebook preview');
		assert((await this.facebookMentionLink.getAttribute('href')).includes('https://www.facebook.com/'), 'Incorrect href value in Facebook preview');
	}
	async verifyLinkedInMentionPreview(mentionName) {
		await this.linkedInMentionLink.isVisible();
		assert((await this.linkedInMentionLink.textContent()).includes(mentionName), 'Mention name not found on LinkedIn preview');
		assert((await this.linkedInMentionLink.getAttribute('href')).includes('https://www.linkedin.com/company'), 'Incorrect href value in LinkedIn preview');
	}

	async verifyLinkInLinkedinPagePreview(text) {
		await expect(this.linkedInMessageLink, 'Linkedin preview is not updated with link on composer').toBeVisible();
		expect(await this.linkedInMessageLink).toHaveAttribute('href', text);
		expect(await this.linkedInMessageLink.innerText()).toContain(text);
	}

	async verifyHashtagInTwitterPreview(hashtag) {
		await expect(this.twitterHashtagLink, 'twitter preview is not updated with hashtag on composer').toBeVisible();
		assert((await this.twitterHashtagLink.textContent()).includes(hashtag), 'Hashtag not found on Twitter preview');
		assert((await this.twitterHashtagLink.getAttribute('href')).includes(`https://twitter.com/hashtag/${hashtag}`), 'Incorrect href value in Twitter preview');
	}

	async verifyTiktokHashtagPreview(hashtag) {
		await expect(this.tiktokHashtagLink, 'Tiktok preview is not updated with hashtag on composer').toBeVisible();
		assert((await this.tiktokHashtagLink.textContent()).includes(hashtag), 'Hashtag not found on Tiktok preview');
		assert((await this.tiktokHashtagLink.getAttribute('href')).includes(`https://www.tiktok.com/tag/${hashtag}`), 'Incorrect href value in Tiktok preview');
	}

	async verifyInstagramHashtagPreview(hashtag) {
		await expect(this.instagramHashtagLink, 'Instagram post preview is not updated with hashtag on composer').toBeVisible();
		assert((await this.instagramHashtagLink.textContent()).includes(hashtag), 'Hashtag not found on Instagram preview');
		assert((await this.instagramHashtagLink.getAttribute('href')).includes(`https://www.instagram.com/explore/tags/${hashtag}`), 'Incorrect href value in Instagram preview');
	}

	async verifyLinkedInPdfPreview() {
		await expect(this.previewNetworkType, 'Linkedin preview is not updated with PDF preview on composer').toContainText('LinkedIn');
		await expect(this.linkedInPdfPreview).toBeVisible();
	}

	async selectMessageScheduleDate() {
		await this.scheduleLaterButton.click();
		await expect(this.openCalendarButton, 'Should open calendar').toHaveCount(1);
		await this.openCalendarButton.hover();
		await this.openCalendarButton.click();
		await this.nextMonthButton.hover();
		await this.nextMonthButton.click();
		await this.firstDayOfNextMonth.click();
		await this.scheduleDoneButton.click();
		await this.scheduleButton.click();
		await expect(this.scheduleButton, 'Schedule message failed from composer').not.toBeVisible();
		await expect(this.feCallOuts).not.toBeVisible();
	}

	async updateDraft(text) {
		await this.messageArea.locator('div').nth(2).click();
		await this.messageArea.fill(text);
	}

	async saveChanges(){
		await this.saveChangesButton.click();
		await expect(this.composeScreen, 'Save message failed from composer').not.toBeVisible();
	}

	async saveDraft() {
		await this.saveDraftFromDropdown.click();
		await expect(this.composeScreen, 'Save draft failed from composer').not.toBeVisible();
	}

	async saveToContentLibrary() {
		await this.moreButton.click();
		await expect(this.saveToContentLibraryButton, 'Content library button should be visible').toBeVisible();
		await this.saveToContentLibraryButton.click();
	}

	async saveEditedMessage() {
		await this.saveEditsButton.click();
		await expect(this.composeScreen, 'Save edit message failed from composer').not.toBeVisible();
	}

	async scheduleDuplicateMessage() {
		await expect(this.scheduleButton).toBeVisible();
		await this.scheduleButton.hover();
		await this.scheduleButton.click();
		await expect(this.scheduleButton, 'Schedule message failed from composer').not.toBeVisible();
		await expect(this.feCallOuts).toHaveCount(1);
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
		await expect(this.mediaContent, 'Media library content is not loaded').toBeVisible();
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
		const mentionItem = this.page.locator('div').filter({hasText: new RegExp(`^${mentionName}$`)}).first();

		await this.mentionsList.isVisible();
		await mentionItem.isVisible();
		await mentionItem.click();
	}

	async openLinkSettingsDialog() {
		await expect(this.addTrackingButton, 'Add tracking button is missing from composer').toBeVisible();
		await this.addTrackingButton.click();
		await expect(this.linkSettingsModal, 'Unable to open link settings modal').toBeVisible();
	}

	async selectLink(url) {
		const linkToSelect = this.page.getByRole('option', { name: `${url}` });
		await expect(this.selectLinkDropdown, 'Link dropdown is not visible').toBeVisible();
		await this.selectLinkDropdown.click();
		await expect(linkToSelect, 'Selected link is not displayed').toBeVisible();
		await linkToSelect.click();
	}

	async selectTracker(tracker) {
		const linkSettingsTracker = this.page.getByRole('option', { name: `${tracker}`});
		await expect(this.linkSettingsTrackerDropdown, 'Link settings track dropdown is not visible').toBeVisible();
		await this.linkSettingsTrackerDropdown.click();
		await linkSettingsTracker.click();
	}

	async setTrackingParameter(parameterName, parameterValue) {
		await expect(this.trackingParametersTable, 'Link tracking parameter table is not visible').toBeVisible();
		await expect(this.parameterName, 'Link settings tracking parameter name is not visible').toBeVisible();
		await this.parameterName.fill(parameterName);
		await expect(this.parameterValue, 'Link settings tracking parameter value is not visible').toBeVisible();
		await this.parameterValue.fill(parameterValue);
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
