import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter, createArrayCsvWriter } from 'csv-writer';
import { GetRecords, WriteDuplicatesRecords } from '../interface/io.interface';
import { DuplicatesMap, KeyObject, S3ObjectsList } from '../interface/S3Object';

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

    async writeDuplicateMapToCsv(duplicatesMap: DuplicatesMap) {
        const csvWriter = createObjectCsvWriter({
            path: path.resolve('output', 'mapping.csv'),
            header: [
                {id: 'currentObject', title: 'CurrentObject'},
                {id: 'oldestVersion', title: 'OldestVersion'}
            ]
        });
        const arrayWrite = createArrayCsvWriter({
            path: path.resolve('output', 'duplicates.csv'),
            header: [ 'Key' ]
        });
        for (const hashKey of duplicatesMap.keys()) {
            const hashValue = duplicatesMap.get(hashKey);
            const record = this.getRecords(hashValue || []);
            await csvWriter.writeRecords(record.objectRecord);
            if(record.arrayRecord.length) {
                await arrayWrite.writeRecords(record.arrayRecord);
            }
        }
    }

    getRecords(value: S3ObjectsList): GetRecords {
        const record: WriteDuplicatesRecords = [];
        const duplicatesArray: string[][] = [];

        let oldestRecord = value[0];

        value.forEach((object) => {
            let oldestRecordModifiedDate = Date.parse(oldestRecord.LastModified);
            let currentObjectModifiedDate = Date.parse(object.LastModified);
            if(oldestRecordModifiedDate > currentObjectModifiedDate) {
                oldestRecord = object;
            }
        });

        value.forEach((object) => {
            record.push({ currentObject: object.Key, oldestVersion: oldestRecord.Key });
            if(object.Key !== oldestRecord.Key) {
                duplicatesArray.push([object.Key]);
            }
        });

        return {
            objectRecord: record,
            arrayRecord: duplicatesArray
        };
    }

    async getKeyNamesFromCsv(path: string): Promise<KeyObject[]> {
        const results: KeyObject[] = [];

        if(!fs.existsSync(path)) {
            console.log('No Duplicates List file found');
            return results;
        }

        return new Promise((resolve, reject) => {
            fs.createReadStream(path)
                .pipe(csv())
                .on('data', (data: KeyObject) => results.push(data))
                .on('end', () => {
                    resolve(results);
                });
        })
    }
}

export default IO;