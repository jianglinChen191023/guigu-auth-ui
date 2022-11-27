<template>
  <div>
    <el-card>
      <el-row :gutter="22">
        <el-col :span="6">
          <el-input
            v-model="searchObj.username"
            placeholder="请输入登录账号"
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
      </el-row>

      <!-- table 表格区域 -->
      <el-table
        :data="list"
        border
        stripe
      >
        <el-table-column label="序号" width="70" align="center">
          <template slot-scope="scope">
            {{ (page - 1) * limit + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="title" label="系统模块" />
        <el-table-column prop="businessType" label="操作类型" />
        <el-table-column prop="requestMethod" label="请求方式" />
        <el-table-column prop="operName" label="操作人员" />
        <el-table-column prop="operIp" label="IP地址" />
        <el-table-column prop="method" label="请求方法" />
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '0' ? 'primary' : 'success'">
              {{ scope.row.status === '0' ? '失败' : '成功' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              :disabled="$hasBP('btn.sysOperLog.list')"
              @click="showDetailsDialog(scope.row)"
            >
              详情
            </el-button>
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

    <!-- 日志详情对话框 -->
    <el-dialog
      title="日志详情"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleClose"
    >
      <div>
        <span>请求参数：</span>
        <span>{{ sysOperLog.operParam }}</span>
        <el-divider />
        <span>返回参数：</span>
        <span>{{ sysOperLog.jsonResult }}</span>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getPageList } from '@/api/system/operLog'

export default {
  name: 'List',
  data() {
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
        username: '',
        createTimeBegin: '',
        createTimeEnd: ''
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

      /* 详情对话框 */
      // 操作日志对象
      sysOperLog: {},
      // 控制是否显示对话框
      dialogVisible: false
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

    /* 详情对话框 */
    // 显示详情对话框
    showDetailsDialog(row) {
      this.sysOperLog = row
      this.dialogVisible = true
    },
    // 详情对话框关闭
    handleClose() {
      this.sysOperLog = {}
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>

</style>
