// pages/plant-detail/plant-detail.js
Page({
  data: {
    plant: null,
    isCollected: false,
    currentImageIndex: 0,
    showImagePreview: false,
    currentTheme: 'green', // 当前主题
    fontSizeValue: 28 // 默认字体大小
  },

  onLoad(options) {
    if (options.plant) {
      const plant = JSON.parse(decodeURIComponent(options.plant))
      
      // 初始化主题和字体大小
      this.initThemeAndFontSize()
      
      this.setData({
        plant: plant,
        isCollected: this.checkCollectionStatus(plant.id)
      })
      wx.setNavigationBarTitle({
        title: plant.title || '植物详情'
      })
    }
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

  // 检查收藏状态
  checkCollectionStatus(plantId) {
    const collectionList = wx.getStorageSync('collectionList') || []
    return collectionList.some(item => item.id === plantId)
  },

  // 收藏/取消收藏
  toggleCollection() {
    const plant = this.data.plant
    const collectionList = wx.getStorageSync('collectionList') || []
    
    if (this.data.isCollected) {
      // 取消收藏
      const newCollectionList = collectionList.filter(item => item.id !== plant.id)
      wx.setStorageSync('collectionList', newCollectionList)
      this.setData({ isCollected: false })
      wx.showToast({
        title: '已取消收藏',
        icon: 'success'
      })
    } else {
      // 添加收藏
      collectionList.push(plant)
      wx.setStorageSync('collectionList', collectionList)
      this.setData({ isCollected: true })
      wx.showToast({
        title: '收藏成功',
        icon: 'success'
      })
    }
  },

  // 预览图片
  previewImage() {
    const plant = this.data.plant
    if (plant.src) {
      wx.previewImage({
        urls: [plant.src],
        current: plant.src
      })
    }
  },

  // 查看文章
  viewArticle(e) {
    const article = e.currentTarget.dataset.article
    if (article.url) {
      wx.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(article.url)}&title=${encodeURIComponent(article.title)}`
      })
    }
  },

  // 分享功能
  onShareAppMessage() {
    const plant = this.data.plant
    return {
      title: `多肉花园 - ${plant.title}`,
      path: `/pages/plant-detail/plant-detail?plant=${encodeURIComponent(JSON.stringify(plant))}`,
      imageUrl: plant.src
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    const plant = this.data.plant
    return {
      title: `多肉花园 - ${plant.title}`,
      imageUrl: plant.src
    }
  },

  // 用户反馈
  onFeedback() {
    wx.showModal({
      title: '用户反馈',
      content: '您可以通过以下方式联系我们：\n1. 发送邮件至 feedback@duorou.com\n2. 在公众号留言\n3. 添加客服微信',
      showCancel: false,
      confirmText: '知道了'
    })
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
  
  // 页面显示时刷新主题和字体大小
  onShow() {
    this.initThemeAndFontSize()
  }
})