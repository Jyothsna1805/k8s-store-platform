import { execa } from "execa";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ABSOLUTE path to charts/store
const CHART_PATH = path.resolve(__dirname, "../../charts/store");

export async function installStore({ name }) {
  console.log("Installing store:", name);
  console.log("Using chart path:", CHART_PATH);

  const releaseName = name;
  const namespace = name;

  await execa(
    "helm",
    [
      "install",
      releaseName,
      CHART_PATH,
      "--namespace",
      namespace,
      "--create-namespace",
      "--set",
      `store.name=${name}`,
    ],
    { stdio: "inherit" }
  );
}
