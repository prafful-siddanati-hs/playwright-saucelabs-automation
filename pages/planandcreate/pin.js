const { expect } = require('@playwright/test');
const {getRandomMediaFile} = require('../../globals');
const {join} = require('node:path');

exports.PinPage = class PinPage {
	constructor(page) {
		this.page = page;
		this.composeButton = page.locator('button[aria-label="Create posts and more"]');
		this.composerHeader = page.locator('.vk-ComposerHeader');
		this.pinButton = page.locator('[data-test-id="new-pin"]');
		this.messageArea = page.getByTestId('MessageEditArea').getByLabel('Text');
		this.mediaOverLay = page.locator('.vk-ComposerModal .vk-MediaAttachmentThumbnailCard');
		this.pinterestBoardPicker = page.getByPlaceholder('Select boards (required)');
		this.extendedInfoTextEntry = page.getByPlaceholder('Add the URL this Pin links to (required)');
		this.pinterestPreview = page.locator('.vk-PinterestPreview');
		this.previewDescription = page.locator('.vk-PinterestPreviewDescription');
		this.previewWebsiteUrl = page.locator('.vk-PinterestPreviewUrl');
		this.feCallOuts = page.locator('#fe-lib-async-callouts-container>div>div>div>div[type="success"]');
		this.postNowButton = page.getByRole('button', { name: 'Post now', exact: true });
		this.messageCharCount = page.locator('(//*[contains(@class, "MessageEditArea")]//*[contains(@class, "-characterCounterCount")])[1]', {locationStrategy: 'xpath'});
	}

	async selectPinButton() {
		await expect(this.composeButton).toBeVisible();
		await this.composeButton.click();
		await this.composeButton.click();
		await this.pinButton.click();
		await expect(this.pinterestBoardPicker).toBeVisible();
		await expect(this.extendedInfoTextEntry).toBeVisible();
		await expect(this.messageArea).toBeVisible();
	}

	async selectFirstPinBoard() {
		await this.pinterestBoardPicker.click();
		await this.page.locator('(//*[contains(@class,"vk-PinterestBoardName")])[1]').click();
		await this.composerHeader.click();
	}

	/**
	 * Writes a message into the pinterest message editor area.
	 *
	 * @param {string} message - The message to be written.
	 * @param {Object} [testInfo=false] - Optional. Contains info about test environment. Should be used only if test needs to be run on webkit.
	 * @param {string} testInfo.project.name - The name of the project. Eg: 'webkit', 'chromium', 'firefox'.
	 * Usage example:
	 * test('Run this test in safari also', async ({ page }, testInfo) => { //Can be skipped if test is intended to run only on chrome
	 * 		await pinPage.writePinMessage('Hello', testInfo);
	 * });
	 */
	async writePinMessage(message, testInfo = false) {
		await this.page.keyboard.press('Escape');
		const originalContent = await this.messageArea.textContent();
		const newContent = `${originalContent}${message}`;
		if (testInfo && testInfo.project.name === 'webkit') {
			await this.messageArea.pressSequentially(newContent);
		} else {
			await this.messageArea.fill(newContent);
		}
		await expect(this.page.locator('.vk-Loader')).toHaveCount(0);
	}

	async writeWebsiteUrl(url) {
		await this.extendedInfoTextEntry.click();
		await this.extendedInfoTextEntry.fill(url);
	}

	async uploadImageFile(testDataImagesFolder) {
		try {
			const randomFile = await getRandomMediaFile(testDataImagesFolder);
			const filePath = join(testDataImagesFolder, randomFile);

			await this.page.setInputFiles('.vk-MediaUpload input[type="file"]', filePath);
			await expect(this.mediaOverLay).toBeVisible();
		} catch (error) {
			console.error('Error:', error);
		}
	}

	async verifyPinPreview(text, url) {
		await expect(this.pinterestPreview, 'Pin preview is not visible').toBeVisible();
		await expect(this.previewDescription, 'Pin description is not visible').toContainText(`${text}`);
		await expect(this.previewWebsiteUrl, 'Pin website url is not visible').toContainText(`${url}`);
	}

	async sendNow() {
		await this.postNowButton.click();
		await expect(this.postNowButton, 'Pin send message failed').not.toBeVisible();
		await expect(this.feCallOuts).toHaveCount(1);
	}

	async removeCharacters(count) {
		await this.messageArea.click();
		await this.page.keyboard.press('End');
		await this.page.waitForTimeout(500);

		for (let i = 0; i < count; i++) {
			await this.page.keyboard.press('Backspace');
		}
	}

	async clearMessageEditor() {
		await this.messageArea.click();
		await this.messageArea.fill('');
	}

};
