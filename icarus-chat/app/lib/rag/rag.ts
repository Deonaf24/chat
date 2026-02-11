import { postUpload } from "@/app/lib/api/upload";
import { UploadResult } from "@/app/types/files";

export const rag = {
    async uploadOne(file: File, assignment_title: string): Promise<UploadResult> {
        const response = await postUpload(file, assignment_title);
        return response;
    },
    async uploadMany(files: File[], assignment_title: string): Promise<UploadResult[]> {
        const results : UploadResult[] = [];

        files.forEach(async file => {
            const response = await this.uploadOne(file, assignment_title);
            results.push(response);
        });
        return results;
    }
}