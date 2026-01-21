<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="getNoticeList" :pagination="false">
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">发布公告</el-button>
      </template>
      <template #operation="scope">
        <el-button type="primary" link :icon="Delete" @click="deleteNoticeItem(scope.row)">删除</el-button>
      </template>
    </ProTable>
    <NoticeDrawer ref="drawerRef" @refresh="proTable?.getTableList" />
  </div>
</template>

<script setup lang="ts" name="noticeManage">
import { ref, reactive } from "vue";
import { Notice, getNoticeList, deleteNotice } from "@/api/modules/notice";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import ProTable from "@/components/ProTable/index.vue";
import NoticeDrawer from "./NoticeDrawer.vue";
import { CirclePlus, Delete } from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";

const proTable = ref<ProTableInstance>();

const columns = reactive<ColumnProps<Notice.ResNoticeList>[]>([
  { prop: "title", label: "公告标题", search: { el: "input" } },
  {
    prop: "type",
    label: "公告类型",
    tag: true,
    enum: [
      { label: "系统通知", value: "system", tagType: "danger" },
      { label: "活动通知", value: "activity", tagType: "warning" },
      { label: "更新日志", value: "update", tagType: "info" }
    ],
    fieldNames: { label: "label", value: "value" }
  },
  {
    prop: "createdAt",
    label: "发布时间",
    render: scope => {
      return scope.row.createdAt ? new Date(scope.row.createdAt).toLocaleString() : "--";
    }
  },
  { prop: "pushCount", label: "推送人数" },
  { prop: "clickCount", label: "点击次数" },
  { prop: "operation", label: "操作", fixed: "right", width: 100 }
]);

const drawerRef = ref<InstanceType<typeof NoticeDrawer> | null>(null);
const openDrawer = (title: string) => {
  drawerRef.value?.acceptParams({ title, row: { title: "", type: "system", content: "" } });
};

const deleteNoticeItem = async (row: Notice.ResNoticeList) => {
  await ElMessageBox.confirm("确认删除该公告吗？", "提示", { type: "warning" });
  await deleteNotice({ id: row.id });
  ElMessage.success("删除成功");
  proTable.value?.getTableList();
};
</script>
