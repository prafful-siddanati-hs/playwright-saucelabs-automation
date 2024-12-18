const { expect } = require('@playwright/test');
const { format, formatISO, addDays, startOfWeek, addWeeks, subDays } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');
const { plan_create } = require('../../globals');
const deleteScheduledMessageById = require('../../custom-commands/deleteScheduledMesssagesById');
const getScheduledMessages = require('../../custom-commands/getScheduledMessages');
const scheduleV3Message = require('../../custom-commands/scheduleV3Message');
const timeZone = 'America/Toronto';
const assert = require('assert');
const NUM_TIME_SLOTS_IN_WEEK = 7;
const NUM_TIME_SLOTS_IN_EXPANDED_VIEW = 168;

exports.PlannerPage = class PlannerPage {
	constructor(page) {
		this.page = page;
		/**
     * - - - - - PLANNER GENERIC - - - - -
     */
		this.plannerButton = page.getByLabel('Plan', { exact: true });
		this.detailPane = page.locator('[data-testid="DetailPaneRenderer"]');
		this.genericDetailPaneText = page.locator('.vk-GenericPreview .vk-PreviewMessageText');
		this.unschedPostCheckbox = page.getByTestId('UnscheduledPostsCheckBoxContainer');
		this.closeExportModalButton = page.locator('.vk-DialogCloseButton');
		this.firstDayFromMonthCalendar = page.locator('.vk-Planner .rdp-day[tabindex="0"]');
		this.nextMonthNavigator = page.getByLabel('Go to next month');
		this.startDayOfSunWeek = page.locator('//div[position() = 1 and text() = "Sun"]', { locateStrategy: 'xpath' });
		this.startDayOfMonWeek = page.locator('//div[position() = 1 and text() = "Mon"]', { locateStrategy: 'xpath' });
		this.feCallOut = page.locator('#fe-lib-async-callouts-container>div>div>div>div[type="success"]');
		this.extbutton = page.locator('#walkthrough-root .vk-OnboardingPopoverExit');
		this.recommendedTimesPlaceholder = page.locator('(//*[contains(@class,"vk-SuggestedPostContainer")])[1]', { locateStrategy: 'xpath' });
		this.recommendedTimesPopoverSocialProfile = page.locator('.vk-SuggestedPostContainer #popper li');
		this.recommendedTimesNewPost = page.locator('(//*[contains(@class, "vk-SuggestedPostContainer")]//*[contains(@class,"vk-NewPostPlaceholderDropdownItem")]//*[text()="Post"])[1]', { locateStrategy: 'xpath' });
		this.editDraftButton = page.locator('//button[text()="Edit draft"]', { locateStrategy: 'xpath' });
		this.ghostCard = page.locator('//*[contains(@data-testid,"ghost-card")]', { locateStrategy: 'xpath' });

		/**
     * - - - - - CALENDAR: TOP PANE - - - - -
     */
		this.calendarTab = page.getByTestId('MainPanelWrapper').getByText('Calendar');
		this.draftsTab = page.getByTestId('MainPanelWrapper').getByText('Drafts');
		this.approvalstab = page.getByTestId('MainPanelWrapper').getByText('Approvals');
		this.contentTab = page.locator('.vk-NavigationTab [data-label-content="Content"]');
		this.datePickerButton = page.locator('.vk-Planner .vk-Toolbar #dateRangeAnchor');
		this.orgPicker= page.getByTestId('OrgPicker');
		this.createPostButton = page.locator('.vk-Planner [data-testid="CreatePostButton"]');
		this.addMediaButton = page.getByTestId('ContentButton');
		this.filtersButton = page.getByTestId('FiltersButton');
		this.filterAccountsPicker = page.getByTestId('right-sheet').getByText('Social accounts');
		this.filterPostStatusPicker = page.getByTestId('right-sheet').getByText('Post status');
		this.filterCampaignsPicker = page.getByTestId('right-sheet').getByText('Campaigns');
		this.filterApplyButton = page.getByLabel('Apply filters');
		this.clearAllFilters = page.locator('button[aria-label="Clear filters"]');
		this.filterPanelClearButton = page.locator('[data-testid="right-sheet"] button[aria-label="Clear filters"]');
		this.filterCloseButton = page.getByTestId('right-sheet').getByLabel('Close Panel');
		this.filterBackButton = page.getByText('keyboard_arrow_left');
		this.viewWeekToggle = page.getByLabel('View weekly planner');
		this.viewMonthToggle = page.getByLabel('View monthly planner');
		this.todayButton = page.getByTestId('TodayButton');
		this.nextButton = page.getByTestId('NextNavButton');
		this.prevButton = page.getByTestId('PrevNavButton');
		this.settingsButton = page.getByTestId('SettingsButton');
		this.exportButton = page.getByTestId('planner-export-button');
		this.csvExportOption = page.getByTestId('export-dropdown-csv-list-item');
		this.exportModal = page.locator('.vk-ExportingModalContainer');
		this.startOfWeekSundayButton = page.locator('//*[contains(@role, "listbox")]//label[text()="Sunday"]', { locateStrategy: 'xpath' });
		this.startOfWeekMondayButton = page.locator('//*[contains(@role, "listbox")]//label[text()="Monday"]', { locateStrategy: 'xpath' });
		this.recommendedTimeToggle = page.locator('//*[contains(@role, "listbox")]//label[text()="Show recommended times"]', { locateStrategy: 'xpath' });

		/**
     * - - - - - CALENDAR: WEEK VIEW - - - -
     */
		this.week = page.locator('.vk-Planner .vk-Week');
		this.messages = page.locator('.vk-Planner .vk-Week .vk-DraggableCard');
		this.mediaThumbnail = page.getByTestId('ThumbnailContainer');
		this.timeSlot = page.locator('.vk-Planner .vk-TimeSlot');
		this.weekViewValidation = page.locator('.vk-Planner .vk-CalendarHeader');
		this.dayMessageCounter = page.locator('//*[contains(@class,vk-CalendarHeader)]/*[contains(@aria-label,"today")]//*[contains(@data-testid,"NumContent")]', { locateStrategy: 'xpath' });
		this.todayColumn = page.getByLabel('today');
		this.newPost = page.locator('//*[contains(@class, "vk-NewPostContainer")]//*[contains(@class,"vk-NewPostPlaceholderDropdownItem")]//*[text()="Post"]', { locateStrategy: 'xpath' });
		this.newPin = page.locator('//*[contains(@class, "vk-NewPostContainer")]//*[contains(@class,"vk-NewPostPlaceholderDropdownItem")]//*[text()="Pin"]', { locateStrategy: 'xpath' });
		this.nextMonthFromDateRange = page.locator('//*[contains(@class, "vk-Planner")]//*[contains(@class, \'rdp-month\')]//*[@aria-label="Go to next month"]', { locateStrategy: 'xpath' });
		this.firstHolidayPill = page.locator('//*[@data-dap-target="planner-ai-suggestions-chip"]', { locateStrategy: 'xpath' });
		this.draggableCard = page.getByTestId('DraggableCard');
		this.exitOnboardingPopover = page.locator('#walkthrough-root .vk-OnboardingPopoverExit');

		/**
     * - - - - - CALENDAR: MONTH VIEW - - - - -
     */
		this.month = page.locator('.vk-Planner .vk-Month');
		this.viewToggleMonthByInactiveButton = page.locator('.vk-Planner .vk-CountToggleBar [aria-pressed="false"]');
		this.monthDateRangeButton = page.locator('.vk-Planner [data-testid="date-picker-toggle-button"]');
		this.daySlot = page.locator('.vk-Planner .vk-Month .vk-Day');
		this.pausedIconInMonthView = page.locator('.vk-Row .vk-CountByPostTypeWrapper .pause');
		this.monthDayTodayClickable = page.locator('//*[@data-today]', { locateStrategy: 'xpath' });
		this.prevYearNavigationButton = page.getByLabel('Previous year');
		this.nextYearNavigationButton = page.getByLabel('Next year');
		this.newPostMonthSidePane = page.locator('//*[contains(@id, "popper")]//*[contains(@class,"vk-NewPostPlaceholderDropdownItem")]//*[text()="Post"]', { locateStrategy: 'xpath' });
		this.messageStatusOnMonthView = page.getByTestId('DayOfMonthStatus-SCHEDULED').first();
		this.messageCountOnMonthView = page.getByTestId('DayOfMonthCount-SCHEDULED').first();
		this.draftCountOnMonthView = page.getByTestId('DayOfMonthCount-DRAFTS');
		this.messageSNCountOnMonthView = page.locator('//*[contains(@class, "vk-SNCountBarWrapper")]//div//div[last()]', { locateStrategy: 'xpath' });
		this.messageBarCountOnMonthSNView = page.locator('//*[contains(@class, "vk-SNCountBarWrapper")]', { locateStrategy: 'xpath' });
		this.disconnectedIcon = page.locator('[data-status="DISCONNECTED"]');
		this.monthSidePaneCloseButton = page.locator('.vk-DetailPane .vk-CloseButton');
		this.monthSidePaneCreateButton = page.locator('.vk-DetailPane .vk-MonthSidePaneCreateButton');
		this.monthSidePaneBackButton = page.locator('.vk-DetailPane .vk-BackButton');
		this.hourCardBlockFirstCard = page.locator('(//*[contains(@class, "vk-DetailPane")]//*[contains(@class, "vk-HourBlockContainer")]//*[contains(@class, "vk-Card")])[1]', { locateStrategy: 'xpath' });
		this.hourCardBlockTitle = page.locator('(//*[contains(@class, "vk-DetailPane")]//*[contains(@class, "vk-HourBlockContainer")]//*[contains(@class, "vk-HourBlockTitle")])[1]', { locateStrategy: 'xpath' });
		this.hourCardBlockShowMore = page.locator('//button[.//*[starts-with(text(), "Show")]]', { locateStrategy: 'xpath' });
		this.recommendedTimesPlaceholderMonthPanel = page.locator('(//*[contains(@class,"vk-RecommendedTimeCardContainer")])[1]', { locateStrategy: 'xpath' });
		this.recommendedTimesNewPostListPanel = page.locator('((//*[contains(@class, "vk-DropdownContainer")]//*[contains(@class,"vk-NewPostPlaceholderDropdownItem")]//*[text()="Post"])[1]', { locateStrategy: 'xpath' });
		this.monthSidePaneCards = page.locator('.vk-DetailPane .vk-HourBlockCardsContainer .vk-Card');

		/**
     * - - - - - CALENDAR: LIST VIEW - - - - -
     */
		this.viewToggleList = page.getByLabel('View planner as a list');
		this.mediaThumbnailListView = page.locator('.vk-ListViewCardListCardsContainer').getByTestId('ThumbnailContainer');
		this.postVolumeCalendarContainer = page.getByLabel('Post volume graphs');
		this.postVolumeGraphWeekContainer = page.getByTestId('Weeks');
		this.postVolumeGraphWeek = page.getByTestId('Weeks').locator('.vk-PostVolumeGraphWeek');
		this.postVolumeCalendarNextWeek = page.getByTestId('PostVolumeGraph').getByLabel('Next week');
		this.postVolumeCalendarPrevWeek = page.getByTestId('PostVolumeGraph').getByLabel('Previous week');
		this.collapsePostVolumeGraph = page.locator('.vk-CollapseButton');
		this.singlePvgBar = page.locator('//*[contains(@data-testid,"PostCountBarGraph")]/ancestor::*[contains(@aria-label,"1 post on")]', { locateStrategy: 'xpath' });
		this.listViewCreateButton = page.locator('(//*[contains(@class, "vk-ListViewCreateButtonDropdown")])[1]', { locateStrategy: 'xpath' });
		this.listViewNewPost = page.locator('//*[contains(@class, "vk-NewPostPlaceholderDropdownItem")]//*[text()="Post"]', { locateStrategy: 'xpath' });
		this.listViewNewPin = page.locator('//*[contains(@class, "vk-NewPostPlaceholderDropdownItem")]//*[text()="Pin"]', { locateStrategy: 'xpath' });
		this.scheduledCardsListView = page.locator('//*[contains(@data-testid,"StateText") and text()="Scheduled"]', { locateStrategy: 'xpath' });
		this.pendingApprovalCardsListView = page.locator('//*[contains(@data-testid,"StateText") and text()="Pending"]', { locateStrategy: 'xpath' });
		this.failedCardsListView = page.locator('//*[contains(@data-testid,"StateText") and text()="Failed"]', { locateStrategy: 'xpath' });
		this.publishedCardsListView = page.locator('//*[contains(@data-testid,"StateText") and text()="Published"]', { locateStrategy: 'xpath' });
		this.draftCardsListView = page.locator('//*[contains(@data-testid,"StateText") and text()="Draft"]', { locateStrategy: 'xpath' });
		this.listViewApproveAction = page.locator('.vk-ActionsWrapper button[aria-label="Approve post"]');
		this.listViewRejectAction = page.locator('.vk-ActionsWrapper button[aria-label="Reject post"]');
		this.listViewMoreActions = page.locator('.vk-ActionsWrapper button[aria-label="More actions"]');
		this.listViewDuplicateAction = page.locator('.vk-ActionsWrapper button[aria-label="Duplicate post"]');
		this.listViewEditAction = page.locator('.vk-ActionsWrapper button[aria-label="Edit post"]');
		this.listViewDeleteAction = page.locator('.vk-ActionsWrapper button[aria-label="Delete post"]');
		this.editFromMoreActionsItems = page.locator('//*[contains(@class, "vk-ActionsWrapper")]//*[contains(@class, "vk-ListItemWrapper")]//*[text()="Edit"]', { locateStrategy: 'xpath' });
		this.duplicateFromMoreActionsItems = page.locator('//*[contains(@class, "vk-ActionsWrapper")]//*[contains(@class, "vk-ListItemWrapper")]//*[text()="Duplicate"]', { locateStrategy: 'xpath' });
		this.deleteFromMoreActionsItems = page.locator('//*[contains(@class, "vk-ActionsWrapper")]//*[contains(@class, "vk-ListItemWrapper")]//*[text()="Delete"]', { locateStrategy: 'xpath' });
		this.moveToDraftsFromMoreActionsItems = page.locator('//*[contains(@class, "vk-ActionsWrapper")]//*[contains(@class, "vk-ListItemWrapper")]//*[text()="Move to drafts"]', { locateStrategy: 'xpath' });
		this.ReconnectFromMoreActionsItems = page.locator('//*[contains(@class, "vk-ActionsWrapper")]//*[contains(@class, "vk-ListItemWrapper")]//*[text()="Reconnect"]', { locateStrategy: 'xpath' });
		this.messageRejectReason = page.getByTestId('RejectionReason');
		this.recommendedTimesPlaceholderListPanel = page.locator('(//*[contains(@class,"vk-DropdownAnchorWrapper")])[1]', { locateStrategy: 'xpath' });
		this.todayInListView = page.locator('//*[contains(@class,"vk-InnerDay") and contains(@aria-label,"today")]');
		this.listViewCards = page.locator('[data-testid="CardWrapper"]');
		this.listViewDayContainer = page.locator('//*[contains(@class, "vk-Planner")]//*[contains(@class,"vk-CardListContainer")]', { locateStrategy: 'xpath' });

		/**
     * - - - - CALENDAR: PREVIEW PANE - - - - -
     */
		this.detailPaneMessageStateText = page.locator('.vk-Planner .vk-DetailPane .vk-StateText');
		this.detailPaneSocialNetwork = page.locator('.vk-Planner .vk-DetailPane .vk-NetworkType');
		this.duplicateButton = page.locator('//*[contains(@class,"vk-AdditionalActions")]//*[text()="Duplicate"]');
		this.moveToDraftsButton = page.locator('.vk-Planner .vk-DetailPane .vk-ConvertPostToDraft');
		this.postDuplicateButton = page.getByTestId('DuplicateButton');
		this.rescheduleButton = page.getByTestId('RescheduleButton');
		this.editButton = page.getByTestId('EditButton');
		this.deleteButton = page.getByTestId('DeleteButton');
		this.moreActions = page.getByTestId('Dropdown').getByLabel('More actions');
		this.messageRejectModal = page.locator('.vk-MessageRejectModal');
		this.messageRejectModalTitle = page.locator('//*[contains(@class,"vk-MessageRejectModal")]//h2[contains(text(),"Reject Message")]', { locateStrategy: 'xpath' });
		this.messageRejectModalInput = page.locator('.vk-MessageRejectModal input');
		this.messageRejectModalRejectButton = page.locator('.vk-MessageRejectModal .vk-SubmitButton');
		this.confirmationSubmitButton = page.locator('.vk-ConfirmationModal .vk-SubmitButton');
		this.duplicateButton = page.locator('//*[contains(@class,"vk-AdditionalActions")]//*[text()="Duplicate"]', { locateStrategy: 'xpath' });
		this.moveToDraftsBtn = page.locator('button[data-testid="MoveToDraftsButton"]');
		this.sidePaneCloseButton = page.getByTestId('CloseButton');
		this.deletePostButton = page.getByRole('button', { name: 'Delete post' });
		this.termsOfServiceWall = page.locator('.vk-TermsOfServiceWall button');
		this.firstFreeImage = page.locator('.-mediaRow img[draggable="true"]').first();
		this.draftCard = page.getByText('No account');
		this.closeSaveDraftPopup = page.locator('#DraftSavedPopover [aria-label="Close Draft saved"]');
		this.reconnectButton = page.locator('.vk-Planner .vk-DetailPane .vk-ReconnectButton');
		this.messageTags = page.locator('.vk-DetailPane .vk-TagDetails .vk-TagContainer');
		this.altTextDescription = page.locator('.vk-AltText p');
		this.previewPaneNetworkType = page.locator('.vk-Planner .vk-DetailPane .vk-NetworkType');
		this.previewPaneScheduledTime = page.locator('.vk-DetailPane .vk-ScheduledTime');
		this.viewApprovalHistory = page.getByLabel('View approval history');
		this.approvalDescription = page.locator('.-modalDialog .-content .-description');
		this.approvalHistoryFirstDetails = page.locator('.-modalDialog .-action:nth-child(1) .-description');
		this.approvalHistorySecondDetails = page.locator('.-modalDialog .-action:nth-child(2) .-description');
		this.approvalHistoryThirdDetails = page.locator('.-modalDialog .-action:nth-child(3) .-description');
		this.approvalHistoryReason = page.locator('.-modalDialog .-reason');
		this.rejectModalInput = page.locator('.vk-MessageRejectModal input');
		this.rejectModalRejectButton = page.locator('.vk-MessageRejectModal .vk-SubmitButton');
		this.closeApprovalHistoryModal = page.getByTestId('App').getByLabel('Close', { exact: true });
		this.previewPaneApproveButton = page.getByTestId('ContextualActionsArea').getByLabel('Approve');
		this.previewPaneRejectButton = page.getByTestId('ContextualActionsArea').getByLabel('Reject');
		this.rejectModalInput = page.locator('.vk-MessageRejectModal input');
		this.rejectModalRejectButton = page.locator('.vk-MessageRejectModal .vk-SubmitButton');
		this.suspendedReasonSidePane = page.locator('(//*[contains(@class, "vk-SuspendActions")]//p)[2]', { locateStrategy: 'xpath' });
		this.suspendedInfoMsgSidePane = page.locator('(//*[contains(@class, "vk-SuspendActions")]//p)[1]', { locateStrategy: 'xpath' });
		this.detailPaneCloseButton = page.getByTestId('CloseButton');
		this.internalCommentsTab = page.getByRole('tab', { name: 'Internal comments' });
		this.internalCommentTextArea = page.locator('#ConversationsEditableTextArea [aria-label="Text editor"]');
		this.saveInternalComment = page.getByLabel('Save comment');
		this.commentPreview = page.locator('[role="tabpanel"] [data-testid="Comment"] p');
		this.editInternalComment = page.getByTestId('CommentActions').getByLabel('Edit');
		this.copyInternalCommentLink = page.getByTestId('CommentActions').getByLabel('Copy link');
		this.deleteInternalComment = page.getByTestId('CommentActions').getByLabel('Delete');
		this.deleteConfirmationButton = page.getByLabel('Confirm delete');
		this.addInternalCommentMedia = page.getByTestId('Editor').getByLabel('Add media');
		this.internalCommentMediaDownloadButton = page.getByTestId('Attachment').getByLabel('Download media');
		this.internalCommentMediaDeleteButton = page.getByTestId('Attachment').getByLabel('Delete media');
		this.tagContainerText = page.locator('.vk-Planner [data-testid="DetailPaneRenderer"] .vk-FacebookTargeting p');
		this.hideDraftComments = page.getByRole('button', { name: 'Hide draft comments' });

		//Twitter
		this.twitterPreviewSocialProfile = page.locator('.vk-Planner .vk-DetailPane .vk-TwitterPreview .vk-Handle');
		this.twitterReplySocialProfile = page.locator('[data-testid="Preview"] .vk-Wrapper span');
		this.twitterPreviewMessageText = page.locator('.vk-Planner .vk-DetailPane .vk-TwitterPreview .vk-ContentBody p');
		this.twitterPreviewMedia = page.locator('//*[contains(@class, "vk-DetailPane")]//*[contains(@class, "vk-TwitterPreview")]//*[contains(@class,"vk-MediaImg") or contains(@class,"vk-ImageContainer")]', { locateStrategy: 'xpath' });
		this.twitterReplyMediaPreview = page.locator('.vk-DetailPane .vk-MediaContainer');
		this.twitterPreviewVideo = page.locator('.vk-Planner .vk-DetailPane .vk-TwitterPreview .vk-VideoPlayer');
		this.twitterMentionLink = page.locator('.vk-Planner .vk-TwitterPreview .vk-ContentBody .vk-MessageMention');
		this.videoPlayButton = page.locator('.vk-Planner .vk-DetailPane .vk-TwitterPreview .vk-PlayButton');

		//Facebook
		this.facebookPreviewSocialProfile = page.locator('.vk-Planner .vk-DetailPane .vk-FacebookPreview .vk-Name');
		this.facebookPreviewMessageText = page.locator('.vk-Planner .vk-DetailPane .vk-FacebookPreview .vk-ContentBody p');
		this.facebookPreviewMedia = page.locator('.vk-Planner .vk-DetailPane .vk-FacebookPreview .vk-MediaImg');
		this.facebookPreviewImageContainer = page.locator('.vk-Planner .vk-DetailPane .vk-FacebookPreview .vk-MediaContainer');
		this.facebookPreviewVideo = page.locator('.vk-Planner .vk-DetailPane .vk-FacebookPreview .vk-VideoPlayer');
		this.facebookPreviewLinkPreview = page.locator('.vk-FacebookPreview .vk-ContentBody p');
		this.facebookThumbNail = page.locator('.vk-FacebookPreview .vk-ThumbnailContainer .vk-Thumbnail');
		this.facebookMentionLink = page.locator('.vk-Planner .vk-FacebookPreview .vk-ContentBody .vk-MessageMention');

		//LinkedIn
		this.linkedinPreviewSocialProfile = page.locator('.vk-Planner .vk-DetailPane .vk-LinkedInPreview .vk-Name');
		this.linkedinPreviewMessageText = page.locator('.vk-Planner .vk-DetailPane .vk-LinkedInPreview .vk-ContentBody p');
		this.linkedinPreviewMedia = page.locator('.vk-Planner .vk-DetailPane .vk-LinkedInPreview .vk-MediaImg');
		this.linkedinPreviewImageContainer = page.locator('.vk-Planner .vk-DetailPane .vk-LinkedInPreview .vk-MediaContainer');
		this.linkedinPreviewVideo = page.locator('.vk-Planner .vk-DetailPane .vk-LinkedInPreview .vk-VideoPlayer');
		this.linkedinPreviewPdf = page.locator('.vk-Planner .vk-DetailPane .vk-LinkedInPreview .vk-PdfContainer .vk-PdfDocument');
		this.pdfCardIcon = page.locator('//*[contains(@data-testid,"MediaStateText")][text()="PDF"]');
		this.linkedInMentionLink = page.locator('.vk-Planner .vk-LinkedInPreview .vk-ContentBody .vk-MessageMention');
		this.linkedinLinkPreviewMedia = page.locator('.vk-Planner .vk-DetailPane .vk-LinkedInPreview .vk-LinkPreviewMedia');

		//Instagram
		this.instagramPreviewSocialProfile = page.locator('.vk-Planner .vk-DetailPane .vk-InstagramPreviewHeader .vk-Name');
		this.instagramPreviewImageContainer = page.locator('.vk-Planner .vk-DetailPane .vk-InstagramPreview .vk-ImageContainer');
		this.instagramPreviewVideo = page.locator('.vk-Planner .vk-DetailPane .vk-InstagramPreview .vk-VideoPlayer');
		this.instagramReelPreviewSocialProfile = page.locator('.vk-Planner .vk-DetailPane .vk-InstagramReelPreview .vk-Name');
		this.instagramReelMessageText = page.locator('.vk-Planner .vk-DetailPane .vk-InstagramReelPreview .vk-MessageText');
		this.instagramReelPreviewMedia = page.locator('.vk-Planner .vk-DetailPane .vk-InstagramReelPreview .vk-StreamlinedVideo');
		this.instagramPreviewMessageText = page.locator('(//*[contains(@class,"vk-Planner")]//*[contains(@class,"vk-InstagramPreview")]//p)[1]', { locateStrategy: 'xpath' });
		this.instagramPreviewMessageTextWithMedia = page.locator('(//*[contains(@class,"vk-Planner")]//*[contains(@class,"vk-InstagramPreview")]//p)[2]', { locateStrategy: 'xpath' });
		this.instagramStoryPreviewMessageState = page.locator('.vk-Planner .vk-DetailPane .vk-AuthorText');
		this.instagramStoryPreviewSocialProfile = page.locator('.vk-Planner .vk-DetailPane .vk-InstagramStoryPreview .vk-Name');
		this.instagramStoryPreviewMessageText = page.locator('.vk-Planner .vk-DetailPane .vk-InstagramStoryPreview .vk-StoryText');
		this.instagramStoryPreviewPublisherNotesText = page.locator('.vk-Planner .vk-DetailPane .vk-PublisherNotes');
		this.instagramVideoPlayButton = page.locator('.vk-Planner .vk-InstagramPreview .vk-PlayButton');
		this.instagramImageContainer = page.locator('.vk-Planner .vk-InstagramPreview .vk-ImageContainer');
		this.mediaNavigatorButton = page.locator('.vk-Planner .vk-InstagramPreview button.vk-StyledButton svg[alt="Next item"]');
		this.assetCounter = page.locator('.vk-Planner .vk-InstagramPreview .vk-AssetCounterContainer');
		this.firstProductTagName = page.locator('.vk-Planner .vk-InstagramPreview .vk-CollapsedStyledProductTag[aria-label="Pride T-Shirt - Small"]');
		this.productTagTitle = page.locator('.rc-Planner .vk-ProductTagContainer .vk-ProductTagTitle');
		this.productTagName = page.locator('.rc-Planner .vk-ProductTagContainer p.vk-ProductTagTitle');
		this.instagramCarouselIndicators = page.locator('.vk-Planner .vk-InstagramPreview .vk-IndicatorDot');
		this.instagramPreviewHeaderName = page.locator('.vk-Planner .vk-InstagramPreview .vk-InstagramPreviewHeader .vk-Name');
		this.instagramCollaboratorsonSidePane = page.locator('.vk-Planner .vk-DetailPane [data-testid = "Info"] .vk-InstagramCollaboratorsDetails p');

		//Pinterest
		this.pinterestPreviewMessageText = page.locator('.vk-Planner .vk-DetailPane .vk-PinterestPreview .vk-PinterestPreviewDescription');

		this.pinterestPreviewSocialProfile = page.locator('.vk-Planner .vk-DetailPane .vk-PinterestPreview .vk-PinterestPreviewUsername');

		//Tiktok
		this.tiktokPreviewMessageText = page.locator('.vk-Planner .vk-DetailPane .vk-TikTokPreview .vk-MessageText');
		this.tiktokEngagementField = page.locator('..vk-Planner .vk-DetailPane .vk-PrivacySettings li');

		/**
     * - - - - - PLANNER ADS - - - - -
     */

		this.advertisePage = page.locator('//*[text()="Advertise"]', { locateStrategy: 'xpath' });
		this.adDetailPaneNetworkType = page.locator('(//div[contains(@class, "vk-SocialProfile")]//*[text()="LinkedIn"])');
		this.adDetailPaneObjective = page.locator('(//div[contains(@class, "vk-AdObjective")]//*[text()="Get more website visitors"])', { locateStrategy: 'xpath' });
		this.adDetailPaneAudienceNetwork = page.locator('(//div[contains(@class, "vk-AdLinkedinAudienceNetwork")]//*[text()="LinkedIn Audience Network"])', { locateStrategy: 'xpath' });
		this.adViewMoreDetailsButton = page.locator('(//div[contains(@class, "vk-Planner")]//*[contains(@class,"vk-DetailPane")]//*[text()="View more details"])', { locateStrategy: 'xpath' });
		this.adViewMoreDetailsButtonInPanel = page.locator('//*[contains(@class,"vk-DetailPane")]//*[text()="View more details"]', { locateStrategy: 'xpath' });
		this.adViewMoreDetailsButtonInModal = page.locator('//*[contains(@class,"vk-AdsPreviewModal")]//*[text()="View more details"]', { locateStrategy: 'xpath' });
		this.adDetailPaneInputToggle = page.locator('(//div[contains(@class, "vk-ActionContainer")]//input[contains(@data-testid, "AdCampaignStatusInputToggle")]', { locateStrategy: 'xpath' });
		this.adDetailPaneInputToggleSpanBtn = page.locator('//div[contains(@class, "vk-ActionContainer")]//input[contains(@data-testid, "AdCampaignStatusInputToggle")]/../..', { locateStrategy: 'xpath' });
		this.adDetailStatusToastPaused = page.locator('//div[contains(@class, "vk-MessageColumn")]//*[text()="You paused your campaign"]', { locateStrategy: 'xpath' });
		this.adPerformanceHeader = page.locator('//*[contains(@class,"vk-DetailPane")]//h3[contains(text(), "Performance")]', { locateStrategy: 'xpath' });
		this.multiAdSecondImage = page.locator('(//div[contains(@aria-label, "Ad image 2")]', { locateStrategy: 'xpath' });

		/**
     * - - - - - OWLY WRITER PANEL - - - - -
     */
		this.firstOwlyWriterSuggestion = page.locator('[data-dap-target="planner-ai-suggestions-panel"] [data-testid="suggested-card-container"]:first-child', { locateStrategy: 'css selector' });

		/**
     * - - - - - APPROVALS VIEW - - - - -
     */
		this.pendingAssignedTab = page.locator('.vk-Planner .vk-ApprovalsToolbarContainer .vk-TabsContainer #approval-tabs-APPROVALS_PENDING_ASSIGNED');
		this.pendingCreatedTab = page.locator('.vk-Planner .vk-ApprovalsToolbarContainer .vk-TabsContainer #approval-tabs-APPROVALS_PENDING_CREATED');
		this.rejectedTab = page.locator('.vk-Planner .vk-ApprovalsToolbarContainer .vk-TabsContainer #approval-tabs-APPROVALS_REJECTED');
		this.expiredTab = page.locator('.vk-Planner .vk-ApprovalsToolbarContainer .vk-TabsContainer #approval-tabs-APPROVALS_EXPIRED');
		this.postTypeFilter = page.locator('.vk-Planner .vk-ApprovalsViewContainer [data-testid="PostTypeFilterAnchor"]');
		this.accountFilter = page.locator('.vk-Planner .vk-ApprovalsViewContainer [data-testid="AccountsFilterAnchor"]');
		this.postsFilter = page.locator('.vk-Planner .vk-ApprovalsViewContainer [data-testid="list-item-clickable"] [title="Posts"]');
		this.commentsAndRepliesFilter = page.locator('.vk-Planner .vk-ApprovalsViewContainer [data-testid="list-item-clickable"] [title="Comments & Replies"]');
		this.MessagesFilter = page.locator('.vk-Planner .vk-ApprovalsViewContainer [data-testid="list-item-clickable"] [title="Messages"]');
		this.closeButtonForPostTypeFilter = page.locator('.vk-Planner .vk-ApprovalsViewContainer button[data-testid="approvals-type-dropdown-footerApplyButton"]');
		this.applyButtonForPostTypeFilter = page.locator('.vk-Planner .vk-ApprovalsViewContainer button[data-testid="approvals-type-dropdown-footerApplyButton"]');
		this.sortByDateFilter = page.getByTestId('SortByDropdownAnchor');
		this.newestFirstDateModified = page.locator('button [title="Date modified (newest first)"]');
		this.approvalsListViewMoreActions = page.getByLabel('More actions').first();
		this.approvalsListViewEditButton = page.getByLabel('Edit post');
		this.approvalsListViewDuplicateButton = page.getByLabel('Duplicate post');
		this.approvalsListViewDeleteButton = page.getByLabel('Delete post');
		this.noPermissionDeleteButton = page.locator('//label[contains(., "Only authors can delete content")]', { locateStrategy: 'xpath' });
		this.approvalsListViewRejectButton = page.locator('(//*[contains(@class, "vk-Planner")]//*[contains(@aria-label, "Reject post")])[1]', { locateStrategy: 'xpath' });
		this.approvalsListViewApproveButton = page.locator('(//*[contains(@class, "vk-Planner")]//*[contains(@aria-label, "Approve post")])[1]', { locateStrategy: 'xpath' });
		this.sectionHeaderTitle = page.locator('//*[contains(@class,"vk-SectionContainerTitle")][contains(text(),"Content you submitted for approval")]', { locateStrategy: 'xpath' });
	}

	async visit() {
		await this.page.goto('/dashboard#/planner');
		await this.page.waitForURL('/dashboard#/planner');
	}

	async selectCreatePostButton() {
		await expect(this.createPostButton).toBeVisible();
		await this.createPostButton.click();
	}

	async setDarkLaunchCookies() {
		const url = this.page.url();
		await this.page.context().addCookies([
			{
				name: 'PUB_32151_UI_ACTIVATION_BLITZ',
				value: '1',
				url: url,
			}
		]);
		await this.page.reload();
	}

	async selectWeekView() {
		await expect(this.viewWeekToggle).toBeVisible();
		await this.viewWeekToggle.click();
	}

	async selectMonthView() {
		await expect(this.viewMonthToggle).toBeVisible();
		await this.viewMonthToggle.click();
	}

	async toggleMonthView() {
		await expect(this.viewToggleMonthByInactiveButton).toBeVisible();
		await this.viewToggleMonthByInactiveButton.click();
	}

	async selectMonthDay(day) {
		const dayCell = this.page.locator(`//*[contains(@class, 'vk-Row')]//*[contains(@class, 'vk-Day') and contains(@id, 'Date-${day}')]`, { locateStrategy: 'xpath' });
		await expect(dayCell).toBeVisible();
		await dayCell.click();
		await expect(this.detailPane).toBeVisible();
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

	async verifyScheduledMessage(text, userName = false) {
		if (!userName) {
			await expect(this.page.getByText(text), 'Schedule message is visible on planner').toBeVisible();
		} else {
			const cardSelector = `//*[contains(@class, "vk-Card")]//*[@aria-label[contains(., '${userName}')]]/following::div[2][contains(text(), '${text}')]`;
			await expect(this.page.locator(cardSelector), 'Schedule message is visible on planner').toBeVisible();
		}
	}

	async verifyScheduledMessageInCurrentOrNextWeek(text) {
		if (!(await this.ghostCard.isVisible())) {
			await this.verifyScheduledMessage(text);
		} else {
			await expect(this.page.getByLabel('Next week')).toBeVisible();
			await this.nextButton.click();
			await this.verifyScheduledMessage(text);
		}
	}

	async verifyScheduledMessageNotPresent (text, profile = false) {
		if (!profile) {
			await expect(this.page.getByText(text), 'Schedule message is no longer visible on planner').not.toBeVisible();
		} else {
			const cardSelector = `//*[contains(@class, "vk-Card")]//*[@aria-label[contains(text(), '${profile}')]]/following::div[2][contains(text(), '${text}')]`;
			await expect(this.page.locator(cardSelector)).not.toBeVisible();
		}
	}

	async verifyMessageOnApprovalsView(text) {
		await expect(this.page.getByText(text), 'Schedule message is visible on planner').toBeVisible();
	}

	/**
	 * Click on scheduled message to show preview pane
	 * @param {string} text Text of the message to click
	 * @param {string} profile Optional value to click specific profile
	 */
	async showPreviewPane(text, profile = false) {
		if (!profile) {
			await this.page.getByText(text).click();
		} else {
			const cardSelector = this.page.locator(`//*[contains(@class, "vk-Card")]//*[@aria-label[contains(., '${profile}')]]/following::div[2][contains(text(), '${text}')]`, {locateStrategy: 'xpath'});
			await cardSelector.click();
		}
	}

	async verifyTextInPreviewPane(text) {
		const previewPaneMessageText = this.page.getByTestId('Preview').getByText(text);
		await expect(previewPaneMessageText, 'Message is not visible on planner preview pane').toBeVisible();
	}

	async verifyFirstCommentInPreviewPane(firstComment) {
		const firstCommentPreviewPaneText = this.page.getByTestId('Info').locator('.vk-FirstComment').getByText(firstComment);
		await expect(firstCommentPreviewPaneText, 'First Comment is visible on planner preview pane').toBeVisible();
	}

	async verifyPDFInPreviewPane() {
		await expect(this.page.getByTestId('Preview'), 'Message with PDF is not visible on planner preview pane').toBeVisible();
		await expect(this.linkedinPreviewPdf).toBeVisible();
	}

	async verifyFacebookMentionInPreviewPane(mentionName) {
		await this.facebookMentionLink.isVisible();
		assert((await this.facebookMentionLink.textContent()).includes(mentionName), 'Mention name not found on Facebook preview');
		assert((await this.facebookMentionLink.getAttribute('href')).includes('https://www.facebook.com/'), 'Incorrect href value in Facebook preview');
	}

	async verifyLinkedInMentionInPreviewPane(mentionName) {
		await this.linkedInMentionLink.isVisible();
		assert((await this.linkedInMentionLink.textContent()).includes(mentionName), 'Mention name not found on LinkedIn preview');
		assert((await this.linkedInMentionLink.getAttribute('href')).includes('https://www.linkedin.com/company'), 'Incorrect href value in LinkedIn preview');
	}

	async editFromPreviewPane() {
		await expect(this.editButton, 'Edit button is visible on planner preview pane').toBeVisible();
		await this.editButton.click();
	}

	async duplicateFromPreviewPane() {
		await this.moreActions.click();
		await expect(this.duplicateButton, 'Duplicate button is visible on planner preview pane').toBeVisible();
		await this.duplicateButton.click();
	}

	async deleteFromPreviewPane() {
		await this.deleteButton.click();
		await this.deletePostButton.click();
	}

	async weekViewPostCountHeader(num) {
		const postCountHeader = this.page.locator(`//*[contains(@data-testid,"NumContent")][text()=${num}]`);
		await postCountHeader.isVisible();
	}

	async selectListView() {
		await expect(this.viewToggleList).toBeVisible();
		await this.viewToggleList.click();
	}

	async selectCreateButton() {
		await expect(this.createPostButton).toBeVisible();
		await this.createPostButton.click();
	}

	async checkAltText(text) {
		await expect(this.altTextDescription).toBeVisible();
		await expect(this.altTextDescription).toHaveText(text);
	}

	async toggleFiltersButton() {
		await expect(this.filtersButton).toBeVisible();
		await this.filtersButton.click();
	}

	async filterBySocialProfile(profileName) {
		const profileSelectorItem = this.page.locator(`//*[contains(@data-testid,"ListItem")]//*[text()="${profileName}"]`, { locateStrategy: 'xpath' });

		await expect(this.filterAccountsPicker).toBeVisible();
		await this.filterAccountsPicker.click();

		await expect(profileSelectorItem).toBeVisible();
		await profileSelectorItem.click();

		await expect(this.filterApplyButton).toBeVisible();
		await this.filterApplyButton.click();
	}

	async filterByPostStatus(postType) {
		const POST_STATUS_LABELS = {
			Drafts: 'POST-DRAFTS',
			Scheduled: 'POST-SCHEDULED',
			Published: 'POST-SENT',
			PendingApproval: 'POST-PENDING_APPROVAL',
			Rejected: 'POST-REJECTED_APPROVAL',
			Failed: 'POST-SEND_FAILED_PERMANENTLY',
			Disconnected: 'POST-DISCONNECTED',
			Expired: 'POST-EXPIRED_APPROVAL'
		};
		const getPostStatusSelector = (labelName) => `[data-testid="${POST_STATUS_LABELS[labelName]}"]`;

		await expect(this.filterPostStatusPicker).toBeVisible();
		await this.filterPostStatusPicker.click();

		const postStatusSelector = getPostStatusSelector(postType);
		await expect(this.page.locator(postStatusSelector)).toBeVisible();
		await this.page.locator(postStatusSelector).click();

		await expect(this.filterApplyButton).toBeVisible();
		await this.filterApplyButton.click();
	}

	async closeFilterPanel() {
		await expect(this.filterCloseButton).toBeVisible();
		await this.filterCloseButton.click();
	}

	async resetSelectedFilters() {
		await expect(this.clearAllFilters).toBeVisible();
		await this.clearAllFilters.click();
	}

	async rejectScheduledMessage(rejectReason) {
		await expect(this.previewPaneRejectButton).toBeVisible();
		await this.previewPaneRejectButton.click();
		await expect(this.messageRejectModal).toBeVisible();
		await expect(this.messageRejectModalInput).toBeVisible();
		await this.messageRejectModalInput.fill(rejectReason);
		await expect(this.messageRejectModalRejectButton).toBeVisible();
		await this.messageRejectModalRejectButton.click();
	}

	async approveFromApprovalsListView(text, postType) {
		const approveButton = this.page.locator(`(//*[contains(@data-testid,"approvals-list-table")]//*[contains(@data-testid,"Content")]//span[text()="${text}"]/following::*//*[contains(@aria-label, "Approve post")])[1]`, { locateStrategy: 'xpath' });
		const postTypeSelector = this.page.locator(`(//*[contains(@data-testid,"approvals-list-table")]//*[contains(@data-testid,"Content")]//span[text()="${text}"]/following::*[contains(@data-testid,"PostType") and contains(text(),"${postType}")])[1]`, { locateStrategy: 'xpath' });

		await expect(postTypeSelector).toBeVisible();
		await expect(postTypeSelector).toHaveText(postType);
		await expect(approveButton).toBeVisible();
		await approveButton.click();
		await expect(approveButton).not.toBeVisible();
	}

	async rejectFromApprovalsListView(text, postType, reason) {
		const rejectButton = this.page.locator(`(//*[contains(@data-testid,"approvals-list-table")]//*[contains(@data-testid,"Content")]//span[text()="${text}"]/following::*//*[contains(@aria-label, "Reject post")])[1]`, { locateStrategy: 'xpath' });
		const postTypeSelector = this.page.locator(`(//*[contains(@data-testid,"approvals-list-table")]//*[contains(@data-testid,"Content")]//span[text()="${text}"]/following::*[contains(@data-testid,"PostType") and contains(text(),"${postType}")])[1]`, { locateStrategy: 'xpath' });

		await expect(postTypeSelector).toBeVisible();
		await expect(postTypeSelector).toHaveText(postType);
		await expect(rejectButton).toBeVisible();
		await rejectButton.click();
		await expect(this.rejectModalInput).toBeVisible();
		await this.rejectModalInput.fill(reason);
		await expect(this.rejectModalRejectButton).toBeVisible();
		await this.rejectModalRejectButton.click();
	}

	async openComposerFromMonthSidePane() {
		await expect(this.monthSidePaneCreateButton).toBeVisible();
		await this.monthSidePaneCreateButton.click();
		await expect(this.newPostMonthSidePane).toBeVisible();
		await this.newPostMonthSidePane.click();
	}

	async selectPost(selector) {
		await expect(this.nextButton).toBeVisible();
		await this.nextButton.click();
		const timeSlots = await this.timeSlot;
		const timeSlotCount = await timeSlots.count();
		expect([NUM_TIME_SLOTS_IN_WEEK, NUM_TIME_SLOTS_IN_EXPANDED_VIEW]).toContain(timeSlotCount);
		await this.timeSlot.first().click(); // Click on the first time slot
		await expect(selector).toBeVisible(); // Wait for the desired selector and click it
		await selector.click();
	}

	async clickListViewDayCard(text, username) {
		const cardSelector = this.page.locator(`//*[contains(@class, "vk-Card") and contains(.//div, "${username}") and contains(.//div, "${text}")]`, { locateStrategy: 'xpath' });
		await expect(cardSelector).toBeVisible();
		await cardSelector.click();
	}

	async dragAndDropCard(message, hour, id) {
		const nextDayDate = format(utcToZonedTime(addDays(startOfWeek(addWeeks(new Date(), 1)), 1), timeZone), 'eeee, d MMMM');
		const nextDayTime = format(utcToZonedTime(addDays(startOfWeek(addWeeks(new Date(), 1)), 1), timeZone), 'ha');

		await this.hideNativePosts(id);
		await this.hideRecommendedTimes(id);
		await expect(this.page.getByLabel('Next week')).toBeVisible();
		await this.nextButton.click();
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
		await expect(this.firstFreeImage, 'First image on planner media library is not visible').toHaveJSProperty('complete', true);
		await expect(this.firstFreeImage).not.toHaveJSProperty('naturalWidth', 0);

		const source = this.firstFreeImage;
		const destination = this.page.getByRole('gridcell', { name: `0 posts, ${nextDayDate} at 12AM` });

		await source.dragTo(destination);

		await this.page.waitForTimeout(2000);
		await expect(this.closeSaveDraftPopup, 'Save draft popup is not visible').toBeVisible();
		await this.sidePaneCloseButton.click();
		await expect(this.draftCard, 'Draft card is not visible on planner').toBeVisible();
		await this.draftCard.click();

		await this.deleteButton.click();
		await this.deletePostButton.click();
		await this.page.waitForTimeout(1000);
	}

	async scheduleMessageWithPDF(memberId, snId, message, scheduleDate, reviewerId = false) {
		const createMessage = new scheduleV3Message();
		const options = {
			messages: [
				{
					socialProfileId: snId,
					text: message,
					scheduledSendTime: scheduleDate,
					mediaUrls: [plan_create.getRandomPDF()],
				}
			]
		};
		if (reviewerId) {
			options.messages[0].oneTimeReviewerId = parseInt(reviewerId, 10);
		}
		await createMessage.command(parseInt(memberId, 10), options);
	}

	async scheduleIGPostWithFirstComment(memberId, snId, message, scheduleDate, firstCommentText, reviewerId = false) {
		const createMessage = new scheduleV3Message();
		const options = {
			messages: [
				{
					socialProfileId: parseInt(snId, 10),
					text: message,
					scheduledSendTime: scheduleDate,
					postType: { 'postType': 'IG_FEED' },
					publishingMode: { 'mode': 'IG_API' },
					firstComment: { 'text': firstCommentText },
					mediaUrls: [plan_create.mediaUrls.imageAttachment],
				}
			]
		};
		if (reviewerId) {
			options.messages[0].oneTimeReviewerId = parseInt(reviewerId, 10);
		}
		await createMessage.command(parseInt(memberId, 10), options);
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
				messagesToDelete = response)
			.catch(err => console.log('Error getting scheduled messages', err));

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
