<template>
  <div class="dashboard-container">
    <div class="dashboard-text">name: {{ name }}</div>
    <div v-for="project in projects">
      <el-link type="primary" :href="project.path">{{ project.name }}</el-link>
      <br/>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  created() {
    this.projects = [
      {
        name: '尚筹网会员系统',
        path: this.basePath
      },
      {
        name: '尚筹网后台管理系统',
        path: `${this.basePath}:8080/atcrowdfunding02-admin-webui-1.0-SNAPSHOT/admin/to/login/page.html`
      },
      {
        name: '电商后台管理系统',
        path: `${this.basePath}:81/#/login`
      },
      {
        name: '通用权限系统',
        path: `${this.basePath}:1127/#/login`
      }
    ]
  },
  data() {
    return {
      // 服务器地址
      basePath: 'http://175.178.174.83',
      // 项目
      projects: []
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
