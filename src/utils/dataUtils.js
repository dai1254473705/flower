// 解析多行文本为数组
export const parseLines = (text) => {
  if (!text) return [];
  return text.split('\n').map(l => l.trim()).filter(Boolean);
};

// 将数组转换为多行文本
export const stringifyList = (list) => {
  if (!Array.isArray(list)) return '';
  return list.map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join('\n');
};

// 灵活解析列表（支持JSON或换行）
export const parseFlexibleList = (text) => {
  const trimmed = (text || '').trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // fallback to line split
    }
  }
  return parseLines(trimmed);
};

// 标准化数据项
export const normalizeImageItem = (item) => {
  const srcListArr = Array.isArray(item.srcList) ? item.srcList : [];
  const legacySrc =
    srcListArr.length > 0
      ? srcListArr[0]
      : item.src
        ? { local: '', remote: item.src }
        : { local: '', remote: '' };
  const srcIcon = item.srcIcon || legacySrc;
  return {
    ...item,
    category: item.category || '未分类',
    articles: item.articles || [],
    srcIcon,
    srcList: srcListArr
  };
};

