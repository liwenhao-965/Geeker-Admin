import { ResPage, User } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 用户管理模块
 */
// 获取用户列表
export const getUserList = (params: User.ReqUserParams) => {
  return http.post<ResPage<User.ResUserList>>(`/users/get`, params);
};

// 获取树形用户列表
export const getUserTreeList = (params: User.ReqUserParams) => {
  return http.post<ResPage<User.ResUserList>>(`/users/get`, params);
};

// 新增用户
export const addUser = (params: any) => {
  return http.post(`/users/create`, params);
};

// 批量添加用户
export const BatchAddUser = (params: FormData) => {
  return http.post(`/users/create`, params);
};

// 编辑用户
export const editUser = (params: any) => {
  return http.post(`/users/edit`, params);
};

// 删除用户
export const deleteUser = (params: { handle: string; purge?: boolean }) => {
  return http.post(`/users/delete`, params);
};

// 切换用户状态 (SillyTavern 使用 enable/disable)
export const changeUserStatus = (params: { handle: string; status: number }) => {
  const url = params.status === 1 ? `/users/enable` : `/users/disable`;
  return http.post(url, { handle: params.handle });
};

// 重置用户密码
export const resetUserPassWord = (params: { handle: string }) => {
  return http.post(`/users/reset-password`, params);
};

// 导出用户数据
export const exportUserInfo = (params: User.ReqUserParams) => {
  return http.download(PORT1 + `/user/export`, params);
};

// 获取用户状态字典
export const getUserStatus = () => {
  return http.get<User.ResStatus[]>(PORT1 + `/user/status`);
};

// 获取用户性别字典
export const getUserGender = () => {
  return http.get<User.ResGender[]>(PORT1 + `/user/gender`);
};

// 获取用户部门列表
export const getUserDepartment = () => {
  return http.get<User.ResDepartment[]>(PORT1 + `/user/department`, {}, { cancel: false });
};

// 获取用户角色字典
export const getUserRole = () => {
  return http.get<User.ResRole[]>(PORT1 + `/user/role`);
};

// 获取首页仪表盘数据
export const getDashboardData = () => {
  return http.get<any>(`/users/dashboard`);
};
