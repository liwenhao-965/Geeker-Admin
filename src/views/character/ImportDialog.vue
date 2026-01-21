<template>
  <el-dialog v-model="dialogVisible" :title="`从${importType === 'file' ? '文件' : 'URL'}导入角色卡`" width="500px">
    <el-form label-width="80px">
      <el-form-item label="所属分类">
        <el-select v-model="categoryId" placeholder="请选择分类" style="width: 100%">
          <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
        </el-select>
      </el-form-item>

      <template v-if="importType === 'file'">
        <el-form-item label="选择文件">
          <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="true"
            :limit="1"
            accept=".json,.png"
            :on-change="handleFileChange"
          >
            <el-button type="primary">选择 JSON 或 PNG 角色卡</el-button>
          </el-upload>
        </el-form-item>
      </template>

      <template v-else>
        <el-form-item label="角色 URL">
          <el-input v-model="importUrl" placeholder="请输入角色卡下载 URL" />
        </el-form-item>
      </template>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleImport">导入</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { Character, addCharacter } from "@/api/modules/character";
import { extractDataFromPng } from "@/utils/characterParser";

const dialogVisible = ref(false);
const importType = ref<"file" | "url">("file");
const categoryId = ref("");
const importUrl = ref("");
const categories = ref<Character.Category[]>([]);
const loading = ref(false);
const selectedFile = ref<any>(null);

const acceptParams = (params: { type: "file" | "url"; categories: Character.Category[] }) => {
  importType.value = params.type;
  categories.value = params.categories.filter(c => c.id !== "");
  categoryId.value = categories.value[0]?.id || "";
  dialogVisible.value = true;
  selectedFile.value = null;
  importUrl.value = "";
};

const handleFileChange = (file: any) => {
  selectedFile.value = file.raw;
};

const processCharData = (charData: any, avatar: string = "") => {
  // SillyTavern V2/V3 structure
  const data = charData.data || charData;
  return {
    name: data.name || charData.name || "未命名",
    categoryId: categoryId.value,
    avatar: avatar,
    author: data.creator || charData.creator || "未知",
    description: data.description || charData.description || "",
    data: charData
  };
};

const handleImport = async () => {
  if (!categoryId.value) return ElMessage.warning("请选择分类");

  loading.value = true;
  try {
    if (importType.value === "file") {
      if (!selectedFile.value) return ElMessage.warning("请选择文件");

      const file = selectedFile.value;
      if (file.name.endsWith(".json")) {
        const reader = new FileReader();
        reader.onload = async e => {
          try {
            const charData = JSON.parse(e.target?.result as string);
            await addCharacter(processCharData(charData));
            ElMessage.success("导入成功");
            emit("refresh");
            dialogVisible.value = false;
          } catch (err) {
            ElMessage.error("JSON 解析失败");
          }
        };
        reader.readAsText(file);
      } else if (file.name.endsWith(".png")) {
        const reader = new FileReader();
        reader.onload = async e => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const uint8Array = new Uint8Array(arrayBuffer);
            const charData = extractDataFromPng(uint8Array);
            if (charData) {
              // Convert PNG to data URL for avatar preview
              const avatarReader = new FileReader();
              avatarReader.onload = async ev => {
                await addCharacter(processCharData(charData, ev.target?.result as string));
                ElMessage.success("导入成功");
                emit("refresh");
                dialogVisible.value = false;
              };
              avatarReader.readAsDataURL(file);
            } else {
              ElMessage.error("未能从 PNG 中提取到角色数据");
            }
          } catch (err) {
            ElMessage.error("PNG 解析失败");
          }
        };
        reader.readAsArrayBuffer(file);
      }
    } else {
      if (!importUrl.value) return ElMessage.warning("请输入 URL");

      const response = await fetch(importUrl.value);
      const blob = await response.blob();
      const fileName = importUrl.value.split("/").pop() || "downloaded_char.png";

      if (fileName.endsWith(".json") || blob.type === "application/json") {
        const text = await blob.text();
        const charData = JSON.parse(text);
        await addCharacter(processCharData(charData));
      } else {
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const charData = extractDataFromPng(uint8Array);
        if (charData) {
          const avatar = await new Promise<string>(resolve => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target?.result as string);
            reader.readAsDataURL(blob);
          });
          await addCharacter(processCharData(charData, avatar));
        } else {
          throw new Error("未能从 URL 文件中提取到角色数据");
        }
      }

      ElMessage.success("导入成功");
      emit("refresh");
      dialogVisible.value = false;
    }
  } catch (error: any) {
    ElMessage.error("导入失败: " + (error.message || "未知错误"));
  } finally {
    loading.value = false;
  }
};

const emit = defineEmits(["refresh"]);
defineExpose({ acceptParams });
</script>
