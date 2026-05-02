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

export type DocumentStatus = 'queued' | 'indexing' | 'indexed' | 'failed';

export type UserDocument = {
  id: string;
  filename: string;
  status: DocumentStatus;
  createdAt: string;
};

type UploadResponse = {
  message: string;
  documentId: string;
};

type StatusResponse = {
  documentId: string;
  status: DocumentStatus;
};

type DocumentsResponse = {
  documents: UserDocument[];
  uploadLimit: number;
};

export function createApiClient(getToken: GetToken): {
  uploadPdf: (
    file: File,
    onProgress?: (percent: number) => void,
  ) => Promise<UploadResponse>;
  chat: (message: string) => Promise<ChatResponse>;
  getDocumentStatus: (documentId: string) => Promise<DocumentStatus>;
  getDocuments: () => Promise<DocumentsResponse>;
} {
  const client: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
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
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await client.post<UploadResponse>('/upload/pdf', formData, {
      onUploadProgress: (event: AxiosProgressEvent) => {
        if (!onProgress) return;
        if (!event.total) return;
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      },
    });
    return response.data;
  }

  async function chat(message: string): Promise<ChatResponse> {
    const response = await client.get<ChatResponse>('/chat', {
      params: { message },
    });
    return response.data;
  }

  async function getDocumentStatus(documentId: string): Promise<DocumentStatus> {
    const response = await client.get<StatusResponse>(
      `/upload/documents/${documentId}/status`,
    );
    return response.data.status;
  }

  async function getDocuments(): Promise<DocumentsResponse> {
    const response = await client.get<DocumentsResponse>('/upload/documents');
    return response.data;
  }

  return {
    uploadPdf,
    chat,
    getDocumentStatus,
    getDocuments,
  };
}