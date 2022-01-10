import { S3 } from "aws-sdk";
import { CONFIG, LogService, Paths } from "../constants";
import { DeleteList, S3ObjectsList } from "../interfaces/s3.interface";
import IoService from "./io.service";

class S3Service {
    s3: S3;
    ioService: IoService;
    log: LogService;

    constructor() {
        this.s3 = new S3()
        this.ioService = new IoService();
        this.log = new LogService();
    }

    async getAllObjects(opts: S3.ListObjectsV2Request = { Bucket: CONFIG.BUCKET_NAME}) {
        this.log.startFetching();
        const data = await this.s3.listObjectsV2(opts).promise();
        this.log.fetchingComplete();
        return <S3ObjectsList><unknown>data.Contents;
    }

    async batchDelete(deleteList: DeleteList) {
        const successListWriter = this.ioService.getCsvKeyListWriter(Paths.getSuccessDeletedPath());
        const errorListWriter = this.ioService.getCsvKeyListWriter(Paths.getErrorDeletedPath());

        this.log.startDeleteProcess(deleteList.length);
        for (let index = 0; index < deleteList.length; index+= CONFIG.ITEMS_PER_BATCH_DELETE) {
            const batch = deleteList.slice(index, index + CONFIG.ITEMS_PER_BATCH_DELETE);

            const opts: S3.DeleteObjectsRequest = {
                Bucket: CONFIG.BUCKET_NAME,
                Delete: {
                    Objects: batch
                }
            };

            this.log.startBatchDelete(index, batch.length);
            const {Deleted, Errors}: S3.DeleteObjectsOutput = await this.s3.deleteObjects(opts).promise();

            this.log.duplicateFindingOperation(index + 1, deleteList.length);
            if(Deleted) {
                this.log.logDeletedEntries(Deleted.length);
                for (const object of Deleted) {
                    await successListWriter.writeRecords([[object.Key]])
                }
            }
            if(Errors) {
                this.log.logErrorEntries(Errors.length);
                for (const object of Errors) {
                    await errorListWriter.writeRecords([[object.Key]])
                }
            }
            this.log.batchDeleteComplete();
        }
        this.log.deleteProcesComplete();
    }
}

export default S3Service;