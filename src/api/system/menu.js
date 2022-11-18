import request from '@/utils/request'

const api_name = '/admin/system/sysMenu'

// 角色菜单保存-分配权限
export function saveRoleMenu(data) {
  return request({
    url: `${api_name}/saveRoleMenu`,
    method: 'post',
    data
  })
}

// 根据角色id获取拥有的菜单id
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

