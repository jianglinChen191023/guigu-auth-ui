<template>
  <div>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchObj.roleName"
            placeholder="请输入角色名称"
            class="input-with-select"
            clearable
            @clear="getList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getList" />
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="showAddDialogVisible()">添加角色</el-button>
          <el-button type="danger" @click="removeRoles()">批量删除</el-button>
        </el-col>
      </el-row>

      <!-- table 表格区域 -->
      <el-table
        :data="list"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" />
        <el-table-column prop="roleName" label="角色名称" />
        <el-table-column prop="roleCode" label="角色编码" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialogVisible(scope.row.id)" />
            <!-- 删除 -->
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeDataById(scope.row.id)"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        :current-page="page"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="limit"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 添加/修改 对话框 -->
    <el-dialog
      :title="saveOrUpdateTitle"
      :visible.sync="saveOrUpdateDialogVisible"
      width="50%"
      @close="saveOrUpdateDialogClose"
    >
      <!-- 内容主体区域 -->
      <el-form ref="saveOrUpdateFormRef" :model="saveOrUpdateForm" :rules="saveOrUpdateFormRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="saveOrUpdateForm.roleName" />
        </el-form-item>
        <el-form-item label="角色代码" prop="roleCode">
          <el-input v-model="saveOrUpdateForm.roleCode" />
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="saveOrUpdateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveOrUpdate">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { getPageList, removeById, getRoleById, update, save, batchRemove } from '@/api/role/role'

export default {
  name: 'List',
  data() {
    return {
      // 角色列表
      list: [],
      // 总记录数
      total: 0,
      // 当前页
      page: 1,
      // 每页显示记录数
      limit: 10,
      // 条件查询封装对象
      searchObj: {},
      // - 批量删除
      // 选中的数据
      multipleSelection: [],
      // - 添加或修改
      // 控制对话框的显示与隐藏
      saveOrUpdateDialogVisible: false,
      // 标题
      saveOrUpdateTitle: '',
      // 表单数据
      saveOrUpdateForm: {
        roleName: '',
        roleCode: ''
      },
      // 表单规则
      saveOrUpdateFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入用户名称',
            trigger: 'blur'
          }
        ],
        roleCode: [
          {
            required: true,
            message: '请输入用户代码',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取列表数据
    getList() {
      getPageList(this.page, this.limit, this.searchObj).then(res => {
        this.list = res.data.records
        this.total = res.data.total
      })
    },
    handleSizeChange(newSize) {
      this.limit = newSize
      this.list()
    },
    handleCurrentChange(newPage) {
      this.page = newPage
      this.list()
    },
    // 保存或修改角色
    saveOrUpdate() {
      // 判断 id 是否存在 {true: 修改角色, false: 保存角色}
      if (!this.saveOrUpdateForm.id) {
        this.saveRole()
      } else {
        this.updateRole()
      }
    },
    saveRole() {
      // 表单验证
      this.$refs.saveOrUpdateFormRef.validate(valid => {
        if (!valid) return

        save(this.saveOrUpdateForm).then(res => {
          this.$message.success('保存角色成功!')
          // 关闭弹框
          this.saveOrUpdateDialogVisible = false
          // 刷新数据
          this.getList()
        })
      })
    },
    updateRole() {
      // 表单验证
      this.$refs.saveOrUpdateFormRef.validate(valid => {
        if (!valid) return
        update(this.saveOrUpdateForm).then(res => {
          this.$message.success('修改角色成功!')
          // 关闭弹框
          this.saveOrUpdateDialogVisible = false
          // 刷新数据
          this.getList()
        })
      })
    },
    showEditDialogVisible(id) {
      getRoleById(id).then(res => {
        // 修改角色对应数据
        this.saveOrUpdateForm = res.data
        // 弹框标题
        this.saveOrUpdateTitle = '修改角色'
        // 显示弹框
        this.saveOrUpdateDialogVisible = true
      })
    },
    showAddDialogVisible() {
      // 弹框标题
      this.saveOrUpdateTitle = '添加角色'
      // 显示弹框
      this.saveOrUpdateDialogVisible = true
    },
    // 重置表单
    saveOrUpdateDialogClose() {
      // 清空表单数据
      this.saveOrUpdateForm = {}
    },
    removeDataById(id) {
      // 弹框询问用户是否删除数据
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeById(id).then(res => {
          this.$message.success('删除成功!')
          // 刷新数据
          this.getList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    removeRoles() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择要删除的角色!')
        return
      }

      // 弹框询问用户是否删除数据
      this.$confirm('此操作将永久删除这些角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = []
        // 循环选中的角色信息, 取出 id 值
        this.multipleSelection.forEach(item => {
          // 精度问题: js 的数值存储为 2的53次方, 数据库ID是19位数值, 所以需要处理
          ids.push(item.id + '')
        })
        // 请求批量删除
        batchRemove(ids).then(res => {
          this.$message.success('批量删除成功!')
          // 刷新数据
          this.getList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
