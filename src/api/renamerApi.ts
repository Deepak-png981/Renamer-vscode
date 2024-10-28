import axios from 'axios';
import { RUN_BINARY_URL } from '../constants/urls';
import { RenameDirPayload, RenameFilePayload } from '../types';
export const renameFileViaApi = async (
    input: RenameFilePayload | RenameDirPayload,
    namingConvention: string,
    isDirectory: boolean = false
) => {
    const payload = isDirectory
    ? {
          ...input,
          debug: 'true',
          namingConvention: namingConvention,
      }
    : {
          fileName: (input as RenameFilePayload).fileName,
          fileContent: (input as RenameFilePayload).fileContent,
          debug: 'true',
          namingConvention: namingConvention,
      };
    try {
        const response = await axios.post(RUN_BINARY_URL, payload);
        const result = response.data;
        return result;
    } catch (error) {
        throw new Error(`Error contacting API: ${error}`);
    }
};
