// pages/webview/webview.js
Page({
  data: {
    url: '',
    title: ''
  },

  onLoad(options) {
    const url = decodeURIComponent(options.url || '')
    const title = decodeURIComponent(options.title || '文章详情')
    
    this.setData({
      url: url,
      title: title
    })
    
    wx.setNavigationBarTitle({
      title: title
    })
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