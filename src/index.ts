import Metrics from "./constants/metrics";
import { DuplicatesMap, KeyObject, S3ObjectsList } from "./interfaces/s3.interface";
import IoService from "./services/io.service";
import S3Service from "./services/s3.service";
import Util from "./util";

class Main {
    ioService: IoService;
    s3Service: S3Service;
    utilService: Util;

    constructor() {
        this.ioService = new IoService();
        this.s3Service = new S3Service();
        this.utilService = new Util();
    }

    public async main(): Promise<void> {
        global.metrics = new Metrics();
        const listOfObjectsV2: S3ObjectsList = await this.ioService.getObjectsFromInventoryCsv('output.csv');
        const duplicatesMap: DuplicatesMap = this.utilService.createHashMapOfDuplicates(listOfObjectsV2);
        await this.ioService.writeDuplicateMapToCsv(duplicatesMap);
        metrics.print();
        const duplicateKeys: KeyObject[] = await this.ioService.getDuplicatesListFromCsv();
        if(duplicateKeys) {
            await this.s3Service.batchDelete(duplicateKeys);
        }
    }
}

new Main().main();