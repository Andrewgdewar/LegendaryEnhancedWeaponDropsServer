import { IProps } from "@spt/models/eft/common/tables/ITemplateItem";

export enum RarityColor {
  Rare = "tracerGreen",
  Epic = "tracerYellow",
  Legendary = "tracerRed",
}

export enum RarityPrice {
  Rare = 25000,
  Epic = 70000,
  Legendary = 125000,
}

export enum RarityExperience {
  Rare = 100,
  Epic = 200,
  Legendary = 450,
}

export enum RarityMultipliersReduce {
  Rare = 0.8,
  Epic = 0.6,
  Legendary = 0.4,
}

export enum RarityMultipliersIncrease {
  Rare = 1.2,
  Epic = 1.35,
  Legendary = 1.5,
}

export type Rarity = keyof typeof RarityColor;

export interface EpicWeaponData {
  tpl: string;
  rarity: Rarity;
  originalTpl: string;
  parentId: string;
  overrides: Partial<IProps>;
  // name: string;
  // shortName: string;
  // description: string;
  // templateDescription: string;
  templateId: string;
}

export const Languages = [
  "ch",
  "en",
  "cz",
  "hu",
  "ge",
  "jp",
  "po",
  "sk",
  "ro",
  "tu",
  "es-mx",
  "it",
  "es",
  "fr",
  "pl",
  "kr",
  "ru",
];
