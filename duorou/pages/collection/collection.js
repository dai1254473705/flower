// pages/collection/collection.js
Page({
  data: {
    collectionList: [],
    loading: false,
    currentTheme: 'green', // 当前主题
    fontSizeValue: 28 // 默认字体大小
  },

  onLoad() {
    // 初始化主题和字体大小
    this.initThemeAndFontSize()
    this.loadCollection()
  },

  onShow() {
    // 初始化主题和字体大小
    this.initThemeAndFontSize()
    // 每次显示页面时刷新收藏列表
    this.loadCollection()
  },
  
  // 初始化主题和字体大小
  initThemeAndFontSize() {
    const userSettings = wx.getStorageSync('userSettings') || {}
    const themeName = userSettings.themeName || 'green'
    const fontSize = userSettings.fontSize || 'medium'
    
    // 设置字体大小值
    let fontSizeValue = 28
    if (fontSize === 'small') fontSizeValue = 24
    if (fontSize === 'large') fontSizeValue = 32
    
    this.setData({
      currentTheme: themeName,
      fontSizeValue
    })
  },

  // 加载收藏列表
  loadCollection() {
    const collectionList = wx.getStorageSync('collectionList') || []
    this.setData({
      collectionList: collectionList,
      loading: false
    })
  },

  // 跳转到植物详情
  goToPlantDetail(e) {
    const plant = e.currentTarget.dataset.plant
    wx.navigateTo({
      url: `/pages/plant-detail/plant-detail?plant=${encodeURIComponent(JSON.stringify(plant))}`
    })
  },

  // 取消收藏
  removeFromCollection(e) {
    const plant = e.currentTarget.dataset.plant
    const that = this
    
    wx.showModal({
      title: '确认取消收藏',
      content: `确定要取消收藏"${plant.title}"吗？`,
      success(res) {
        if (res.confirm) {
          const collectionList = wx.getStorageSync('collectionList') || []
          const newCollectionList = collectionList.filter(item => item.id !== plant.id)
          wx.setStorageSync('collectionList', newCollectionList)
          
          that.loadCollection()
          
          wx.showToast({
            title: '已取消收藏',
            icon: 'success'
          })
        }
      }
    })
  },

  // 清空收藏
  clearCollection() {
    const that = this
    
    wx.showModal({
      title: '确认清空收藏',
      content: '确定要清空所有收藏吗？此操作不可撤销。',
      success(res) {
        if (res.confirm) {
          wx.setStorageSync('collectionList', [])
          that.loadCollection()
          
          wx.showToast({
            title: '收藏已清空',
            icon: 'success'
          })
        }
      }
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '多肉花园 - 我的收藏',
      path: '/pages/collection/collection'
    }
  },
  
  // 主题切换回调
  onThemeChange(themeName) {
    this.setData({ currentTheme: themeName })
  },
  
  // 字体大小切换回调
  onFontSizeChange(fontSize) {
    let fontSizeValue = 28
    if (fontSize === 'small') fontSizeValue = 24
    if (fontSize === 'large') fontSizeValue = 32
    
    this.setData({ fontSizeValue })
  }
})