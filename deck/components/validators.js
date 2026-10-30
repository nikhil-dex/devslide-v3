// Shared prop validators for AIRDeck components.
//
// Not a component — this file is imported by components, never by the
// compiler. It exists to keep every component's validateProps identical in
// style and error wording without clever abstraction: four small functions,
// each pushing human-readable messages into the caller's errors array.
//
// Canonical error wording (the Component API v1 standard):
//   • missing/empty required prop  → `missing required prop "name"`
//   • wrong container type         → `prop "name" must be an array`
//   • wrong element type           → `prop "name[2]" must be a string`
//   • wrong nested field           → `prop "items[2].label" must be a string`

function isPlainObject(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

// Required text prop: must be present and non-empty after trimming.
export function requiredText(errors, props, name) {
  const value = props[name];
  if (value === undefined || String(value).trim() === "") {
    errors.push(`missing required prop "${name}"`);
  }
}

// Required array of strings. requireNonEmpty treats [] as missing.
export function requiredStringArray(errors, props, name, { requireNonEmpty = false } = {}) {
  const value = props[name];

  if (!Array.isArray(value)) {
    errors.push(`prop "${name}" must be an array`);
    return;
  }
  if (requireNonEmpty && value.length === 0) {
    errors.push(`missing required prop "${name}"`);
    return;
  }
  value.forEach((item, index) => {
    if (typeof item !== "string") {
      errors.push(`prop "${name}[${index}]" must be a string`);
    }
  });
}

// Required array of objects, each carrying the listed non-empty string fields.
export function requiredObjectArray(errors, props, name, fields) {
  const value = props[name];

  if (!Array.isArray(value)) {
    errors.push(`prop "${name}" must be an array`);
    return;
  }
  value.forEach((item, index) => {
    if (!isPlainObject(item)) {
      errors.push(`prop "${name}[${index}]" must be an object`);
      return;
    }
    for (const field of fields) {
      const fieldValue = item[field];
      if (typeof fieldValue !== "string" || fieldValue.trim() === "") {
        errors.push(`prop "${name}[${index}].${field}" must be a string`);
      }
    }
  });
}

// Required array of string-arrays (table rows). requireNonEmpty treats [] as missing.
export function requiredRowsArray(errors, props, name, { requireNonEmpty = false } = {}) {
  const value = props[name];

  if (!Array.isArray(value)) {
    errors.push(`prop "${name}" must be an array`);
    return;
  }
  if (requireNonEmpty && value.length === 0) {
    errors.push(`missing required prop "${name}"`);
    return;
  }
  value.forEach((row, rowIndex) => {
    if (!Array.isArray(row)) {
      errors.push(`prop "${name}[${rowIndex}]" must be an array`);
      return;
    }
    row.forEach((cell, cellIndex) => {
      if (typeof cell !== "string") {
        errors.push(`prop "${name}[${rowIndex}][${cellIndex}]" must be a string`);
      }
    });
  });
}
