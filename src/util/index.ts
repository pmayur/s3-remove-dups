import { GetRecords, WriteDuplicatesRecords } from "../interfaces/io.interface";
import { DuplicatesMap, S3Object, S3ObjectsList } from "../interfaces/s3.interface";

class Util {
    getHashMapOfDuplicates(listOfObjects: S3ObjectsList): DuplicatesMap {
        let hashMap: DuplicatesMap = new Map();

        listOfObjects.forEach((object: S3Object, index: number) => {
            const mapKey = object.ETag;
            const mapValue = object;

            const values = hashMap.get(mapKey);
            if(values) {
                hashMap.set(mapKey, [...values, mapValue]);
            } else {
                hashMap.set(mapKey, [mapValue]);
            }
        })

        return hashMap;
    }

    getWritableRecords(value: S3ObjectsList): GetRecords {
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
            record.push({
                currentObject: object.Key,
                oldestVersion: oldestRecord.Key
            });
            if(object.Key !== oldestRecord.Key) {
                duplicatesArray.push([object.Key]);
            }
        });

        return {
            objectRecord: record,
            arrayRecord: duplicatesArray
        };
    }
}


export default Util;