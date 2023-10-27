const { chromium } = require('playwright');
const DynamoDB = require('hsdynamodb');
const SocialProfiles = require('hsapi').som;
const events = require('events');
const util = require('util');
const _ = require('underscore');
const co = require('co');
const OrganizationMembers = require('hsapi').organizationMembersService;

class getFixture extends events.EventEmitter {
    constructor() {
        super();
        this.step = '';
    }

    checkResponse(response, successMsg) {
        if (this.step && this.step !== '') {
            console.log(`${this.step}:`);
        }

        if (!Array.isArray(response)) {
            response = [response];
        }

        response.forEach((r) => {
            if (!this.api.globals.hasResponseErrors(r)) {
                this.client.api.verify.ok(true, `${successMsg}`);
            } else {
                this.client.api.verify.ok(false, JSON.stringify(r, null, 2));
            }
        });
    }

    async command(name, type, addSocial, ttl) {
        let fixture = {};

        if (!ttl) {
            ttl = 90;
        }

        if (ttl < 30 || ttl > 600 || typeof ttl !== 'number') {
            throw new Error('ttl must be a number of seconds between 30 and 600.');
        }

        let dynamoDB = 'build-ci-dynamodb-test-accounts-dev';
        let AWSprofile = 'build-ci-aws-creds';

        let accountsFile = 'pipeline-accounts.js';
        let dynamodb = new DynamoDB('nightwatch-saucelabs', AWSprofile, dynamoDB);
        let socialProfiles = new SocialProfiles(`${this.api.globals.som_bridge}`);
        let accounts = require(`./../fixtures/${accountsFile}`)[type];

        if (!accounts) {
            let keys = _.allKeys(accounts);
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

        if (
            (fixture.isSocialProfile === undefined || fixture.isSocialProfile === true) &&
            fixture.tearDown !== false 
        ) {
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
                let member = this.api.globals.hsUsers.get()[0];

                if (!member) {
                    throw new Error('No Firemox account. Call createUser before add social network.');
                }
                
                fixture.member = member;

                this.step = 'Adding social network';
                
                // Add the rest of your code here...
                
            }
            
            return this;
            
        }
        
    }
    
}

module.exports = getFixture;
