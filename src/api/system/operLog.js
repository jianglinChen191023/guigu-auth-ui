import request from '@/utils/request'

const api_name = '/admin/system/sysOperLog'

// 列表
export function getPageList(page, limit, params) {
  return request({
    url: `${api_name}/${page}/${limit}`,
    method: 'get',
    params
  })
}
