import { DuplicateIdsPath } from "./constants";
import { DuplicatesMap, KeyObject, S3ObjectsList } from "./interface/S3Object";
import IO from "./io/IO";
import S3Service from "./s3/s3";
import Util from "./util";

class Main {
    ioService: IO;
    s3Service: S3Service;
    utilService: Util;

    constructor() {
        this.ioService = new IO();
        this.s3Service = new S3Service();
        this.utilService = new Util();
    }

    public async main(): Promise<void> {
        const listOfObjectsV2: S3ObjectsList = await this.s3Service.getAllObjects();
        const duplicatesMap: DuplicatesMap = this.utilService.getHashMapOfDuplicates(listOfObjectsV2);
        await this.ioService.writeDuplicateMapToCsv(duplicatesMap);
        const duplicateKeys: KeyObject[] = await this.ioService.getKeyNamesFromCsv(DuplicateIdsPath);
        if(duplicateKeys) {
            await this.s3Service.batchDelete(duplicateKeys);
        }
    }
}

new Main().main();