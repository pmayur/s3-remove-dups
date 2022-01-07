import IO from "./io/IO";
import S3Service from "./s3/s3";

class Main {
    ioService: IO;
    s3Service: S3Service;

    constructor() {
        this.ioService = new IO();
        this.s3Service = new S3Service();
    }

    public async main(): Promise<void> {
        const listOfObjects = await this.ioService.parseCSV();
        const listObjectsV2 = await this.s3Service.getAllObjects();
    }
}

new Main().main();