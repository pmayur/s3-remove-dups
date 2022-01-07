import { DuplicatesMap, S3Object, S3ObjectsList } from "../interface/S3Object";

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
}

export default Util;