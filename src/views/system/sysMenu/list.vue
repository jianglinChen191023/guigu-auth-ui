<template>
  <div class="app-container">
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="openSaveDialog()">添加菜单</el-button>
        </el-col>
      </el-row>

      <!-- 表格-懒加载 -->
      <el-table
        :data="list"
        style="width: 100%"
        row-key="id"
        border
        :tree-props="{children: 'children'}"
      >
        <el-table-column prop="name" label="菜单名称" width="160" />
        <el-table-column label="图标">
          <template slot-scope="scope">
            <i :class="scope.row.icon" />
          </template>
        </el-table-column>
        <el-table-column prop="perms" label="权限标识" width="160" />
        <el-table-column prop="path" label="路由地址" width="120" />
        <el-table-column prop="component" label="组件路径" width="160" />
        <el-table-column prop="sortValue" label="排序" width="60" />
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <el-switch
              :value="scope.row.status === 1"
              disabled
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.type !== 2"
              type="success"
              icon="el-icon-plus"
              size="mini"
              title="添加下级节点"
              @click="openSaveDialog(scope.row)"
            />
            <el-button type="primary" icon="el-icon-edit" size="mini" title="修改" @click="openUpdateDialog(scope.row)" />
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              title="删除"
              :disabled="scope.row.hasChildren"
              @click="removeById(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/修改对话框 -->
    <!--
    {
      data() {
        return {
          /* 添加/修改对话框 */
          // 对话框标题
          dialogTitle: '',
          // 控制添加/修改对话框显示或隐藏(默认)
          addOrUpdateDialogFormVisible: false,
          // 表单对象
          sysMenu: {}
        }
      },
      methods: {
        // 关闭对话框
        saveOrUpdateDialogClose() {
           this.sysMenu = {}
        },
        // 打开保存对话框
        openSaveDialog() {
          // 对话框标题
          this.dialogTitle = '添加菜单'
          // 打开对话框
          this.addOrUpdateDialogFormVisible = true
        },
        // 打开修改对话框
        openUpdateDialog(id) {
          // 根据id获取对象
          getById(id).then(res => {
            // 保存表单数据
            this.sysMenu = res.data
            // 对话框标题
            this.dialogTitle = '修改菜单'
            // 打开对话框
            this.addOrUpdateDialogFormVisible = true
          })
        },
        // 保存或删除
        saveOrUpdate() {
          if (!this.sysMenu.id) {
            // 无id保存
            this.save()
          } else {
            // 有id修改
            this.update()
          }
        },
        // 调用API保存
        save() {
          save.then(res => {
            // 关闭对话框
            this.addOrUpdateDialogFormVisible = true
            // 提示
            this.$message.success('保存成功!')
          })
        },
        // 调用API修改
        update(id) {
          update.then(res => {
            // 关闭对话框
            this.addOrUpdateDialogFormVisible = true
            // 提示
            this.$message.success('修改成功!')
          })
        },

      }
    }
    -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="addOrUpdateDialogFormVisible"
      width="50%"
      @close="saveOrUpdateDialogClose"
    >
      <el-form ref="addOrUpdateForm" :model="sysMenu">
        <el-form-item v-if="sysMenu.id === ''" label="上级部门">
          <el-input v-model="sysMenu.parentName" disabled />
        </el-form-item>
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="sysMenu.type" :disabled="typeDisabled">
            <el-radio :label="0" :disabled="type0Disabled">目录</el-radio>
            <el-radio :label="1" :disabled="type1Disabled">菜单</el-radio>
            <el-radio :label="2" :disabled="type2Disabled">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="sysMenu.name" />
        </el-form-item>
        <el-form-item v-if="sysMenu.type !== 2" label="图标" prop="icon">
          <el-select v-model="sysMenu.icon" clearable>
            <el-option v-for="item in iconList" :key="item.class" :label="item.class" :value="item.class">
              <span style="float: left;">
                <i :class="item.class" />  <!-- 如果动态显示图标，这里添加判断 -->
              </span>
              <span style="padding-left: 6px;">{{ item.class }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="sysMenu.sortValue" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item v-if="sysMenu.type !== 2" prop="path">
          <span slot="label">
            <el-tooltip content="访问的路由地址，如：`sysUser`" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
            路由地址
          </span>
          <el-input v-model="sysMenu.path" placeholder="请输入路由地址" />
        </el-form-item>
        <el-form-item v-if="sysMenu.type !== 0 && sysMenu.type !== 2" prop="component">
          <span slot="label">
            <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
            组件路径
          </span>
          <el-input v-model="sysMenu.component" placeholder="请输入组件路径" />
        </el-form-item>
        <el-form-item v-if="sysMenu.type === 2">
          <el-input v-model="sysMenu.perms" placeholder="请输入权限标识" maxlength="100" />
          <span slot="label">
            <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(hasAuthority('bnt.sysRole.list'))" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
            权限字符
          </span>
        </el-form-item>
        <el-form-item label="状态" prop="type">
          <el-radio-group v-model="sysMenu.status">
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
import { save, update, getById, getAll, removeById } from '@/api/system/menu'

export default {
  // 定义数据
  data() {
    return {
      list: [],
      iconList: [
        {
          class: 'el-icon-s-tools'
        },
        {
          class: 'el-icon-s-custom'
        },
        {
          class: 'el-icon-setting'
        },
        {
          class: 'el-icon-user-solid'
        },
        {
          class: 'el-icon-s-help'
        },
        {
          class: 'el-icon-phone'
        },
        {
          class: 'el-icon-s-unfold'
        },
        {
          class: 'el-icon-s-operation'
        },
        {
          class: 'el-icon-more-outline'
        },
        {
          class: 'el-icon-s-check'
        },
        {
          class: 'el-icon-tickets'
        },
        {
          class: 'el-icon-s-goods'
        },
        {
          class: 'el-icon-document-remove'
        },
        {
          class: 'el-icon-warning'
        },
        {
          class: 'el-icon-warning-outline'
        },
        {
          class: 'el-icon-question'
        },
        {
          class: 'el-icon-info'
        }
      ],

      /* 添加/修改对话框 */
      typeDisabled: false,
      type0Disabled: false,
      type1Disabled: false,
      type2Disabled: false,
      // 对话框标题
      dialogTitle: '',
      // 控制添加/修改对话框显示或隐藏(默认)
      addOrUpdateDialogFormVisible: false,
      // 表单对象
      sysMenu: {
        id: '',
        parentId: '',
        name: '',
        type: 0,
        path: '',
        component: '',
        perms: '',
        icon: '',
        sortValue: 1,
        status: 1
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
      this.sysMenu = {
        id: '',
        parentId: '',
        name: '',
        type: 0,
        path: '',
        component: '',
        perms: '',
        icon: '',
        sortValue: 1,
        status: 1
      }
    },
    // 打开保存对话框
    openSaveDialog(row) {
      console.log(this.sysMenu.id === '')
      if (row) {
        this.sysMenu.parentId = row.id
        this.sysMenu.parentName = row.name
        // 对话框标题
        this.dialogTitle = '添加子菜单'
        if (row.type === 0) {
          this.sysMenu.type = 1
          this.typeDisabled = false
          this.type0Disabled = false
          this.type1Disabled = false
          this.type2Disabled = true
        } else if (row.type === 1) {
          this.sysMenu.type = 2
          this.typeDisabled = true
        }
      } else {
        // 对话框标题
        this.dialogTitle = '添加目录节点'
        this.sysMenu.type = 0
        this.sysMenu.component = 'Layout'
        this.sysMenu.parentId = 0
        this.typeDisabled = true
      }

      // 打开对话框
      this.addOrUpdateDialogFormVisible = true
    },
    // 打开修改对话框
    openUpdateDialog(row) {
      // 根据id获取对象
      getById(row.id).then(res => {
        // 保存表单数据
        this.sysMenu = res.data
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
          if (!this.sysMenu.id) {
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
      save(this.sysMenu).then(res => {
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
      update(this.sysMenu).then(res => {
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
