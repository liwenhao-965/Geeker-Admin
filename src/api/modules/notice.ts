import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

export namespace Notice {
  export interface ResNoticeList {
    id: string;
    title: string;
    content: string;
    type: "system" | "activity" | "update";
    createdAt: number;
    clickCount: number;
    pushCount: number;
  }
}

// 获取公告列表
export const getNoticeList = () => {
  return http.get<Notice.ResNoticeList[]>(PORT1 + `/notices/list`);
};

// 新增公告
export const addNotice = (params: { title: string; content: string; type: string }) => {
  return http.post<Notice.ResNoticeList>(PORT1 + `/notices/add`, params);
};

// 删除公告
export const deleteNotice = (params: { id: string }) => {
  return http.post(PORT1 + `/notices/delete`, params);
};
