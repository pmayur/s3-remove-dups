import { S3 } from "aws-sdk";
import { createArrayCsvWriter, createObjectCsvWriter } from "csv-writer";
import path from "path";
import { CONFIG, GetAllObjectsOpts, Paths } from "../constants";
import { DeleteList, S3ObjectsList } from "../interfaces/s3.interface";
import IoService from "./io.service";

class S3Service {
    s3: S3;
    ioService: IoService;

    constructor() {
        this.s3 = new S3()
        this.ioService = new IoService();
    }

    async getAllObjects(opts: S3.ListObjectsV2Request = GetAllObjectsOpts) {
        const data = await this.s3.listObjectsV2(opts).promise();
        return <S3ObjectsList><unknown>data.Contents;
    }

    async batchDelete(deleteList: DeleteList) {
        const successListWriter = this.ioService.getCsvKeyListWriter(Paths.getSuccessDeletedPath());
        const errorListWriter = this.ioService.getCsvKeyListWriter(Paths.getErrorDeletedPath());

        for (let index = 0; index < deleteList.length; index++) {
            const batch = deleteList.slice(index, index + CONFIG.ITEMS_PER_BATCH_DELETE);
            const opts: S3.DeleteObjectsRequest = {
                Bucket: 'img-compression',
                Delete: {
                    Objects: batch
                }
            };
            const deleteOutput: S3.DeleteObjectsOutput = await this.s3.deleteObjects(opts).promise();
            if(deleteOutput.Deleted) {
                for (const object of deleteOutput.Deleted) {
                    await successListWriter.writeRecords([[object.Key]])
                }
            }
            if(deleteOutput.Errors) {
                for (const object of deleteOutput.Errors) {
                    await errorListWriter.writeRecords([[object.Key]])
                }
            }
        }
    }
}

export default S3Service;