const { expect } = require('@playwright/test');

exports.ComposePage = class ComposePage {
	constructor(page) {
		this.page = page;
		this.composeButton = page.getByLabel('Composer', { exact: true });
		this.postButton = page.locator('div.animated-secondary').getByLabel('Post');
		this.composeScreen = page.locator('#fullScreenComposerMountPoint .vk-ComposerModal');
		this.profileDropDown = page.locator('[aria-label="Select a social account (required)"]');
		this.snContentItems = page.locator('.vk-ContentItems');
		this.snPilltext = page.locator('.vk-PillText');
		this.composerHeader = page.locator('.vk-ComposerHeader');
		this.previewNetworkType = page.locator('.vk-ComposerModal .vk-MessagePreviewHeader .vk-NetworkType');
		this.genericPreviewSingleImage = page.locator('.vk-ComposerModal .vk-GenericPreview .vk-MediaImg');
		this.twitterPreviewSingleImage = page.locator('.vk-ComposerModal .vk-TwitterPreview .vk-MediaImg');
		this.facebookPreviewSingleImage = page.locator('.vk-ComposerModal .vk-FacebookPreview .vk-MediaImg');
		this.messageArea = page.getByTestId('MessageEditArea').getByLabel('Text');
		this.scheduleLaterButton = page.getByRole('button', { name: 'Schedule for later' });
		this.scheduleDone = page.getByRole('button', { name: 'Done' });
		this.scheduleDoneButton = page.getByTestId('schedule-post-done-btn');
		this.scheduleButton = page.locator('button:has-text("Schedule")');
		this.saveChangesButton = page.getByRole('button', { name: 'Save changes' });
		this.postNowButton = page.getByRole('button', { name: 'Post now', exact: true });
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
		this.instagramPreviewText = page.locator('.vk-ComposerModal').getByTestId('preview-container').getByLabel('Instagram post preview');
		this.instagramReelPreviewText = page.locator('.vk-ComposerModal').getByTestId('preview-container').locator('.vk-InstagramReelPreview');
		this.exitButton = page.getByRole('button', { name: 'Exit tutorial' });
		this.feCallOuts = page.locator('#fe-lib-async-callouts-container>div>div>div>div[type="success"]');
		this.moreButton = page.getByLabel('more', { exact: true });
		this.saveDraftFromDropdown = page.getByRole('button', { name: 'Save draft', exact: true });
		this.mediaLibraryButton = page.getByLabel('Media library', { exact: true });
		this.mediaLibraryCloseButton = page.getByRole('button', { name: 'Close media library'});
		this.termsOfServiceWall = page.locator('.vk-TermsOfServiceWall button');
		this.mediaSearchBox = page.getByPlaceholder('Search media');
		this.loadingBars = page.locator('[data-testid="bouncing-bars-loader-wrapper"]');
		this.mediaContent = page.locator('.-mediaContent');
		this.firstImage = page.locator('.-mediaRow');
		this.mediaThumbnail = page.locator('.rc-MediaLibrary .-mediaContainer .MediaThumbnail');
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

		await this.profileDropDown.click();
		await expect(this.snContentItems).toBeVisible();
		await profileSelectorItem.click();
		await this.composerHeader.click();
		await this.verifySocialProfileSelected(name);
	}

	async uploadFile(name) {
		await this.page.setInputFiles('.vk-MediaUpload input[type="file"]',`${name}`);
		await expect(this.mediaOverLay).toBeVisible();
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
		await expect(this.feCallOuts).toHaveCount(1);
	}

	async verifySocialProfileSelected(name) {
		await this.page.waitForSelector(`text="${name}"`);
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
		await this.moreButton.click();
		await this.saveDraftFromDropdown.click();
		await expect(this.composeScreen).not.toBeVisible();
	}

	async openMediaLibrary() {
		await this.mediaLibraryButton.click();
		await this.page.waitForTimeout(1000);
		if (await this.termsOfServiceWall.isVisible()) {
			await this.termsOfServiceWall.click();
		}
	}

	async searchMediaLibrary(searchTerm) {
		await this.mediaSearchBox.click();
		await this.mediaSearchBox.fill(searchTerm);
		await expect(this.loadingBars).not.toBeVisible();
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
};
