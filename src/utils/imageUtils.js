// 图片路径处理
export const normalizeImagePath = (path) => {
  if (!path) return '';
  return '/' + path.replace(/^public\//, 'flower/');
};

// 获取图片显示源
export const getImageDisplaySrc = (srcIcon, srcList, placeholder) => {
  const srcItem = srcIcon || (srcList && srcList.length > 0 ? srcList[0] : null);
  const hasLocal = !!(srcItem && srcItem.local);
  if (hasLocal) {
    return normalizeImagePath(srcItem.local);
  }
  return placeholder;
};

// 检查图片状态
export const getImageStatus = (srcIcon, srcList) => {
  const srcItem = srcIcon || (srcList && srcList.length > 0 ? srcList[0] : null);
  return {
    hasLocal: !!(srcItem && srcItem.local),
    hasRemote: !!(srcItem && srcItem.remote),
    srcItem
  };
};

