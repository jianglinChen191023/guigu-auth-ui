<template>
  <div>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="22">
        <el-col :span="8">
          <el-input
            v-model="searchObj.keyword"
            placeholder="请输入用户名/姓名/手机号码"
            class="input-with-select"
            clearable
            @clear="getList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getList" />
          </el-input>
        </el-col>
        <el-col :span="8">
          <el-date-picker
            v-model="createTimes"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            :picker-options="pickerOptions"
          />
        </el-col>
        <el-col :span="6">
          <el-button type="primary" :disabled="$hasBP('btn.sysUser.add')" @click="showAddDialogVisible()">添加用户</el-button>
          <el-button type="danger" :disabled="$hasBP('btn.sysUser.remove')" @click="removeRoles()">批量删除</el-button>
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
        <el-table-column
          label="序号"
          width="70"
          align="center"
        >
          <template slot-scope="scope">
            {{ (page - 1) * limit + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="name" label="姓名" width="110" />
        <el-table-column prop="phone" label="手机" />
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <el-switch
              :value="scope.row.status === 1"
              @change="switchStatus(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button size="mini" type="primary" icon="el-icon-edit" :disabled="$hasBP('btn.sysUser.update')" @click="showEditDialogVisible(scope.row.id)" />
            <!-- 删除 -->
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              :disabled="$hasBP('btn.sysUser.remove')"
              @click="removeDataById(scope.row.id)"
            />
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                :disabled="$hasBP('btn.sysUser.add')"
                @click="showAssignRole(scope.row)"
              />
            </el-tooltip>
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
        <el-form-item label="用户名" prop="username">
          <el-input v-model="saveOrUpdateForm.username" />
        </el-form-item>
        <el-form-item v-if="!saveOrUpdateForm.id" label="密码" prop="password">
          <el-input v-model="saveOrUpdateForm.password" type="password" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="saveOrUpdateForm.name" />
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="saveOrUpdateForm.phone" />
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
import { save, updateStatus, update, getById, getPageList, removeById, removeByIds } from '@/api/system/user'
import { getRolesByUserId, doAssign } from '@/api/system/role'

export default {
  name: 'List',
  data() {
    // 验证手机号的规则
    const checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        // 合法的手机号
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }

    return {
      // 用户列表
      list: [],
      // 总记录数
      total: 0,
      // 当前页
      page: 1,
      // 每页显示记录数
      limit: 10,
      // 时间条件
      createTimes: [],
      // 条件查询封装对象
      searchObj: {
        keyword: '',
        createTimeBegin: '',
        createTimeEnd: ''
      },
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
        username: [
          {
            required: true,
            message: '请输入用户名称',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入用户密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '密码的长度在 6-15 个字符之间',
            trigger: 'blur'
          }
        ],
        name: [
          {
            required: true,
            message: '请输入姓名',
            trigger: 'blur'
          }
        ],
        phone: [
          {
            required: true,
            message: '请输入手机号码',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      /* 分配角色 */
      sysUser: {},
      // 分配角色控制对话框的显示与隐藏
      dialogRoleVisible: false,
      // 所有角色列表
      allRoles: [],
      // 用户的角色ID的列表
      userRoleIds: [],
      // 是否是不确定的
      isIndeterminate: false,
      // 是否全选
      checkAll: false
    }
  },
  watch: {
    createTimes(newValue) {
      if (newValue && newValue.length === 2) {
        // 选择时间
        this.searchObj.createTimeBegin = newValue[0]
        this.searchObj.createTimeEnd = newValue[1]
      } else {
        // 取消时间
        this.searchObj.createTimeBegin = ''
        this.searchObj.createTimeEnd = ''
      }

      this.getList()
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 切换用户状态
    switchStatus(row) {
      row.status = row.status === 1 ? 0 : 1
      updateStatus(row.id, row.status).then(res => {
        if (res.code) {
          this.$message.success(res.message || '操作成功')
          this.getList()
        }
      })
    },
    // 获取列表数据
    getList() {
      getPageList(this.page, this.limit, this.searchObj).then(res => {
        this.list = res.data.records
        this.total = res.data.total
      })
    },
    handleSizeChange(newSize) {
      this.limit = newSize
      this.getList()
    },
    handleCurrentChange(newPage) {
      this.page = newPage
      this.getList()
    },
    // 保存或修改用户
    saveOrUpdate() {
      // 判断 id 是否存在 {true: 修改用户, false: 保存用户}
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
          this.$message.success('保存用户成功!')
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
          this.$message.success('修改用户成功!')
          // 关闭弹框
          this.saveOrUpdateDialogVisible = false
          // 刷新数据
          this.getList()
        })
      })
    },
    showEditDialogVisible(id) {
      getById(id).then(res => {
        // 修改用户对应数据
        this.saveOrUpdateForm = res.data
        // 弹框标题
        this.saveOrUpdateTitle = '修改用户'
        // 显示弹框
        this.saveOrUpdateDialogVisible = true
      })
    },
    showAddDialogVisible() {
      // 弹框标题
      this.saveOrUpdateTitle = '添加用户'
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
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
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
        this.$message.warning('请选择要删除的用户!')
        return
      }

      // 弹框询问用户是否删除数据
      this.$confirm('此操作将永久删除这些用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = []
        // 循环选中的用户信息, 取出 id 值
        this.multipleSelection.forEach(item => {
          // 精度问题: js 的数值存储为 2的53次方, 数据库ID是19位数值, 所以需要处理
          ids.push(item.id + '')
        })
        // 请求批量删除
        removeByIds(ids).then(res => {
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
    },
    /* 分配权限 */
    // 展示分配角色
    showAssignRole(row) {
      this.sysUser = row
      getRolesByUserId(row.id).then(response => {
        this.allRoles = response.data.allRoles
        this.userRoleIds = response.data.userRoleIds
        this.checkAll = this.userRoleIds.length === this.allRoles.length
        this.isIndeterminate = this.userRoleIds.length > 0 && this.userRoleIds.length < this.allRoles.length

        // 显示弹框
        this.dialogRoleVisible = true
      })
    },

    // 全选勾选状态发生改变的监听
    // value 当前勾选状态 true/false
    handleCheckAllChange(value) {
      // 如果当前全选, userRoleIds就是所有角色id的数组, 否则是空数组
      this.userRoleIds = value ? this.allRoles.map(item => item.id) : []
      // 如果当前不是全选也不全不选时, 指定为false
      this.isIndeterminate = false
    },

    // 角色列表选中项发生改变的监听
    handleCheckedChange(value) {
      const { userRoleIds, allRoles } = this
      this.checkAll = userRoleIds.length === allRoles.length && allRoles.length > 0
      this.isIndeterminate = userRoleIds.length > 0 && userRoleIds.length < allRoles.length
    },

    // 分配角色
    assignRole() {
      const assginRoleVo = {
        userId: this.sysUser.id,
        roleIdList: this.userRoleIds
      }

      doAssign(assginRoleVo).then(res => {
        this.$message.success('分配角色成功!')
        this.dialogRoleVisible = false
        this.getList()
      })
    }
  }
}
</script>

<style scoped>

</style>
