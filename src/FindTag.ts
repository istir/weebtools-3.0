interface Setting {
  key: string;
  name: string;
  value: string | string[] | boolean;
  type: string;
  hidden: boolean;
}

export default function FindTag(
  settingsObject,
  key: string,
  ValueToFind: string,
  WhatToReturn?: string
): string | boolean | string[] | Setting {
  if (WhatToReturn) {
    return settingsObject.find((el) => el[key] === ValueToFind)[WhatToReturn];
  }
  const object: Setting = settingsObject.find((el) => el[key] === ValueToFind);

  return object;
  // return settingsObject.find((el) => el[key] === ValueToFind);
}
