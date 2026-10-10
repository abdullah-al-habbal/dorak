function snakeCase(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function camelCase(value: string): string {
  return value.replace(/_([a-z])/g, (_, letter: string) =>
    letter.toUpperCase(),
  );
}

export function dashboardProfileRequestBody(body: string): string {
  const value: unknown = JSON.parse(body);
  if (value === null || Array.isArray(value) || typeof value !== "object")
    return body;

  return JSON.stringify(
    Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [snakeCase(key), entry]),
    ),
  );
}

export function dashboardProfileResponseData(value: unknown): unknown {
  if (value === null || Array.isArray(value) || typeof value !== "object")
    return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [camelCase(key), entry]),
  );
}
