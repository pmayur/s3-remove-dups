import IO from "./io/IO";

class Main {
    ioService: IO;

    constructor() {
        this.ioService = new IO();
    }

    public async main(): Promise<void> {
        const listOfObjects = await this.ioService.parseCSV();
    }
}

new Main().main();