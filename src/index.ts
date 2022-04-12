import { ApplicationFunctionOptions, Probot } from "probot";
import dedent from 'dedent';
import * as rush from '@microsoft/rush-lib';
import { Terminal, ConsoleTerminalProvider } from '@rushstack/node-core-library';

export default (app: Probot, _options: ApplicationFunctionOptions) => {
    app.on("issues.opened", async (context) => {
        const issueComment = context.issue({
            body: "Thanks for opening this issue!",
        });

        await context.octokit.issues.createComment(issueComment);
    });

    // For more information on building apps:
    // https://probot.github.io/docs/

    // To get your app running against GitHub, see:
    // https://probot.github.io/docs/development/

    app.on('pull_request.opened', async (context) => {
      const rushConfiguration = loadRushConfiguration();
      const projectChangeAnalyzer = new rush.ProjectChangeAnalyzer(rushConfiguration);
      const terminal = createRushTerminal();
      const targetBranchName = context.payload.pull_request.base.ref;
      const projects = await projectChangeAnalyzer.getChangedProjectsAsync({
        targetBranchName,
        terminal,
        shouldFetch: false,
        includeExternalDependencies: true,
        enableFiltering: true,
      });
      if (projects.size === 0) {
        return;
      }
      const projectArray = Array.from(projects).sort((a, b) => a.packageName.localeCompare(b.packageName));
      const comment = context.issue({
        body: dedent`
        Hiya ${context.payload.pull_request.user.login}, I've seen you changed some packages. If you'd like to publish new versions, Please fill the necessary survey.
        | Package name | Bump type(patch, minor, major) | Changelog |
        | -- | -- | -- |
        ${projectArray.map((project) => {
          return `| ${project.packageName} | patch |  |`;
        }).join('\n')}
        `,
      });
      await context.octokit.issues.createComment(comment);
    });
};


function createRushTerminal(): rush.IGetChangedProjectsOptions['terminal'] {
  const terminalProvider = new ConsoleTerminalProvider();
  const terminal = new Terminal(terminalProvider);
  return terminal;
}

function loadRushConfiguration(): rush.RushConfiguration {
  return rush.RushConfiguration.loadFromDefaultLocation({
    startingFolder: String.raw`X:\Dev\Repos\Cocos\eslint-config`,
  });
}