import http from "@/api";

export interface ChatSettings {
  freeChatLimit: number;
  freeRouteModel: string;
  premiumRouteModel: string;
}

export const getChatSettings = () => {
  return http.get<ChatSettings>(`/chat-settings/get`);
};

export const saveChatSettings = (params: ChatSettings) => {
  return http.post(`/chat-settings/save`, params);
};
