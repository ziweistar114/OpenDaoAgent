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
console.log(`Response version: ${response.version}`);
console.log(`Generated at: ${response.system.generatedAt}`);
console.log(`Query: ${response.query.text}`);
console.log(`Route: ${response.route.mode} | ${response.route.reason}`);
console.log(`Summary: ${response.answer.summary}`);
if (response.answer.evidence.length) {
  console.log("Evidence:");
  for (const item of response.answer.evidence) {
    console.log(`- ${item}`);
  }
}
if (response.answer.nextActions.length) {
  console.log("Next actions:");
  for (const item of response.answer.nextActions) {
    console.log(`- ${item}`);
  }
}
if (response.memory.write) {
  console.log(`Memory write: ${response.memory.write.reason}`);
  if (response.memory.write.item) {
    console.log(
      `Memory item: [${response.memory.write.item.category}/${response.memory.write.item.priority}] ${response.memory.write.item.summary}`
    );
  }
}
console.log(
  `Knowledge index: ${response.knowledge.index.cacheState} | docs=${response.knowledge.index.documentCount} | chunks=${response.knowledge.index.chunkCount}`
);
console.log("System notes:");
for (const note of response.system.notes) {
  console.log(`- ${note}`);
}
