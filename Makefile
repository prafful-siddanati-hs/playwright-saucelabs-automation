procs = $(shell ps -ef | grep  saucectl | grep -v grep | awk '{ print $$2 ; }')
killcmd = $(if $(procs), "kill" "-9" $(procs), "echo" "no matching processes")

install:
	rm -rf node_modules || true
	yarn
	npm install saucectl@latest --no-save

test-playwright-saucelabs:
	npx saucectl run

test-playwright-local:
	npx playwright test tests/folderName/testName.js