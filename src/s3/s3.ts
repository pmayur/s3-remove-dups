import { S3 } from "aws-sdk";
import { createArrayCsvWriter, createObjectCsvWriter } from "csv-writer";
import path from "path";
import { CONFIG, GetAllObjectsOpts } from "../constants";
import { DeleteList, S3ObjectsList } from "../interface/S3Object";

class S3Service {
    s3 = new S3();

    async getAllObjects(opts: S3.ListObjectsV2Request = GetAllObjectsOpts) {
        const data = await this.s3.listObjectsV2(opts).promise();
        return <S3ObjectsList><unknown>data.Contents;
    }

    async batchDelete(deleteList: DeleteList) {
        for (let index = 0; index < deleteList.length; index++) {
            const batch = deleteList.slice(index, index + CONFIG.ITEMS_PER_BATCH_DELETE);
            const opts: S3.DeleteObjectsRequest = {
                Bucket: 'img-compression',
                Delete: {
                    Objects: deleteList
                }
            };
            const deleteOutput: S3.DeleteObjectsOutput = await this.s3.deleteObjects(opts).promise();
            if(deleteOutput.Deleted) {
                const arrayWrite = createArrayCsvWriter({
                    path: path.resolve('output', 'success.csv'),
                    header: [ 'Key' ]
                });
                for (const object of deleteOutput.Deleted) {
                    await arrayWrite.writeRecords([[object.Key]])
                }
            }
            if(deleteOutput.Errors) {
                const arrayWrite = createArrayCsvWriter({
                    path: path.resolve('output', 'failure.csv'),
                    header: [ 'Key' ]
                });
                for (const object of deleteOutput.Errors) {
                    await arrayWrite.writeRecords([[object.Key]])
                }
            }
        }
    }
}

export default S3Service;