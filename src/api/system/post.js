import request from '@/utils/request'

const api_name = '/admin/system/sysPost'

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

// 修改状态
export function updateStatus(id, status) {
  return request({
    url: `${api_name}/update/${id}/${status}`,
    method: 'put'
  })
}

// 根据 id 获取信息
export function getById(id) {
  return request({
    url: `${api_name}/getById/${id}`,
    method: 'get'
  })
}

// 列表
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

