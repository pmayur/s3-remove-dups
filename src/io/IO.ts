import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';

class IO {
    headers: string[] = ['Bucket', 'Key', 'Size', 'LastModified'];

    async parseCSV(): Promise<any[]> {
        const results: any[] = [];
        const fileName = path.resolve('files', 'data.csv');

        return new Promise((resolve, reject) => {
            fs.createReadStream(fileName)
                .pipe(csv(this.headers))
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    resolve(results);
                });

        })
    }
}

export default IO;