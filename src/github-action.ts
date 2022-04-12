import run from "@probot/adapter-github-actions";
import app from "./index";

console.log(`Running ....`);

// @ts-ignore
run(app);