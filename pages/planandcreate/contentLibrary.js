const { expect } = require('@playwright/test');

exports.ContentLibraryPage = class ContentLibraryPage {
	constructor(page) {
		this.page = page;
		this.contentLibrarySection = page.locator('#publisherSection');
		this.createContentLibBtn = page.getByText('Create Content Library');
		this.libNameInput = page.getByRole('textbox');
		this.createBtn = page.getByLabel('Create Library');
		this.uploadAssetsButton = page.getByRole('button', { name: 'Upload Assets'});
		this.createAssetPopup = page.locator('#createAsset');
		this.selectLibraryButton = page.locator('button').filter({ hasText: 'Select a Content Library…' });
		this.addAssetButton = page.getByRole('button', { name: 'Add new asset' });

	}

	async visit() {
		await this.page.goto('/dashboard#/publisher/contentlibrary');
		await expect(this.contentLibrarySection).toBeVisible();
	}

	async createContentLibrary(libraryName) {
		await expect(this.createContentLibBtn).toBeVisible();
		await this.createContentLibBtn.click();
		await this.createContentLibBtn.click();
		await expect(this.libNameInput).toBeVisible();
		await this.libNameInput.click();
		await this.libNameInput.fill(libraryName);
		//TODO:Select team (first item from the list)
		await expect(this.createBtn).toBeEnabled();
		await this.createBtn.click();
		await this.createBtn.click();
		await expect(this.uploadAssetsButton).toBeVisible();
	}

	async createContentLibraryAsset(libraryName) {
		const libToSelect = this.page.getByRole('option', { name: `${libraryName}` }).locator('div');
		await expect(this.createAssetPopup).toBeVisible();
		await expect(this.selectLibraryButton).toBeVisible();
		await this.selectLibraryButton.click();
		await libToSelect.click();
		await expect(this.addAssetButton).toBeEnabled();
		await this.addAssetButton.click();


	}
};
