import { IProps } from "@spt/models/eft/common/tables/ITemplateItem";
import { RarityColor } from "./constants";

export type Rarity = keyof typeof RarityColor;

export interface EpicWeaponData {
  tpl: string;
  name: string;
  rarity: Rarity;
  originalTpl: string;
  parentId: string;
  overrides: Partial<IProps>;
  templateId: string;
}
