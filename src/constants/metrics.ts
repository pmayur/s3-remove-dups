import { S3Object } from "../interfaces/s3.interface";
import Util from "../util";
import fs from 'fs';
import { Paths } from ".";

class Metrics {
    private duplicateCount: number = 0;
    private duplicateSize: number = 0;
    private uniqueCount: number = 0;
    private uniqueSize: number = 0;
    private totalCount: number = 0;
    private totalSize: number = 0;

    private folderCount: number = 0;
    private foldersTotalSize: number = 0;
    private corruptFilesCount: number = 0;
    private corruptFilesSize: number = 0;

    private totalDeleteCount: number = 0;
    private deleteFileCount: number = 0;
    private deleteCorruptFileCount: number = 0;
    private deleteFilesSize: number = 0;

    private moreThan128KBCount: number = 0;
    private lessThan128KBCount: number = 0;
    private tota128KBFilesSize: number = 0;
    private olderThan30DaysCount: number = 0;
    private validTrasferableFiles: number = 0;

    duplicateEntry = (entry: S3Object) => {
        this.duplicateCount ++;
        const size = parseInt(entry.Size.trim())
        this.duplicateSize += size;
        this.objectEntry(size, entry.Key);
    }

    uniqueEntry = (entry: S3Object) => {
        this.uniqueCount ++;
        const size = parseInt(entry.Size.trim());
        this.uniqueSize += size;
        this.objectEntry(size, entry.Key);
        this.checkValidTransitionFile(entry);
    }

    deleteEntry = (entry: S3Object) => {
        this.totalDeleteCount ++;
        const size = parseInt(entry.Size.trim());
        this.deleteFilesSize += size;
        if(size === 0) {
            this.deleteCorruptFileCount ++;
        } else {
            this.deleteFileCount ++;
        }
    }

    checkValidTransitionFile(entry: S3Object) {
        const isMoreThan128KB = parseInt(entry.Size.trim()) > 128 * 1000;
        const date30DaysAgo = new Date().getTime() - (30 * 24 * 60 * 60 * 100);
        const isOlderThan30Days = Date.parse(entry.LastModified) < date30DaysAgo;

        if(isOlderThan30Days) this.olderThan30DaysCount ++;
        if(isMoreThan128KB) {
            this.moreThan128KBCount ++
        } else {
            this.lessThan128KBCount ++
            this.tota128KBFilesSize += parseInt(entry.Size.trim());
        }

        if(isOlderThan30Days && isMoreThan128KB) this.validTrasferableFiles++;
    }

    folderEntry(size: number) {
        this.folderCount ++;
        this.foldersTotalSize += size;
    }

    corruptFileEntry(size: number) {
        this.corruptFilesCount ++;
        this.corruptFilesSize += size;
    }

    normalEntry(size: number) {
        this.totalCount ++;
        this.totalSize += size;
    }

    objectEntry(size: number, Key: string) {
        this.normalEntry(size);
        if(size == 0) {
            if(Util.isFolder(Key)) {
                this.folderEntry(size);
            } else {
                this.corruptFileEntry(size);
            }
        }
    }

    static formatBytes = (bytes: number, decimals = 12) => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    static formatNumber = (labelValue: number) => {
        return Math.abs(Number(labelValue)) >= 1.0e+6

        ? Math.abs(Number(labelValue)) / 1.0e+6 + "M"

        : Math.abs(Number(labelValue)) >= 1.0e+3

        ? Math.abs(Number(labelValue)) / 1.0e+3 + "K"

        : Math.abs(Number(labelValue));
    }

    print = async () => {
        const lessThan128KBAvg = this.tota128KBFilesSize / this.lessThan128KBCount;
        const records = {
            mappings: {
                duplicates: {
                    count: this.duplicateCount,
                    countReadable: Metrics.formatNumber(this.duplicateCount),
                    size: this.duplicateSize,
                    readable: Metrics.formatBytes(this.duplicateSize)
                },
                uniques: {
                    count: this.uniqueCount,
                    countReadable: Metrics.formatNumber(this.uniqueCount),
                    size: this.uniqueSize,
                    readable: Metrics.formatBytes(this.uniqueSize)
                },
                total: {
                    count: this.totalCount,
                    countReadable: Metrics.formatNumber(this.totalCount),
                    size: this.totalSize,
                    readable: Metrics.formatBytes(this.totalSize)
                },
                folders: {
                    count: this.folderCount,
                    countReadable: Metrics.formatNumber(this.folderCount),
                    size: this.foldersTotalSize,
                    readable: Metrics.formatBytes(this.foldersTotalSize)
                },
                corruptFiles: {
                    count: this.corruptFilesCount,
                    countReadable: Metrics.formatNumber(this.corruptFilesCount),
                    size: this.corruptFilesSize,
                    readable: Metrics.formatBytes(this.corruptFilesSize)
                }
            },
            toBeDeleted: {
                files: this.deleteFileCount,
                filesReadable: Metrics.formatNumber(this.deleteFileCount),
                corrupt: this.deleteCorruptFileCount,
                corruptReadable: Metrics.formatNumber(this.deleteCorruptFileCount),
                count: this.totalDeleteCount,
                countReadable: Metrics.formatNumber(this.totalDeleteCount),
                size: this.deleteFilesSize,
                readable: Metrics.formatBytes(this.deleteFilesSize)
            },
            transferData: {
                totalValid: this.validTrasferableFiles,
                moreThan128kb: this.moreThan128KBCount,
                lessThan128kb: this.lessThan128KBCount,
                smallFilesAverage: lessThan128KBAvg,
                smallFilesAverageReadable: Metrics.formatBytes(lessThan128KBAvg),
                olderThan30Days: this.olderThan30DaysCount,
            }
        };
        fs.writeFileSync(Paths.metricsFilePath(), JSON.stringify(records, null, 4));
    }
};

export default Metrics;