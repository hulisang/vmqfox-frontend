<template>
  <div class="qrcode-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>支付宝二维码管理</span>
          <el-button type="primary" @click="showAddDialog = true">添加二维码</el-button>
        </div>
      </template>

      <!-- 二维码表格 -->
      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID"></el-table-column>
        <el-table-column prop="price" label="金额"></el-table-column>
        <el-table-column prop="pay_url" label="收款链接" show-overflow-tooltip></el-table-column>
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-switch
              v-model="row.state"
              :active-value="0"
              :inactive-value="1"
              @change="handleStateChange(row.id, row.state)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="searchParams.limit"
        @current-change="handlePageChange"
        class="pagination-container"
      ></el-pagination>
    </el-card>

    <!-- 添加二维码弹窗 -->
    <el-dialog v-model="showAddDialog" title="添加支付宝二维码" @close="resetForm">
      <el-form :model="addForm" ref="addFormRef" :rules="rules" label-width="80px">
        <el-form-item label="金额" prop="price">
          <el-input-number v-model="addForm.price" :precision="2" :step="0.01" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="收款码" prop="pay_url">
          <el-input v-model="addForm.pay_url" placeholder="请输入收款链接"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { VmqService } from '@/api/vmqApi'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'

const searchParams = ref({
  page: 1,
  limit: 10,
})

const tableData = ref([])
const total = ref(0)
const loading = ref(false)
const showAddDialog = ref(false)

const addForm = reactive({
  price: 0,
  pay_url: '',
})

const addFormRef = ref<FormInstance>()
const rules = reactive<FormRules>({
  price: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  pay_url: [{ required: true, message: '请输入收款链接', trigger: 'blur' }],
})

const fetchQrcodeList = async () => {
  loading.value = true
  try {
    const res = await VmqService.getZfbQrcodes(searchParams.value)
    tableData.value = res.items
    total.value = res.total
  } catch (error) {
    ElMessage.error('获取二维码列表失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  searchParams.value.page = page
  fetchQrcodeList()
}

const handleStateChange = async (id: number, state: number) => {
  try {
    await VmqService.setQrcodeState(id, state)
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    // 恢复原状
    fetchQrcodeList()
  }
}

const handleDelete = async (id: number) => {
  await ElMessageBox.confirm('确定要删除这个二维码吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  
  try {
    await VmqService.delZfbQrcode(id)
    ElMessage.success('删除成功')
    fetchQrcodeList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleAdd = async () => {
  if (!addFormRef.value) return
  await addFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await VmqService.addZfbQrcode(addForm)
        ElMessage.success('添加成功')
        showAddDialog.value = false
        fetchQrcodeList()
      } catch (error) {
        ElMessage.error('添加失败')
      }
    }
  })
}

const resetForm = () => {
  if (!addFormRef.value) return
  addFormRef.value.resetFields()
}

onMounted(() => {
  fetchQrcodeList()
})
</script>

<style scoped>
.qrcode-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style> 