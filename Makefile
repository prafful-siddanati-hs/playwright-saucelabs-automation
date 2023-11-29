procs = $(shell ps -ef | grep  saucectl | grep  'bin/sc' | grep -v grep | awk '{ print $$2 ; }')
killcmd = $(if $(procs), "kill" "-9" $(procs), "echo" "no matching processes")

install:
	rm -rf node_modules || true
	yarn
	npm install saucectl@latest --no-save

test-playwright-saucelabs:
	npx saucectl run

test-playwright-local:
	npx playwright test tests/folderName/testName.js

start-tunnel:
	sc-4.9.2-linux/bin/sc -c sc-4.9.2-linux/tunnel-config.yml

stop-tunnel:
	@echo 'processes == ['$(procs)']'
	@$(killcmd)

run-test:
	npx saucectl run -c .sauce/config.yml --select-suite "[Playwright] Schedule & Delete via API"

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
