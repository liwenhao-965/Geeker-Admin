<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :init-param="initParam"
      :data-callback="dataCallback"
      @drag-sort="sortTable"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button v-auth="'add'" type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增用户</el-button>
        <el-button v-auth="'batchAdd'" type="primary" :icon="Upload" plain @click="batchAdd">批量添加用户</el-button>
        <el-button v-auth="'export'" type="primary" :icon="Download" plain @click="downloadFile">导出用户数据</el-button>
        <el-button type="primary" plain @click="toDetail">To 子集详情页面</el-button>
        <el-button type="danger" :icon="Delete" plain :disabled="!scope.isSelected" @click="batchDelete(scope.selectedListIds)">
          批量删除用户
        </el-button>
      </template>
      <!-- Expand -->
      <template #expand="scope">
        {{ scope.row }}
      </template>
      <!-- usernameHeader -->
      <template #usernameHeader="scope">
        <el-button type="primary" @click="ElMessage.success('我是通过作用域插槽渲染的表头')">
          {{ scope.column.label }}
        </el-button>
      </template>
      <!-- createTime -->
      <template #createTime="scope">
        <el-button type="primary" link @click="ElMessage.success('我是通过作用域插槽渲染的内容')">
          {{ scope.row.createTime }}
        </el-button>
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button type="primary" link :icon="Refresh" @click="resetPass(scope.row)">重置密码</el-button>
        <el-button type="primary" link :icon="Delete" @click="deleteAccount(scope.row)">删除</el-button>
      </template>
    </ProTable>
    <UserDrawer ref="drawerRef" />
    <ImportExcel ref="dialogRef" />
  </div>
</template>

<script setup lang="tsx" name="useProTable">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { User } from "@/api/interface";
import { useHandleData } from "@/hooks/useHandleData";
import { useDownload } from "@/hooks/useDownload";
import { ElMessage, ElMessageBox } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import UserDrawer from "@/views/proTable/components/UserDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Download, Upload, Refresh } from "@element-plus/icons-vue";
import {
  getUserList,
  deleteUser,
  editUser,
  addUser,
  changeUserStatus,
  resetUserPassWord,
  exportUserInfo,
  BatchAddUser
} from "@/api/modules/user";

const router = useRouter();

// 跳转详情页
const toDetail = () => {
  router.push(`/proTable/useProTable/detail/${Math.random().toFixed(3)}?params=detail-page`);
};

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 如果表格需要初始化请求参数，直接定义传给 ProTable (之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({ type: 1 });

// dataCallback 是对于返回的表格数据做处理，如果你后台返回的数据不是 list && total 这些字段，可以在这里进行处理成这些字段
// 或者直接去 hooks/useTable.ts 文件中把字段改为你后端对应的就行
const dataCallback = (data: any) => {
  return {
    list: data.list,
    total: data.total
  };
};

// 如果你想在请求之前对当前请求参数做一些操作，可以自定义如下函数：params 为当前所有的请求参数（包括分页），最后返回请求列表接口
// 默认不做操作就直接在 ProTable 组件上绑定	:requestApi="getUserList"
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.createTime && (newParams.startTime = newParams.createTime[0]);
  newParams.createTime && (newParams.endTime = newParams.createTime[1]);
  delete newParams.createTime;
  return getUserList(newParams);
};

// 表格配置项
const columns = reactive<ColumnProps<User.ResUserList>[]>([
  { type: "selection", fixed: "left", width: 70 },
  {
    prop: "username",
    label: "用户名",
    search: { el: "input" }
  },
  {
    prop: "tags",
    label: "用户标签",
    search: {
      el: "select",
      key: "tag",
      props: { placeholder: "请选择用户标签" }
    },
    enum: [
      { label: "活跃", value: "活跃" },
      { label: "高价值", value: "高价值" },
      { label: "Plus付费用户", value: "Plus付费用户" }
    ],
    render: scope => {
      return (
        <>
          {scope.row.tags?.map(tag => (
            <el-tag
              class="mr5"
              key={tag}
              type={tag === "高价值" ? "danger" : tag === "活跃" ? "success" : tag === "Plus付费用户" ? "warning" : "info"}
            >
              {tag}
            </el-tag>
          ))}
        </>
      );
    }
  },
  {
    prop: "enabled",
    label: "用户状态",
    render: scope => {
      return (
        <>
          <el-switch
            model-value={scope.row.enabled}
            active-text={scope.row.enabled ? "启用" : "禁用"}
            onClick={() => changeStatus(scope.row)}
          />
        </>
      );
    }
  },
  {
    prop: "created",
    label: "注册时间",
    width: 200,
    search: {
      el: "date-picker",
      span: 2,
      key: "createTime",
      props: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" }
    },
    render: scope => {
      return <span>{scope.row.created ? new Date(scope.row.created).toLocaleString() : "--"}</span>;
    }
  },
  {
    prop: "lastLogin",
    label: "最后登录时间",
    width: 180,
    render: scope => {
      return <span>{scope.row.lastLogin ? new Date(scope.row.lastLogin).toLocaleString() : "--"}</span>;
    }
  },
  { prop: "operation", label: "操作", fixed: "right", width: 200 }
]);

// 表格拖拽排序
const sortTable = ({ newIndex, oldIndex }: { newIndex?: number; oldIndex?: number }) => {
  console.log(newIndex, oldIndex);
  console.log(proTable.value?.tableData);
  ElMessage.success("修改列表排序成功");
};

// 删除用户信息
const deleteAccount = async (params: any) => {
  await useHandleData(deleteUser, { handle: params.handle, purge: true }, `删除【${params.username}】用户`);
  proTable.value?.getTableList();
};

// 批量删除用户信息
const batchDelete = async () => {
  // 注意：SillyTavern 接口可能不支持批量删除，这里需要根据实际情况调整
  // 目前先循环调用或者提示不支持
  ElMessage.warning("批量删除功能暂未对接");
};

// 重置用户密码
const resetPass = async (params: any) => {
  await useHandleData(resetUserPassWord, { handle: params.handle }, `重置【${params.username}】用户密码`);
  proTable.value?.getTableList();
};

// 切换用户状态
const changeStatus = async (row: any) => {
  await useHandleData(changeUserStatus, { handle: row.handle, status: row.enabled ? 0 : 1 }, `切换【${row.username}】用户状态`);
  proTable.value?.getTableList();
};

// 导出用户列表
const downloadFile = async () => {
  ElMessageBox.confirm("确认导出用户数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(exportUserInfo, "用户列表", proTable.value?.searchParam)
  );
};

// 批量添加用户
const dialogRef = ref<InstanceType<typeof ImportExcel> | null>(null);
const batchAdd = () => {
  const params = {
    title: "用户",
    tempApi: exportUserInfo,
    importApi: BatchAddUser,
    getTableList: proTable.value?.getTableList
  };
  dialogRef.value?.acceptParams(params);
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof UserDrawer> | null>(null);
const openDrawer = (title: string, row: Partial<User.ResUserList> = {}) => {
  const params = {
    title,
    isView: title === "查看",
    row: { ...row },
    api: title === "新增" ? addUser : title === "编辑" ? editUser : undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>
