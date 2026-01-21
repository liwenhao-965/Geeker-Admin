<template>
  <div class="card content-box">
    <span class="text">聊天设定</span>
    <el-form :model="settings" label-width="150px" style="max-width: 600px; margin-top: 20px">
      <el-form-item label="免费次数设定">
        <el-input-number v-model="settings.freeChatLimit" :min="0" :precision="0" />
        <div class="help-text">设定免费用户每天可进行的免费聊天次数上限。</div>
      </el-form-item>
      <el-form-item label="免费路线模型">
        <el-select v-model="settings.freeRouteModel" placeholder="请选择模型" style="width: 100%">
          <el-option v-for="item in modelOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <div class="help-text">免费路线连接时自动切换的模型型号。</div>
      </el-form-item>
      <el-form-item label="高级路线模型">
        <el-select v-model="settings.premiumRouteModel" placeholder="请选择模型" style="width: 100%">
          <el-option v-for="item in modelOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <div class="help-text">高级（付费）路线连接时自动切换的模型型号。</div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSave">保存设定</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts" name="chatSettings">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getChatSettings, saveChatSettings, ChatSettings } from "@/api/modules/chatSettings";

const loading = ref(false);
const modelOptions = [
  { label: "DeepSeek V3 (Exp)", value: "deepseek-ai/DeepSeek-V3.2-Exp" },
  { label: "DeepSeek V3", value: "deepseek-ai/DeepSeek-V3" },
  { label: "DeepSeek R1", value: "deepseek-ai/DeepSeek-R1" },
  { label: "GPT-4o", value: "gpt-4o" },
  { label: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet-20240620" },
  { label: "Gemini 1.5 Pro", value: "google/gemini-1.5-pro" }
];
const settings = ref<ChatSettings>({
  freeChatLimit: 10,
  freeRouteModel: "deepseek-ai/DeepSeek-V3.2-Exp",
  premiumRouteModel: "deepseek-ai/DeepSeek-V3.2-Exp"
});

const loadSettings = async () => {
  try {
    const { data } = await getChatSettings();
    if (data) {
      // 确保即使后端返回的数据不完整，模型字段也有默认值
      settings.value = {
        ...settings.value,
        ...data
      };
    }
  } catch (error) {
    console.error(error);
  }
};

const handleSave = async () => {
  loading.value = true;
  try {
    await saveChatSettings(settings.value);
    ElMessage.success("保存成功");
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadSettings();
});
</script>

<style scoped lang="scss">
.help-text {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.5;
  color: #909399;
}
</style>
