interface MappingRecord {
    originalKey: string;
    originalSize: string;
    originalETag: string;
    retainedKey: string;
}

export type DeleteKeysList = string[][];

export type MappingRecordsList = MappingRecord[];

export type GetRecords = {
    objectRecord: MappingRecordsList,
    arrayRecord: DeleteKeysList
}