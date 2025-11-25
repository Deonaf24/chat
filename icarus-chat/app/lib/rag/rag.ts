import { postUpload } from "@/app/lib/api/upload";
import { UploadResult } from "@/app/types/files";

export const rag = {
    async uploadOne(file: File, assignmentId: string): Promise<UploadResult> {
        const response = await postUpload(file, assignmentId);
        return response;
    },
    async uploadMany(files: File[], assignmentId: string): Promise<UploadResult[]> {
        const results : UploadResult[] = [];

        files.forEach(async file => {
            const response = await this.uploadOne(file, assignmentId);
            results.push(response);
        });
        return results;
    }
}