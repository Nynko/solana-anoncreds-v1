// function toSnakeCase(str: string): string {
//     return str.replace(/([A-Z])/g, "_$1").toLowerCase();
//   }
  
// export function convertKeysToSnakeCase(obj: any): any {
// if (Array.isArray(obj)) {
//     return obj.map(convertKeysToSnakeCase);
// } else if (obj !== null && typeof obj === 'object') {
//     return Object.keys(obj).reduce((acc: any, key: string) => {
//     const snakeKey = toSnakeCase(key);
//     acc[snakeKey] = convertKeysToSnakeCase(obj[key]);
//     return acc;
//     }, {});
// }
// return obj;
// }


// export function convertStringsToBuffers(obj) {
//   if (typeof obj === 'string') {
//     // Assuming all strings should be converted to Buffer
//     return Buffer.from(obj);
//   } else if (Array.isArray(obj)) {
//     return obj.map(convertStringsToBuffers);
//   } else if (obj !== null && typeof obj === 'object') {
//     return Object.keys(obj).reduce((acc, key) => {
//       acc[key] = convertStringsToBuffers(obj[key]);
//       return acc;
//     }, {});
//   }
//   return obj;
// }



export function splitStringFromEnd(str: string, chunkSize: number): string[] {
    // Validate chunk size
    if (chunkSize <= 0) {
      throw new Error("Chunk size must be greater than 0.");
    }
  
    const chunks: string[] = [];
    let index = str.length; // Start from the end of the string
  
    while (index > 0) {
      // Calculate start position for the chunk
      const start = Math.max(index - chunkSize, 0);
      // Extract substring from start to index
      const chunk = str.substring(start, index);
      chunks.unshift(chunk); // Add chunk to the beginning of the array
      index -= chunkSize; // Move the index backwards by chunkSize
    }
  
    return chunks;
  }