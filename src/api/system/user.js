import request from '@/utils/request'

const api_name = '/admin/system/sysUser'

// 保存
export function save(data) {
  return request({
    url: `${api_name}/save`,
    method: 'post',
    data
  })
}

// 修改状态
export function updateStatus(id, status) {
  return request({
    url: `${api_name}/updateStatus/${id}/${status}`,
    method: 'put'
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

// 获取分页数据
export function getPageList(page, limit, params) {
  return request({
    url: `${api_name}/${page}/${limit}`,
    method: 'get',
    params
  })
}

// 根据 id 删除
export function removeById(id) {
  return request({
    url: `${api_name}/removeById/${id}`,
    method: 'delete'
  })
}

// 批量删除
export function removeByIds(data) {
  return request({
    url: `${api_name}/removeByIds`,
    method: 'delete',
    data
  })
}

