// app.js
App({
  onLaunch() {
    // 初始化云开发（可选）
    if (wx.cloud) {
      wx.cloud.init({
        env: 'your-cloud-env-id', // 替换为你的云环境ID
        traceUser: true
      })
    }

    // 检查更新
    this.checkForUpdate()
    
    // 初始化缓存
    this.initStorage()
  },

  onShow() {
    // 小程序启动或从后台进入前台时
    console.log('多肉花园小程序启动')
  },

  onHide() {
    // 小程序从前台进入后台时
    console.log('多肉花园小程序进入后台')
  },

  // 检查更新
  checkForUpdate() {
    const updateManager = wx.getUpdateManager()
    
    updateManager.onCheckForUpdate((res) => {
      // 请求完新版本信息的回调
      console.log('检查更新结果:', res.hasUpdate)
    })
    
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    
    updateManager.onUpdateFailed(() => {
      // 新版本下载失败
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      })
    })
  },

  // 初始化本地存储
  initStorage() {
    // 初始化收藏列表
    if (!wx.getStorageSync('collectionList')) {
      wx.setStorageSync('collectionList', [])
    }
    
    // 初始化用户设置
    if (!wx.getStorageSync('userSettings')) {
      wx.setStorageSync('userSettings', {
        theme: 'light',
        imageQuality: 'high',
        cacheEnabled: true
      })
    }
  },

  // 全局错误处理
  onError(msg) {
    console.error('小程序发生错误:', msg)
    // 可以在这里上报错误到服务器
  },

  // 全局分享配置
  globalData: {
    userInfo: null,
    baseUrl: 'https://dai1254473705.github.io/flower/data/',
    version: '1.0.0'
  }
})
