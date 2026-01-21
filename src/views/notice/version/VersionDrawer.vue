<template>
  <el-drawer v-model="drawerVisible" :destroy-on-close="true" size="500px" :title="`${drawerProps.title}版本`">
    <el-form ref="ruleFormRef" label-width="110px" label-suffix=" :" :rules="rules" :model="drawerProps.row">
      <el-form-item label="版本号" prop="version">
        <el-input v-model="drawerProps.row!.version" placeholder="请填写版本号 (如: 1.0.1)" clearable></el-input>
      </el-form-item>
      <el-form-item label="更新类型" prop="updateType">
        <el-select v-model="drawerProps.row!.updateType" placeholder="请选择更新类型" clearable>
          <el-option label="强制更新" :value="1" />
          <el-option label="非强制更新" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="安卓安装包" prop="androidUrl">
        <el-upload
          class="upload-demo"
          action="/api/file/upload/file"
          :limit="1"
          :on-success="handleUploadSuccess"
          :on-remove="handleRemove"
          :file-list="fileList"
        >
          <el-button type="primary">点击上传</el-button>
          <template #tip>
            <div class="el-upload__tip">请上传 .apk 文件</div>
          </template>
        </el-upload>
        <el-input v-model="drawerProps.row!.androidUrl" placeholder="文件路径" readonly style="margin-top: 10px"></el-input>
      </el-form-item>
      <el-form-item label="版本说明" prop="description">
        <el-input
          v-model="drawerProps.row!.description"
          type="textarea"
          :rows="5"
          placeholder="请填写版本说明"
          clearable
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="VersionDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance, UploadUserFile } from "element-plus";
import { addVersion, editVersion } from "@/api/modules/version";

const rules = reactive({
  version: [{ required: true, message: "请填写版本号" }],
  updateType: [{ required: true, message: "请选择更新类型" }],
  androidUrl: [{ required: true, message: "请上传安卓安装包" }],
  description: [{ required: true, message: "请填写版本说明" }]
});

interface DrawerProps {
  title: string;
  row: any;
  api?: (params: any) => Promise<any>;
}

const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  row: {}
});

const fileList = ref<UploadUserFile[]>([]);

const acceptParams = (params: DrawerProps) => {
  drawerProps.value = { ...params, row: params.row || {} };
  if (drawerProps.value.row.androidUrl) {
    fileList.value = [{ name: "已上传包", url: drawerProps.value.row.androidUrl }];
  } else {
    fileList.value = [];
  }
  drawerVisible.value = true;
};

const handleUploadSuccess = (response: any) => {
  if (response.code === 200) {
    drawerProps.value.row.androidUrl = response.data.fileUrl;
    ElMessage.success("上传成功");
  } else {
    ElMessage.error(response.msg || "上传失败");
  }
};

const handleRemove = () => {
  drawerProps.value.row.androidUrl = "";
};

const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      if (drawerProps.value.title === "新增") {
        await addVersion(drawerProps.value.row);
      } else {
        await editVersion(drawerProps.value.row);
      }
      ElMessage.success({ message: `${drawerProps.value.title}版本成功！` });
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
