import request from '@/utils/request'

const api_name = '/admin/system/sysMenu'

// 根据角色id获取菜单
export function getMenuListByRoleId(roleId) {
  return request({
    url: `${api_name}/getMenuListByRoleId/${roleId}`,
    method: 'get'
  })
}

// 保存
export function save(data) {
  return request({
    url: `${api_name}/save`,
    method: 'post',
    data
  })
}

// 修改
export function update(data) {
  return request({
    url: `${api_name}/update`,
    method: 'put',
    data
  })
}

// 根据 id 获取信息
export function getById(id) {
  return request({
    url: `${api_name}/getById/${id}`,
    method: 'get'
  })
}

// 获取列表数据
export function getAll() {
  return request({
    url: `${api_name}/getAll`,
    method: 'get'
  })
}

// 根据 id 删除
export function removeById(id) {
  return request({
    url: `${api_name}/removeById/${id}`,
    method: 'delete'
  })
}

