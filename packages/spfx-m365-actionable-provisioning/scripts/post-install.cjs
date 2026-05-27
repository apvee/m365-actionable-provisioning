const fs = require("fs");
const path = require("path");

const packageName = "@apvee/spfx-m365-actionable-provisioning";
const resourceName = "SPFxProvisioningUIStrings";
const resourcePath = "node_modules/@apvee/spfx-m365-actionable-provisioning/lib/loc/{locale}.js";

const candidateRoots = [
  process.env.INIT_CWD,
  process.cwd(),
].filter(Boolean);

const findConfigPath = () => {
  for (const root of candidateRoots) {
    const configPath = path.join(root, "config", "config.json");
    if (fs.existsSync(configPath)) return configPath;
  }
  return undefined;
};

const configPath = findConfigPath();

if (!configPath) {
  console.info(`[${packageName}] SPFx config/config.json not found; skipping localized resource setup.`);
  return;
}

try {
  const contents = JSON.parse(fs.readFileSync(configPath, "utf8"));
  contents.localizedResources = contents.localizedResources || {};

  if (contents.localizedResources[resourceName] === resourcePath) {
    console.info(`[${packageName}] Localized resource already configured.`);
    return;
  }

  if (contents.localizedResources[resourceName]) {
    console.warn(
      `[${packageName}] ${resourceName} already exists with a different path; leaving it unchanged.`
    );
    return;
  }

  contents.localizedResources[resourceName] = resourcePath;
  fs.writeFileSync(configPath, `${JSON.stringify(contents, null, 2)}\n`);
  console.info(`[${packageName}] Added ${resourceName} to ${configPath}.`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[${packageName}] Unable to update SPFx localized resources: ${message}`);
}
