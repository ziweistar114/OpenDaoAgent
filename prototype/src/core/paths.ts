import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

export const prototypeRoot = path.resolve(currentDir, "../..");
export const dataRoot = path.join(prototypeRoot, "data");
export const memoryFilePath = path.join(dataRoot, "memory", "memory.json");
export const knowledgeDirPath = path.join(dataRoot, "knowledge");
