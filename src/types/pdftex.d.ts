declare class PDFTeX {
    constructor(workerUrl: string);
    on_stdout?: (msg: string) => void;
    on_stderr?: (msg: string) => void;
    compile(src: string): Promise<string | false>;
}
