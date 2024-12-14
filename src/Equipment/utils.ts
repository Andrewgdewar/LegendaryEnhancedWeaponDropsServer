import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";

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

export const roundToSingleDecimal = (num: number) => Math.round(num * 10) / 10;
