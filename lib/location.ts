export const US_ONLY = "us-only";
export const NORTH_AMERICA_ONLY = "north-america-only";
export const EUROPE_ONLY = "europe-only";
export const UK_ONLY = "uk-only";

export function checkArray(text: string, itemsToCheck: string[]) {
  for (let item of itemsToCheck) {
    if (text.toLowerCase().indexOf(item.toLowerCase()) !== -1) {
      return true;
    }
  }
  return false;
}

export function checkLocation(
  prefixTokens: string[],
  locationTokens: string[],
  suffixTokens: string[],
  title: string,
  description: string
): boolean {
  const itemsToCheck = merge(
    combine(prefixTokens, locationTokens),
    combine(locationTokens, suffixTokens)
  );
  return (
    checkArray(title, itemsToCheck) || checkArray(description, itemsToCheck)
  );
}

export function merge(array1: string[], array2: string[]): string[] {
  return [...new Set([...array1, ...array2])];
}

// Returns an array with all the combinations of array 1 and 2
export function combine(...args: Array<string[]>): string[] {
  let result: string[] = [];

  function combineToArrays(array1: string[], array2: string[]) {
    if (array1.length === 0) return array2;
    if (array2.length === 0) return array1;
    const result = [];
    for (let i = 0; i < array1.length; i++) {
      for (let j = 0; j < array2.length; j++) {
        result.push(`${array1[i]} ${array2[j]}`);
      }
    }
    return result;
  }

  for (let array of args) {
    result = combineToArrays(result, array);
  }

  return result;
}

export function extractLocationTag(
  locationRequired: string,
  jobTitle: string,
  jobDescription: string
): string | null {
  const prefixes = ["only", "location", "location:"];
  const suffixes = ["only", "residents", "candidates", "based"];

  const usOnlyTags = ["US", "USA", "U.S.A", "U.S.A", "United States"];
  const northAmericaOnlyTags = [
    ...combine(usOnlyTags, ["and", "or", "&"], ["canada"]),
    "North America"
  ];
  const europeOnlyTags = ["Europe", "EU", "European Union"];
  const ukOnlyTags = ["UK", "United Kingdom", "England"];

  // First, we check location required, if they exist
  if (locationRequired) {
    if (checkArray(locationRequired, northAmericaOnlyTags)) {
      return NORTH_AMERICA_ONLY;
    }
    if (checkArray(locationRequired, usOnlyTags)) {
      return US_ONLY;
    }
    if (checkArray(locationRequired, europeOnlyTags)) {
      return EUROPE_ONLY;
    }
    if (checkArray(locationRequired, ukOnlyTags)) {
      return UK_ONLY;
    }
  }

  // now we check in the title and description
  const northAmericaOnly = checkLocation(
    prefixes,
    northAmericaOnlyTags,
    suffixes,
    jobTitle,
    jobDescription
  );

  if (northAmericaOnly) {
    return NORTH_AMERICA_ONLY;
  }

  const usOnly = checkLocation(
    prefixes,
    usOnlyTags,
    suffixes,
    jobTitle,
    jobDescription
  );

  if (usOnly) {
    return US_ONLY;
  }

  const europeOnly = checkLocation(
    prefixes,
    europeOnlyTags,
    suffixes,
    jobTitle,
    jobDescription
  );

  if (europeOnly) {
    return EUROPE_ONLY;
  }

  const ukOnly = checkLocation(
    prefixes,
    ukOnlyTags,
    suffixes,
    jobTitle,
    jobDescription
  );
  if (ukOnly) {
    return UK_ONLY;
  }

  return null;
}