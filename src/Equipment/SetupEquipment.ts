import { DependencyContainer } from "tsyringe";

import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import config from "../../config/config.json";
import {
  checkParentRecursive,
  cloneDeep,
  getNewMongoId,
  roundToSingleDecimal,
  saveToFile,
} from "./utils";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import {
  IColor,
  ITemplateItem,
} from "@spt/models/eft/common/tables/ITemplateItem";
import { IProps } from "@spt/models/eft/common/ILocationBase";
import { IBotConfig } from "../../types/models/spt/config/IBotConfig.d";
import {
  EpicWeaponData,
  Languages,
  Rarity,
  RarityColor,
  RarityExperience,
  RarityMultipliersReduce,
  RarityPrice,
} from "./types";
import _weaponMap from "../Constants/weapons.json";

const weaponMap = _weaponMap as Record<string, EpicWeaponData>;

export default function SetupEquipment(
  container: DependencyContainer
): undefined {
  const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
  const tables = databaseServer.getTables();

  // const items = tables.templates.items;
  // const globals = tables.globals;
  // const botTypes = tables.bots.types;
  // const configServer = container.resolve<ConfigServer>("ConfigServer");
  // const botConfig = configServer.getConfig<IBotConfig>(ConfigTypes.BOT);

  // const equipmentList = Object.keys(items).filter((id) => {
  //   const {
  //     IsUnsaleable,
  //     IsUnbuyable,
  //     IsUnremovable,
  //     CanSellOnRagfair,
  //     CanPutIntoDuringTheRaid,
  //     QuestItem,
  //   } = items[id]._props;
  //   return (
  //     !IsUnsaleable &&
  //     !IsUnbuyable &&
  //     !IsUnremovable &&
  //     CanSellOnRagfair &&
  //     !QuestItem &&
  //     CanPutIntoDuringTheRaid &&
  //     checkParentRecursive(items[id]._parent, items, [BaseClasses.MOD]) &&
  //     !checkParentRecursive(items[id]._parent, items, [BaseClasses.MAGAZINE])
  //   );
  // });

  // This is for the botTypesAdjustmentsLater
  // const bossNames = botConfig.bosses.map((name) => name.toLowerCase());
  // const followers = Object.keys(botTypes).filter((name) =>
  //   name.includes("follower")
  // );

  // const FirstPrimaryWeapon = new Set<string>([]);
  // const Holster = new Set<string>([]);

  // const combinedbossFollowers = [...bossNames, ...followers, "marksman"];

  // combinedbossFollowers.forEach((name) => {
  //   if (botTypes?.[name]?.inventory?.equipment?.FirstPrimaryWeapon) {
  //     const weaponList = botTypes[name].inventory.equipment.FirstPrimaryWeapon;
  //     let highestId = "";
  //     let highestValue = 0;
  //     let secondHighestId = "";
  //     for (const id in botTypes[name].inventory.equipment.FirstPrimaryWeapon) {
  //       if (weaponList[id] > highestValue) {
  //         secondHighestId = highestId;
  //         highestId = id;
  //         highestValue = weaponList[id];
  //       }
  //     }
  //     if (highestId) FirstPrimaryWeapon.add(highestId);
  //     if (secondHighestId) FirstPrimaryWeapon.add(secondHighestId);
  //   }

  //   if (botTypes?.[name]?.inventory?.equipment?.Holster) {
  //     const weaponList = botTypes[name].inventory.equipment.Holster;

  //     let highestId = "";
  //     let highestValue = 0;
  //     let secondHighestId = "";
  //     for (const id in botTypes[name].inventory.equipment.Holster) {
  //       if (weaponList[id] > highestValue) {
  //         secondHighestId = highestId;
  //         highestId = id;
  //         highestValue = weaponList[id];
  //       }
  //     }
  //     if (highestId) Holster.add(highestId);
  //     if (secondHighestId) Holster.add(secondHighestId);
  //   }
  // });

  // console.log(FirstPrimaryWeapon.size, Holster.size);

  // const primary = [...FirstPrimaryWeapon]
  //   .map((id) => items[id])
  //   .map(({ _name, _id }) => ({ _name, _id }));
  // const holster = [...Holster]
  //   .map((id) => items[id])
  //   .map(({ _name, _id }) => ({ _name, _id }));

  // const all = [...FirstPrimaryWeapon, ...Holster];

  const getNewItem = (
    originalTpl: string,
    rarity: Rarity,
    items: Record<string, ITemplateItem>
  ): EpicWeaponData => ({
    tpl: getNewMongoId(items),
    rarity,
    originalTpl,
    parentId: items[originalTpl]._parent,
    overrides: {
      BackgroundColor: RarityColor[rarity],
      AllowMisfire: false,
      AllowJam: false,
      AllowOverheat: false,
      CanSellOnRagfair: false,
      IsUnbuyable: true,
      InsuranceDisabled: true,
      LootExperience: RarityExperience[rarity],
      BaseMalfunctionChance: 0,
      RecoilForceBack: Math.round(
        items[originalTpl]._props.RecoilForceBack *
          RarityMultipliersReduce[rarity]
      ),
      RecoilForceUp: Math.round(
        items[originalTpl]._props.RecoilForceUp *
          RarityMultipliersReduce[rarity]
      ),
      Weight: roundToSingleDecimal(
        items[originalTpl]._props.Weight * RarityMultipliersReduce[rarity]
      ),
      CameraSnap: roundToSingleDecimal(
        items[originalTpl]._props.CameraSnap * RarityMultipliersReduce[rarity]
      ),
    },
    templateId: getNewMongoId(items),
  });

  // const newItem = getNewItem("5bfea6e90db834001b7347f3", "Rare", items);

  // const map: Record<string, EpicWeaponData> = {
  //   "5bfea6e90db834001b7347f3": newItem,
  // };

  // saveToFile(map, "Constants/weapons.json");

  // global > itemPresets
  // Need a new default template
  Object.keys(weaponMap).forEach((id) => {
    const { originalTpl, tpl, overrides } = weaponMap[id];
    const newItem: ITemplateItem = cloneDeep(
      tables.templates.items[originalTpl]
    );

    newItem._id = tpl;

    if (newItem?._props?.Chambers) {
      newItem?._props?.Chambers.forEach(({ _parent }, index) => {
        if (_parent) {
          newItem._props.Chambers[index]._parent = tpl;
        }
      });
    }
    if (newItem?._props?.Slots) {
      newItem?._props?.Slots.forEach(({ _parent }, index) => {
        if (_parent) {
          newItem._props.Slots[index]._parent = tpl;
        }
      });
    }

    newItem._props = { ...newItem._props, ...overrides };

    tables.templates.items[tpl] = newItem;
  });

  Object.keys(tables.globals.ItemPresets).forEach((id) => {
    const preset = tables.globals.ItemPresets[id];
    if (weaponMap[preset?._encyclopedia]) {
      const { templateId, tpl } = weaponMap[preset._encyclopedia];
      tables.globals.ItemPresets[templateId] = cloneDeep(preset);
      tables.globals.ItemPresets[templateId]._id = templateId;
      tables.globals.ItemPresets[templateId]._encyclopedia = tpl;

      if (tables.globals.ItemPresets[templateId]?._items?.[0]) {
        tables.globals.ItemPresets[templateId]._items[0] = {
          ...tables.globals.ItemPresets[templateId]._items[0],
          _tpl: tpl,
        };
      }
    }
  });

  // globals > Mastering > Templates (add just new uuid to array)
  tables.globals.config.Mastering.forEach(({ Templates }, index) => {
    Templates.forEach((id) => {
      if (weaponMap[id]) {
        tables.globals.config.Mastering[index].Templates.push(
          weaponMap[id].tpl
        );
      }
    });
  });

  // locales > global > <lang>.json
  // Need to copy/update name with correct ID
  // <templateId>: ""
  // "<tpl> Name":
  // "<tpl> ShortName":
  // "<tpl> Description"
  Languages.forEach((lang) => {
    Object.keys(weaponMap).forEach((id) => {
      const { tpl, templateId, rarity, originalTpl } = weaponMap[id];

      tables.locales.global[lang][templateId] = "";
      tables.locales.global[lang][tpl + " Name"] =
        rarity + " " + tables.locales.global[lang][originalTpl + " Name"];
      tables.locales.global[lang][tpl + " ShortName"] =
        rarity + " " + tables.locales.global[lang][originalTpl + " ShortName"];
      tables.locales.global[lang][tpl + " Description"] =
        tables.locales.global[lang][originalTpl + " Description"];

      // if (lang === "en")
      //   console.log(
      //     locales[lang][tpl + " Name"],
      //     locales[lang][tpl + " ShortName"],
      //     locales[lang][tpl + " Description"],
      //     locales[lang][templateId]
      //   );
    });
  });

  // templates > handook.json > items
  // need to push the following (so it can be sold) based off of rarity
  Object.keys(weaponMap).forEach((id) => {
    const { tpl, rarity, parentId } = weaponMap[id];
    tables.templates.handbook.Items.push({
      Id: tpl,
      ParentId: parentId,
      Price: RarityPrice[rarity],
    });
  });

  config.debug && console.log("EWP: equipment stored!");
}
