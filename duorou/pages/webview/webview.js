// pages/webview/webview.js
Page({
  data: {
    url: '',
    title: '',
    currentTheme: 'green', // 当前主题
    fontSizeValue: 28 // 默认字体大小
  },

  onLoad(options) {
    const url = decodeURIComponent(options.url || '')
    const title = decodeURIComponent(options.title || '文章详情')
    
    // 初始化主题和字体大小
    this.initThemeAndFontSize()
    
    this.setData({
      url: url,
      title: title
    })
    
    wx.setNavigationBarTitle({
      title: title
    })
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
  
  // 页面显示时刷新主题和字体大小
  onShow() {
    this.initThemeAndFontSize()
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
  },

  // 页面加载完成
  onWebviewLoad(e) {
    console.log('Webview加载完成', e)
  },

  // 页面加载错误
  onWebviewError(e) {
    console.error('Webview加载错误', e)
    wx.showToast({
      title: '页面加载失败',
      icon: 'none'
    })
  }
})