import request from '@/utils/request'

const api_name = '/admin/system/sysRole'

// 列表
export function getPageList(page, limit, params) {
  return request({
    url: `${api_name}/${page}/${limit}`,
    method: 'get',
    params
  })
}

// 角色删除
export function removeById(id) {
  return request({
    url: `${api_name}/remove/${id}`,
    method: 'delete'
  })
}

// 角色保存
export function save(data) {
  return request({
    url: `${api_name}/save`,
    method: 'post',
    data
  })
}

// 角色修改
export function update(data) {
  return request({
    url: `${api_name}/update`,
    method: 'put',
    data
  })
}

// 根据 id 获取角色信息
export function getRoleById(id) {
  return request({
    url: `${api_name}/findRoleById/${id}`,
    method: 'get'
  })
}

// 批量删除
export function batchRemove(ids) {
  return request({
    url: `${api_name}/batchRemove`,
    method: 'delete',
    data: {
      ids
    }
  })
}
