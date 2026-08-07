export function parsePostmanCollection(jsonString) {
  try {
    const raw = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    if (!raw.info || !raw.item) {
      throw new Error("Invalid Postman Collection: missing 'info' or 'item' root fields.");
    }
    
    // Normalize item structure with generated IDs if missing
    let idCounter = 1;
    function processItems(items) {
      return items.map(item => {
        const processed = { ...item };
        if (!processed.id) {
          processed.id = item.item ? `folder-${idCounter++}` : `req-${idCounter++}`;
        }
        if (item.item) {
          processed.item = processItems(item.item);
        }
        return processed;
      });
    }

    return {
      info: raw.info,
      variable: raw.variable || [],
      item: processItems(raw.item),
      event: raw.event || []
    };
  } catch (err) {
    throw new Error(`Failed to parse Postman collection: ${err.message}`);
  }
}

export function exportPostmanCollection(collectionData) {
  const exportFormat = {
    info: collectionData.info || {
      _postman_id: "export-" + Date.now(),
      name: "Exported Collection",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: collectionData.item || [],
    variable: collectionData.variable || [],
    event: collectionData.event || []
  };
  return JSON.stringify(exportFormat, null, 2);
}
