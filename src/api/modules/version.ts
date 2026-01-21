import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

export namespace Version {
  export interface ResVersionList {
    id: string;
    version: string;
    androidUrl: string;
    description: string;
    updateType: number; // 1: 强制更新, 2: 非强制更新
    createdAt: string;
  }
}

// 获取版本列表
export const getVersionList = (params: any) => {
  return http.post<any>(PORT1 + `/version/list`, params);
};

// 新增版本
export const addVersion = (params: any) => {
  return http.post(PORT1 + `/version/add`, params);
};

// 编辑版本
export const editVersion = (params: any) => {
  return http.post(PORT1 + `/version/edit`, params);
};

// 删除版本
export const deleteVersion = (params: { id: string }) => {
  return http.post(PORT1 + `/version/delete`, params);
};

// 获取最新版本
export const getLatestVersion = () => {
  return http.get<Version.ResVersionList>(PORT1 + `/version/latest`);
};
