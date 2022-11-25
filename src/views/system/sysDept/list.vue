<template>
  <div>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" :disabled="$hasBP('btn.sysDept.add')" @click="openSaveDialog()">添加部门</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table
        :data="list"
        style="width: 100%"
        row-key="id"
        border
        :tree-props="{children: 'children'}"
      >
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="leader" label="项目负责人" width="160" />
        <el-table-column prop="phone" label="部门电话" width="180" />
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <el-switch
              :value="scope.row.status === 1"
              disabled
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="200" />
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button
              type="success"
              icon="el-icon-plus"
              size="mini"
              title="添加下级部门"
              :disabled="$hasBP('btn.sysDept.add')"
              @click="openSaveDialog(scope.row)"
            />
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              title="修改"
              :disabled="$hasBP('btn.sysDept.update')"
              @click="openUpdateDialog(scope.row)"
            />
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              title="删除"
              :disabled="scope.row.hasChildren || $hasBP('btn.sysDept.remove')"
              @click="removeById(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/修改对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="addOrUpdateDialogFormVisible"
      width="50%"
      @close="saveOrUpdateDialogClose"
    >
      <el-form ref="addOrUpdateForm" :model="sysDept" :rules="sysDeptRules" label-width="80px">
        <el-form-item v-if="sysDept.id === '' && sysDept.parentId !== 0" label="上级部门">
          <el-input v-model="sysDept.parentName" disabled />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="sysDept.name" />
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-input v-model="sysDept.leader" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="sysDept.phone" />
        </el-form-item>
        <el-form-item label="状态" prop="type">
          <el-radio-group v-model="sysDept.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addOrUpdateDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveOrUpdate()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { save, update, getById, getAll, removeById } from '@/api/system/dept'
import { checkPhone } from '@/utils/validate'

const sysDeptObj = {
  id: '',
  parentId: '',
  parentName: '',
  name: '',
  leader: '',
  phone: '',
  status: 1
}

export default {
  // 定义数据
  data() {
    const validatorPhone = (rule, value, callback) => {
      if (!checkPhone(value)) {
        callback(new Error('请输入合法的手机号'))
      } else {
        callback()
      }
    }
    return {
      list: [],

      /* 添加/修改对话框 */
      // 对话框标题
      dialogTitle: '',
      // 控制添加/修改对话框显示或隐藏(默认)
      addOrUpdateDialogFormVisible: false,
      // 表单对象
      sysDept: JSON.parse(JSON.stringify(sysDeptObj)),
      sysDeptRules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        leader: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
        phone: [{ required: true, trigger: 'blur', validator: validatorPhone }]
      }
    }
  },

  // 当页面加载时获取数据
  created() {
    this.getList()
  },

  methods: {
    // 调用api层获取数据库中的数据
    getList() {
      getAll().then(res => {
        this.list = res.data
      })
    },

    /* ========= start - 添加/修改对话框 ========= */
    // 关闭对话框
    saveOrUpdateDialogClose() {
      this.sysDept = JSON.parse(JSON.stringify(sysDeptObj))
    },
    // 打开保存对话框
    openSaveDialog(row) {
      if (row) {
        this.sysDept.parentId = row.id
        this.sysDept.parentName = row.name
        // 对话框标题
        this.dialogTitle = '添加子部门'
      } else {
        // 对话框标题
        this.dialogTitle = '添加部门'
        this.sysDept.parentId = 0
      }

      // 打开对话框
      this.addOrUpdateDialogFormVisible = true
    },
    // 打开修改对话框
    openUpdateDialog(row) {
      // 根据id获取对象
      getById(row.id).then(res => {
        // 保存表单数据
        this.sysDept = res.data
        // 对话框标题
        this.dialogTitle = '修改菜单'
        // 打开对话框
        this.addOrUpdateDialogFormVisible = true
      })
    },
    // 保存或删除
    saveOrUpdate() {
      // 校验表单
      this.$refs.addOrUpdateForm.validate(valid => {
        if (valid) {
          if (!this.sysDept.id) {
            // 无id保存
            this.save()
          } else {
            // 有id修改
            this.update()
          }
        }
      })
    },
    // 调用API保存
    save() {
      save(this.sysDept).then(res => {
        // 关闭对话框
        this.addOrUpdateDialogFormVisible = false
        // 提示
        this.$message.success('保存成功')
        // 刷新数据
        this.getList()
      })
    },
    // 调用API修改
    update() {
      update(this.sysDept).then(res => {
        // 关闭对话框
        this.addOrUpdateDialogFormVisible = false
        // 提示
        this.$message.success('修改成功')
        // 刷新数据
        this.getList()
      })
    },
    /* ========= end - 添加/修改对话框 ========= */

    // 根据id删除数据
    removeById(row) {
      // 弹框询问用户是否删除数据
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeById(row.id).then(res => {
          // 提示
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
    }
  }
}
</script>
