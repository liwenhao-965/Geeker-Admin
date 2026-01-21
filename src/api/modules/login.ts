import { Login } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import authMenuList from "@/assets/json/authMenuList.json";
import authButtonList from "@/assets/json/authButtonList.json";
import http from "@/api";

/**
 * @name 登录模块
 */
// 用户登录
export const loginApi = (params: Login.ReqLoginForm) => {
  // SillyTavern 登录需要 handle 和 password
  return http.post<any>(
    PORT1 + `/users/login`,
    {
      handle: params.username,
      password: params.password
    },
    { loading: false }
  );
};

// 获取 CSRF Token
export const getCsrfTokenApi = () => {
  return http.get<{ token: string }>(`/csrf-token`, {}, { loading: false });
};

// 获取菜单列表
export const getAuthMenuListApi = () => {
  // return http.get<Menu.MenuOptions[]>(PORT1 + `/menu/list`, {}, { loading: false });
  // 如果想让菜单变为本地数据，注释上一行代码，并引入本地 authMenuList.json 数据
  return authMenuList;
};

// 获取按钮权限
export const getAuthButtonListApi = () => {
  // return http.get<Login.ResAuthButtons>(PORT1 + `/auth/buttons`, {}, { loading: false });
  // 如果想让按钮权限变为本地数据，注释上一行代码，并引入本地 authButtonList.json 数据
  return authButtonList;
};
