/**
 * Utility functions to safely parse JSON fields from database responses
 * This handles cases where JSON fields are stored as strings in the database
 */

/**
 * Safely parse a JSON string to an object/array
 * @param {string|any} jsonString - The JSON string or value to parse
 * @param {any} fallback - Fallback value if parsing fails (default: [])
 * @returns {any} - Parsed JSON or fallback value
 */
export const safeJsonParse = (jsonString, fallback = []) => {
  if (!jsonString) return fallback;

  // If it's already an object/array, return it as is
  if (typeof jsonString === "object") return jsonString;

  // If it's a string, try to parse it
  if (typeof jsonString === "string") {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn("Failed to parse JSON string:", error);
      return fallback;
    }
  }

  return fallback;
};

/**
 * Parse common JSON fields in a record/object
 * @param {object} record - The record object containing JSON fields
 * @param {string[]} jsonFields - Array of field names that should be parsed as JSON
 * @returns {object} - Record with parsed JSON fields
 */
export const parseJsonFields = (record, jsonFields = []) => {
  if (!record || typeof record !== "object") return record;

  const parsedRecord = { ...record };

  jsonFields.forEach((field) => {
    if (record[field] !== undefined) {
      parsedRecord[field] = safeJsonParse(record[field]);
    }
  });

  return parsedRecord;
};

/**
 * Parse JSON fields for an array of records
 * @param {Array} records - Array of record objects
 * @param {string[]} jsonFields - Array of field names that should be parsed as JSON
 * @returns {Array} - Array of records with parsed JSON fields
 */
export const parseJsonFieldsArray = (records, jsonFields = []) => {
  if (!Array.isArray(records)) return records;

  return records.map((record) => parseJsonFields(record, jsonFields));
};

/**
 * Common JSON fields used across the application
 */
export const COMMON_JSON_FIELDS = [
  "images",
  "keywords",
  "items",
  "bannerIDs",
  "brandIDs",
  "categoryIDs",
  "productIDs",
];
