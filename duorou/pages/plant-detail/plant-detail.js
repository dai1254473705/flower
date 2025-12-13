// pages/plant-detail/plant-detail.js
Page({
  data: {
    plant: null,
    isCollected: false,
    currentImageIndex: 0,
    showImagePreview: false,
    currentTheme: 'green', // 当前主题
    fontSizeValue: 28, // 默认字体大小
    articleGroups: [], // 文章分组数据
    currentTab: 'intro', // 当前选中的 tab: 'intro' 或 'articles'
    totalArticlesCount: 0, // 文章总数
    hasIntroContent: false // 是否有简介内容
  },

  onLoad(options) {
    if (options.plant) {
      const plant = JSON.parse(decodeURIComponent(options.plant))
      
      // 初始化主题和字体大小
      this.initThemeAndFontSize()
      
      // 处理文章分组
      const articleGroups = this.groupArticlesByType(plant.articles || [])
      const totalArticlesCount = (plant.articles || []).length
      
      // 判断简介内容是否为空
      const hasIntroContent = this.hasIntroContent(plant)
      
      this.setData({
        plant: plant,
        articleGroups: articleGroups,
        isCollected: this.checkCollectionStatus(plant.id),
        totalArticlesCount: totalArticlesCount,
        hasIntroContent: hasIntroContent
      })
      wx.setNavigationBarTitle({
        title: plant.title || '植物详情'
      })
    }
  },
  
  // 按类型分组文章
  groupArticlesByType(articles) {
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return []
    }
    
    const typeMap = {
      '种植方法': { icon: '📖', type: '种植方法', articles: [] },
      '生活习性': { icon: '🌱', type: '生活习性', articles: [] },
      '病虫害防治': { icon: '🐛', type: '病虫害防治', articles: [] },
      '繁殖技巧': { icon: '🌿', type: '繁殖技巧', articles: [] },
      '养护要点': { icon: '💧', type: '养护要点', articles: [] },
      '品种介绍': { icon: '📚', type: '品种介绍', articles: [] },
      '其他': { icon: '📝', type: '其他', articles: [] }
    }
    
    articles.forEach(article => {
      const type = (article.type || '其他').trim()
      if (typeMap[type]) {
        typeMap[type].articles.push(article)
      } else {
        typeMap['其他'].articles.push(article)
      }
    })
    
    // 过滤掉空的分组，并按顺序返回
    const groups = Object.values(typeMap).filter(group => group.articles.length > 0)
    
    // 按文章数量排序（可选，也可以保持固定顺序）
    // groups.sort((a, b) => b.articles.length - a.articles.length)
    
    return groups
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

  // 查看文章 - 直接打开 webview
  viewArticle(e) {
    const article = e.currentTarget.dataset.article
    if (article.url) {
      wx.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(article.url)}&title=${encodeURIComponent(article.title || '文章详情')}`
      })
    } else {
      wx.showToast({
        title: '文章链接不存在',
        icon: 'none'
      })
    }
  },

  // 分享功能
  onShareAppMessage() {
    const plant = this.data.plant
    return {
      title: `多肉小园 - ${plant.title}`,
      path: `/pages/plant-detail/plant-detail?plant=${encodeURIComponent(JSON.stringify(plant))}`,
      imageUrl: plant.src
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    const plant = this.data.plant
    return {
      title: `多肉小园 - ${plant.title}`,
      imageUrl: plant.src
    }
  },

  // 客服消息回调（当用户点击客服按钮后）
  onContactServiceMessage(e) {
    // 可以在这里处理客服消息的相关逻辑
    // e.detail 包含会话信息
    console.log('客服消息', e.detail)
    const plant = this.data.plant
    if (plant) {
      // 可以在这里自动发送当前植物信息给客服
      // 注意：需要在客服会话中手动发送，或者通过其他方式传递
    }
  },
  
  // 用户反馈（保留兼容性，现在使用 button 的 open-type="contact"）
  onFeedback() {
    // 已改为使用 button 的 open-type="contact"，此方法保留兼容性
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
  },
  
  // 页面显示时刷新主题和字体大小
  onShow() {
    this.initThemeAndFontSize()
  },
  
  // 切换 Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab
    })
  },
  
  // 判断是否有简介内容
  hasIntroContent(plant) {
    if (!plant) return false
    
    // 检查植物介绍
    if (plant.introduction && plant.introduction.trim()) {
      return true
    }
    
    // 检查形态特征
    if (plant.morphology && Array.isArray(plant.morphology) && plant.morphology.length > 0) {
      return true
    }
    
    // 检查养护要点
    if (plant.carePoints && Array.isArray(plant.carePoints) && plant.carePoints.length > 0) {
      return true
    }
    
    // 检查养护信息
    if (plant.careInfo) {
      const careInfo = plant.careInfo
      if (careInfo.wateringFrequency || careInfo.lightRequirement || 
          careInfo.suitableTemperature || careInfo.soilRequirement) {
        return true
      }
    }
    
    return false
  }
})