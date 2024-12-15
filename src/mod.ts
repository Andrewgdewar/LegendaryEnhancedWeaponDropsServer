/* eslint-disable @typescript-eslint/naming-convention */
import { DependencyContainer } from "tsyringe";
import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";

import { enabled } from "../config/config.json";

import { ILogger } from "@spt/models/spt/utils/ILogger";

import SetupEquipment from "./Equipment/SetupEquipment";
import buildWeaponsJson from "./Equipment/buildWeaponsJson";

class LegendaryEnhancedWeaponDrops implements IPostSptLoadMod {
  postSptLoad(container: DependencyContainer): void {
    // buildWeaponsJson(container);
    if (enabled) {
      try {
        SetupEquipment(container);
      } catch (error) {
        const Logger = container.resolve<ILogger>("WinstonLogger");
        Logger.error(
          `EWP failed to make equipment changes.
            ` + error?.message
        );
      }
    }
  }
}

module.exports = { mod: new LegendaryEnhancedWeaponDrops() };
