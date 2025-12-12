// utils/dataManager.js
// 数据管理工具 - 实现智能缓存和版本更新

const DATA_URL = 'https://dai1254473705.github.io/flower/data/image-links.json'
const CACHE_KEY = 'plantsData'
const VERSION_KEY = 'dataVersion'
const CACHE_TIME_KEY = 'dataCacheTime'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24小时

/**
 * 获取植物数据（优先使用缓存，后台更新）
 */
function getPlantsData() {
  return new Promise((resolve, reject) => {
    // 先检查缓存
    const cachedData = wx.getStorageSync(CACHE_KEY)
    const cachedVersion = wx.getStorageSync(VERSION_KEY)
    const cacheTime = wx.getStorageSync(CACHE_TIME_KEY)
    
    // 如果缓存存在且未过期，直接返回
    if (cachedData && cacheTime && (Date.now() - cacheTime < CACHE_DURATION)) {
      resolve(cachedData)
      // 后台更新
      updateDataInBackground()
      return
    }
    
    // 从网络获取
    wx.request({
      url: DATA_URL,
      success(res) {
        if (res.statusCode === 200 && res.data) {
          // 处理数据格式：可能是数组或对象
          let plantsData = res.data
          
          // 如果是对象，提取plants数组
          if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
            plantsData = res.data.plants || res.data
          }
          
          // 确保是数组
          if (!Array.isArray(plantsData)) {
            if (cachedData && Array.isArray(cachedData)) {
              resolve(cachedData)
              return
            }
            reject(new Error('数据格式错误'))
            return
          }
          
          const newVersion = (res.data.version || res.data[0]?.version) || '1.0.0'
          
          // 检查版本是否更新
          if (newVersion !== cachedVersion) {
            // 更新缓存
            wx.setStorageSync(CACHE_KEY, plantsData)
            wx.setStorageSync(VERSION_KEY, newVersion)
            wx.setStorageSync(CACHE_TIME_KEY, Date.now())
          }
          
          resolve(plantsData)
        } else {
          // 网络失败，使用缓存
          if (cachedData && Array.isArray(cachedData)) {
            resolve(cachedData)
          } else {
            reject(new Error('数据加载失败'))
          }
        }
      },
      fail() {
        // 网络错误，使用缓存
        if (cachedData && Array.isArray(cachedData)) {
          resolve(cachedData)
          wx.showToast({
            title: '使用缓存数据',
            icon: 'none',
            duration: 2000
          })
        } else {
          reject(new Error('网络错误，且无缓存数据'))
        }
      }
    })
  })
}

/**
 * 后台更新数据
 */
function updateDataInBackground() {
  wx.request({
    url: DATA_URL,
    success(res) {
      if (res.statusCode === 200 && res.data) {
        let plantsData = res.data
        
        // 处理数据格式
        if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
          plantsData = res.data.plants || res.data
        }
        
        if (Array.isArray(plantsData)) {
          const newVersion = (res.data.version || res.data[0]?.version) || '1.0.0'
          const cachedVersion = wx.getStorageSync(VERSION_KEY)
          
          if (newVersion !== cachedVersion) {
            wx.setStorageSync(CACHE_KEY, plantsData)
            wx.setStorageSync(VERSION_KEY, newVersion)
            wx.setStorageSync(CACHE_TIME_KEY, Date.now())
            
            // 通知用户有更新（可选，避免打扰用户）
            // wx.showToast({
            //   title: '数据已更新',
            //   icon: 'success',
            //   duration: 2000
            // })
          }
        }
      }
    },
    fail() {
      // 静默失败，不影响用户体验
    }
  })
}

/**
 * 获取轮播图数据
 */
function getBannerData() {
  return new Promise((resolve) => {
    wx.request({
      url: DATA_URL,
      success(res) {
        if (res.statusCode === 200 && res.data) {
          // 如果是对象格式，提取banner
          if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
            if (res.data.banner && Array.isArray(res.data.banner)) {
              resolve(res.data.banner)
              return
            }
            // 如果plants数组第一个元素有banner
            if (res.data.plants && res.data.plants[0] && res.data.plants[0].banner) {
              resolve(res.data.plants[0].banner)
              return
            }
          }
          // 如果是数组格式，检查第一个元素
          if (Array.isArray(res.data) && res.data[0] && res.data[0].banner) {
            resolve(res.data[0].banner)
            return
          }
        }
        resolve([])
      },
      fail() {
        resolve([])
      }
    })
  })
}

/**
 * 清除缓存
 */
function clearCache() {
  wx.removeStorageSync(CACHE_KEY)
  wx.removeStorageSync(VERSION_KEY)
  wx.removeStorageSync(CACHE_TIME_KEY)
}

module.exports = {
  getPlantsData,
  getBannerData,
  updateDataInBackground,
  clearCache
}

