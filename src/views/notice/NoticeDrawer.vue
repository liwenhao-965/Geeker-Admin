<template>
  <el-drawer v-model="drawerVisible" :destroy-on-close="true" size="450px" :title="`${drawerProps.title}公告`">
    <el-form ref="ruleFormRef" label-width="100px" label-suffix=" :" :rules="rules" :model="drawerProps.row">
      <el-form-item label="公告标题" prop="title">
        <el-input v-model="drawerProps.row!.title" placeholder="请填写公告标题" clearable></el-input>
      </el-form-item>
      <el-form-item label="公告类型" prop="type">
        <el-select v-model="drawerProps.row!.type" placeholder="请选择公告类型" clearable>
          <el-option label="系统通知" value="system" />
          <el-option label="活动通知" value="activity" />
          <el-option label="更新日志" value="update" />
        </el-select>
      </el-form-item>
      <el-form-item label="公告内容" prop="content">
        <el-input v-model="drawerProps.row!.content" type="textarea" :rows="10" placeholder="请填写公告内容" clearable></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="NoticeDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { addNotice } from "@/api/modules/notice";

const rules = reactive({
  title: [{ required: true, message: "请填写公告标题" }],
  type: [{ required: true, message: "请选择公告类型" }],
  content: [{ required: true, message: "请填写公告内容" }]
});

interface DrawerProps {
  title: string;
  row: any;
  api?: (params: any) => Promise<any>;
  getTableList?: () => void;
}

const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  row: {}
});

const acceptParams = (params: DrawerProps) => {
  drawerProps.value = { ...params, row: params.row || {} };
  drawerVisible.value = true;
};

const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await addNotice(drawerProps.value.row);
      ElMessage.success({ message: `${drawerProps.value.title}公告成功！` });
      emit("refresh");
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

const emit = defineEmits(["refresh"]);

defineExpose({
  acceptParams
});
</script>
