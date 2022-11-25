/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  // const valid_map = ['admin', 'editor']
  return str.trim().length > 0
}

/**
 * 验证手机号的规则
 *
 * @param {string} moble
 * @returns {Boolean}
 */
export function checkPhone(phone) {
  // 验证手机号的正则表达式
  return /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/.test(phone)
}
