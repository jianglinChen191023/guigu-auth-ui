<template>
  <div>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="22">
        <el-col :span="6">
          <el-input
            v-model="searchObj.name"
            placeholder="请输入岗位名称"
            class="input-with-select"
            clearable
            @clear="getList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getList" />
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-input
            v-model="searchObj.postCode"
            placeholder="请输入岗位编号"
            class="input-with-select"
            clearable
            @clear="getList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getList" />
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchObj.status" placeholder="请选择" @change="getList">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" :disabled="$hasBP('btn.sysPost.add')" @click="openSaveDialog()">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table
        :data="list"
        style="width: 100%"
        border
      >
        <el-table-column
          label="序号"
          width="70"
          align="center"
        >
          <template slot-scope="scope">
            {{ (page - 1) * limit + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="岗位名称" />
        <el-table-column prop="postCode" label="岗位编码" width="160" />
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <el-switch
              :value="scope.row.status === 1"
              :disabled="$hasBP('btn.sysPost.update')"
              @change="switchStatus(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="200" />
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              title="修改"
              :disabled="$hasBP('btn.sysPost.update')"
              @click="openUpdateDialog(scope.row)"
            />
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              title="删除"
              :disabled="$hasBP('btn.sysPost.remove')"
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
      <el-form ref="addOrUpdateForm" :model="sysPost" :rules="sysPostRules" label-width="80px">
        <el-form-item label="岗位名称" prop="name">
          <el-input v-model="sysPost.name" />
        </el-form-item>
        <el-form-item label="岗位编码" prop="postCode">
          <el-input v-model="sysPost.postCode" />
        </el-form-item>
        <el-form-item label="状态" prop="type">
          <el-radio-group v-model="sysPost.status">
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
import { save, update, updateStatus, getById, getPageList, removeById } from '@/api/system/post'

const sysPostObj = {
  id: '',
  name: '',
  postCode: '',
  status: 1
}

export default {
  // 定义数据
  data() {
    return {
      list: [],
      // 总记录数
      total: 0,
      // 当前页
      page: 1,
      // 每页显示记录数
      limit: 10,
      // 条件查询封装对象
      searchObj: {
        name: '',
        postCode: '',
        status: ''
      },
      options: [
        {
          value: '',
          label: '全部'
        }, {
          value: '1',
          label: '正常'
        }, {
          value: '0',
          label: '停用'
        }],

      /* 添加/修改对话框 */
      // 对话框标题
      dialogTitle: '',
      // 控制添加/修改对话框显示或隐藏(默认)
      addOrUpdateDialogFormVisible: false,
      // 表单对象
      sysPost: JSON.parse(JSON.stringify(sysPostObj)),
      sysPostRules: {
        name: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
        postCode: [{ required: true, message: '请输入岗位编码', trigger: 'blur' }]
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
      getPageList(this.page, this.limit, this.searchObj).then(res => {
        this.list = res.data.records
        this.total = res.data.total
      })
    },

    /* ========= start - 添加/修改对话框 ========= */
    // 关闭对话框
    saveOrUpdateDialogClose() {
      this.sysPost = JSON.parse(JSON.stringify(sysPostObj))
    },
    // 打开保存对话框
    openSaveDialog(row) {
      if (row) {
        this.sysPost.parentId = row.id
        this.sysPost.parentName = row.name
        // 对话框标题
        this.dialogTitle = '添加子部门'
      } else {
        // 对话框标题
        this.dialogTitle = '添加部门'
        this.sysPost.parentId = 0
      }

      // 打开对话框
      this.addOrUpdateDialogFormVisible = true
    },
    // 打开修改对话框
    openUpdateDialog(row) {
      // 根据id获取对象
      getById(row.id).then(res => {
        // 保存表单数据
        this.sysPost = res.data
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
          if (!this.sysPost.id) {
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
      save(this.sysPost).then(res => {
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
      update(this.sysPost).then(res => {
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
    },
    // 切换状态
    switchStatus(row) {
      row.status = row.status === 1 ? 0 : 1
      updateStatus(row.id, row.status).then(res => {
        this.$message.success('操作成功')
        this.getList()
      })
    }
  }
}
</script>
