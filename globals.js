// globals.js
const fs = require('fs');

module.exports = {
	som: 'https://som-staging.hootops.com:504',
	som_bridge: 'https://som-staging.hootops.com:504',
	tops_skyline: 'https://organization.staging.hootops.com',
	broker_member_service: 'https://member.staging.hootops.com',
	service_message_publishing: 'https://message-publishing.staging.hootops.com',
	service_drafts: 'https://drafts.staging.hootops.com',
	service_trail: 'https://trail.staging.hootops.com',
	launch_url_cms: 'https://www-staging.hootsuite.com',
	login_url: 'https://staging.hootsuite.com/login?lang=en',
	defaultPassword: '5U{=2;56mjm1lf5ZpNTm',
	testOrgPrefix: 'TEMP_ORG_',
	isOrgSafeToDelete: function (org, memberId, testOrgPrefix) {
		const DO_NOT_DELETE_STAGING_ORG = [1866699];

		let orgInWhiteList = DO_NOT_DELETE_STAGING_ORG.includes(org.id);
		let orgNameHasPrefix = org.name.startsWith(testOrgPrefix);
		let isOrgOwner = org.paymentMemberId === memberId;

		if ((!orgInWhiteList) && orgNameHasPrefix && isOrgOwner) {
			return true;
		} else {
			console.log(`!!!ORG SAFETY CHECK FAILED!!! orgInWhiteList: ${orgInWhiteList} orgNameHasPrefix: ${orgNameHasPrefix} isOrgOwner: ${isOrgOwner}`);
			return false;
		}
	},
	// Check whether HSAPI responded with error
	hasResponseErrors: function (res) {
		if (typeof res !== 'object') {
			console.log('Unable to parse response object.');
			return true;
		}
		// Check for errors in the body and non-200 status codes.
		return ((res.body && res.body.errors) || (res.statusCode && res.statusCode !== 200));
	},

	plan_create: {

		pdfs: {
			single_page:
			{
				bytes:20597,
				fileName: 'single_page.pdf',
				fileSource: 'Upload',
				mimeType: 'application/pdf',
				pages: 1,
				productTags: null,
				status: 'ATTACHED',
				thumbnailUrl: 'https://hootsuite-video.s3.amazonaws.com/staging/thumb-0-13062818-r3urcWFm.jpeg',
				trackingSource: 'UPLOAD',
				uploadGroup: null,
				url: 'https://hootsuite-video.s3.amazonaws.com/staging/13062818-oJt5U2C9.pdf',
			},
			multi_page:
			{
				bytes: 19408,
				fileName: 'multi_page.pdf',
				fileSource: 'Upload',
				mimeType: 'application/pdf',
				pages: 5,
				productTags: null,
				status: 'ATTACHED',
				thumbnailUrl: 'https://hootsuite-video.s3.amazonaws.com/staging/thumb-0-13062818-v3F9uBSD.jpeg',
				trackingSource: 'UPLOAD',
				uploadGroup: null,
				url: 'https://hootsuite-video.s3.amazonaws.com/staging/13062818-v3F9uBSD.pdf',
			}
		},

		mediaUrls: {
			imageAttachment:
			{
				'bytes': 68408,
				'fileName': '12262804-6MuAcGtv.jpeg',
				'fileSource': 'Pexels',
				'height': 598,
				'mimeType': 'image/jpeg',
				'productTags': null,
				'status': 'ATTACHED',
				'thumbnailUrl': 'https://hootsuite-video.s3.amazonaws.com/staging/thumb-0-12262804-4kFLS6Ca.jpeg',
				'trackingSource': 'UPLOAD',
				'url': 'https://hootsuite-video.s3.amazonaws.com/staging/12262804-4kFLS6Ca.jpeg',
				'width': 940
			},
			videoAttachment:
			{
				'bytes': 2321652,
				'fileName': '111956469_32407e98-0a1d-4084-b8eb-9ce8d403efdf.mp4',
				'fileSource': 'Upload',
				'height': 720,
				'mimeType': 'video/mp4',
				'productTags': null,
				'status': 'ATTACHED',
				'thumbnailUrl': 'https://hootsuite-video.s3.amazonaws.com/staging/12262804_8dcc8204-bb88-446d-ba92-55944bea29c8.mp4',
				'trackingSource': 'UPLOAD',
				'url': 'https://hootsuite-video.s3.amazonaws.com/staging/12262804_8dcc8204-bb88-446d-ba92-55944bea29c8.mp4',
				'width': 1280
			}
		},

		generateRandomMessage: function(baseText , length) {
			return baseText.repeat(length).substring(0, length);
		},

		getComposeMessage: function () {
			const MESSAGE = [
				'Draft',
				'Compose',
				'D$a#t_',
				'C@mP0se',
				'12abXY!%',
				'comporTeste'
			];
			return MESSAGE[Math.floor(Math.random() * MESSAGE.length)];
		},

		mediaSearchTerms: function () {
			const SEARCH_TERM = ['dog', 'owl', 'snow', 'music', 'nature', 'bee'];
			return SEARCH_TERM[Math.floor(Math.random() * SEARCH_TERM.length)];
		},

		getFaceBookPageMention: function () {
			const MENTIONS = [
				'AlexT Hoot Shop',
				'hoot_rm_business',
				'Hootrm\'s Catz',
				'Brandon is not Awesome',
				'BrandonEats',
				'John Owly Art',
				'Test Algérie',
				'SneakPeek Test',
				'NET - National Eligibility Test - UGC',
				'Nat-Test Center, Yangon',
				'MentionSocials',
				'M.E.N',
				'Men\'s Health (TEST)',
				'User',
				'user',
			];
			return MENTIONS[Math.floor(Math.random() * MENTIONS.length)];
		},

		getTikTokMention: function () {
			const MENTIONS = [
				'@hootjd',
				'@hoot_ps',
				'@r2d2_test'
			];
			return MENTIONS[Math.floor(Math.random() * MENTIONS.length)];
		},

		getLinkedinMention: function () {
			const MENTIONS = [
				'Composer Staging Page Two',
				'catsRUs',
				'Hootsuite Academy',
				'Hootsuite Test Page!',
				'MENT Internet Works',
				'MENT',
				'The Good Judge-ment Podcast',
				'Hoot',
				'Music Business Worldwide (MBW)',
				'Music Reports, Inc',
				'Газпром', //Russian (Gazprom)
				'大众汽车', //Chinese (Volkswagen)
			];
			return MENTIONS[Math.floor(Math.random() * MENTIONS.length)];
		},

		getTwitterMentions: function () {
			const MENTIONS = [
				'@ShanePlusThree',
				'@Taco_BlueJay',
				'@Taco_Emu',
				'@Taco_Finch',
				'@Taco_SNebouxii',
				'@Taco_Sparrow',
				'@Taco_Toucan',
				'@Taco_Woodpecker',
				'@tacoalbatross',
				'@tacofowl',
				'@taco_dove',
				'@taco_eagle',
				'@HComposerStg',
				'@hoot_planner',
				'@hoot_r2d2'
			];
			return MENTIONS[Math.floor(Math.random() * MENTIONS.length)];
		},

		getIgbMentions: function () {
			const MENTIONS = [
				'@alexhoot3',
				'@donutdestruction',
				'@hootigb',
				'@Itarchive',
				'@plancreatetagger',
				'@robot.taco'
			];
			return MENTIONS[Math.floor(Math.random() * MENTIONS.length)];
		},

		getRandomUrl: function () {
			const URLS = [
				'cbc.ca',
				'ndtv.com',
				'cnn.com',
				'hootsuite.com',
				'instagram.com',
				'pinterest.com',
				'linkedin.com',
				'slack.com'
			];
			return URLS[Math.floor(Math.random() * URLS.length)];
		},

		getSBETestUrl: function () {
			const URLS = [
				'https://www.scottish-enterprise.com',
				'https://www.eventbrite.co.uk/e/accessability-expo-tickets-953252522957'
				//Add more URLs here which are logged via SBE tickets
			];
			return URLS[Math.floor(Math.random() * URLS.length)];
		},

		getRandomUrlWithSpaces: function () {
			const URLS = [
				'https://www.canada.ca/en/global-affairs/news/2023/08/negotiations-launched-for-canada---ukraine-bilateral-security-commitments.html',
				'https://www.canada.ca/fr/sante-canada/nouvelles/2023/07/le-gouvernement-du-canada-investit-plus-de-5-millions-de-dollars-pour-soutenir-les-soins-a-domicile-et-en-milieu-communautaire-ainsi-que-les-servic.html',
				'https://www.canada.ca/en/global-affairs/news/2023/08/canada-imposes-new-sanctions-against-lebanese-nationals0.html',
				'https://www.canada.ca/en/global-affairs/news/2023/08/canada-imposes-additional-sanctions-on-third-anniversary-of-belaruss-fraudulent-presidential-elections.html',
				'https://www.canada.ca/en/global-affairs/news/2023/08/minister-joly-to-travel-to-slovenia-north-macedonia-and-albania.html',
			];
			return URLS[Math.floor(Math.random() * URLS.length)];
		},

		getRandomPDF: function() {
			const pdfs = Object.values(this.pdfs);
			const randomIndex = Math.floor(Math.random() * pdfs.length);
			return pdfs[randomIndex];
		},

		getMediaUrls: function () {
			const mediaUrls = Object.values(this.mediaUrls);
			const randomIndex = Math.floor(Math.random() * mediaUrls.length);
			return mediaUrls[randomIndex];
		},

		getRandomHashTag: function() {
			const HASH_TAGS = [
				'#Test',
				'#QA',
				'#SoftwareTesting',
				'#Test123',
				'#Version2.0',
				'#2024Goals',
				'#Test_Automation',
				'#New-Features',
				'#Feature_Release!',
				'#ThisIsAReallyLongHashtagThatShouldTestTheLimitsOfHashtagLengthInTheApplication',
				'#TestAutomation',
				'#TESTAUTOMATION',
				'#Testing🚀',
				'#TestAutomationSuite',
				'#A'
			];
			return HASH_TAGS[Math.floor(Math.random() * HASH_TAGS.length)];
		},

		getRandomLanguageHashtag: function () {
			const HASH_LANG_TAGS = [
				'#Test',
				'#A',
				'#Amor',
				'#Amour',
				'#Liebe',
				'#Amore',
				'#愛',
				'#사랑',
				'#حب',
			];
			return HASH_LANG_TAGS[Math.floor(Math.random() * HASH_LANG_TAGS.length)];
		},

		getRandomEmoji: function () {
			const EMOJIS = [
				'😀',
				'🤣',
				'😃',
				'🥐',
				'🍻',
				'🍷',
				'🍸',
				'🇮🇹 ',
				'🌺',
				'🍣',
				'🍜',
				'🕌',
				'🥟'
			];
			return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
		},
	},

	getRandomMediaFile: function(directoryPath) {
		return new Promise((resolve, reject) => {
			fs.readdir(directoryPath, (err, files) => {
				if (err) {
					reject(err);
					return;
				}
				const randomIndex = Math.floor(Math.random() * files.length);
				const randomFile = files[randomIndex];
				resolve(randomFile);
			});
		});
	},
	/**
         * Function to get object from Playwright's global storage
         *
         * @param {string}     globalData  Data pushed to Playwright's global storage. Ex: global.fixture, global.organization etc
         * @param {string}     name        Name of the socialProfile/Org you want to get. Example: 'acc1','playwright_org_'
         * @return {object}    storage     Returns socialProfile/organization object from global storage pushed at the end of getFixture()/createOrg()
    */
	getObjectByName: function(globalData, name) {
		for (let i = 0; i < globalData.length; i++) {
			if (globalData[i].name === name) {
				return globalData[i];
			}
		}
		return `No object data found for ${name}`;
	},

	/**
     * Function to add data from createTeam to organization in global storage.
     *
     * @param {string}     globalData      Data pushed to Playwright's global.organization
     * @param {string}     organization    Name of the organization you are adding to.
     * @param {object}     team            Team to add.
     * @return {object}    storage         All accounts or the specified account.
     */
	addTeam: function (globalData, organization, team) {
		let orgFound = false;
		for (let i = 0; i < globalData.length; i++) {
			if (globalData[i].name === organization) {
				globalData[i].teams.push(team);
				orgFound = true;
				break;
			}
		}

		if(!orgFound) {
			console.log('Unable to find global organization object to add a team to.');
		}
	}
};
