<template>
  <el-drawer v-model="drawerVisible" :destroy-on-close="true" size="600px" :title="`${drawerProps.title}角色卡`">
    <el-form ref="ruleFormRef" label-width="100px" label-suffix=" :" :rules="rules" :model="drawerProps.row">
      <el-form-item label="角色头像" prop="avatar">
        <div class="avatar-upload">
          <el-image v-if="drawerProps.row!.avatar" :src="drawerProps.row!.avatar" class="avatar-preview" fit="cover" />
          <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="handleAvatarChange">
            <el-button type="primary">选择图片</el-button>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="drawerProps.row!.name" placeholder="请输入角色名称" clearable />
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input v-model="drawerProps.row!.author" placeholder="请输入作者名称" clearable />
      </el-form-item>
      <el-form-item label="所属分类" prop="categoryId">
        <el-select v-model="drawerProps.row!.categoryId" placeholder="请选择分类" clearable style="width: 100%">
          <el-option v-for="cat in drawerProps.categories" :key="cat.id" :label="cat.name" :value="cat.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="角色介绍" prop="description">
        <el-input v-model="drawerProps.row!.description" type="textarea" :rows="4" placeholder="请输入角色介绍" clearable />
      </el-form-item>
      <el-form-item label="开场白" prop="first_message">
        <el-input v-model="drawerProps.row!.data.first_message" type="textarea" :rows="4" placeholder="请输入开场白" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="CharacterDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Character, addCharacter } from "@/api/modules/character";

const rules = reactive({
  name: [{ required: true, message: "请输入角色名称" }],
  categoryId: [{ required: true, message: "请选择分类" }],
  avatar: [{ required: true, message: "请上传角色头像" }]
});

interface DrawerProps {
  title: string;
  row: Partial<Character.ResCharacterList>;
  categories: Character.Category[];
}

const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  row: { data: {} },
  categories: []
});

const acceptParams = (params: DrawerProps) => {
  drawerProps.value = { ...params, row: { ...params.row, data: params.row.data || {} } };
  drawerVisible.value = true;
};

const handleAvatarChange = (file: any) => {
  const reader = new FileReader();
  reader.onload = e => {
    drawerProps.value.row.avatar = e.target?.result as string;
  };
  reader.readAsDataURL(file.raw);
};

const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await addCharacter(drawerProps.value.row);
      ElMessage.success({ message: `${drawerProps.value.title}角色卡成功！` });
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

<style scoped lang="scss">
.avatar-upload {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  .avatar-preview {
    width: 100px;
    height: 100px;
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
  }
}
</style>
