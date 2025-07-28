<template>
  <ArtTableFullScreen>
    <div class="account-page" id="table-full-screen">
      <!-- 搜索栏 -->
      <ArtSearchBar
        v-model:filter="formFilters"
        :items="formItems"
        @reset="handleReset"
        @search="handleSearch"
      ></ArtSearchBar>

      <ElCard shadow="never" class="art-table-card">
        <!-- 表格头部 -->
        <ArtTableHeader v-model:columns="columnChecks" @refresh="handleRefresh">
          <template #left>
            <ElButton @click="showDialog('add')">新增用户</ElButton>
          </template>
        </ArtTableHeader>

        <!-- 表格 -->
        <ArtTable
          ref="tableRef"
          row-key="id"
          :loading="loading"
          :data="tableData"
          :currentPage="pagination.currentPage"
          :pageSize="pagination.pageSize"
          :total="pagination.total"
          :marginTop="10"
          @selection-change="handleSelectionChange"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        >
          <template #default>
            <ElTableColumn v-for="col in columns" :key="col.prop || col.type" v-bind="col" />
          </template>
        </ArtTable>

        <!-- 用户表单对话框 -->
        <ElDialog
          v-model="dialogVisible"
          :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
          width="30%"
          align-center
        >
          <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
            <ElFormItem label="用户名" prop="username">
              <ElInput v-model="formData.username" :disabled="dialogType === 'edit'" />
            </ElFormItem>
            <ElFormItem label="邮箱" prop="email">
              <ElInput v-model="formData.email" type="email" placeholder="请输入邮箱地址" />
            </ElFormItem>
            <ElFormItem v-if="dialogType === 'add'" label="密码" prop="password">
              <ElInput v-model="formData.password" type="password" placeholder="请输入密码" />
            </ElFormItem>
            <ElFormItem label="角色" prop="role">
              <ElSelect v-model="formData.role" placeholder="请选择角色">
                <ElOption label="管理员" value="admin" />
                <ElOption label="超级管理员" value="super_admin" />
              </ElSelect>
            </ElFormItem>
          </ElForm>
          <template #footer>
            <div class="dialog-footer">
              <ElButton @click="dialogVisible = false">取消</ElButton>
              <ElButton type="primary" @click="handleSubmit">提交</ElButton>
            </div>
          </template>
        </ElDialog>

        <!-- 密码重置对话框 -->
        <ElDialog
          v-model="passwordDialogVisible"
          title="重置密码"
          width="25%"
          align-center
        >
          <ElForm ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="80px">
            <ElFormItem label="新密码" prop="password">
              <ElInput v-model="passwordForm.password" type="password" placeholder="请输入新密码" />
            </ElFormItem>
            <ElFormItem label="确认密码" prop="confirmPassword">
              <ElInput v-model="passwordForm.confirmPassword" type="password" placeholder="请确认新密码" />
            </ElFormItem>
          </ElForm>
          <template #footer>
            <div class="dialog-footer">
              <ElButton @click="passwordDialogVisible = false">取消</ElButton>
              <ElButton type="primary" @click="handlePasswordReset">确定</ElButton>
            </div>
          </template>
        </ElDialog>
      </ElCard>
    </div>
  </ArtTableFullScreen>
</template>

