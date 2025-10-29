import { postUpload } from "@/app/lib/api/upload";
import { UploadResult } from "@/app/types/files";

export const rag = {
    async uploadOne(file: File): Promise<UploadResult> {
        const response = await postUpload(file);
        return response;
    },
    async uploadMany(files: File[]): Promise<UploadResult[]> {
        const results : UploadResult[] = [];

        files.forEach(async file => {
            const response = await this.uploadOne(file);
            results.push(response);
        });
        return results;
    }
}