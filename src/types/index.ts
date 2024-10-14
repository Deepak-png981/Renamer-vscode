export interface RenameFilePayload {
    fileName: string;
    fileContent: string;
}
export interface RenameDirFileInterface {
    fileName: string;
    content: string;
}

export interface RenameDirPayload {
    contentDirectory: {
        files: RenameDirFileInterface[];
    };
}