// index.js
Page({
  data: {
    plants: [],
    banners: [], // 轮播图数据
    searchValue: '',
    loading: true,
    hasMore: true,
    showNoMore: false, // 控制是否显示"没有更多数据"提示
    page: 1,
    pageSize: 20,
    skeletonCount: 8, // 骨架屏数量
    showSkeleton: true, // 是否显示骨架屏
    statusBarHeight: 0, // 状态栏高度
    currentTheme: 'green', // 当前主题
    fontSizeValue: 28, // 默认字体大小
    defaultBanners: [ // 默认轮播图数据（当JSON中没有banner字段时使用）
      {
        id: 1,
        image: 'https://mmbiz.qpic.cn/sz_mmbiz_jpg/venVgYic7svSmSgiaN806tNPsiaThgqWloRVKBR8B4uQWLZ7PCdYenFxmNTh1eYAPVdwMBia6emTCcQgH6zb8LKKYg/0?from=appmsg',
        title: '多肉花园'
      },
      {
        id: 2,
        image: 'https://mmbiz.qpic.cn/sz_mmbiz_jpg/venVgYic7svSmSgiaN806tNPsiaThgqWloRsibibxjljR3KXU8FE9H9ObzjhbEbKUHRiaM8wtftLY1KdyDHsCmdpT7kw/0?from=appmsg',
        title: '发现多肉之美'
      },
      {
        id: 3,
        image: 'https://mmbiz.qpic.cn/sz_mmbiz_jpg/venVgYic7svSmSgiaN806tNPsiaThgqWloRsCSRicqukwHUjeZDrfpmBkbY4YQjHJFCc049KVfm5ia9snUWraTtebAQ/0?from=appmsg',
        title: '多肉百科全书'
      }
    ]
  },

  onLoad() {
    // 获取状态栏高度并应用到样式
    const app = getApp()
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || wx.getStorageSync('statusBarHeight') || 0
    })
    
    // 初始化主题和字体大小
    this.initThemeAndFontSize()
    
    // 显示骨架屏300毫秒后加载数据
    setTimeout(() => {
      this.loadPlants()
    }, 300)
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
  
  // 跳转到设置页面
  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  onShow() {
    // 刷新收藏状态
    if (this.data.plants.length > 0) {
      this.updateCollectionStatus()
    }
  },

  // 加载植物数据
  loadPlants() {
    const that = this
    this.setData({ loading: true })

    // 从网络获取数据
    wx.request({
      url: 'https://dai1254473705.github.io/flower/data/image-links.json',
      success(res) {
        if (res.statusCode === 200 && res.data) {
          // 缓存数据
          wx.setStorageSync('plantsData', res.data)
          that.processPlantsData(res.data)
        } else {
          // 网络请求失败，尝试从缓存获取
          const cachedPlants = wx.getStorageSync('plantsData')
          if (cachedPlants && cachedPlants.length > 0) {
            that.processPlantsData(cachedPlants)
            wx.showToast({
              title: '使用缓存数据',
              icon: 'none'
            })
          } else {
            that.setData({ loading: false, showSkeleton: false })
            wx.showToast({
              title: '数据加载失败',
              icon: 'none'
            })
          }
        }
      },
      fail() {
        // 网络错误，尝试从缓存获取
        const cachedPlants = wx.getStorageSync('plantsData')
        if (cachedPlants && cachedPlants.length > 0) {
          that.processPlantsData(cachedPlants)
          wx.showToast({
            title: '使用缓存数据',
            icon: 'none'
          })
        } else {
          that.setData({ loading: false, showSkeleton: false })
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          })
        }
      }
    })
  },

  // 处理植物数据
  processPlantsData(plantsData) {
    // 检查数据是否有效
    if (!Array.isArray(plantsData)) {
      this.setData({ loading: false, showSkeleton: false })
      wx.showToast({
        title: '数据格式错误',
        icon: 'none'
      })
      return
    }

    // 先加载所有数据，暂不使用分页（后续可优化）
    const allPlants = plantsData
    
    // 更新收藏状态
    const collectionList = wx.getStorageSync('collectionList') || []
    const plantsWithCollection = allPlants.map(plant => ({
      ...plant,
      isCollected: collectionList.some(item => item.id === plant.id)
    }))

    // 处理轮播图数据 - 检查plantsData[0]是否包含banner字段
    let banners = this.data.defaultBanners
    if (plantsData[0] && plantsData[0].banner && Array.isArray(plantsData[0].banner)) {
      banners = plantsData[0].banner
    }

    this.setData({
      plants: plantsWithCollection,
      banners: banners,
      loading: false,
      showSkeleton: false, // 隐藏骨架屏
      hasMore: false // 所有数据已加载，但不显示"没有更多数据"提示
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

  // 搜索功能
  onSearchInput(e) {
    this.setData({
      searchValue: e.detail.value
    })
  },

  // 执行搜索
  onSearch() {
    if (this.data.searchValue.trim()) {
      wx.navigateTo({
        url: `/pages/search-result/search-result?keyword=${this.data.searchValue}`
      })
    }
  },

  // 跳转到分类页面
  goToCategory() {
    wx.navigateTo({
      url: '/pages/category/category'
    })
  },

  // 跳转到植物列表页面
  goToPlantList(e) {
    const plant = e.currentTarget.dataset.plant
    wx.navigateTo({
      url: `/pages/plant-list/plant-list?plantId=${plant.id}&plant=${encodeURIComponent(JSON.stringify(plant))}`
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
      plants: [],
      showSkeleton: true,
      showNoMore: false // 重置"没有更多数据"提示
    })
    setTimeout(() => {
      this.loadPlants()
      wx.stopPullDownRefresh()
    }, 300)
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({
        page: this.data.page + 1
      })
      this.loadPlants()
    }
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '多肉花园 - 发现美丽的多肉植物',
      path: '/pages/index/index'
    }
  }
})
