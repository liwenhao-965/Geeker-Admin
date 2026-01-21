import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

export namespace Character {
  export interface Category {
    id: string;
    name: string;
    order: number;
  }
  export interface ResCharacterList {
    id: string;
    categoryId: string;
    name: string;
    description: string;
    avatar: string;
    author: string;
    clickCount: number;
    clickPopulation: number;
    data: any;
    createdAt: number;
  }
}

// 获取分类列表
export const getCategoryList = () => {
  return http.get<Character.Category[]>(PORT1 + `/discover/categories`);
};

// 新增分类
export const addCategory = (params: { name: string }) => {
  return http.post<Character.Category>(PORT1 + `/discover/categories/add`, params);
};

// 删除分类
export const deleteCategory = (params: { id: string }) => {
  return http.post(PORT1 + `/discover/categories/delete`, params);
};

// 获取角色卡列表
export const getCharacterList = (params: { categoryId?: string }) => {
  return http.get<Character.ResCharacterList[]>(PORT1 + `/discover/characters`, params);
};

// 新增角色卡
export const addCharacter = (params: any) => {
  return http.post<Character.ResCharacterList>(PORT1 + `/discover/characters/add`, params);
};

// 删除角色卡
export const deleteCharacter = (params: { id: string }) => {
  return http.post(PORT1 + `/discover/characters/delete`, params);
};
