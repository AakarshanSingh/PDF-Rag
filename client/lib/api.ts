import axios, { AxiosInstance, AxiosProgressEvent } from 'axios';

type GetToken = () => Promise<string | null>;

export type Doc = {
  pageContent?: string;
  metadata?: {
    loc?: {
      pageNumber?: number;
    };
    source?: string;
  };
  id?: string;
};

export type ChatResponse = {
  message: string;
  docs: Doc[];
};

export function createApiClient(getToken: GetToken): {
  uploadPdf: (
    file: File,
    onProgress?: (percent: number) => void,
  ) => Promise<void>;
  chat: (message: string) => Promise<ChatResponse>;
} {
  const client: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
  });

  client.interceptors.request.use(async (config) => {
    const token = await getToken();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  async function uploadPdf(
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<void> {
    const formData = new FormData();
    formData.append('pdf', file);

    await client.post('/upload/pdf', formData, {
      onUploadProgress: (event: AxiosProgressEvent) => {
        if (!onProgress) return;
        if (!event.total) return;
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      },
    });
  }

  async function chat(message: string): Promise<ChatResponse> {
    const response = await client.get<ChatResponse>('/chat', {
      params: { message },
    });
    return response.data;
  }

  return {
    uploadPdf,
    chat,
  };
}
