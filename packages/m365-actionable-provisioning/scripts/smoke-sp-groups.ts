import { runSharePointGroupSmoke } from "./smoke/sharepoint-groups";

runSharePointGroupSmoke().then(() => {
  console.log("SharePoint groups smoke passed");
}).catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
