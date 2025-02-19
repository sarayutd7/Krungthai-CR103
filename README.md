## Step 1: Clone the Repository
# Clone your project repository
```
git clone <your-repository-url>
cd <your-project-folder>
```


## Step 2: Initialize npm (if not already initialized)
```
npm init -y
```
This command creates a `package.json` file, which helps manage dependencies.


## Step 3: Install Cypress
# This installs Cypress as a development dependency.
```
npm install cypress --save-dev 

npm uninstall mochawesome mochawesome-merge mochawesome-report-generator

npm install cypress-mochawesome-reporter --save-dev

npm i cypress-discord-webhook-integration

npm list puppeteer

npm uninstall puppeteer

npm install puppeteer@latest

npm audit fix --force

npm install puppeteer@latest

npm i cypress-discord-webhook-integration

npm install node-html-to-image

npm install ws

```

# Using mochawesome
```
npm install --save-dev mochawesome

run command.

cypress run --reporter mochawesome
```
ref.https://medium.com/@iMayank.Shekhar/cypress-generate-tests-reports-using-mochawesome-cf829d083d51

# Installing cypress-mochawesome-reporter:
```
npm install cypress-mochawesome-reporter --save-dev
```
This command installs cypress-mochawesome-reporter, a reporter for Cypress that uses Mochawesome to generate test reports.

 
#Installing mochawesome, mochawesome-merge, and mochawesome-report-generator:
```
npm install mochawesome mochawesome-merge mochawesome-report-generator --save-dev
```

- mochawesome: A tool for generating test reports in HTML and JSON formats.
- mochawesome-merge: Used to merge multiple JSON report files together.
- mochawesome-report-generator: Used to generate HTML reports from the merged JSON files.
After installing these packages, you can configure Cypress to use cypress-mochawesome-reporter by adding the following settings to your cypress.json file:
```
{
  reporter: 'cypress-mochawesome-reporter', 
  reporterOptions: {
    reportDir: 'cypress/reports',    // กำหนดโฟลเดอร์ที่เก็บรายงาน
    reportFilename: 'test-report',   // ชื่อไฟล์รายงาน
    overwrite: false,                // ไม่ลบไฟล์รายงานเก่าเมื่อรันใหม่
    html: true,                      // สร้างรายงานเป็น HTML
    json: false,                     // ไม่สร้างไฟล์ JSON
    saveJson: false,                 // ไม่บันทึกไฟล์ JSON
    merge: true,                     // รวมไฟล์รายงานทั้งหมด
    timestamp: 'mmddyyyy_HHMMss',
    charts: true,
    code: true,
    autoOpen: false,
    quiet: false,
    inline: true,
    embeddedScreenshots: true
  }
}
```
And in your cypress/support/index.js file, add this line to enable the reporter:
```
import 'cypress-mochawesome-reporter/register';
```

## Check the import path: Ensure that the import path in your cypress/support/index.js file is correct. It should look like this:
```
import 'cypress-mochawesome-reporter/register';
npm audit fix
```

## Step 4: Open Cypress for the First Time
```sh
npx cypress open
```
This will generate a default Cypress folder structure:
```
/project-folder
 ├── cypress/
 │   ├── fixtures/
 │   ├── integration/
 │   ├── plugins/
 │   ├── support/
 ├── cypress.json
 ├── package.json
 ├── node_modules/
```

## Step 5: Add Cypress Scripts to `package.json`
Modify the `scripts` section in `package.json` to include Cypress commands:
```json
"scripts": {
  "cypress:open": "cypress open",
  "cypress:run": "cypress run"
}
```
Now you can run Cypress with:
```sh
npm run cypress:open   # Opens Cypress GUI
npm run cypress:run    # Runs tests in headless mode
```

## Step 6: Writing Your First Test
Create a new test file in `cypress/integration/`:
```sh
touch cypress/integration/sample_test.spec.js
```
Add the following test inside `sample_test.spec.js`:
```js
describe('My First Test', () => {
  it('Visits the Cypress homepage', () => {
    cy.visit('https://www.cypress.io')
    cy.contains('features').click()
    cy.url().should('include', '/features')
  })
})
```
Run the test:
```sh
npm run cypress:run
```

## Step 7: Setting Up Cypress in GitHub Actions (CI/CD)
Create a `.github/workflows/cypress.yml` file and add:
```yaml
name: Cypress Tests

on: [push, pull_request]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Run Cypress tests
        run: npm run cypress:run
```
Commit and push changes:
```sh
git add .
git commit -m "Setup Cypress"
git push origin main
```

## Step 8: Ignoring Unnecessary Files
To prevent tracking unnecessary files, add the following to `.gitignore`:
```
node_modules/
cypress/videos/
cypress/screenshots/
```

## Conclusion
You have successfully set up Cypress in your Git repository! 🎉
Now, you can start writing and running E2E tests to ensure the quality of your application.

## Run to cloudcypress
```
Set ProjectID on Cypress.config.js
Run Comment on Terminal
npx cypress run --record --key 24e7040a-1a38-490a-bdb4-b1804d08e754 | tee './cypress/result.txt'
```
## set and config azure-pipelines.yml 
```
# To configure triggers for Azure CI see
# https://docs.microsoft.com/en-us/azure/devops/pipelines/build/triggers?view=azure-devops&tabs=yaml#tags
jobs:
  - job: Cypress_tests
    pool:
      vmImage: 'ubuntu-latest'
    # Runs tests in parallel https://docs.cypress.io/guides/guides/parallelization
    # https://learn.microsoft.com/en-us/azure/devops/pipelines/process/phases?view=azure-devops&tabs=yaml
    strategy:
      parallel: 2
    steps:
      - task: NodeTool@0
      # Caches dependencies using npm lock file as key
      # https://docs.cypress.io/guides/continuous-integration/introduction#Caching
      - task: CacheBeta@1
        inputs:
          key: npm | package-lock.json
          path: /home/vsts/.npm
          restoreKeys: npm | package-lock.json
      - task: CacheBeta@1
        inputs:
          key: cy | package-lock.json
          path: /home/vsts/.cache/Cypress
          restoreKeys: cy | package-lock.json
      - script: npm ci --prefer-offline
      # Starts web server for E2E tests - replace with your own server invocation
      # https://docs.cypress.io/guides/continuous-integration/introduction#Boot-your-server
      - script: npm start &
      - script: npx wait-on 'http-get://localhost:3000' # Waits for above
      # Runs tests in parallel and records to Cypress Cloud
      # https://docs.cypress.io/guides/cloud/projects#Set-up-a-project-to-record
      # https://docs.cypress.io/guides/guides/parallelization
      - script: npx cypress run --record --parallel --ci-build-id $BUILD_BUILDNUMBER
        # For recording and parallelization to work you must set your CYPRESS_RECORD_KEY
        # in Azure DevOps → Your Pipeline → Edit → Variables
        env:
          CYPRESS_RECORD_KEY: $(CYPRESS_RECORD_KEY)
```

### Azure Setup
# Run Cypress tests every time you push.
```
File azure-pipelines.yml
```

## Set Webhook in cypress cloud
```
Webhook name - Krungthai CR103_Ad-Hoc DGL Loan Survey
Teams webhook URL -  
Notifications - Select All runs
```