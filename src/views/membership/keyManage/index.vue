<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="主密钥列表"
      :columns="columns"
      :request-api="getTableList"
      :pagination="false"
      :tool-button="false"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" @click="openAddMaster">新增主密钥</el-button>
      </template>

      <!-- 操作 -->
      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="viewSubKeys(scope.row)">查看分钥</el-button>
        <el-button type="danger" link :icon="Delete" @click="deleteMaster(scope.row)">删除</el-button>
      </template>
    </ProTable>

    <!-- 新增主密钥弹窗 -->
    <el-dialog v-model="addVisible" title="新增主密钥" width="500px">
      <el-form :model="masterForm" label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="masterForm.name" placeholder="请输入主密钥名称" />
        </el-form-item>
        <el-form-item label="Key">
          <el-input v-model="masterForm.key" placeholder="请输入 sk-..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddMaster">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分钥管理弹窗 -->
    <SubKeyDialog ref="subKeyDialogRef" />
  </div>
</template>

<script setup lang="tsx" name="keyManage">
import { ref, reactive } from "vue";
import { CirclePlus, Delete, View } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { getMasterKeyListApi, addMasterKeyApi, deleteMasterKeyApi } from "@/api/modules/premiumKey";
import { ElMessage, ElMessageBox } from "element-plus";
import SubKeyDialog from "./SubKeyDialog.vue";

const proTable = ref<ProTableInstance>();
const subKeyDialogRef = ref();

// 表格配置项
const columns: ColumnProps<any>[] = [
  { prop: "name", label: "名称" },
  { prop: "key", label: "主密钥 (Key)", copyable: true },
  {
    prop: "createdAt",
    label: "创建时间",
    render: scope => {
      return <span>{new Date(scope.row.createdAt).toLocaleString()}</span>;
    }
  },
  { prop: "subKeyCount", label: "分钥数量" },
  { prop: "operation", label: "操作", fixed: "right", width: 220 }
];

// 获取列表
const getTableList = async () => {
  const res = await getMasterKeyListApi();
  return {
    data: res.data
  };
};

// 新增主密钥
const addVisible = ref(false);
const masterForm = reactive({
  name: "",
  key: ""
});

const openAddMaster = () => {
  masterForm.name = "";
  masterForm.key = "";
  addVisible.value = true;
};

const submitAddMaster = async () => {
  if (!masterForm.name || !masterForm.key) return ElMessage.warning("请填写完整信息");
  await addMasterKeyApi(masterForm);
  ElMessage.success("添加成功");
  addVisible.value = false;
  proTable.value?.getTableList();
};

// 删除主密钥
const deleteMaster = async (row: any) => {
  await ElMessageBox.confirm(`确定删除主密钥【${row.name}】吗？这将同时删除所有关联的分钥！`, "提示", {
    type: "warning"
  });
  await deleteMasterKeyApi({ id: row.id });
  ElMessage.success("删除成功");
  proTable.value?.getTableList();
};

// 查看分钥
const viewSubKeys = (row: any) => {
  subKeyDialogRef.value.open(row);
};
</script>
