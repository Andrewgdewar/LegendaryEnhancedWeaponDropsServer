import { DependencyContainer } from "tsyringe";

import { DatabaseServer } from "@spt/servers/DatabaseServer";
import config from "../../config/config.json";

export default function SetupEquipment(
  container: DependencyContainer
): undefined {
  const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
  const tables = databaseServer.getTables();

  config.debug && console.log("EWP: equipment stored!");
}
