<template>
  <el-dialog v-model="visible" :title="`分钥管理 - ${currentMaster?.name}`" width="1000px">
    <div class="mb20">
      <el-form :inline="true" :model="genForm">
        <el-form-item label="分钥名称">
          <el-input v-model="genForm.name" placeholder="名称前缀" />
        </el-form-item>
        <el-form-item label="生成数量">
          <el-input-number v-model="genForm.count" :min="1" :max="50" />
        </el-form-item>
        <el-form-item label="有效期(天)">
          <el-input-number v-model="genForm.expiryDays" :min="1" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleGenerate">生成分钥</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="subKeys" border style="width: 100%" height="500px">
      <el-table-column prop="name" label="名称" width="150" />
      <el-table-column prop="key" label="分钥 (Key)" width="200">
        <template #default="scope">
          <el-tag v-copy="scope.row.key" class="cursor-pointer">{{ scope.row.key }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="生成时间" width="160">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="usedAt" label="激活时间" width="160">
        <template #default="scope">
          {{ scope.row.usedAt ? formatDate(scope.row.usedAt) : "未激活" }}
        </template>
      </el-table-column>
      <el-table-column prop="expiresAt" label="过期时间" width="160">
        <template #default="scope">
          {{ scope.row.expiresAt ? formatDate(scope.row.expiresAt) : "--" }}
        </template>
      </el-table-column>
      <el-table-column prop="isActive" label="状态" width="100">
        <template #default="scope">
          <el-switch v-model="scope.row.isActive" @change="(val: any) => handleStatusChange(scope.row, val)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="scope">
          <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { getSubKeyListApi, generateSubKeyApi, changeSubKeyStatusApi, deleteSubKeyApi } from "@/api/modules/premiumKey";
import { ElMessage, ElMessageBox } from "element-plus";

const visible = ref(false);
const currentMaster = ref<any>(null);
const subKeys = ref<any[]>([]);

const genForm = reactive({
  name: "",
  count: 1,
  expiryDays: 30
});

const open = (master: any) => {
  currentMaster.value = master;
  genForm.name = `${master.name}-分钥`;
  visible.value = true;
  refreshList();
};

const refreshList = async () => {
  if (!currentMaster.value) return;
  const res = await getSubKeyListApi(currentMaster.value.id);
  subKeys.value = res.data;
};

const handleGenerate = async () => {
  if (!genForm.name) return ElMessage.warning("请输入分钥名称");
  await generateSubKeyApi({
    masterKeyId: currentMaster.value.id,
    ...genForm
  });
  ElMessage.success("生成成功");
  refreshList();
};

const handleStatusChange = async (row: any, val: boolean) => {
  await changeSubKeyStatusApi({ key: row.key, isActive: val });
  ElMessage.success("状态已更新");
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`确定删除分钥【${row.name}】吗？`, "提示", { type: "warning" });
  await deleteSubKeyApi({ key: row.key });
  ElMessage.success("删除成功");
  refreshList();
};

const formatDate = (ts: number) => {
  if (!ts) return "--";
  return new Date(ts).toLocaleString();
};

defineExpose({ open });
</script>

<style scoped>
.mb20 {
  margin-bottom: 20px;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