<script setup lang="ts">
  import { h } from 'vue'

  import { ElDialog, FormInstance, ElButton } from 'element-plus'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import type { FormRules } from 'element-plus'
  import { useCheckedColumns } from '@/composables/useCheckedColumns'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { VmqGoService } from '@/api/vmqGoApi'
  import { SearchChangeParams, SearchFormItem } from '@/types'
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'User' }) // 定义组件名称，用于 KeepAlive 缓存控制

  // 工具函数
  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return '无'
    return new Date(timestamp * 1000).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const dialogType = ref('add')
  const dialogVisible = ref(false)
  const loading = ref(false)

  // 定义表单搜索初始值
  const initialSearchState = {
    username: '',
    email: '',
    role: '',
    status: ''
  }

  // 响应式表单数据
  const formFilters = reactive({ ...initialSearchState })

  const pagination = reactive({
    currentPage: 1,
    pageSize: 20,
    total: 0
  })

  // 表格数据
  const tableData = ref<any[]>([])

  // 表格实例引用
  const tableRef = ref()

  // 选中的行数据
  const selectedRows = ref<any[]>([])

  // 当前编辑的用户ID
  const currentUserId = ref<number | null>(null)

  // 密码重置对话框
  const passwordDialogVisible = ref(false)
  const passwordFormRef = ref<FormInstance>()
  const passwordForm = reactive({
    password: '',
    confirmPassword: ''
  })

  // 重置表单
  const handleReset = () => {
    Object.assign(formFilters, { ...initialSearchState })
    pagination.currentPage = 1 // 重置到第一页
    getUserList()
  }

  // 搜索处理
  const handleSearch = () => {
    console.log('搜索参数:', formFilters)
    pagination.currentPage = 1 // 搜索时重置到第一页
    getUserList()
  }

  // 表单项变更处理
  const handleFormChange = (params: SearchChangeParams): void => {
    console.log('表单项变更:', params)
  }

  // 表单配置项
  const formItems: SearchFormItem[] = [
    {
      label: '用户名',
      prop: 'username',
      type: 'input',
      config: {
        clearable: true,
        placeholder: '请输入用户名'
      },
      onChange: handleFormChange
    },
    {
      label: '邮箱',
      prop: 'email',
      type: 'input',
      config: {
        clearable: true,
        placeholder: '请输入邮箱'
      },
      onChange: handleFormChange
    },
    {
      label: '角色',
      prop: 'role',
      type: 'select',
      config: {
        clearable: true,
        placeholder: '请选择角色'
      },
      options: () => [
        { label: '管理员', value: 'admin' },
        { label: '超级管理员', value: 'super_admin' }
      ],
      onChange: handleFormChange
    }
  ]



  // 显示对话框
  const showDialog = (type: string, row?: any) => {
    dialogVisible.value = true
    dialogType.value = type

    // 重置表单验证状态
    if (formRef.value) {
      formRef.value.resetFields()
    }

    if (type === 'edit' && row) {
      currentUserId.value = row.id
      formData.username = row.username
      formData.email = row.email
      formData.role = row.role
      formData.password = '' // 编辑时不显示密码
    } else {
      currentUserId.value = null
      formData.username = ''
      formData.email = ''
      formData.role = 'admin'
      formData.password = ''
    }
  }

  // 显示密码重置对话框
  const showPasswordDialog = (row: any) => {
    currentUserId.value = row.id
    passwordDialogVisible.value = true
    passwordForm.password = ''
    passwordForm.confirmPassword = ''

    // 重置表单验证状态
    if (passwordFormRef.value) {
      passwordFormRef.value.resetFields()
    }
  }

  // 删除用户
  const deleteUser = async (row: any) => {
    try {
      await ElMessageBox.confirm('确定要删除该用户吗？', '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await VmqGoService.deleteUser(row.id)
      ElMessage.success('删除成功')
      getUserList() // 刷新列表
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('删除用户失败:', error)
        ElMessage.error('删除失败')
      }
    }
  }

  // 动态列配置
  const { columnChecks, columns } = useCheckedColumns(() => [
    { type: 'selection' }, // 勾选列
    {
      prop: 'id',
      label: 'ID',
      width: 80,
      sortable: true
    },
    {
      prop: 'username',
      label: '用户名',
      minWidth: 120,
      sortable: true
    },
    {
      prop: 'email',
      label: '邮箱',
      minWidth: 180,
      sortable: true
    },
    {
      prop: 'role',
      label: '角色',
      width: 120,
      formatter: (row: any) => {
        return row.role === 'super_admin' ? '超级管理员' : '管理员'
      }
    },

    {
      prop: 'last_login_time',
      label: '最后登录时间',
      width: 180,
      sortable: true,
      formatter: (row: any) => {
        return row.last_login_time ? formatTimestamp(row.last_login_time) : '从未登录'
      }
    },
    {
      prop: 'last_login_ip',
      label: '最后登录IP',
      width: 140,
      sortable: true
    },
    {
      prop: 'created_at',
      label: '创建时间',
      width: 180,
      sortable: true,
      formatter: (row: any) => {
        return formatTimestamp(row.created_at)
      }
    },
    {
      prop: 'updated_at',
      label: '更新时间',
      width: 180,
      sortable: true,
      formatter: (row: any) => {
        return formatTimestamp(row.updated_at)
      }
    },
    {
      prop: 'operation',
      label: '操作',
      width: 200,
      fixed: 'right',
      formatter: (row: any) => {
        return h('div', { style: 'display: flex; gap: 8px;' }, [
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => showDialog('edit', row)
          }),
          h(ElButton, {
            size: 'small',
            type: 'warning',
            onClick: () => showPasswordDialog(row)
          }, () => '重置密码'),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => deleteUser(row)
          })
        ])
      }
    }
  ])

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive({
    username: '',
    email: '',
    password: '',
    role: 'admin'
  })

  onMounted(() => {
    getUserList()
  })

  // 获取用户列表数据
  const getUserList = async () => {
    loading.value = true
    try {
      const { currentPage, pageSize } = pagination

      // 构建搜索参数
      const params: any = {
        page: currentPage,
        limit: pageSize
      }

      // 添加搜索条件
      if (formFilters.username) {
        params.search = formFilters.username
      }

      console.log('请求参数:', params)
      console.log('当前token:', useUserStore().accessToken)

      // 使用Go API获取用户列表
      const response = await VmqGoService.getUsers(params)

      console.log('API响应:', response)

      // 处理Go API返回的数据格式
      const userList = response.data || []
      const meta = response.meta || {}

      tableData.value = userList.map((item: any) => ({
        id: item.id,
        username: item.username,
        email: item.email,
        role: item.role,
        status: item.status,
        last_login_time: item.last_login_time,
        last_login_ip: item.last_login_ip,
        created_at: item.created_at,
        updated_at: item.updated_at
      }))

      // 更新分页信息
      Object.assign(pagination, {
        currentPage: meta.page || 1,
        pageSize: meta.limit || 10,
        total: meta.total || 0
      })
    } catch (error: any) {
      console.error('获取用户列表失败:', error)

      // 详细错误信息
      if (error?.response?.status === 401) {
        ElMessage.error('未授权访问，请先登录')
      } else if (error?.response?.status === 403) {
        ElMessage.error('权限不足，需要超级管理员权限')
      } else if (error?.response?.data?.message) {
        ElMessage.error(`获取用户列表失败: ${error.response.data.message}`)
      } else {
        ElMessage.error('获取用户列表失败，请检查网络连接和后端服务')
      }
    } finally {
      loading.value = false
    }
  }

  const handleRefresh = () => {
    getUserList()
  }

  // 处理表格行选择变化
  const handleSelectionChange = (selection: any[]) => {
    selectedRows.value = selection
  }

  // 表单验证规则
  const rules = reactive<FormRules>({
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 50, message: '长度在 6 到 50 个字符', trigger: 'blur' }
    ],
    role: [{ required: true, message: '请选择角色', trigger: 'change' }]
  })

  // 密码重置验证规则
  const passwordRules = reactive<FormRules>({
    password: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, max: 50, message: '长度在 6 到 50 个字符', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请确认密码', trigger: 'blur' },
      {
        validator: (_rule, value, callback) => {
          if (value !== passwordForm.password) {
            callback(new Error('两次输入的密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  })

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          if (dialogType.value === 'add') {
            // 创建新用户
            await VmqGoService.createUser({
              username: formData.username,
              email: formData.email,
              password: formData.password,
              role: formData.role
            })
            ElMessage.success('添加成功')
          } else {
            // 更新用户
            if (currentUserId.value) {
              await VmqGoService.updateUser(currentUserId.value, {
                username: formData.username,
                email: formData.email,
                role: formData.role
              })
              ElMessage.success('更新成功')
            }
          }

          dialogVisible.value = false
          // 刷新用户列表
          getUserList()
        } catch (error: any) {
          console.error('操作失败:', error)
          const message = error?.response?.data?.message || (dialogType.value === 'add' ? '添加失败' : '更新失败')
          ElMessage.error(message)
        }
      }
    })
  }

  // 处理密码重置
  const handlePasswordReset = async () => {
    if (!passwordFormRef.value || !currentUserId.value) return

    await passwordFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          await VmqGoService.resetUserPassword(currentUserId.value!, passwordForm.password)
          ElMessage.success('密码重置成功')
          passwordDialogVisible.value = false
        } catch (error: any) {
          console.error('密码重置失败:', error)
          const message = error?.response?.data?.message || '密码重置失败'
          ElMessage.error(message)
        }
      }
    })
  }

  // 处理表格分页变化
  const handleSizeChange = (newPageSize: number) => {
    pagination.pageSize = newPageSize
    getUserList()
  }

  const handleCurrentChange = (newCurrentPage: number) => {
    pagination.currentPage = newCurrentPage
    getUserList()
  }
</script>

<style lang="scss" scoped>
.account-page {
  padding: 20px;

  .search-form {
    margin-bottom: 20px;
  }

  .table-container {
    background: white;
    border-radius: 8px;
    padding: 20px;
  }
}
</style>
