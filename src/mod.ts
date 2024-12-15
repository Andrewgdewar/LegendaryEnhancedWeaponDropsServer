import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { DependencyContainer } from "tsyringe";
import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";

import { enabled } from "../config/config.json";

import { ILogger } from "@spt/models/spt/utils/ILogger";

import SetupEquipment from "./Equipment/SetupEquipment";
import { LocationUpdater } from "./LocationUpdater/locationUpdater";
import buildWeaponsJson from "./Equipment/buildWeaponsJson";

class LegendaryEnhancedWeaponDrops implements IPreSptLoadMod, IPostSptLoadMod {
  preSptLoad(container: DependencyContainer): void {
    enabled && LocationUpdater(container);
  }

  postSptLoad(container: DependencyContainer): void {
    // buildWeaponsJson(container);
    // return;
    if (enabled) {
      try {
        SetupEquipment(container);
      } catch (error) {
        const Logger = container.resolve<ILogger>("WinstonLogger");
        Logger.error(
          `LEWD failed to make equipment changes.
            ` + error?.message
        );
      }
    }
  }
}

module.exports = { mod: new LegendaryEnhancedWeaponDrops() };
