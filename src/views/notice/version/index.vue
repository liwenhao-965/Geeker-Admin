<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="getVersionList" :init-param="initParam">
      <!-- 表格头部操作按钮 -->
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增版本</el-button>
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" @click="openDrawer('编辑', scope.row)">编辑</el-button>
        <el-button type="primary" link :icon="Delete" @click="deleteVersionItem(scope.row)">删除</el-button>
      </template>
    </ProTable>
    <VersionDrawer ref="drawerRef" @refresh="proTable?.getTableList" />
  </div>
</template>

<script setup lang="ts" name="versionManage">
import { ref, reactive } from "vue";
import { Version, getVersionList, deleteVersion } from "@/api/modules/version";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import ProTable from "@/components/ProTable/index.vue";
import VersionDrawer from "./VersionDrawer.vue";
import { CirclePlus, Delete, EditPen } from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";

const proTable = ref<ProTableInstance>();

// 如果表格需要初始化请求参数，直接定义传给 ProTable(可选)
const initParam = reactive({});

const columns = reactive<ColumnProps<Version.ResVersionList>[]>([
  { prop: "version", label: "版本号", search: { el: "input" } },
  { prop: "androidUrl", label: "安装包路径" },
  {
    prop: "updateType",
    label: "更新类型",
    enum: [
      { label: "强制更新", value: 1, tagType: "danger" },
      { label: "非强制更新", value: 2, tagType: "primary" }
    ],
    fieldNames: { label: "label", value: "value" }
  },
  { prop: "description", label: "版本说明" },
  {
    prop: "createdAt",
    label: "发布时间",
    width: 180,
    render: scope => {
      return scope.row.createdAt ? new Date(scope.row.createdAt).toLocaleString() : "--";
    }
  },
  { prop: "operation", label: "操作", fixed: "right", width: 150 }
]);

const drawerRef = ref<InstanceType<typeof VersionDrawer> | null>(null);
const openDrawer = (title: string, row: Partial<Version.ResVersionList> = {}) => {
  const params = {
    title,
    row: { ...row },
    isView: title === "查看",
    api: title === "新增" ? undefined : undefined // 这里可以根据需求传入 api
  };
  drawerRef.value?.acceptParams(params);
};

const deleteVersionItem = async (row: Version.ResVersionList) => {
  await ElMessageBox.confirm("确认删除该版本记录吗？", "提示", { type: "warning" });
  await deleteVersion({ id: row.id });
  ElMessage.success("删除成功");
  proTable.value?.getTableList();
};
</script>
