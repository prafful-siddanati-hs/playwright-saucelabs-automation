exports.ManageCampaignsPage = class ManageCampaignsPage {
	constructor(page) {
		this.page = page;
		this.manageCampaignsView = page.locator('.rc-AppCampaignsView .rc-ManageCampaigns');
		this.createCampaignButton = page.locator('.rc-AppCampaigns button.-createCampaignButton');
		this.closeButton = page.locator('.rc-ManageCampaigns .rc-HeaderCloseButton');
		this.archiveToggleListItem = page.locator('.rc-ManageCampaigns .vk-ToggleArchiveListItem');
		this.archiveConfirmButton = page.locator('.vk-ConfirmArchiveButton');
		this.noCampaignsMessage = page.locator('.rc-ManageCampaigns .-emptyCampaigns');
		this.campaignsList = page.locator('.rc-ManageCampaigns .vk-CampaignList');
	}
};
