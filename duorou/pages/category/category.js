// pages/category/category.js
Page({
  data: {
    categories: [],
    loading: true,
    currentTheme: 'green', // 当前主题
    fontSizeValue: 28 // 默认字体大小
  },

  onLoad() {
    // 初始化主题和字体大小
    this.initThemeAndFontSize()
    
    this.loadCategories()
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

  // 加载分类数据
  loadCategories() {
    const that = this
    
    // 检查本地缓存
    const cachedPlants = wx.getStorageSync('plantsData')
    if (cachedPlants && cachedPlants.length > 0) {
      that.processCategoriesData(cachedPlants)
      return
    }

    // 从网络获取数据
    wx.request({
      url: 'https://dai1254473705.github.io/flower/data/image-links.json',
      success(res) {
        if (res.statusCode === 200 && res.data) {
          wx.setStorageSync('plantsData', res.data)
          that.processCategoriesData(res.data)
        } else {
          that.setData({ loading: false })
          wx.showToast({
            title: '数据加载失败',
            icon: 'none'
          })
        }
      },
      fail() {
        that.setData({ loading: false })
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  // 处理分类数据
  processCategoriesData(plantsData) {
    // 提取所有分类并统计数量
    const categoryMap = {}
    plantsData.forEach(plant => {
      if (plant.category) {
        if (!categoryMap[plant.category]) {
          categoryMap[plant.category] = 0
        }
        categoryMap[plant.category]++
      }
    })

    // 转换为数组格式
    const categories = Object.keys(categoryMap).map(category => ({
      name: category,
      count: categoryMap[category],
      icon: this.getCategoryIcon(category)
    }))

    this.setData({
      categories: categories.sort((a, b) => b.count - a.count),
      loading: false
    })
  },

  // 获取分类图标
  getCategoryIcon(category) {
    const iconMap = {
      '景天科': '🌵',
      '番杏科': '🌿',
      '仙人掌科': '🌵',
      '百合科': '🌸',
      '龙舌兰科': '🌱',
      '大戟科': '🍃',
      '萝藦科': '🌺',
      '菊科': '🌼',
      '马齿苋科': '🍀'
    }
    return iconMap[category] || '🌱'
  },

  // 跳转到分类植物列表
  goToPlantList(e) {
    const category = e.currentTarget.dataset.category
    wx.navigateTo({
      url: `/pages/plant-list/plant-list?category=${encodeURIComponent(category)}`
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '多肉花园 - 植物分类',
      path: '/pages/category/category'
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
  },
  
  // 页面显示时刷新主题和字体大小
  onShow() {
    this.initThemeAndFontSize()
  }
})