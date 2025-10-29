import { apiClient } from "./client";
import { UploadResult } from "@/app/types/files";

export async function postUpload(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<{ "filename": string }>("/upload", formData, {
        headers: {"Content-Type": "multipart/form-data"}
    });

    return response.data;
}