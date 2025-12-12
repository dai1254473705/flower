// utils/searchUtils.js
// 搜索工具类

/**
 * 搜索植物
 * @param {Array} plants - 植物数组
 * @param {String} keyword - 搜索关键词
 * @returns {Array} 搜索结果
 */
function searchPlants(plants, keyword) {
  if (!keyword || !plants || !Array.isArray(plants)) {
    return []
  }
  
  const lowerKeyword = keyword.toLowerCase().trim()
  if (!lowerKeyword) {
    return []
  }
  
  return plants.filter(plant => {
    // 搜索标题
    if (plant.title && plant.title.toLowerCase().includes(lowerKeyword)) {
      return true
    }
    
    // 搜索分类
    if (plant.category && plant.category.toLowerCase().includes(lowerKeyword)) {
      return true
    }
    
    // 搜索描述
    if (plant.description && plant.description.toLowerCase().includes(lowerKeyword)) {
      return true
    }
    
    // 搜索标签
    if (plant.tags && Array.isArray(plant.tags)) {
      if (plant.tags.some(tag => tag && tag.toLowerCase().includes(lowerKeyword))) {
        return true
      }
    }
    
    // 搜索文章标题
    if (plant.articles && Array.isArray(plant.articles)) {
      if (plant.articles.some(article => 
        article.title && article.title.toLowerCase().includes(lowerKeyword)
      )) {
        return true
      }
    }
    
    return false
  })
}

/**
 * 高亮关键词（用于富文本显示，小程序中可能需要使用rich-text组件）
 * @param {String} text - 原始文本
 * @param {String} keyword - 关键词
 * @returns {String} 高亮后的文本（HTML格式）
 */
function highlightKeyword(text, keyword) {
  if (!keyword || !text) return text
  
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark style="background-color: #ffeb3b; color: #333;">$1</mark>')
}

module.exports = {
  searchPlants,
  highlightKeyword
}

