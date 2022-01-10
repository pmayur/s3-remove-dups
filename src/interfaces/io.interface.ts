interface WriteDuplicatesRecord {
    currentObject: string;
    oldestVersion: string;
}

export type WriteDuplicatesArray = string[][];

export type WriteDuplicatesRecords = WriteDuplicatesRecord[];

export type GetRecords = {
    objectRecord: WriteDuplicatesRecords,
    arrayRecord: WriteDuplicatesArray
}