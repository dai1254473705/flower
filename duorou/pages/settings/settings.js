// settings.js
Page({
  data: {
    themes: [
      { id: 'green', name: '清新绿', colors: ['#4CAF50', '#81C784', '#C8E6C9'] },
      { id: 'blue', name: '天空蓝', colors: ['#2196F3', '#64B5F6', '#BBDEFB'] },
      { id: 'pink', name: '浪漫粉', colors: ['#E91E63', '#F06292', '#F8BBD0'] },
      { id: 'purple', name: '优雅紫', colors: ['#9C27B0', '#BA68C8', '#E1BEE7'] },
      { id: 'dark', name: '深色主题', colors: ['#212121', '#424242', '#757575'] }
    ],
    userSettings: {
      themeName: 'green',
      fontSize: 'medium',
      imageQuality: 'high',
      cacheEnabled: true
    },
    cacheSize: 0,
    currentTheme: 'green', // 当前主题
    fontSizeValue: 28 // 默认字体大小
  },

  onLoad() {
    this.initThemeAndFontSize()
    this.loadUserSettings()
    this.calculateCacheSize()
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

  // 加载用户设置
  loadUserSettings() {
    const userSettings = wx.getStorageSync('userSettings') || {}
    this.setData({
      userSettings: {
        themeName: userSettings.themeName || 'green',
        fontSize: userSettings.fontSize || 'medium',
        imageQuality: userSettings.imageQuality || 'high',
        cacheEnabled: userSettings.cacheEnabled !== false
      }
    })
  },

  // 计算缓存大小
  calculateCacheSize() {
    wx.getStorageInfo({
      success: (res) => {
        const cacheSize = (res.currentSize / 1024).toFixed(2)
        this.setData({ cacheSize })
      }
    })
  },

  // 切换主题
  onThemeChange(e) {
    // 支持两种调用方式：1. 通过事件调用 2. 直接传递themeName
    const themeName = typeof e === 'string' ? e : e.currentTarget.dataset.theme
    const userSettings = {
      ...this.data.userSettings,
      themeName,
      theme: themeName === 'dark' ? 'dark' : 'light'
    }
    wx.setStorageSync('userSettings', userSettings)
    
    // 将主题名转换为带 -theme 后缀的类名
    const themeClass = `${themeName}-theme`
    
    // 更新当前设置页面的主题
    this.setData({ 
      userSettings,
      currentTheme: themeClass
    })
    
    // 应用主题到导航栏
    this.applyTheme(themeName)
    
    // 通知所有页面更新主题（包括当前页面栈中的页面）
    const pages = getCurrentPages()
    pages.forEach(page => {
      // 避免对当前设置页再次调用导致递归
      if (page !== this && page.onThemeChange) {
        page.onThemeChange(themeName)
      }
    })
    
    wx.showToast({
      title: '主题已更新',
      icon: 'success',
      duration: 1500
    })
  },

  // 应用主题到导航栏
  applyTheme(themeName) {
    // 根据主题切换导航栏颜色
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

  // 清除缓存
  onClearCache() {
    const that = this
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除缓存
          wx.clearStorage({
            success: () => {
              // 重新计算缓存大小
              that.calculateCacheSize()
              // 重新初始化设置
              that.loadUserSettings()
              wx.showToast({
                title: '缓存已清除',
                icon: 'success'
              })
            },
            fail: () => {
              wx.showToast({
                title: '清除失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '多肉小园 - 个性化设置',
      path: '/pages/settings/settings'
    }
  }
})