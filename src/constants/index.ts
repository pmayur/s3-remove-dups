import path from 'path';

export const GetAllObjectsOpts = {
    Bucket: "img-compression",
}

export const DuplicateIdsPath = path.resolve('output', 'duplicates.csv');

export const CONFIG = {
    ITEMS_PER_BATCH_DELETE:  1000
}