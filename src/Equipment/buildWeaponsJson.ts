import { DependencyContainer } from "tsyringe";

import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { buildNewWeapon, saveToFile } from "./utils";
import { EpicWeaponData, Rarity } from "./types";
import _weaponMap from "../Constants/weapons.json";
import { EffectedBosses } from "./constants";

export default function buildWeaponsJson(
  container: DependencyContainer
): undefined {
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
  const tables = databaseServer.getTables();

  const items = tables.templates.items;
  const botTypes = tables.bots.types;

  const FirstPrimaryWeapon = new Set<string>([]);

  const Holster = new Set<string>([]);

  EffectedBosses.forEach((name) => {
    if (botTypes?.[name]?.inventory?.equipment?.FirstPrimaryWeapon) {
      const weaponList = botTypes[name].inventory.equipment.FirstPrimaryWeapon;
      let highestId = "";
      let highestValue = 0;
      let secondHighestId = "";
      for (const id in botTypes[name].inventory.equipment.FirstPrimaryWeapon) {
        if (weaponList[id] > highestValue) {
          secondHighestId = highestId;
          highestId = id;
          highestValue = weaponList[id];
        }
      }
      if (highestId) FirstPrimaryWeapon.add(highestId);
      if (secondHighestId) FirstPrimaryWeapon.add(secondHighestId);
    }
    if (botTypes?.[name]?.inventory?.equipment?.Holster) {
      const weaponList = botTypes[name].inventory.equipment.Holster;
      let highestId = "";
      let highestValue = 0;
      let secondHighestId = "";
      for (const id in botTypes[name].inventory.equipment.Holster) {
        if (weaponList[id] > highestValue) {
          secondHighestId = highestId;
          highestId = id;
          highestValue = weaponList[id];
        }
      }
      if (highestId) Holster.add(highestId);
      if (secondHighestId) Holster.add(secondHighestId);
    }
  });

  const all = [...FirstPrimaryWeapon, ...Holster];

  const map: Record<string, Record<Rarity, EpicWeaponData>> = {};

  all.forEach((id) => {
    map[id] = {
      Legendary: buildNewWeapon(id, "Legendary", items),
      Epic: buildNewWeapon(id, "Epic", items),
      Rare: buildNewWeapon(id, "Rare", items),
    };
  });

  saveToFile(map, "Constants/weapons.json");
}
