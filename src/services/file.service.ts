import api from '../utils/axios';
export const fileService = {
  deleteFile: (id: string) =>
    api.delete(`/file/${id}`),

  update: (id: string) =>
    api.patch(`/file/${id}`),

  get: (id: string) =>
    api.get(`/download/${id}`),

  upload: async (file: File, entityType: string, entityName: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('entityName', entityName);

    // return api.post('/upload', formData);
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    return response;
  },
};