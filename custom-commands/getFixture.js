const events = require('events');
const DynamoDB = require('hsdynamodb');
const SocialProfiles = require('hsapi').som;
const OrganizationMembers = require('hsapi').organizationMembersService;
const _ = require('underscore');

const { som_bridge, tops_skyline } = require('../globals.js');

class getFixture extends events.EventEmitter {
    constructor() {
        super();
        this.step = '';
    }
    
    hasResponseErrors(res) {
        if (typeof res !== 'object') {
            console.log('Unable to parse response object.');
            return true;
        }
        // Check for errors in the body and non-200 status codes.
        return ((res.body && res.body.errors) || (res.statusCode && res.statusCode !== 200));
    }

    checkResponse(response, successMsg) {
        if (this.step && this.step !== '') {
            console.log(`${this.step}:`);
        }

        if (!Array.isArray(response)) {
            response = [response];
        }

        response.forEach((r) => {
            if (!this.hasResponseErrors(r)) {
                console.log(true, `${successMsg}`);
            } else {
                console.log(false, JSON.stringify(r, null, 2));
            }
        });
    }

    async command(name, type, addSocial, ttl) {
        let fixture = {};
        
        try {
            if (!ttl) {
                ttl = 90;
            }

            if (ttl < 30 || ttl > 600 || typeof ttl !== 'number') {
                throw new Error('ttl must be a number of seconds between 30 and 600.');
            }

            let dynamoDB = 'build-ci-dynamodb-test-accounts-dev';
            let AWSprofile = 'build-ci-aws-creds';

            let accountsFile = 'accounts.js';
            let dynamodb = new DynamoDB('playwright-saucelabs', AWSprofile, dynamoDB);
            let socialProfiles = new SocialProfiles(som_bridge);
            let accountData = require(`./../fixtures/${accountsFile}`);
            let accounts = accountData[type];

            if (!accounts) {
                let keys = _.allKeys(accountData);
                throw new Error(`${type} not available. Supported values are ${keys.toString()}.`);
            }

            const opts = {
                timeout: (ttl * 1000)
            };
            
            // Locking account in DynamoDB
            this.step = 'Locking account in DynamoDB';
            
            let locked = await dynamodb.lockFromList(accounts, opts);

            this.checkResponse(locked.resource, 'Account has been locked.');

            Object.assign(fixture, locked.resource);

            fixture.name = name;

            fixture.dynamodb = {
                key: locked.key,
                destroy: locked.destroy
            };

            if ((fixture.isSocialProfile === undefined || fixture.isSocialProfile === true) && fixture.tearDown !== false ) {
                fixture.isSocialProfile = true;

                fixture.socialProfile = {
                    userId: fixture.id,
                    type: fixture.type.toUpperCase(),
                    email: fixture.email,
                    username: fixture.username,
                    password: fixture.password,
                    auth1: fixture.auth1,
                    auth2: fixture.auth2
                };

                // Cleaning social profile
                this.step = 'Cleaning social profile';
                
                let isClean = await socialProfiles.cleanUpSocialProfile(fixture.socialProfile.type, {
                    userId: fixture.socialProfile.userId
                });

                this.checkResponse(isClean, 'Social profile has been cleaned.');

                if (addSocial) {
                    let member = (global.member)[0];
                    console.log("member:: ", member)

                    if (!member) {
                        throw new Error('No Hootsuite account. Call createUser before add social network.');
                    }
                    
                    fixture.member = member;

                    this.step = 'Adding social network to Hootsuite member';

                    let profile = await socialProfiles.addSocialProfile(fixture.socialProfile.userId,
                        fixture.socialProfile.username,
                        fixture.socialProfile.type,
                        fixture.socialProfile.auth1,
                        fixture.socialProfile.auth2,
                        {
                            memberId: fixture.member.memberId,
                            externalId: fixture.socialProfile.userId
                        });

                    this.checkResponse(profile, `Social profile ${fixture.socialProfile.username} has been added.`);
                    fixture.socialProfile.socialProfileId = profile.socialProfileId;
                    fixture.socialProfile.isSecurePost = profile.isSecurePost;
                    fixture.socialProfile.isReuathRequired = profile.isReuathRequired;
                } 
            } else {
                fixture.isSocialProfile = false;
                fixture.customAccount = {};

                Object.assign(fixture.customAccount, locked.resource);

                if (fixture.type === 'enterprise') {
                    let organizationMembers = new OrganizationMembers(tops_skyline);
                    
                    this.step = 'Checking user for existing Organizations';
                    let existingOrgs = await organizationMembers.getMemberOrgs(parseInt(fixture.memberId));

                    if (typeof existingOrgs !== 'object') {
                        console.log(`Failed to retrieve user organizations. Response: ${JSON.stringify(existingOrgs)}`);
                    }

                    if (existingOrgs.data.length > 0) {
                        let existingOrgData = Object.values(existingOrgs.data);

                        console.log(`Current member is in ${existingOrgData.length} orgs`);

                        existingOrgData.forEach((org) => {
                            console.log(` Org name: ${org.name} / Org Id: ${org.id} / Payment Member Id: ${org.paymentMemberId}`);
                        })
                    }
                }

                //Do not call tearDown() for dedicated enterprise users
                if (fixture.customAccount.isHootsuiteUser || fixture.type === 'enterprise') {
                    fixture.customAccount.requiresTearDown = false;
                    fixture.customAccount.requiresEmailChange = false;
                    fixture.customAccount.name = fixture.name;
                }

                //If custom account does not have email, return the id instead.
                if (!locked.resource.email) {
                    fixture.customAccount.email = locked.resource.id;
                }
            }

            let displayEmail = fixture.isSocialProfile ? fixture.socialProfile.email : fixture.customAccount.email;
            /*let displayPassword = fixture.isSocialProfile ? fixture.socialProfile.password : fixture.customAccount.password;

            //TODO:Figure out how to differentiate pipeline vs local, for now print only email, update later is needed
            if (isPipeline) {
                console.log(!locked.resource !== undefined, `Only Email: ${displayEmail}`);
            }
            console.log(locked.resource !== undefined, `${displayEmail} / ${displayPassword}`); */

            console.log(!locked.resource !== undefined, `${displayEmail}`);

        } catch (err) {
            console.assert(false, `${this.step} ${err}`);
        } finally {
            console.log("pushing data to global.fixture", fixture)
            //Update global storage with fixture array so that functions like tearDown() can access it.
            if (!global.fixture) {
                global.fixture = []
            }
            global.fixture.push(fixture);
            this.emit('complete');
        }
            return this;
        }
    };
    
module.exports = getFixture;
