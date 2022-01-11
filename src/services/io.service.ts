import csv from 'csv-parser';
import fs from 'fs';
import { createObjectCsvWriter, createArrayCsvWriter } from 'csv-writer';
import { DuplicatesMap, S3Object } from '../interfaces/s3.interface';
import Util from '../util';
import { FILE_NAMES, LogService, Paths } from '../constants';
class IoService {
    utilService: Util;
    logService: LogService;
    headers: string[] = ['Bucket', 'Key', 'Size', 'LastModified', 'ETag', 'StorageClass', 'EncryptionStatus', 'IntelligentTieringAccessTier', 'BucketKeyStatus'];

    constructor() {
        this.utilService = new Util();
        this.logService = new LogService();
    }

    getObjectsFromInventoryCsv = async (fileName: string = FILE_NAMES.INVENTORY_CSV) =>  await this.getObjectsFromCsv(Paths.getInventoryFilePath(fileName), this.headers);

    getDuplicatesListFromCsv = async (fileName: string = FILE_NAMES.DUPLICATE_LISTS_CSV) =>  await this.getObjectsFromCsv(Paths.getDuplicateKeysListPath(fileName));

    private async getObjectsFromCsv(file: string, headers?: string[]): Promise<any[]> {
        const results: any[] = [];

        if(!fs.existsSync(file)) {
            console.log(`${file} does not exist`);
            return results;
        }

        let fetched = 0;
        this.logService.startFetchingCsv();

        return new Promise((resolve, reject) => {
            fs.createReadStream(file)
                .pipe(csv(headers))
                .on('data', ({Key, ETag, LastModified} : S3Object) => {
                    fetched++;
                    this.logService.logObjectsFetchedFromCsv(fetched);
                    results.push({ Key, ETag, LastModified })
                })
                .on('end', () => {
                    this.logService.fetchingCompleteCsv();
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

        this.logService.startWritingDuplicatesToCsv(duplicatesMap.size);
        for (const objectKey of duplicatesMap.keys()) {
            const hashValue = duplicatesMap.get(objectKey);
            const record = this.utilService.getWritableRecords(hashValue || []);
            await objectWriter.writeRecords(record.objectRecord);
            if(record.arrayRecord.length) {
                await listWriter.writeRecords(record.arrayRecord);
            }
        }
        this.logService.writingToCsvComplete();
    }
}

export default IoService;
