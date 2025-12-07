// index.js
Page({
  data: {
    plants: [],
    searchValue: '',
    loading: true,
    hasMore: true,
    page: 1,
    pageSize: 20
  },

  onLoad() {
    this.loadPlants()
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

    // 检查本地缓存
    const cachedPlants = wx.getStorageSync('plantsData')
    if (cachedPlants && cachedPlants.length > 0) {
      that.processPlantsData(cachedPlants)
      return
    }

    // 从网络获取数据
    wx.request({
      url: 'https://dai1254473705.github.io/flower/data/image-links.json',
      success(res) {
        if (res.statusCode === 200 && res.data) {
          // 缓存数据
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
    const startIndex = (this.data.page - 1) * this.data.pageSize
    const endIndex = startIndex + this.data.pageSize
    const currentPagePlants = plantsData.slice(startIndex, endIndex)
    
    // 更新收藏状态
    const collectionList = wx.getStorageSync('collectionList') || []
    const plantsWithCollection = currentPagePlants.map(plant => ({
      ...plant,
      isCollected: collectionList.some(item => item.id === plant.id)
    }))

    this.setData({
      plants: this.data.page === 1 ? plantsWithCollection : [...this.data.plants, ...plantsWithCollection],
      loading: false,
      hasMore: endIndex < plantsData.length
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
