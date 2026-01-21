<template>
  <div class="main-box">
    <div class="left-box custom-card">
      <div class="title">角色分类</div>
      <div class="category-list">
        <div
          v-for="item in categories"
          :key="item.id"
          class="category-item"
          :class="{ active: activeCategoryId === item.id }"
          @click="selectCategory(item.id)"
        >
          <span>{{ item.name }}</span>
          <el-button v-if="item.id !== ''" type="danger" link :icon="Delete" @click.stop="handleDeleteCategory(item)"></el-button>
        </div>
      </div>
      <el-button type="primary" plain class="add-btn" :icon="Plus" @click="handleAddCategory">添加分类</el-button>
    </div>
    <div class="right-box custom-card">
      <ProTable
        ref="proTable"
        :columns="columns"
        :request-api="getCharacterListApi"
        :init-param="initParam"
        :pagination="false"
        :data-callback="dataCallback"
      >
        <template #tableHeader>
          <el-dropdown trigger="click" @command="handleImport">
            <el-button type="primary" :icon="CirclePlus">
              添加角色卡<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="new">新建角色卡</el-dropdown-item>
                <el-dropdown-item command="file">从文件导入</el-dropdown-item>
                <el-dropdown-item command="url">从URL导入</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template #avatar="scope">
          <el-image :src="scope.row.avatar" class="char-avatar" :preview-src-list="[scope.row.avatar]" fit="cover" />
        </template>
        <template #operation="scope">
          <el-button type="primary" link :icon="Delete" @click="handleDeleteCharacter(scope.row)">删除</el-button>
        </template>
      </ProTable>
    </div>

    <!-- 导入弹窗等逻辑在此补充 -->
    <CharacterDrawer ref="drawerRef" @refresh="getTableList" />
    <ImportDialog ref="importRef" @refresh="getTableList" />
  </div>
</template>

<script setup lang="ts" name="characterManage">
import { ref, onMounted, reactive } from "vue";
import {
  Character,
  getCategoryList,
  addCategory,
  deleteCategory,
  getCharacterList,
  deleteCharacter
} from "@/api/modules/character";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import ProTable from "@/components/ProTable/index.vue";
import CharacterDrawer from "./CharacterDrawer.vue";
import ImportDialog from "./ImportDialog.vue";
import { Plus, Delete, CirclePlus, ArrowDown } from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";

const categories = ref<Character.Category[]>([]);
const activeCategoryId = ref("");
const proTable = ref<ProTableInstance>();
const drawerRef = ref();
const importRef = ref();

const initParam = reactive({
  categoryId: activeCategoryId
});

const getTableList = () => {
  proTable.value?.getTableList();
};

const getCategories = async () => {
  const { data } = await getCategoryList();
  categories.value = [{ id: "", name: "全部", order: -1 }, ...data];
};

const selectCategory = (id: string) => {
  activeCategoryId.value = id;
  initParam.categoryId = id;
};

const handleAddCategory = () => {
  ElMessageBox.prompt("请输入分类名称", "添加分类", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /.+/,
    inputErrorMessage: "名称不能为空"
  }).then(async ({ value }) => {
    await addCategory({ name: value });
    ElMessage.success("添加成功");
    getCategories();
  });
};

const handleDeleteCategory = async (item: Character.Category) => {
  await ElMessageBox.confirm(`确认删除分类 "${item.name}" 吗？`, "提示", { type: "warning" });
  await deleteCategory({ id: item.id });
  ElMessage.success("删除成功");
  if (activeCategoryId.value === item.id) activeCategoryId.value = "";
  getCategories();
};

const getCharacterListApi = (params: any) => {
  return getCharacterList(params);
};

const dataCallback = (data: any) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.list)) return data.list;
  return [];
};

const columns = reactive<ColumnProps<Character.ResCharacterList>[]>([
  { prop: "avatar", label: "头像", width: 100 },
  { prop: "name", label: "名称", search: { el: "input" } },
  { prop: "author", label: "作者" },
  { prop: "clickCount", label: "点击次数", width: 100, sortable: true },
  { prop: "clickPopulation", label: "点击人数", width: 100, sortable: true },
  { prop: "description", label: "介绍", showOverflowTooltip: true },
  {
    prop: "createdAt",
    label: "创建时间",
    render: scope => {
      return scope.row.createdAt ? new Date(scope.row.createdAt).toLocaleString() : "--";
    }
  },
  { prop: "operation", label: "操作", fixed: "right", width: 100 }
]);

const handleImport = (command: string) => {
  if (command === "new") {
    drawerRef.value.acceptParams({
      title: "新建",
      row: { categoryId: activeCategoryId.value || categories.value[1]?.id },
      categories: categories.value.filter(c => c.id !== "")
    });
  } else {
    importRef.value.acceptParams({
      type: command,
      categories: categories.value
    });
  }
};

const handleDeleteCharacter = async (row: Character.ResCharacterList) => {
  await ElMessageBox.confirm(`确认删除角色 "${row.name}" 吗？`, "提示", { type: "warning" });
  await deleteCharacter({ id: row.id });
  ElMessage.success("删除成功");
  proTable.value?.getTableList();
};

onMounted(() => {
  getCategories();
});
</script>

<style scoped lang="scss">
.main-box {
  display: flex;
  gap: 10px;
  height: 100%;
  .custom-card {
    display: flex;
    flex-direction: column;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
  }
  .left-box {
    width: 220px;
    padding: 15px;
    .title {
      margin-bottom: 15px;
      font-size: 16px;
      font-weight: bold;
    }
    .category-list {
      flex: 1;
      overflow-y: auto;
      .category-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 15px;
        margin-bottom: 5px;
        cursor: pointer;
        border-radius: 4px;
        &:hover {
          background: var(--el-fill-color-light);
        }
        &.active {
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }
      }
    }
    .add-btn {
      width: 100%;
      margin-top: 15px;
    }
  }
  .right-box {
    flex: 1;
    overflow: hidden;
    :deep(.char-avatar) {
      width: 50px;
      height: 50px;
      border-radius: 4px;
    }
  }
}
</style>
