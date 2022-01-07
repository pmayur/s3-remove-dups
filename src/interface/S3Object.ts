export interface S3Object {
    Bucket?: string;
    Key: string;
    Size?: string;
    LastModified: string;
    ETag: string;
    StorageClass?: string;
}

export type S3ObjectsList = S3Object[];

export type DuplicatesMap = Map<string, S3ObjectsList>;