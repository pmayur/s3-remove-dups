import csv from 'csv-parser';
import fs from 'fs';
import { createObjectCsvWriter, createArrayCsvWriter } from 'csv-writer';
import { DuplicatesMap } from '../interfaces/s3.interface';
import Util from '../util';
import { LogService, Paths } from '../constants';

class IoService {
    utilService: Util;
    log: LogService;
    headers: string[] = ['Bucket', 'Key', 'Size', 'LastModified'];

    constructor() {
        this.utilService = new Util();
        this.log = new LogService();
    }

    getObjectsFromInventoryCsv = async () =>  await this.getObjectsFromCsv(Paths.getInventoryFilePath(), this.headers);

    getDuplicatesListFromCsv = async () =>  await this.getObjectsFromCsv(Paths.getDuplicateKeysListPath());

    private async getObjectsFromCsv(file: string, headers?: string[]): Promise<any[]> {
        const results: any[] = [];

        if(!fs.existsSync(file)) {
            console.log(`${file} does not exist`);
            return results;
        }

        return new Promise((resolve, reject) => {
            fs.createReadStream(file)
                .pipe(csv(headers))
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    resolve(results);
                });

        })
    }

    getCsvKeyListWriter (path: string) {
        return createArrayCsvWriter({
            path: path,
            header: [ 'Key' ]
        });
    }

    getCsvObjectWriter(path: string) {
        return createObjectCsvWriter({
            path: path,
            header: [
                {id: 'currentObject', title: 'CurrentObject'},
                {id: 'oldestVersion', title: 'OldestVersion'}
            ]
        })
    }

    async writeDuplicateMapToCsv(duplicatesMap: DuplicatesMap) {
        const objectWriter = this.getCsvObjectWriter(Paths.getDuplicateMappingsFilePath());
        const listWriter = this.getCsvKeyListWriter(Paths.getDuplicateKeysListPath());

        this.log.startWritingDuplicatesToCsv(duplicatesMap.size);
        for (const objectKey of duplicatesMap.keys()) {
            const hashValue = duplicatesMap.get(objectKey);
            const record = this.utilService.getWritableRecords(hashValue || []);
            await objectWriter.writeRecords(record.objectRecord);
            if(record.arrayRecord.length) {
                await listWriter.writeRecords(record.arrayRecord);
            }
        }
        this.log.writingToCsvComplete();
    }
}

export default IoService;
