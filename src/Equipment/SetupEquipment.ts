import { DependencyContainer } from "tsyringe";

import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { cloneDeep } from "./utils";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { EpicWeaponData, Rarity } from "./types";
import _weaponMap from "../Constants/weapons.json";
import { Languages, Rarities, RarityPrice } from "./constants";
import { debug } from "../../config/config.json";

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

  // adjust quests
  for (const questId in tables.templates.quests) {
    const quest = tables.templates.quests[questId];
    // templates > quests > each > conditions >
    // available for finish> each> counter > conditions >
    // each > weapon | target (if target is array) >includes >add all 3
    quest?.conditions?.AvailableForFinish?.forEach((cond, index) => {
      cond?.counter?.conditions?.forEach((item, inIndex) => {
        if (item?.weapon?.length) {
          item.weapon.forEach((id) => {
            if (weaponMap[id]) {
              tables.templates.quests[questId].conditions?.AvailableForFinish[
                index
              ].counter.conditions[inIndex].weapon.push(
                ...Object.keys(weaponMap[id]).map(
                  (rarity: Rarity) => weaponMap[id][rarity].tpl
                )
              );
              debug &&
                console.log(
                  "Updated killquests for",
                  quest.QuestName,
                  weaponMap[id]?.Rare?.name,
                  " added 3 rarities."
                );
            }
          });
        } else if (item.target && typeof item.target !== "string") {
          item.target.forEach((id) => {
            if (weaponMap[id]) {
              (
                tables.templates.quests[questId].conditions?.AvailableForFinish[
                  index
                ].counter.conditions[inIndex].target as string[]
              ).push(
                ...Object.keys(weaponMap[id]).map(
                  (rarity: Rarity) => weaponMap[id][rarity].tpl
                )
              );
              debug &&
                console.log(
                  "Updated weapons to fine for",
                  quest.QuestName,
                  weaponMap[id]?.Rare?.name,
                  " added 3 rarities."
                );
            }
          });
        }
      });
    });

    // rewards > success > each > items? each > _tpl > replace with rare
    quest?.rewards?.Success?.forEach((reward, index) => {
      if (reward?.items && typeof reward?.items !== "string") {
        reward?.items?.forEach((item, inIndex) => {
          if (!!weaponMap?.[item._tpl]) {
            debug &&
              console.log(
                "Updated reward for ",
                quest.QuestName,
                item._tpl,
                weaponMap[item._tpl]?.Rare?.name,
                " now rare."
              );

            tables.templates.quests[questId].rewards.Success[index].items[
              inIndex
            ]._tpl = weaponMap[item._tpl]?.Rare?.tpl;
          }
        });
      }
    });
  }

  console.log(
    "[LEWD]: Legendary Enhanced Weapon Drops successfully integrated!"
  );
}
