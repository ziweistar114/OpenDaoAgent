import { getConfig } from "./core/config.js";
import { runOrchestrator } from "./orchestrator/run.js";
import { listAllowedTools } from "./tools/catalog.js";

const config = getConfig();
const sampleQuery = {
  text: "What should Phase 1 focus on if we want persistent memory and local-first deployment?"
};

const response = await runOrchestrator(sampleQuery);

console.log(`${config.appName} prototype`);
console.log(`Mode: ${config.mode}`);
console.log(`Phase: ${config.currentPhase}`);
console.log(`Allowed tools: ${listAllowedTools().join(", ")}`);
console.log("---");
console.log(`Query: ${response.query}`);
console.log(`Reply: ${response.reply}`);
console.log("Notes:");
for (const note of response.notes) {
  console.log(`- ${note}`);
}
