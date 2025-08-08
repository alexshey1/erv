import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export async function getData() {
  const results: any[] = [];
  const filePath = path.join(process.cwd(), 'data', 'strainscannabis.csv');

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
} 