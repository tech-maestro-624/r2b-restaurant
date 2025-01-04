import api from "../utils/axios";

export const ConfigurationService = {
    getConfiguration: () => {
        return api.get(`/config`);
      }
    }