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
    
    // 将主题名转换为带 -theme 后缀的类名
    const themeClass = `${themeName}-theme`
    
    this.setData({
      currentTheme: themeClass,
      fontSizeValue
    })
    
    // 更新导航栏颜色
    this.applyTheme(themeName)
  },
  
  // 应用主题到导航栏
  applyTheme(themeName) {
    let navigationBarColor = '#ffffff'
    let frontColor = '#000000'
    
    switch(themeName) {
      case 'green':
        navigationBarColor = '#4CAF50'
        frontColor = '#ffffff'
        break
      case 'blue':
        navigationBarColor = '#2196F3'
        frontColor = '#ffffff'
        break
      case 'pink':
        navigationBarColor = '#E91E63'
        frontColor = '#ffffff'
        break
      case 'purple':
        navigationBarColor = '#9C27B0'
        frontColor = '#ffffff'
        break
      case 'dark':
        navigationBarColor = '#212121'
        frontColor = '#ffffff'
        break
      default:
        navigationBarColor = '#ffffff'
        frontColor = '#000000'
    }
    
    wx.setNavigationBarColor({
      frontColor: frontColor,
      backgroundColor: navigationBarColor
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
      title: '多肉小园 - 我的收藏',
      path: '/pages/collection/collection'
    }
  },
  
  // 主题切换回调
  onThemeChange(themeName) {
    const themeClass = `${themeName}-theme`
    this.setData({ currentTheme: themeClass })
    this.applyTheme(themeName)
  },
  
  // 字体大小切换回调
  onFontSizeChange(fontSize) {
    let fontSizeValue = 28
    if (fontSize === 'small') fontSizeValue = 24
    if (fontSize === 'large') fontSizeValue = 32
    
    this.setData({ fontSizeValue })
  }
})