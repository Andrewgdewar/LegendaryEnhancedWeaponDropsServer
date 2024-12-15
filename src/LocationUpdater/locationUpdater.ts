import { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import { DependencyContainer } from "tsyringe";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import {
  EffectedBosses,
  Rarities,
  RarityChanceHigh,
  RarityChanceLow,
  RarityChanceMedium,
  RarityMultipliersIncrease,
} from "../Equipment/constants";
import weapons from "../Constants/weapons.json";
import { Rarity } from "src/Equipment/types";
import { saveToFile } from "../Equipment/utils";
import config from "../../config/config.json";

export const LocationUpdater = (container: DependencyContainer): undefined => {
  const staticRouterModService = container.resolve<StaticRouterModService>(
    "StaticRouterModService"
  );
  // const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
  // const tables = databaseServer.getTables();
  // updateBotTypes(tables);

  staticRouterModService.registerStaticRouter(
    `LewdWeaponUpdater`,
    [
      {
        url: "/client/match/local/start",
        action: async (_url, info, sessionId, output) => {
          console.log("LEWD - started updates");
          try {
            await setTimeout(() => {
              const databaseServer =
                container.resolve<DatabaseServer>("DatabaseServer");
              const tables = databaseServer.getTables();
              updateBotTypes(tables);
              console.log("LEWD - finished updates");
            }, 1000);
          } catch (error) {
            console.error("LEWD - unable to update bot equipment");
          }
          return output;
        },
      },
    ],
    "aki"
  );
};

const updateBotTypes = (tables: IDatabaseTables) => {
  const botTypes = tables.bots.types;
  // saveToFile(botTypes.marksman.inventory.equipment, "1.json");
  EffectedBosses.forEach((name) => {
    const rarityMultiplier = getRarityMultiplier(name);
    // Mainhand
    for (const id in botTypes?.[name]?.inventory?.equipment
      ?.FirstPrimaryWeapon) {
      // if (currentWeaponList[id])
      if (weapons[id] && botTypes?.[name]?.inventory.mods[id]) {
        for (const _rarity in weapons[id]) {
          // First add the item weightings
          const rarity = _rarity as Rarity;

          const originalItemWeighting =
            botTypes[name].inventory.equipment.FirstPrimaryWeapon[id];

          const newWeighting = Math.round(
            rarityMultiplier[rarity] *
              originalItemWeighting *
              config.rarityMultiplier
          );
          if (newWeighting > 1) {
            const newId = weapons[id][rarity].tpl;

            tables.bots.types[name].inventory.equipment.FirstPrimaryWeapon[
              newId
            ] = newWeighting;

            // Then make a new copy of the mod object
            tables.bots.types[name].inventory.mods[newId] =
              botTypes[name].inventory.mods[id];
          }
        }
      }
    }

    //pistols
    for (const id in botTypes?.[name]?.inventory?.equipment?.Holster) {
      // if (currentWeaponList[id])
      if (weapons[id] && botTypes?.[name]?.inventory.mods[id]) {
        for (const _rarity in weapons[id]) {
          // First add the item weightings
          const rarity = _rarity as Rarity;

          const originalItemWeighting =
            botTypes[name].inventory.equipment.Holster[id];

          const newWeighting = Math.round(
            rarityMultiplier[rarity] *
              originalItemWeighting *
              config.rarityMultiplier
          );
          if (newWeighting > 1) {
            const newId = weapons[id][rarity].tpl;

            tables.bots.types[name].inventory.equipment.Holster[newId] =
              newWeighting;

            // Then make a new copy of the mod object
            tables.bots.types[name].inventory.mods[newId] =
              botTypes[name].inventory.mods[id];
          }
        }
      }
    }
  });
  // saveToFile(botTypes.marksman.inventory.equipment, "2.json");
};

const getRarityMultiplier = (name: string) => {
  switch (true) {
    case name === "pmcbot":
    case name === "exusec":
    case name.includes("follower"):
      return RarityChanceMedium;
    case name.includes("boss"):
      return RarityChanceHigh;
    default: //marksman
      return RarityChanceLow;
  }
};
