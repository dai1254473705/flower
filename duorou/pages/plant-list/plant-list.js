// pages/plant-list/plant-list.js
Page({
  data: {
    plants: [],
    category: '',
    plantId: '',
    currentPlant: null,
    loading: true,
    hasMore: true,
    showNoMore: false, // 控制是否显示"没有更多数据"提示
    page: 1,
    pageSize: 20,
    showSkeleton: true,
    skeletonCount: 6,
    currentTheme: 'green', // 当前主题
    fontSizeValue: 28 // 默认字体大小
  },

  onLoad(options) {
    const category = decodeURIComponent(options.category || '')
    const plantId = options.plantId || ''
    const plantStr = options.plant || ''
    let currentPlant = null
    
    if (plantStr) {
      try {
        currentPlant = JSON.parse(decodeURIComponent(plantStr))
      } catch (e) {
        console.error('解析植物数据失败:', e)
      }
    }
    
    // 初始化主题和字体大小
    this.initThemeAndFontSize()
    
    this.setData({ 
      category, 
      plantId, 
      currentPlant 
    })
    
    // 设置导航栏标题
    if (currentPlant) {
      wx.setNavigationBarTitle({
        title: currentPlant.title || '植物详情'
      })
    } else {
      wx.setNavigationBarTitle({
        title: category || '植物列表'
      })
    }
    
    this.loadPlants()
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



  // 加载植物数据
  loadPlants() {
    const that = this
    this.setData({ loading: true, showSkeleton: true })

    // 检查本地缓存
    const cachedPlants = wx.getStorageSync('plantsData')
    if (cachedPlants && cachedPlants.length > 0) {
      // 模拟网络延迟以展示骨架屏
      setTimeout(() => {
        that.processPlantsData(cachedPlants)
      }, 300)
      return
    }

    // 从网络获取数据
    wx.request({
      url: 'https://dai1254473705.github.io/flower/data/image-links.json',
      success(res) {
        if (res.statusCode === 200 && res.data) {
          wx.setStorageSync('plantsData', res.data)
          that.processPlantsData(res.data)
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

  // 处理植物数据
  processPlantsData(plantsData) {
    let displayPlants = []
    let currentPlant = this.data.currentPlant
    
    // 如果有植物ID，显示单个植物及其文章列表
    if (this.data.plantId) {
      // 如果没有传递植物对象，则从数据中查找
      if (!currentPlant) {
        currentPlant = plantsData.find(plant => plant.id === this.data.plantId)
      }
      
      if (currentPlant) {
        displayPlants = [currentPlant]
      }
    } 
    // 否则按分类过滤
    else if (this.data.category) {
      displayPlants = plantsData.filter(plant => plant.category === this.data.category)
      // 分页处理
      const startIndex = (this.data.page - 1) * this.data.pageSize
      const endIndex = startIndex + this.data.pageSize
      displayPlants = displayPlants.slice(startIndex, endIndex)
    }
    // 否则显示所有植物
    else {
      displayPlants = plantsData
      // 分页处理
      const startIndex = (this.data.page - 1) * this.data.pageSize
      const endIndex = startIndex + this.data.pageSize
      displayPlants = displayPlants.slice(startIndex, endIndex)
    }

    // 更新收藏状态
    const collectionList = wx.getStorageSync('collectionList') || []
    const plantsWithCollection = displayPlants.map(plant => ({
      ...plant,
      isCollected: collectionList.some(item => item.id === plant.id),
      articles: plant.articles || [] // 确保文章列表存在
    }))

    const hasMoreData = displayPlants.length >= this.data.pageSize && !this.data.plantId
    this.setData({
      plants: this.data.page === 1 ? plantsWithCollection : [...this.data.plants, ...plantsWithCollection],
      currentPlant: currentPlant || null,
      loading: false,
      hasMore: hasMoreData,
      showNoMore: !hasMoreData && this.data.plants.length > 0, // 只有在没有更多数据且已经有数据时显示
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

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      page: 1,
      plants: []
    })
    this.loadPlants()
    wx.stopPullDownRefresh()
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({
        page: this.data.page + 1,
        showNoMore: false // 重置"没有更多数据"提示
      })
      this.loadPlants()
    }
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: `多肉花园 - ${this.data.category}植物`,
      path: `/pages/plant-list/plant-list?category=${encodeURIComponent(this.data.category)}`
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
    // 初始化主题和字体大小
    this.initThemeAndFontSize()
    
    // 刷新收藏状态
    if (this.data.plants.length > 0) {
      this.updateCollectionStatus()
    }
  }
})