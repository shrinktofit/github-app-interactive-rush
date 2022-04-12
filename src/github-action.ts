import action from "@probot/adapter-github-actions";
import app from "./index";
import ps from 'path';

const repo = ps.join(process.env.GITHUB_WORKSPACE!, '__repo');
console.debug(`Repo: ${repo}`);

// @ts-ignore
action.run(app({
    repo,
}));