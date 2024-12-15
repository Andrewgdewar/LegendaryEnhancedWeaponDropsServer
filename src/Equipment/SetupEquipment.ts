import { DependencyContainer } from "tsyringe";

import { DatabaseServer } from "@spt/servers/DatabaseServer";
import config from "../../config/config.json";
import { cloneDeep } from "./utils";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { EpicWeaponData, Rarity } from "./types";
import _weaponMap from "../Constants/weapons.json";
import { Languages, RarityPrice } from "./constants";

const weaponMap = _weaponMap as Record<string, Record<Rarity, EpicWeaponData>>;

export default function SetupEquipment(
  container: DependencyContainer
): undefined {
  const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
  const tables = databaseServer.getTables();

  // Need a new default template
  for (const id in weaponMap) {
    for (const rarity in weaponMap[id]) {
      const { originalTpl, tpl, overrides } = weaponMap[id][rarity];
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
    }
  }

  Object.keys(tables.globals.ItemPresets).forEach((id) => {
    const preset = tables.globals.ItemPresets[id];
    if (weaponMap[preset?._encyclopedia]) {
      for (const rarity in weaponMap[preset._encyclopedia]) {
        const { templateId, tpl } = weaponMap[preset._encyclopedia][rarity];
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
    }
  });

  // globals > Mastering > Templates (add just new uuid to array)
  tables.globals.config.Mastering.forEach(({ Templates }, index) => {
    Templates.forEach((id) => {
      if (weaponMap[id]) {
        for (const rarity in weaponMap[id]) {
          tables.globals.config.Mastering[index].Templates.push(
            weaponMap[id][rarity].tpl
          );
        }
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
    for (const id in weaponMap) {
      for (const rare in weaponMap[id]) {
        const { tpl, templateId, rarity, originalTpl } = weaponMap[id][rare];

        tables.locales.global[lang][templateId] = "";
        tables.locales.global[lang][tpl + " Name"] =
          rarity + " " + tables.locales.global[lang][originalTpl + " Name"];
        tables.locales.global[lang][tpl + " ShortName"] =
          rarity +
          " " +
          tables.locales.global[lang][originalTpl + " ShortName"];
        tables.locales.global[lang][tpl + " Description"] =
          tables.locales.global[lang][originalTpl + " Description"];

        // if (lang === "en")
        //   console.log(
        //     locales[lang][tpl + " Name"],
        //     locales[lang][tpl + " ShortName"],
        //     locales[lang][tpl + " Description"],
        //     locales[lang][templateId]
        //   );
      }
    }
  });

  // templates > handook.json > items
  // need to push the following (so it can be sold) based off of rarity
  for (const id in weaponMap) {
    for (const rare in weaponMap[id]) {
      const { tpl, rarity, parentId } = weaponMap[id][rare] as EpicWeaponData;
      tables.templates.handbook.Items.push({
        Id: tpl,
        ParentId: parentId,
        Price: RarityPrice[rarity],
      });
    }
  }

  config.debug && console.log("EWP: equipment stored!");
}
