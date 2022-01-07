import { S3 } from "aws-sdk";
import { ObjectList } from "aws-sdk/clients/s3";
import { GetAllObjectsOpts } from "../constants";
import { S3ObjectsList } from "../interface/S3Object";

class S3Service {
    s3 = new S3();

    async getAllObjects(opts: S3.ListObjectsV2Request = GetAllObjectsOpts) {
        const data = await this.s3.listObjectsV2(opts).promise();
        return <S3ObjectsList><unknown>data.Contents;
    }
}

export default S3Service;