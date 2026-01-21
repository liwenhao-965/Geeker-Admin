import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 会员Key管理模块
 */
export const getMasterKeyListApi = () => {
  return http.get<any[]>(PORT1 + `/premium-keys/master/list`);
};

export const addMasterKeyApi = (params: { name: string; key: string }) => {
  return http.post(PORT1 + `/premium-keys/master/add`, params);
};

export const deleteMasterKeyApi = (params: { id: string }) => {
  return http.post(PORT1 + `/premium-keys/master/delete`, params);
};

export const getSubKeyListApi = (masterKeyId: string) => {
  return http.get<any[]>(PORT1 + `/premium-keys/sub/list`, { masterKeyId });
};

export const generateSubKeyApi = (params: { masterKeyId: string; name: string; count: number; expiryDays: number }) => {
  return http.post(PORT1 + `/premium-keys/sub/generate`, params);
};

export const changeSubKeyStatusApi = (params: { key: string; isActive: boolean }) => {
  return http.post(PORT1 + `/premium-keys/sub/status`, params);
};

export const deleteSubKeyApi = (params: { key: string }) => {
  return http.post(PORT1 + `/premium-keys/sub/delete`, params);
};
