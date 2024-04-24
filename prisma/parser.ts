import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { get } from 'https';

export interface CSVData {
  headers: string[];
  data: string[][];
}

export const processingDescription = {
  header: 'PROCESSING_DESCRIPTION',
  index: 0,
};

type OverrideDataProcesser = (row: string[]) => string[];

export function getOverrideData(
  name: string,
  csvData: CSVData,
  idColumnIndex: number
): Error | OverrideDataProcesser {
  // Check for the processing description
  if (!csvData.headers.includes(processingDescription.header))
    return new Error(`Processing description header missing in ${name}`);

  // Ensure that the description is in the correct place
  if (
    csvData.headers[processingDescription.index] !==
    processingDescription.header
  )
    return new Error(
      `Processing description header found at incorrect index in ${name}`
    );

  const overrideData: string[][] = [];
  csvData.data
    // First we need to remove the processing fields so the indices are correct
    .map((r) => {
      return r.filter((_, i) => i !== processingDescription.index);
    });

  const overrideDescriptions: Map<string, string> = new Map();
  csvData.data.forEach((r) => {
    const data: string[] = r.filter(
      (_, i) => i !== processingDescription.index
    );
    overrideData.push(data);
    overrideDescriptions.set(
      data[idColumnIndex],
      r[processingDescription.index]
    );
  });

  // Cache the override IDs for faster lookup
  const overrideIDs: string[] = overrideData.map((r) => r[idColumnIndex]);

  return (row) => {
    // Check for overrides
    const id: string = row[idColumnIndex];

    if (overrideIDs.includes(id)) {
      overrideData
        // Get the correct row
        .filter((r) => r[idColumnIndex] === id)
        // Clear the ID field as it is only used for identification
        .map((r) => {
          r[idColumnIndex] = '';
          return r;
        })
        // Go through all fields
        .forEach((cols: string[], i) => {
          console.log(`[PROCESSING]: ${overrideDescriptions.get(id)}`);
          cols.forEach((col, i) => {
            // Skip all empty columns
            if (!col || col === '') return;

            // The column contains non-empty data, and so we should overwrite the data in the row
            row[i] = col;
          });
        });
    }

    return row;
  };
}

export function validateCSVHeaders<E extends {}>(
  headers: string[],
  headerEnum: E
): boolean {
  // Remove potential processing description header
  headers = headers.filter((h) => h !== processingDescription.header);

  const actualHeaders: string = JSON.stringify(headers);
  const expectedHeaders: string = JSON.stringify(
    Object.values(headerEnum).filter(
      (value) => typeof value === 'string'
    ) as string[]
  );

  if (actualHeaders === expectedHeaders) {
    return true;
  } else {
    console.error(
      `Expected Headers: ${expectedHeaders}\nActual Headers: ${actualHeaders}`
    );
    return false;
  }
}

export function validateCoordinates(coords: string): [boolean, number, number] {
  const [lat, long] = coords.split(',', 2).map((c) => parseFloat(c.trim()));

  return [!isNaN(lat) && !isNaN(long), lat, long];
}

export async function parseCSV(
  path: string,
  delimiter: string,
  isWebPath: boolean = false
): Promise<CSVData> {
  return new Promise((resolve, reject) => {
    const records: any[] = [];
    const parser = parse({
      delimiter: delimiter,
    });

    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) records.push(record);
    });

    parser.on('error', (err) => {
      console.error(err);
      reject(err);
    });

    parser.on('end', () => {
      const headers: string[] = records.shift();
      resolve({ headers: headers.map((h) => h.trim()), data: records });
    });

    if (isWebPath)
      get(path, (stream) => {
        stream.pipe(parser);
      });
    else createReadStream(path).pipe(parser);
  });
}
