// index.js
Page({
  data: {
    plants: [], // 当前展示的植物（已按分类过滤）
    allPlants: [], // 全量植物列表
    categories: [], // 分类列表
    activeCategory: '全部', // 当前选择的分类
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
        title: '多肉小园'
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
  
  // 跳转到设置页面
  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  onShow() {
    // 重新读取主题和字体大小（确保从设置页返回时能更新）
    this.initThemeAndFontSize()
    // 刷新收藏状态
    if (this.data.plants.length > 0) {
      this.updateCollectionStatus()
    }
  },

  // 加载植物数据
  loadPlants() {
    const that = this
    this.setData({ loading: true })

    const dataManager = require('../../utils/dataManager')
    
    // 使用数据管理工具获取数据
    dataManager.getPlantsData()
      .then(plantsData => {
        that.processPlantsData(plantsData)
      })
      .catch(err => {
        that.setData({ loading: false, showSkeleton: false })
        wx.showToast({
          title: err.message || '数据加载失败',
          icon: 'none'
        })
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

    const categories = this.buildCategories(plantsWithCollection)

    this.setData({
      allPlants: plantsWithCollection,
      categories,
      activeCategory: '全部',
      plants: plantsWithCollection,
      loading: false,
      showSkeleton: false, // 隐藏骨架屏
      hasMore: false // 所有数据已加载，但不显示"没有更多数据"提示
    })
  },

  // 更新收藏状态
  updateCollectionStatus() {
    const collectionList = wx.getStorageSync('collectionList') || []
    const allPlants = this.data.allPlants.map(plant => ({
      ...plant,
      isCollected: collectionList.some(item => item.id === plant.id)
    }))

    const currentCategory = this.data.activeCategory || '全部'
    const filteredPlants = currentCategory === '全部'
      ? allPlants
      : allPlants.filter(plant => plant.category === currentCategory)

    this.setData({
      allPlants,
      plants: filteredPlants
    })
  },

  // 构建分类列表
  buildCategories(plants) {
    const categoryMap = {}
    let uncategorizedCount = 0
    plants.forEach(plant => {
      if (plant.category) {
        categoryMap[plant.category] = (categoryMap[plant.category] || 0) + 1
      } else {
        uncategorizedCount++
      }
    })

    const categories = Object.keys(categoryMap).map(name => ({
      name,
      count: categoryMap[name],
      icon: this.getCategoryIcon(name)
    }))

    const list = [
      { name: '全部', count: plants.length, icon: '📋' },
      ...categories.sort((a, b) => b.count - a.count)
    ]

    // 将未分类放在末尾
    if (uncategorizedCount > 0) {
      list.push({
        name: '未分类',
        count: uncategorizedCount,
        icon: '📦'
      })
    }

    return list
  },

  // 分类选择
  onSelectCategory(e) {
    const category = e.currentTarget.dataset.category
    this.updateFilteredPlants(category)
  },

  // 根据分类过滤植物
  updateFilteredPlants(category = '全部') {
    const targetCategory = category || '全部'
    let filteredPlants = []
    
    if (targetCategory === '全部') {
      filteredPlants = this.data.allPlants
    } else if (targetCategory === '未分类') {
      // 未分类：category 为空、null、undefined 或不存在
      filteredPlants = this.data.allPlants.filter(plant => !plant.category || plant.category.trim() === '')
    } else {
      // 其他分类：精确匹配
      filteredPlants = this.data.allPlants.filter(plant => plant.category === targetCategory)
    }

    this.setData({
      activeCategory: targetCategory,
      plants: filteredPlants
    })
  },

  // 分类图标
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
  // 跳转到植物详情页面
  goToPlantList(e) {
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
      title: '多肉小园 - 发现美丽的多肉植物',
      path: '/pages/index/index'
    }
  }
})
