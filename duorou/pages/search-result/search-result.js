// pages/search-result/search-result.js
Page({
  data: {
    plants: [],
    keyword: '',
    loading: true,
    hasMore: true,
    page: 1,
    pageSize: 20,
    showSkeleton: true,
    skeletonCount: 6,
    currentTheme: 'green', // 当前主题
    fontSizeValue: 28 // 默认字体大小
  },

  onLoad(options) {
    const keyword = decodeURIComponent(options.keyword || '')
    this.setData({ keyword })
    wx.setNavigationBarTitle({
      title: `搜索: ${keyword}`
    })
    // 初始化主题和字体大小
    this.initThemeAndFontSize()
    this.searchPlants()
  },

  onShow() {
    // 初始化主题和字体大小
    this.initThemeAndFontSize()
    // 刷新收藏状态
    if (this.data.plants.length > 0) {
      this.updateCollectionStatus()
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

  // 搜索植物
  searchPlants() {
    const that = this
    this.setData({ loading: true, showSkeleton: true })

    const dataManager = require('../../utils/dataManager')
    const searchUtils = require('../../utils/searchUtils')
    
    // 使用数据管理工具获取数据
    dataManager.getPlantsData()
      .then(plantsData => {
        // 模拟网络延迟以展示骨架屏
        setTimeout(() => {
          that.processSearchResults(plantsData, searchUtils)
        }, 300)
      })
      .catch(err => {
        that.setData({ loading: false, showSkeleton: false })
        wx.showToast({
          title: err.message || '数据加载失败',
          icon: 'none'
        })
      })
  },

  // 处理搜索结果
  processSearchResults(plantsData, searchUtils) {
    const keyword = this.data.keyword
    
    // 使用搜索工具进行搜索
    let filteredPlants = searchUtils.searchPlants(plantsData, keyword)

    // 分页处理
    const startIndex = (this.data.page - 1) * this.data.pageSize
    const endIndex = startIndex + this.data.pageSize
    const currentPagePlants = filteredPlants.slice(startIndex, endIndex)
    
    // 更新收藏状态
    const collectionList = wx.getStorageSync('collectionList') || []
    const plantsWithCollection = currentPagePlants.map(plant => ({
      ...plant,
      isCollected: collectionList.some(item => item.id === plant.id)
    }))

    this.setData({
      plants: this.data.page === 1 ? plantsWithCollection : [...this.data.plants, ...plantsWithCollection],
      loading: false,
      hasMore: endIndex < filteredPlants.length,
      showSkeleton: false
    })
  },

  // 更新收藏状态
  updateCollectionStatus() {
    const collectionList = wx.getStorageSync('collectionList') || []
    const plants = this.data.plants.map(plant => ({
      ...plant,
      isCollected: collectionList.some(item => item.id === plant.id)
    }))
    this.setData({ plants })
  },

  // 跳转到植物详情
  goToPlantDetail(e) {
    const plant = e.currentTarget.dataset.plant
    wx.navigateTo({
      url: `/pages/plant-detail/plant-detail?plant=${encodeURIComponent(JSON.stringify(plant))}`
    })
  },

  // 收藏/取消收藏
  toggleCollection(e) {
    const plant = e.currentTarget.dataset.plant
    const collectionList = wx.getStorageSync('collectionList') || []
    
    if (plant.isCollected) {
      // 取消收藏
      const newCollectionList = collectionList.filter(item => item.id !== plant.id)
      wx.setStorageSync('collectionList', newCollectionList)
    } else {
      // 添加收藏
      collectionList.push(plant)
      wx.setStorageSync('collectionList', collectionList)
    }

    // 更新UI状态
    this.updateCollectionStatus()
    
    wx.showToast({
      title: plant.isCollected ? '已取消收藏' : '收藏成功',
      icon: 'success'
    })
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({
        page: this.data.page + 1
      })
      this.searchPlants()
    }
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: `多肉小园 - 搜索"${this.data.keyword}"`,
      path: `/pages/search-result/search-result?keyword=${encodeURIComponent(this.data.keyword)}`
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