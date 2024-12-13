/* eslint-disable @typescript-eslint/naming-convention */
import { DependencyContainer } from "tsyringe";
import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";

import { enabled } from "../config/config.json";

import { ILogger } from "@spt/models/spt/utils/ILogger";

import SetupEquipment from "./Equipment/SetupEquipment";

class EnchantedWeaponMods implements IPostSptLoadMod {
  postSptLoad(container: DependencyContainer): void {
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

module.exports = { mod: new EnchantedWeaponMods() };
