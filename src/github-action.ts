import action from "@probot/adapter-github-actions";
import app from "./index";

console.log(`Running ....`);

// @ts-ignore
action.run(app);