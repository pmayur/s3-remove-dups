import { S3 } from "aws-sdk";
import { GetAllObjectsOpts } from "../constants";

class S3Service {
    s3 = new S3();

    async getAllObjects(opts: S3.ListObjectsV2Request = GetAllObjectsOpts) {
        const data = await this.s3.listObjectsV2(opts).promise();
        return data.Contents;
    }
}

export default S3Service;