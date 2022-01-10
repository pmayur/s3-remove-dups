import path from 'path';

export const DuplicateIdsPath = path.resolve('output', 'duplicates.csv');

export const CONFIG = {
    ITEMS_PER_BATCH_DELETE:  1000,
    BUCKET_NAME: "img-compression"
}

export const Paths = {
    getInventoryFilePath: (file: string = 'file.csv') => path.resolve('files', 'input', file),
    getDuplicateMappingsFilePath: () => getOutputFilesPath('duplicate_mappings'),
    getDuplicateKeysListPath: () => getOutputFilesPath('duplicate_list'),
    getSuccessDeletedPath: () => getOutputFilesPath('deleted_list'),
    getErrorDeletedPath: () => getOutputFilesPath('error_list'),
}

function getOutputFilesPath(type: string) {
    const fileName = type === 'duplicate_mappings' ? `${new Date().toISOString()}_${type}.csv` : type;
    return path.resolve('files', 'output', fileName)
}

export class LogService {
    private fetching = "Fetching Records from S3";
    private findingDuplicates = "Finding Duplicates from the array";
    private writingDuplicates = "Writing Duplicates to CSV file";
    private deleteProcess = "Deleting Duplicates";
    private batchDelete = "\tDeleting Batch";

    private startLog(id: string, msg: string = id) {
        console.time(id);
        console.log(msg);
    }

    private endLog(id: string) {
        console.timeEnd(id);
        console.log('\n');
    }

    startFetching = () => this.startLog(this.fetching);
    fetchingComplete = () => this.endLog(this.fetching);

    startFindingDuplicates = (size: number) => this.startLog(this.findingDuplicates, this.findingDuplicates + ` of size ${size}`);
    findingComplete = () => this.endLog(this.findingDuplicates);

    startWritingDuplicatesToCsv = (size: number) => this.startLog(this.writingDuplicates, this.writingDuplicates + `of map size ${size}`);
    writingToCsvComplete = () => this.endLog(this.writingDuplicates);

    startDeleteProcess = (size: number) => this.startLog(this.deleteProcess, this.deleteProcess + ` of ${size} entries`);
    deleteProcesComplete = () => this.endLog(this.deleteProcess);

    startBatchDelete = (index: number, size: number) => this.startLog(this.batchDelete, this.batchDelete + ` number ${index + 1} of size ${size}`);
    batchDeleteComplete = () => this.endLog(this.batchDelete);

    logDeletedEntries = (size: number) => {
        console.log(`\t\tDeleted ${size} entries`)
    };
    logErrorEntries = (size: number) => {
        console.log(`\t\tError in ${size} entries`)
    }
}