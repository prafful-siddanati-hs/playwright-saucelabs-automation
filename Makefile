procs = $(shell ps -ef | grep 'bin/sc' | grep -v grep | awk '{ print $$2 ; }')
killcmd = $(if $(procs), "kill" "-9" $(procs), "echo" "no matching processes")
# Pass sauce config file path. Default value is set to .sauce/config.yml
CONFIG_FILE ?= .sauce/config.yml
# Pass the suite name from the config file passed above. Default value set to " " - indicates all suites
SUITE_NAME ?=

DISABLED_TESTS ?=

install:
	rm -rf node_modules || true
	yarn
	npm install saucectl@latest --no-save

test-playwright-saucelabs:
	npx saucectl run

test-playwright-local:
	npx playwright test tests/folderName/testName.js

start-tunnel:
	sc-tunnel/linux/bin/sc -c sc-tunnel/linux/tunnel-config.yml

start-tunnel-local:
	sc-tunnel/local/bin/sc -c sc-tunnel/local/local-tunnel-config.yml

stop-tunnel:
	@echo 'sauce tunnel processId: ['$(procs)'] stopped'
	@$(killcmd)

run-test: dynamodb-setup-for-saucelabs
	export DISABLED_TESTS="$(DISABLED_TESTS)"; \
	if [ -z "${SUITE_NAME}" ]; then \
		npx saucectl run -c ${CONFIG_FILE} --ccy 4; \
	else \
		npx saucectl run -c ${CONFIG_FILE} --select-suite "${SUITE_NAME}"; \
	fi

dynamodb-setup-for-saucelabs:
	@profile="build-ci-aws-creds" \
	awsDefaultCredFile="$$HOME/.aws/credentials" && \
	awsLocalCredFile=".aws-session.saucelabs.ini" && \
	grep -A 4 "\\[$$profile\\]" "$$awsDefaultCredFile" > "$$awsLocalCredFile" && \
	printf "\n🟢 AWS credentials for 'build-ci-aws-creds' profile have been successfully set up for Saucelabs.\n"; \

dynamodb-setup-local-dev:
	@vault write aws/sts/build-ci-dynamodb-test-accounts ttl=60m | \
	tee /dev/stderr | \
	grep -E "(access_key|secret_key|security_token)\\s+(\\S+)" | \
	( \
		read -r _ access_key && read -r _ secret_key && read -r _ security_token && \
		printf "$$access_key\n$$secret_key\nus-east-1\n\n" | aws configure --profile build-ci-aws-creds > /dev/null && \
		aws configure set aws_session_token "$$security_token" --profile build-ci-aws-creds \
	) && \
    printf "\n🟢 Successfully authenticated a session for 'build-ci-aws-creds' aws profile.\n"

dynamodb-browse-locks:
	@default_value=$$(aws dynamodb scan --table-name build-ci-dynamodb-test-accounts-dev --profile build-ci-aws-creds  | tee /dev/stderr | jq -r '.Items[0].Account.S') && \
	[[ $$default_value != "null" ]] || (echo "Found no lock entry!" && exit 1) && \
	read -p "Select a lock account for release [$$default_value]: " account && \
	account=$${account:=$$default_value} && \
	aws dynamodb delete-item \
		--table-name build-ci-dynamodb-test-accounts-dev \
		--profile build-ci-aws-creds \
		--key '{ "TestType": {"S": "playwright-saucelabs"}, "Account": {"S": "'$$account'"}}'
