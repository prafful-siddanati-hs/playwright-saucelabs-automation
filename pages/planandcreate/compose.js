const { expect } = require('@playwright/test');
const {getRandomMediaFile} = require('../../globals');
const {join} = require('node:path');
const getScheduledMessages = require('../../custom-commands/getScheduledMessages');
const deleteScheduledMessageById = require('../../custom-commands/deleteScheduledMesssagesById');
const { addMonths, startOfMonth, addDays, formatISO} = require('date-fns');
const assert = require('assert');
const { use: { longTimeout } } = require('../../playwright.config.js');

exports.ComposePage = class ComposePage {
	constructor(page) {
		this.page = page;
		this.composeButton = page.locator('button[aria-label="Create posts and more"]');
		this.postButton = page.locator('div.animated-secondary button[aria-label=\'Post\']');
		this.composeScreen = page.locator('#fullScreenComposerMountPoint .vk-ComposerModal');
		this.headerLabel = page.locator('.vk-ComposerModal .vk-HeaderLabel');
		this.minimizeComposeButton = page.locator('.vk-ComposerModal [aria-label="Minimize"]');
		this.exitComposeButton = page.locator('.vk-ComposerModal [aria-label="Exit Composer"]');
		this.profileDropDown = page.locator('.vk-ComposerModal [aria-label="Select a social account (required)"]');
		this.snInputPlaceholder = page.locator('.vk-ComposerModal [aria-label="Select a social account (required)"]');
		this.snContentItems = page.locator('.vk-ComposerModal .vk-ContentItems');
		this.snPilltext = page.locator('.vk-ComposerModal .vk-PillText');
		this.postToWrapper = page.locator('.vk-PostToWrapper');
		this.profileListItemTitle = page.locator('.vk-ComposerModal .vk-ProfileListItemTitle');
		this.composerHeader = page.locator('.vk-ComposerHeader');
		this.previewNetworkType = page.locator('.vk-ComposerModal [type="INSTAGRAMBUSINESS"] .vk-MessagePreviewHeader .vk-NetworkType');
		this.tabContent = page.locator('.vk-ComposerModal .vk-TabContent');
		this.messageCharCount = page.locator('.rc-MessageEditArea .rc-CharacterCounter span.-characterCounterCount');
		this.genericPostPreview = page.locator('.vk-ComposerModal [aria-label="generic post preview"]');
		this.genericPostPreviewText = page.locator('.vk-ComposerModal [aria-label="generic post preview"] .vk-PreviewMessageText');
		this.genericPreviewSingleImage = page.locator('.vk-ComposerModal .vk-GenericPreview .vk-MediaImg');
		this.genericFacebookLinkPreviewMedia = page.locator('.vk-ComposerModal [aria-label="generic post preview"] .vk-FacebookPreview .vk-LinkPreviewMedia');
		this.genericTwitterLinkPreviewMedia = page.locator('.vk-ComposerModal [aria-label="generic post preview"] .vk-TwitterPreview .vk-LinkPreviewMedia');
		this.twitterPreviewSingleImage = page.locator('.vk-ComposerModal .vk-TwitterPreview .vk-MediaImg');
		this.twitterPreviewSingleVideo = page.locator('.vk-ComposerModal .vk-TwitterPreview .vk-VideoContainer');
		this.twitterPreviewMediaContainer = page.locator('.vk-ComposerModal .vk-TwitterPreview .vk-MediaContainer');
		this.emptyTwitterPreview = page.locator('.vk-ComposerModal .vk-TwitterPreview');
		this.emptyFacebookPreview = page.locator('.vk-ComposerModal .vk-FacebookPreview');
		this.linkedinNetworkType = page.locator('.vk-ComposerModal [type="LINKEDIN"] .vk-MessagePreviewHeader .vk-NetworkType');
		this.emptyLinkedInPreview = page.locator('.vk-ComposerModal [type="LINKEDIN"] .vk-LinkedInPreview');
		this.emptyLinkedInCompanyPreview = page.locator('.vk-ComposerModal [type="LINKEDINCOMPANY"] .vk-LinkedInPreview');
		this.emptyInstagramPreview = page.locator('.vk-ComposerModal .vk-InstagramPreview');
		this.emptyThreadsPreview = page.locator('.vk-ComposerModal .vk-ThreadsPreview');
		this.facebookPreviewSingleVideo = page.locator('.vk-ComposerModal .vk-FacebookPreview .vk-VideoContainer');
		this.facebookPreviewSingleImage = page.locator('.vk-ComposerModal .vk-FacebookPreview .vk-MediaImg');
		this.facebookPreviewMediaContainer = page.locator('.vk-ComposerModal .vk-FacebookPreview .vk-MediaContainer');
		this.instagramPreviewMediaContainer = page.locator('.vk-ComposerModal .vk-InstagramPreview .vk-MediaContainer');
		this.linkedInPreviewMediaContainer = page.locator('.vk-ComposerModal .vk-LinkedInPreview .vk-MediaContainer');
		this.threadsPreviewSingleImage = page.locator('.vk-ComposerModal .vk-ThreadsPreview .vk-MediaImg');
		this.threadsPreviewSingleVideo = page.locator('.vk-ComposerModal .vk-ThreadsPreview .vk-VideoContainer');
		this.messageArea = page.locator('.rc-MessageEditText [aria-label="Text"].public-DraftEditor-content');
		this.emojiButton = page.locator('#fullScreenComposerMountPoint .vk-ComposerModal [aria-label="Add an emoji"]');
		this.hashTagSuggestions = page.locator('#fullScreenComposerMountPoint .vk-ComposerModal [aria-label="AI hashtag suggestions"]');
		this.canvaButton = page.locator('#fullScreenComposerMountPoint .vk-ComposerModal [aria-label="Design with Canva"]');
		this.scheduleLaterButton = page.getByRole('button', { name: 'Schedule for later' });
		this.scheduleDone = page.getByRole('button', { name: 'Done' });
		this.scheduleDoneButton = page.getByTestId('schedule-post-done-btn');
		this.scheduleButton = page.locator('button.vk-EditFooterScheduleButton');
		this.saveAsDraftButton = page.locator('.vk-ComposerModal [data-testid= "SaveAsDraftButton"]');
		this.saveChangesButton = page.getByRole('button', { name: 'Save changes' });
		this.saveEditsButton = page.getByRole('button', { name: 'Save edits' });
		this.postNowButton = page.getByRole('button', { name: 'Post now', exact: true });
		this.addTagsButton = page.locator('.vk-ComposerModal [aria-label= "Add tags"]');
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
		this.threadsPreviewText = page.locator('.vk-ComposerModal .vk-ThreadsPreview .vk-ContentBody');
		this.threadsMessageLink = page.locator('.vk-ComposerModal .vk-ThreadsPreview .vk-MessagePreview');
		this.twitterMessageLink = page.locator('.rc-Composer .vk-TwitterPreview .vk-ContentBody a');
		this.twitterLinkPreviewTitle = page.locator('.rc-Composer .vk-TwitterPreview .vk-MessageLinkPreview .vk-LinkPreviewTitle');
		this.twitterLinkPreviewSource = page.locator('.rc-Composer .vk-TwitterPreview .vk-MessageLinkPreview .vk-Source');
		this.twitterLinkPrevewMedia = page.locator('.rc-Composer .vk-TwitterPreview .vk-MessageLinkPreview .vk-LinkPreviewMedia');
		this.facebookMessageLink = page.locator('.rc-Composer .vk-FacebookPreview .vk-ContentBody .vk-MessageLink');
		this.facebookLinkPreviewTitle = page.locator('.rc-Composer .vk-FacebookPreview .vk-MessageLinkPreview .vk-LinkPreviewTitle');
		this.facebookLinkPreviewSource = page.locator('.rc-Composer .vk-FacebookPreview .vk-MessageLinkPreview .vk-Source');
		this.facebookLinkPrevewMedia = page.locator('.rc-Composer .vk-FacebookPreview .vk-MessageLinkPreview .vk-LinkPreviewMedia');
		this.linkedInPreviewSingleVideo = page.locator('.vk-ComposerModal .vk-LinkedInPreview .vk-VideoContainer');
		this.instagramReelPreviewSingleVideo = page.locator('.vk-ComposerModal .vk-InstagramReelPreview .vk-StreamlinedVideo');
		this.instagramPreviewText = page.locator('.vk-ComposerModal').getByTestId('preview-container').getByLabel('Instagram post preview');
		this.instagramMessageLink = page.locator('.rc-Composer .vk-InstagramPreview .vk-ContentBody p');
		this.instagramPreviewSingleImage = page.locator('.vk-ComposerModal .vk-InstagramPreview .vk-MediaImg');
		this.linkedInPreviewSingleImage = page.locator('.vk-ComposerModal [type="LINKEDIN"] .vk-LinkedInPreview .vk-MediaImg');
		this.linkedInCompanyPreviewSingleImage = page.locator('.vk-ComposerModal [type="LINKEDIN"] .vk-LinkedInPreview .vk-MediaImg');
		this.instagramReelPreviewText = page.locator('.vk-ComposerModal').getByTestId('preview-container').locator('.vk-InstagramReelPreview');
		this.linkedInPreviewText = page.locator('.vk-ComposerModal [type="LINKEDIN"] .vk-LinkedInPreview .vk-ContentBody');
		this.linkedInCompanyPreviewText = page.locator('.vk-ComposerModal [type="LINKEDINCOMPANY"] .vk-LinkedInPreview .vk-ContentBody');
		this.linkedInMessageLink = page.locator('.rc-Composer [type="LINKEDIN"] .vk-LinkedInPreview .vk-ContentBody a');
		this.linkedInCompanyMessageLink = page.locator('.rc-Composer [type="LINKEDINCOMPANY"] .vk-LinkedInPreview .vk-ContentBody a');
		this.linkedinLinkPreviewTitle = page.locator('.rc-Composer [type="LINKEDIN"] .vk-LinkedInPreview .vk-MessageLinkPreview .vk-LinkPreviewTitle');
		this.linkedinLinkPreviewSource = page.locator('.rc-Composer [type="LINKEDIN"] .vk-LinkedInPreview .vk-MessageLinkPreview .vk-Source');
		this.linkedinLinkPrevewMedia = page.locator('.rc-Composer [type="LINKEDIN"] .vk-LinkedInPreview .vk-MessageLinkPreview .vk-LinkPreviewMedia');
		this.linkedInMentionLink = page.locator('.vk-ComposerModal [type="LINKEDIN"] .vk-LinkedInPreview .vk-ContentBody .vk-MessageMention');
		this.linkedinLinkCompanyPreviewTitle = page.locator('.rc-Composer [type="LINKEDINCOMPANY"] .vk-LinkedInPreview .vk-MessageLinkPreview .vk-LinkPreviewTitle');
		this.linkedinLinkCompanyPreviewSource = page.locator('.rc-Composer [type="LINKEDINCOMPANY"] .vk-LinkedInPreview .vk-MessageLinkPreview .vk-Source');
		this.linkedinCompanyLinkPrevewMedia = page.locator('.rc-Composer [type="LINKEDINCOMPANY"] .vk-LinkedInPreview .vk-MessageLinkPreview .vk-LinkPreviewMedia');
		this.linkedInPdfPreview = page.locator('.vk-ComposerModal [type="LINKEDIN"] .vk-LinkedInPreview .vk-PdfContainer .vk-PdfDocument');
		this.facebookMentionLink = page.locator('.vk-ComposerModal .vk-FacebookPreview .vk-ContentBody .vk-MessageMention');
		this.twitterHashtagLink = page.locator('.vk-TwitterPreview .vk-ContentBody .vk-MessageHashtag');
		this.facebookHashtagLink = page.locator('.vk-FacebookPreview .vk-ContentBody .vk-MessageHashtag');
		this.tiktokHashtagLink = page.locator('.vk-TikTokPreview .vk-MessageText .vk-MessageHashtag');
		this.instagramHashtagLink = page.locator('.vk-ComposerModal .vk-InstagramPreview .vk-ContentBody .vk-MessageHashtag');
		this.instagramFirstCommentHashtagLink = page.locator('.vk-ComposerModal .vk-InstagramFirstCommentPreview .vk-MessageHashtag');
		this.linkedInHashtagLink = page.locator('.vk-LinkedInPreview .vk-MessageHashtag');
		this.feCallOuts = page.locator('#fe-lib-async-callouts-container>div>div>div>div[type="success"]');
		this.moreButton = page.getByLabel('more', { exact: true });
		this.saveDraftFromDropdown = page.getByRole('button', { name: 'Save as draft', exact: true });
		this.addMediaButton = page.locator('.vk-ComposerModal [aria-label="Add media"]');
		this.mediaLibraryButton = page.locator('.vk-ComposerModal [aria-label="Media library"]');
		this.mediaLibraryCloseButton = page.getByRole('button', { name: 'Close media library'});
		this.termsOfServiceWall = page.locator('.vk-TermsOfServiceWall button');
		this.mediaLibraryRetryError= page.getByTestId('MediaLibraryErrorRetry');
		this.mediaLibrarySourceDropdown = page.locator('.rc-MediaLibrary .vk-SourceButton');
		this.freeImagesMediaLibrarySelection = page.locator('//*[contains(@class, "rc-MediaLibrary")]//*[text()="Free Images"]', {locationStrategy: 'xpath'});
		this.giphyMediaLibrarySelection = page.locator('//*[contains(@class, "rc-MediaLibrary")]//*[text()="GIPHY"]', {locationStrategy: 'xpath'});
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
		this.shortenWithOwlyButton = page.getByLabel('Shorten with Ow.ly');
		this.clearOwlyShorteningButton = page.locator('.rc-Composer [aria-label="Clear Ow.ly shortening"]');
		this.addTrackingButton = page.getByLabel('Add tracking');
		this.editCustomLinkSettingsButton = page.getByLabel('Edit custom link settings');
		this.editLinkShorteningButton = page.getByLabel('Edit link shortening');
		this.badLinkThumbnailWarning = page.locator('//*[@aria-labelledby="message-tab-bar-linkedIn"]//*[text()="This website is preventing us from displaying image previews. Please upload a custom thumbnail."]', {locationStrategy: 'xpath'});
		this.twitterLinkPreviewCustomizationInfo = page.getByText('Link preview customization is not supported by Twitter');
		this.twitterCharacterLimitError = page.getByTestId('messageItemError').getByText('Your text exceeds the character limit for Twitter');
		this.saveChangesModal = page.getByRole('heading', { name: 'Save your changes?' });
		this.composeTextAreaErrorTitle = page.locator('//*[@aria-labelledby="message-tab-bar-twitter"]//*[text()="Oops! You haven\'t added any text"]', {locationStrategy: 'xpath'});
		this.composeTextAreaErrorDescription = page.locator('//*[@aria-labelledby="message-tab-bar-twitter"]//*[text()="Twitter requires text to be included"]', {locationStrategy: 'xpath'});
		this.mediaFirstError = page.locator('//div[contains(@class, "rc-MediaPicker")]//*[(@role="alert")]//*[text()="Video frame rate is too high"]', {locationStrategy: 'xpath'});
		this.mediaSecondError = page.locator('//div[contains(@class, "rc-MediaPicker")]//*[(@role="alert")]//*[text()="Twitter supports video frame rates up to 60 fps. Your video is 120 fps."]');
		this.socialNetworkErrorTitle = page.locator('//div[contains(@class, "vk-ProfileSelectorError")]//*[(@role="alert")]//*[text()="Oops! You forgot to select a social account"]', {locationStrategy: 'xpath'});
		this.socialNetworkErrorDescription = page.locator('//div[contains(@class, "vk-ProfileSelectorError")]//*[(@role="alert")]//*[text()="Please choose one or more social accounts to publish to"]', {locationStrategy: 'xpath'});
		this.firstCommentHeader = page.getByText('First comment', { exact: true });
		this.firstCommentSubHeader = page.getByText('First comment is only available for direct publishing and for posts');
		this.firstCommentTextArea = page.locator('.rc-MessageEditText [aria-label="First comment"].public-DraftEditor-content');
		this.firstCommentPreview = page.locator('.vk-ComposerModal').getByTestId('preview-container').locator('.vk-InstagramFirstCommentPreview');
		this.firstCommentHashtagSuggestion = page.locator('#fullScreenComposerMountPoint .vk-ComposerModal .vk-StyledInstagramFirstCommentArea [aria-label="AI hashtag suggestions"]');
		this.hashtagPanelCloseButton = page.locator('.vk-HashTagPanelCloseButton');
		this.hashtagsArea = page.locator('.rc-Panel .-mediaContent', {locationStrategy: 'xpath'});
		this.addHashtagButton = page.getByRole('button', { name: 'Add hashtags' });
		this.firstHashtagSuggestion = page.locator('.-mediaContent [data-testid="list-item-clickable"]', {locationStrategy: 'xpath'}).first();
	}

	async setDarkLaunchCookies() {
	//Add DL here
	}

	async selectComposeButton() {
		await this.page.waitForSelector('button[aria-label="Create posts and more"]');
		const composeHandle = await this.page.$('button[aria-label="Create posts and more"]');

		if (composeHandle) {
			await composeHandle.click();
			console.log('Compose Button clicked!');
		} else {
			console.log('Compose Button not found!');
		}

		await this.postButton.click();
		await expect(this.composeScreen, 'should be navigated to composer full screen').toBeVisible();
	}

	async exitComposer() {
		await expect(this.exitComposeButton, 'Composer exit button is visible').toBeVisible();
		await this.exitComposeButton.click();
	}

	async verifyComposerHeader() {
		await expect(this.headerLabel).toHaveText('Create a post');
		await expect(this.minimizeComposeButton, 'Composer minimize button is visible').toBeVisible();
		await expect(this.exitComposeButton, 'Composer exit button is visible').toBeVisible();
	}

	async verifyComposerMessageArea() {
		await expect(this.postToWrapper).toBeVisible();
		await this.postToWrapper.click();
		await expect(this.profileDropDown, 'Profile picker is visible').toBeVisible();
		await expect(this.snInputPlaceholder, 'Social profile input field is visible').toBeVisible();
		await expect(this.tabContent).toHaveText('Your post');
		await expect(this.messageArea, 'Composer message area is visible').toBeVisible();
		await expect(this.emojiButton, 'Composer emoji button is visible').toBeVisible();
		await expect(this.hashTagSuggestions, 'Composer hashtags button is visible').toBeVisible();
		await expect(this.addMediaButton, 'Composer media button is visible').toBeVisible();
		await expect(this.canvaButton, 'Composer canva button is visible').toBeVisible();
		await expect(this.genericPostPreview, 'Composer generic preview is visible').toBeVisible();
		await expect(this.genericPostPreviewText).toHaveText('Write your caption, then customize it for each social network');
	}

	async verifyComposerFooter() {
		await expect(this.scheduleLaterButton, 'Composer schedule later button is visible').toBeVisible();
		await expect(this.postNowButton, 'Composer post now button is visible').toBeVisible();
		await expect(this.saveAsDraftButton, 'Composer save as draft button is visible').toBeVisible();
	}

	async verifyComposerDraftFooter() {
		await expect(this.scheduleLaterButton).not.toBeVisible();
		await expect(this.postNowButton).not.toBeVisible();
		await expect(this.scheduleButton, 'Composer schedule button is visible').toBeVisible();
		await expect(this.saveAsDraftButton, 'Composer save as draft button is visible').toBeVisible();
	}

	async verifyComposerModal() {
		await this.verifyComposerHeader();
		await this.verifyComposerMessageArea();
		await this.verifyComposerFooter();
	}

	async selectSocialProfile(name) {
		const profileSelectorItem = this.page.getByTestId('MessageEditArea').getByText(`${name}`).first();

		await profileSelectorItem.click();
		await this.verifySocialProfileSelected(name);
	}

	async searchSocialProfile(name) {
		const profileSelectorItem = this.page.locator(`(//*[contains(@class, "rc-Composer")]//*[contains(@class, "vk-SocialNetworkPicker")]//div[contains(@class, "vk-ProfileListItemTitle") and text()="${name}"])[1]`);
		const inputSelector = this.page.locator(`.vk-ComposerModal .vk-SocialNetworkPicker .vk-PillsInputWrapper input[value="${name}"]`);
		await this.page.locator('.vk-ComposerModal .vk-SocialNetworkPicker .vk-PillsInputWrapper input').fill(name);
		await this.page.waitForTimeout(500);
		await expect(inputSelector).toBeVisible();
		await expect(profileSelectorItem).toBeVisible();
		await profileSelectorItem.click();
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
			const multipleMediaOverlays = Array.from(await this.mediaOverLay);
			await Promise.all(multipleMediaOverlays.map(async (overlay) => {
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

	async clearMessageEditor() {
		await this.messageArea.click();
		await this.messageArea.fill('');
	}

	async removeCharacters(count) {
		await this.messageArea.click();
		await this.page.keyboard.press('End');
		await this.page.waitForTimeout(500);

		for (let i = 0; i < count; i++) {
			await this.page.keyboard.press('Backspace');
		}
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

	async waitForCalloutToDisappear() {
		const selector = '#fe-lib-async-callouts-container>div>div>div>div[type="success"]';
		await this.page.waitForSelector(selector, { state: 'visible', timeout: longTimeout });
		await this.page.waitForSelector(selector, { state: 'hidden' });
	}

	async verifySocialProfileSelected(name) {
		const pillText = this.page.locator(`//*[contains(@class, "vk-PillText") and text()="${name}"]`);
		await expect(pillText, 'Social network is selected').toBeVisible();
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

	async verifyThreadsPreview(text) {
		await expect(this.threadsPreviewText, 'Threads preview is not updated with text message on composer').toContainText(`${text}`);
	}

	async verifyThreadsImagePreview() {
		const isImageVisible = await Promise.race([
			this.threadsPreviewSingleImage.waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
			this.threadsPreviewSingleVideo.waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
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

	async verifyInstagramImagePreview() {
		const isImageVisible = await Promise.race([
			this.instagramPreviewSingleImage.waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
			this.instagramPreviewMediaContainer.waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
		]);

		expect(isImageVisible).toBeTruthy();
	}

	async verifyLinkedInImagePreview() {
		const isImageVisible = await Promise.race([
			this.linkedInPreviewSingleImage.waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
			this.linkedInPreviewMediaContainer.waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
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

	async verifyLinkInLinkedInPreview(text) {
		await expect(this.linkedInMessageLink, 'Linkedin preview is not updated with link preview on composer').toBeVisible();
		expect(await this.linkedInMessageLink.getAttribute('href')).toContain(text);
		expect(await this.linkedInMessageLink.innerText()).toContain(text);
	}

	async verifyLinkInLinkedInCompanyPreview(text) {
		await expect(this.linkedInCompanyMessageLink, 'Linkedin preview is not updated with link preview on composer').toBeVisible();
		expect(await this.linkedInCompanyMessageLink.getAttribute('href')).toContain(text);
		expect(await this.linkedInCompanyMessageLink.innerText()).toContain(text);
	}

	async verifyLinkInInstagramPreview(text) {
		await expect(this.instagramMessageLink, 'Instagram preview is not updated with link preview on composer').toBeVisible();
		expect(await this.instagramMessageLink.innerText()).toContain(text);
	}

	async verifyLinkInFacebookPagePreview(text) {
		await expect(this.facebookMessageLink, 'Facebook preview is not updated with link preview on composer').toBeVisible();
		expect(await this.facebookMessageLink.getAttribute('href')).toContain(text);
		expect(await this.facebookMessageLink.innerText()).toContain(text);
	}

	async verifyLinkInThreadsPreview(text) {
		await expect(this.threadsMessageLink, 'Twitter preview is not updated with link preview on composer').toBeVisible();
		expect(await this.threadsMessageLink.innerText()).toContain(text);
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

	async verifyInstagramFirstCommentPreview(comment) {
		await expect(this.firstCommentPreview, 'First comment preview is visible on composer').toBeVisible();
		await expect(this.firstCommentPreview, 'Instagram first comment preview is not updated with text on composer').toContainText(`${comment}`);
	}

	async selectShortenWithOwlyButton() {
		await expect(this.shortenWithOwlyButton).toBeVisible();
		await this.shortenWithOwlyButton.click();
		await this.page.waitForTimeout(2000);
	}

	async selectEditLinkShorteningButton() {
		await expect(this.editLinkShorteningButton).toBeVisible();
		await this.editLinkShorteningButton.click();
	}

	async selectAddTrackingButton() {
		await expect(this.addTrackingButton).toBeVisible();
		await this.addTrackingButton.click();
	}

	async verifyLinkedInPreview(text) {
		await expect(this.linkedInPreviewText, 'Linkedin preview is not updated with text on composer').toContainText(`${text}`);
	}

	async verifyLinkedInCompanyPreview(text) {
		await expect(this.linkedInCompanyPreviewText, 'Linkedin preview is not updated with text on composer').toContainText(`${text}`);
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

	async verifyHashtagInFacebookPreview(hashtag) {
		await expect(this.facebookHashtagLink, 'facebook preview is not updated with hashtag on composer').toBeVisible();
		assert((await this.facebookHashtagLink.textContent()).includes(hashtag), 'Hashtag not found on Facebook preview');
		assert((await this.facebookHashtagLink.getAttribute('href')).includes(`https://www.facebook.com/hashtag/${hashtag}`), 'Incorrect href value in Facebook preview');
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

	async verifyInstagramFirstCommentHashtagPreview(hashtag) {
		await expect(this.instagramFirstCommentHashtagLink, 'Instagram first comment preview is not updated with hashtag on composer').toBeVisible();
		assert((await this.instagramFirstCommentHashtagLink.textContent()).includes(hashtag), 'Hashtag not found on Instagram first comment preview');
		assert((await this.instagramFirstCommentHashtagLink.getAttribute('href')).includes(`https://www.instagram.com/explore/tags/${hashtag}`), 'Incorrect href value in Instagram first comment preview');
	}

	async verifyLinkedInHashtagPreview(hashtag) {
		await expect(this.linkedInHashtagLink, 'Linkedin post preview is not updated with hashtag on composer').toBeVisible();
		assert((await this.linkedInHashtagLink.textContent()).includes(hashtag), 'Hashtag not found on Linkedin preview');
	}

	async verifyLinkedInPdfPreview() {
		await expect(this.linkedinNetworkType, 'Linkedin preview is not updated with PDF preview on composer').toContainText('LinkedIn');
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
		await this.addMediaButton.click();
		await this.mediaLibraryButton.click();
		await this.page.waitForTimeout(1000);
		if (await this.termsOfServiceWall.isVisible()) {
			await this.termsOfServiceWall.click();
		}
		await expect(this.mediaLibraryRetryError).not.toBeVisible(); //Ensure a media library error is not displayed.
	}

	async selectFreeImagesInMediaLibrary() {
		await expect(this.mediaLibrarySourceDropdown, 'Media library source dropdown is not visible').toBeVisible();
		await this.mediaLibrarySourceDropdown.click();
		await expect(await this.freeImagesMediaLibrarySelection, 'Free images drop down list is not visible ').toBeVisible();
		await this.freeImagesMediaLibrarySelection.click();
	}

	async searchMediaLibrary(searchTerm) {
		await this.mediaSearchBox.click();
		await this.mediaSearchBox.fill(searchTerm);
		await this.page.waitForTimeout(1000); // Wait for search results to load
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

	async selectGiphyInMediaLibrary() {
		await expect(this.mediaLibrarySourceDropdown, 'Media library source dropdown is not visible').toBeVisible();
		await this.mediaLibrarySourceDropdown.click();
		expect(await this.giphyMediaLibrarySelection).toBeVisible();
		await this.giphyMediaLibrarySelection.click();
		await this.page.waitForTimeout(1000);
		if (await this.termsOfServiceWall.isVisible()) {
			await this.termsOfServiceWall.click();
		}
		await expect(this.mediaLibraryRetryError).not.toBeVisible(); //Ensure a media library error is not displayed.
	}

	async closeMediaLibrary() {
		await this.mediaLibraryCloseButton.click();
	}

	async selectMention(mentionName) {
		const mentionItem = this.page.locator(`(//div[contains(@class, "vk-Mention")]/*[contains(text(),"${mentionName}")])[1]`, {locationStrategy: 'xpath'});

		await this.mentionsList.isVisible();
		await mentionItem.isVisible();
		await mentionItem.click();
	}

	async openLinkSettingsDialog() {
		await expect(this.addTrackingButton, 'Add tracking button is missing from composer').toBeVisible();
		await this.addTrackingButton.click();
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
				messagesToDelete = response)
			.catch(error => console.log(`Error fetching next month scheduled messages: ${error}`));

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
