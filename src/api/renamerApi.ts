import axios from 'axios';
import { RUN_BINARY_URL } from '../constants/urls';

export const renameFileViaApi = async (fileName: string, fileContent: string , namingConvention: string) => {
    const payload = {
        fileName: fileName,
        fileContent: fileContent,
        debug: "true",
        namingConvention: namingConvention
    };

    try {
        const response = await axios.post(RUN_BINARY_URL, payload);
        return response.data;
    } catch (error) {
        throw new Error(`Error contacting API: ${error}`);
    }
};
