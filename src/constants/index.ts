import path from 'path';
import fs from 'fs';

export const GetAllObjectsOpts = {
    Bucket: "img-compression",
}

export const DuplicateIdsPath = path.resolve('output', 'duplicates.csv');

export const CONFIG = {
    ITEMS_PER_BATCH_DELETE:  1000
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

