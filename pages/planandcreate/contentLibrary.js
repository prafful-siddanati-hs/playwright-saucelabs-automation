const { expect } = require('@playwright/test');

exports.ContentLibraryPage = class ContentLibraryPage {
	constructor(page) {
		this.page = page;
		this.contentLibrarySection = page.locator('#publisherSection');
		this.createContentLibBtn = page.getByText('Create Content Library');
		this.libNameInput = page.getByRole('textbox');
		this.createBtn = page.getByRole('button', { name: 'Create' });
		this.uploadAssetsButton = page.getByRole('button', { name: 'Upload Assets'});
		this.createAssetPopup = page.locator('#createAsset');
		this.selectLibraryButton = page.locator('button').filter({ hasText: 'Select a Content Library…' });
		this.addAssetButton = page.getByRole('button', { name: 'Add new asset' });
		this.addTeamBtn = page.getByLabel('Create Library').getByRole('listitem').locator('div');
		this.librarySelectBtn = page.getByLabel('Select a library');
		this.editLibraryBtn = page.getByRole('option', { name: 'Edit Library...' });
		this.removeLibraryBtn = page.getByRole('button', { name: 'Remove' });
	}

	async visit() {
		await this.page.goto('/dashboard#/publisher/contentlibrary');
		await expect(this.contentLibrarySection).toBeVisible();
		await this.page.waitForLoadState('networkidle');
	}

	async createContentLibrary(libraryName, teamName) {
		const selectTeam = this.page.getByRole('option', { name: `${teamName}` }).locator('div');
		await expect(this.createContentLibBtn).toBeVisible();
		await this.createContentLibBtn.hover();
		await this.createContentLibBtn.click();
		await expect(this.libNameInput).toBeVisible();
		await this.libNameInput.hover();
		await this.libNameInput.click();
		await this.libNameInput.fill(libraryName);
		await this.addTeamBtn.click();
		await selectTeam.click();
		await expect(this.createBtn).toBeEnabled();
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

	async verifyContentLibraryTemplate(templateText) {
		const clTemplate = this.page.locator(`text=${templateText}`);
		await clTemplate.isVisible();
	}

	async deleteContentLibrary() {
		await expect(this.librarySelectBtn).toBeVisible();
		await this.librarySelectBtn.click();
		await this.editLibraryBtn.click();
		await expect(this.removeLibraryBtn).toBeVisible();
		await this.removeLibraryBtn.click();
		this.page.on('dialog', async dialog => {
			await dialog.accept();
		});
		await this.removeLibraryBtn.click();
	}
};
