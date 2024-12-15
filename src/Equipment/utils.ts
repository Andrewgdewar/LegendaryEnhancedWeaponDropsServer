import {
  IProps,
  ITemplateItem,
} from "@spt/models/eft/common/tables/ITemplateItem";
import { EpicWeaponData, Rarity } from "./types";
import {
  RarityColor,
  RarityExperience,
  RarityLoadUnload,
  RarityMultipliersIncrease,
  RarityMultipliersLow,
  RarityMultipliersReduce,
  RarityMultipliersVelocity,
  RarityRepairCost,
} from "./constants";

export const deDupeArr = (arr: any[]) => [...new Set(arr)];

export const saveToFile = (data, filePath) => {
  var fs = require("fs");
  let dir = __dirname;
  let dirArray = dir.split("\\");
  const directory = `${dirArray[dirArray.length - 5]}/${
    dirArray[dirArray.length - 4]
  }/${dirArray[dirArray.length - 3]}/${dirArray[dirArray.length - 2]}/`;
  fs.writeFile(
    directory + filePath,
    JSON.stringify(data, null, 4),
    function (err) {
      if (err) throw err;
    }
  );
};

export const checkParentRecursive = (
  parentId: string,
  items: Record<string, ITemplateItem>,
  queryIds: string[]
): boolean => {
  if (queryIds.includes(parentId)) return true;
  if (!items?.[parentId]?._parent) return false;

  return checkParentRecursive(items[parentId]._parent, items, queryIds);
};

export const cloneDeep = (objectToClone: any) =>
  JSON.parse(JSON.stringify(objectToClone));

export const isObject = (item) => {
  return item && typeof item === "object" && !Array.isArray(item);
};

export const mergeDeep = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
};

export const getNewMongoId = (items) => {
  const newId =
    ((new Date().getTime() / 1000) | 0).toString(16) +
    "xxxxxxxxxxxxxxxx"
      .replace(/[x]/g, function () {
        return ((Math.random() * 16) | 0).toString(16);
      })
      .toLowerCase();

  if (!!items[newId]) return getNewMongoId(items);
  return newId;
};

export const roundToDecimal = (num: number, decimal) =>
  Math.round(num * decimal) / decimal;

export const buildNewWeapon = (
  originalTpl: string,
  rarity: Rarity,
  items: Record<string, ITemplateItem>
): EpicWeaponData => {
  return {
    tpl: getNewMongoId(items),
    rarity,
    originalTpl,
    name: items[originalTpl]._name,
    parentId: items[originalTpl]._parent,
    overrides: buildOverrides(rarity, items[originalTpl]._props),
    templateId: getNewMongoId(items),
  };
};

export const buildOverrides = (
  rarity: Rarity,
  props: IProps
): Partial<IProps> => {
  let {
    PostRecoilHorizontalRangeHandRotation,
    PostRecoilVerticalRangeHandRotation,
    Ergonomics,
    RecoilForceBack,
    RecoilForceUp,
    Weight,
    CameraSnap,
    Velocity,
    weapFireType,
    SingleFireRate,
    bFirerate,
    CenterOfImpact,
    DurabilityBurnRatio,
  } = props;
  const isAuto = weapFireType.includes("fullauto");
  if (Velocity < 1) Velocity = 1;
  return {
    BackgroundColor: RarityColor[rarity],
    AllowMisfire: false,
    AllowJam: false,
    AllowOverheat: false,
    CanSellOnRagfair: false,
    CenterOfImpact: roundToDecimal(
      CenterOfImpact * RarityMultipliersReduce[rarity],
      100
    ),
    IsUnbuyable: true,
    DurabilityBurnRatio: roundToDecimal(
      RarityMultipliersIncrease[rarity] * DurabilityBurnRatio,
      100
    ),
    Velocity: roundToDecimal(RarityMultipliersVelocity[rarity] * Velocity, 100),
    PostRecoilHorizontalRangeHandRotation: (() => {
      const y = roundToDecimal(
        PostRecoilHorizontalRangeHandRotation.y *
          RarityMultipliersReduce[rarity],
        10
      );
      return { x: y * -1, y, z: 0 };
    })(),
    PostRecoilVerticalRangeHandRotation: (() => {
      const x = roundToDecimal(
        PostRecoilVerticalRangeHandRotation.x * RarityMultipliersReduce[rarity],
        10
      );
      return { x, y: 0, z: 0 };
    })(),
    Ergonomics: Math.round(Ergonomics * RarityMultipliersIncrease[rarity]),
    InsuranceDisabled: true,
    LootExperience: RarityExperience[rarity],
    BaseMalfunctionChance: 0,
    RecoilForceBack: Math.round(
      RecoilForceBack * RarityMultipliersReduce[rarity]
    ),
    RecoilForceUp: Math.round(RecoilForceUp * RarityMultipliersReduce[rarity]),
    Weight: roundToDecimal(Weight * RarityMultipliersLow[rarity], 10),
    CameraSnap: roundToDecimal(CameraSnap * RarityMultipliersLow[rarity], 10),
    RepairCost: RarityRepairCost[rarity],
    ...(isAuto
      ? {
          SingleFireRate: Math.round(
            SingleFireRate * RarityMultipliersIncrease[rarity]
          ),
          bFirerate: Math.round(bFirerate * RarityMultipliersIncrease[rarity]),
        }
      : {}),
  };
};

// "LoadUnloadModifier":-30 <  percentage
// "Recoil":-3 <  percentage
// "Velocity": 12.6  <  percentage
// "Loudness": -30
// "HipAccuracyRestorationDelay": 0.2,
// "HipAccuracyRestorationSpeed": 7,
// Loudness: -30,
// ItemSound: "mod",
