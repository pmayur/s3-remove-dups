import { LogService } from "../constants";
import { GetRecords, MappingRecordsList } from "../interfaces/io.interface";
import { DuplicatesMap, S3Object, S3ObjectsList } from "../interfaces/s3.interface";

class Util {
    log: LogService;
    constructor() {
        this.log = new LogService();
    }

    createHashMapOfDuplicates(listOfObjects: S3ObjectsList): DuplicatesMap {
        let hashMap: DuplicatesMap = new Map();

        this.log.startFindingDuplicates(listOfObjects.length);
        listOfObjects.forEach((object: S3Object, index: number) => {
            const mapKey = object.ETag;
            const mapValue = object;

            const values = hashMap.get(mapKey);
            this.log.duplicateFindingOperation(index+1, listOfObjects.length);
            if(values) {
                hashMap.set(mapKey, [...values, mapValue]);
                metrics.countDuplicate(object);
            } else {
                hashMap.set(mapKey, [mapValue]);
                metrics.countUnique(object);
            }
        })
        this.log.findingComplete();

        return hashMap;
    }

    getOldestRecord(value: S3ObjectsList): S3Object {
        let oldestRecord = value[0];
        value.forEach((object) => {
            let oldestRecordModifiedDate = Date.parse(oldestRecord.LastModified);
            let currentObjectModifiedDate = Date.parse(object.LastModified);
            if(oldestRecordModifiedDate > currentObjectModifiedDate) {
                oldestRecord = object;
            }
        });
        return oldestRecord;

    }

    getRecordsForPersisting(objectsList: S3ObjectsList, retainedRecord: S3Object) {
        const mappingRecordList: MappingRecordsList = [];
        const deleteKeysList: string[][] = [];

        objectsList.forEach((object: S3Object) => {
            const mapping = {
                originalETag: object.ETag,
                originalKey: object.Key,
                originalSize: object.Size,
                retainedKey: retainedRecord.Key
            }
            const isFolder = Util.isFolder(object.Key)
            if (parseInt(object.Size) === 0) {
                if(isFolder) {
                    mapping.retainedKey = "FOLDER";
                } else {
                    mapping.retainedKey = "CORRUPT";
                    deleteKeysList.push([object.Key]);
                    metrics.countToBeDeleted(object);
                }
            } else {
                if(object.Key !== retainedRecord.Key) {
                    deleteKeysList.push([object.Key])
                    metrics.countToBeDeleted(object);
                }
            }
            mappingRecordList.push(mapping);
        });

        return {
            mappingRecordList,
            deleteKeysList
        }
    }

    static isFolder(key: string) {
        return key[key.length - 1] === "/";
    };

    getKeyNameFromPath = (path: string) => {
        let pathSplit = path.split('/');
        return pathSplit[pathSplit.length - 1];
    }
}


export default Util;