# Github-to-Mattermost notification

Install this [plugin](https://github.com/mattermost/mattermost-plugin-github) (Sysadmin only)

## Subscribe to a respository.

```sh

# grant access to your Github account.
/github connect private

# Subsribe to the repository you're working on.
/github subscriptions add organization/repo --features issues,pulls,pull_reviews,issue_comments,label:"urgent"

# List the subscripted repositories
/github subscriptions list
```

**Note:** replace `organization/repo` to the repo you want to connect to. For instance: Code-Engine-Studio/ces-juggle-fish

## Config the repository to receive notification

> You must create a webhook for each repository you want to receive notifications for or subscribe to. So give the following instruction to the owner of repo if you don't have permission.

- Go to the **Settings** page of your GitHub organization you want to send notifications from, then select **Webhooks** in the sidebar.
- Click Add Webhook.
- Set the following values:
   - Payload URL: `https://chat.codeenginestudio.com/plugins/github/webhook`
   - Content Type: application/json
   - Secret: with the secret generated in System Console > Plugins > Github > Webhook Secret.
 - Select **Let me select individual events** for "Which events would you like to trigger this webhook?".
 - Select the following events: Branch or Tag creation, Branch or Tag deletion, Issue comments, Issues, Pull requests, Pull request review, Pull request review comments, Pushes, Stars.
 - Hit Add Webhook to save it.

# Bitbucket-to-Mattermost notification

Install this [plugin](https://mattermost.gitbook.io/bitbucket-plugin) (Sysadmin only)

## Subscribe to a respository.

```sh
# grant access to your Bitbucket account.
/bitbucket connect

# Subsribe to the repository you're working on.
/bitbucket subscriptions add workspace/repo pulls,issues,issue_comments,pull_reviews

# List the subscripted repositories
/bitbucket subscriptions list
```

**Note:** replace `workspace/repo` to the repo you want to connect to. For instance: client-workspace/frontend-react

## Config the repository to receive notification

> You must create a webhook for each repository you want to receive notifications for or subscribe to. So give the following instruction to the owner of repo if you don't have permission.

- Go to the **Repository settings** page of the Bitbucket organization you want to send notifications from, then select **Webhooks** in the sidebar.
    
- Select **Add Webhook**.
    
- Set the following values:
    - **Title:**  `Mattermost Bitbucket Webhook - <repository_name>`, replacing `repository_name` with the name of your repository.
    - **URL:**  `https://chat.codeenginestudio.com/plugins/bitbucket/webhook?secret=SOME_SECRET`
    - replace `SOME_SECRET` with the secret generated in System Console > Plugins > Bitbucket > Webhook Secret.
-  Select **Choose from a full list of triggers**.
- Select:
    - **Repository:**  `Push`.
    - **Pull Request:**  `Created`, `Updated`, `Approved`, `Approval removed`, `Merged`, `Declined`, `Comment created`.
    - **Issue:**  `Created`, `Updated`, `Comment created`.
   
- Select **Save**.

# ClickUp (for Scrum master)

## Configuration

Config the ClickUp & Github (should have permission to access the integration in Clickup) following this [article](https://docs.clickup.com/en/articles/856285-github).

## Custom Automation

This action will only occur if the pull request is linked to a ClickUp Task.

Find out more [here](https://docs.clickup.com/en/articles/4188427-github-automations)

# Verifying Commit Message (Optional)

There are two way to install:

- Using NPM

- Update Git hooks directly

## Using NPM

```sh
# Install commitlint cli and conventional config
npm install --save-dev @commitlint/{config-conventional,cli}
# For Windows:
npm install --save-dev @commitlint/config-conventional @commitlint/cli

# Configure commitlint to use conventional config
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
```

To lint commits before they are created you can use Husky's `commit-msg` hook:

```sh
# Install Husky v6
npm install husky --save-dev
# or
yarn add husky --dev

# Activate hooks
npx husky install
# or
yarn husky install

# Add hook
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'
```

Find out more [here](https://commitlint.js.org/#/guides-local-setup)

## Git hooks

To install commit lint for your project please copy the file named [`install.commitlint.sh`](./install.commitlint.sh) to your project folder, then run it.
