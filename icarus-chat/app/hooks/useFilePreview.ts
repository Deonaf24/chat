import { useState } from "react";

import { getFilePreviewUrl } from "@/app/lib/api/school";

export type PreviewableFile = {
  id: number;
  filename: string;
  path?: string;
};

export function useFilePreview() {
  const [state, setState] = useState<{
    file?: PreviewableFile;
    url?: string;
    loading: boolean;
    error?: string;
  }>({ loading: false });

  const openPreview = async (file: PreviewableFile) => {
    setState({ file, loading: true, url: undefined, error: undefined });

    try {
      const url = await getFilePreviewUrl(file.id);
      setState({ file, url, loading: false, error: undefined });
    } catch (err) {
      setState({ file, loading: false, error: "Unable to load file preview." });
    }
  };

  const closePreview = () => setState({ loading: false, url: undefined, file: undefined, error: undefined });

  return {
    state,
    openPreview,
    closePreview,
  };
}
