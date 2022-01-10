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
    getDuplicateMappingsFilePath: () => getOutputFilesPath('duplicate'),
    getSuccessDeletedPath: () => getOutputFilesPath('deleted'),
    getErrorDeletedPath: () => getOutputFilesPath('error'),
}

function getOutputFilesPath(type: string) {
    fs.mkdirSync(path.resolve('files'));
    fs.mkdirSync(path.resolve('files', 'output'));
    fs.mkdirSync(path.resolve('files', 'output', `${type}`));
    return path.resolve('files', 'output', `${type}`, `${new Date().toISOString()}_${type}.csv`)
}

