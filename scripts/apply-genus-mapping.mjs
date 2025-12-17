import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source of truth from user-provided list
const MAPPINGS = [
  // 景天科
  { title: '大和峰', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Yamato Mine'", core: '莲座状，叶片灰绿带红边' },
  { title: '大疣朱紫玉', family: '景天科', genusZh: '青锁龙属', enTitle: "Crassula marnieriana 'Warty'", core: '茎肉质，叶片带凸起疣点' },
  { title: '天之泉', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Ten no Izumi'", core: '杂交品种，叶色浅粉绿' },
  { title: '天堂花', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Paradise Flower'", core: '莲座舒展，花色淡雅' },
  { title: '宇玉殿（灵石）', family: '景天科', genusZh: '青锁龙属', enTitle: "Crassula 'In灵石'", core: '小型丛生，叶片紧凑呈灰绿色' },
  { title: '宝丽安娜', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Brianna'", core: '叶边红边明显，莲座规整' },
  { title: '弗兰克', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Frank Reinelt'", core: '经典红色系，叶尖鲜红' },
  { title: '戴冠曲', family: '景天科', genusZh: '景天属', enTitle: "Sedum 'Cristatum'", core: '缀化品种，茎干扁平呈扇形' },
  { title: '棕玫瑰', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Brown Rose'", core: '叶色棕红，莲座似玫瑰' },
  { title: '橘子球', family: '景天科', genusZh: '景天属', enTitle: "Sedum 'Orange Ball'", core: '小型球状，叶色橙黄' },
  { title: '汤姆漫画', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria \"Tom's Comics\"", core: '叶片带斑纹，色彩丰富' },
  { title: '海姆里克', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Heimlich'", core: '杂交品种，叶厚呈蓝绿色' },
  { title: '火之鸟', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Fire Bird'", core: '叶色鲜红，莲座紧凑' },
  { title: '火星兔子', family: '景天科', genusZh: '青锁龙属', enTitle: "Crassula 'Mars Rabbit'", core: '小型丛生，叶形小巧似兔耳' },
  { title: '火焰', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Flame'", core: '叶边深红，整体似火焰' },
  { title: '爱可儿', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Aiko'", core: '叶色浅粉，莲座精致' },
  { title: '特里尔宝石', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Trier Jewel'", core: '叶尖带粉，质感通透' },
  { title: '狂野男爵', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Wild Baron'", core: '叶片布满疣点，造型独特' },
  { title: '白夜香槟', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'White Night Champagne'", core: '香槟变种，叶色白绿透粉' },
  { title: '白花小松', family: '景天科', genusZh: '景天属', enTitle: "Sedum pachyphyllum 'Album'", core: '叶尖白边，小花白色' },
  { title: '紫红牡丹', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Purple Red Peony'", core: '叶色紫红，莲座似牡丹' },
  { title: '约瑟琳', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Jocelyn'", core: '叶厚呈蓝紫，状态下偏红' },
  { title: '纱维红', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Sahara Red'", core: '叶色深红，质感细腻' },
  { title: '绿蔷薇', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Green Rose'", core: '莲座似蔷薇，叶色嫩绿' },
  { title: '绿风', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Green Wind'", core: '叶形修长，叶色浅绿' },
  { title: '绿龟之卵', family: '景天科', genusZh: '景天属', enTitle: 'Sedum hernandezii', core: '叶形似龟卵，绿色带纹路' },
  { title: '胜利骑兵', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Victory Rider'", core: '叶边红边锐利，莲座周正' },
  { title: '艾格尼斯玫瑰', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Agnes Rose'", core: '叶形卷边，似包拢的玫瑰' },
  { title: '荷花', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Lotus'", core: '莲座似荷花，叶尖带红' },
  { title: '莫兰', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Maureen'", core: '叶色粉紫，状态下偏红' },
  { title: '莱恩小精灵', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Lane Elf'", core: '小型品种，叶色蓝绿' },
  { title: '蒂凡尼', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Tiffany'", core: '叶色浅粉，莲座圆润' },
  { title: '蓝光', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Blue Light'", core: '大型蓝色系，叶边透粉' },
  { title: '蓝精灵', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Blue Elf'", core: '小型蓝色，叶尖带红' },
  { title: '蜜糖', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Honey'", core: '叶色金黄，质感甜润' },
  { title: '贝飞达', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Befida'", core: '杂交品种，叶色浅绿透粉' },
  { title: '赤豆白石', family: '景天科', genusZh: '景天属', enTitle: "Sedum 'Red Bean White Stone'", core: '叶小，红白相间似豆石' },
  { title: '金枝玉叶', family: '景天科', genusZh: '马齿苋属', enTitle: 'Portulacaria afra', core: '灌木状，叶小呈翠绿色' },
  { title: '金蜡冬云', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Golden Wax Winter Cloud'", core: '冬云系，叶色金黄带蜡质感' },
  { title: '长绳串葫芦', family: '景天科', genusZh: '青锁龙属', enTitle: 'Crassula rupestris', core: '茎细长，叶片串状似葫芦' },
  { title: '雅乐之华', family: '景天科', genusZh: '马齿苋属', enTitle: "Portulacaria afra 'Variegata'", core: '金枝玉叶全锦品种，叶带白/粉斑' },
  { title: '雅乐之舞', family: '景天科', genusZh: '马齿苋属', enTitle: "Portulacaria afra 'Foliis Variegatis'", core: '金枝玉叶斑叶品种，绿/白/粉相间' },
  { title: '香水', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Perfume'", core: '部分个体带淡淡香气，叶色浅紫' },
  { title: '黄色星', family: '景天科', genusZh: '景天属', enTitle: "Sedum 'Yellow Star'", core: '叶形星状，整体呈黄色' },
  { title: '黄金玉杯', family: '景天科', genusZh: '拟石莲花属', enTitle: "Echeveria 'Golden Jade Cup'", core: '杯状莲座，叶色金黄' },

  // 阿福花科（原百合科）→ 这里按你现有分类仍落在「百合科」
  { title: '木叶克里克特', family: '百合科', genusZh: '十二卷属', enTitle: "Haworthia truncata var. maughanii 'Kikutori'", core: '克里克特寿，叶窗有木叶状纹路' },
  { title: '樱水晶', family: '百合科', genusZh: '十二卷属', enTitle: 'Haworthia cooperi var. pilifera', core: '经典玉露，叶窗通透' },
  { title: '草水晶', family: '百合科', genusZh: '十二卷属', enTitle: "Haworthia 'Grass Crystal'", core: '小型玉露类，叶形纤细' },
  { title: '菊化石', family: '百合科', genusZh: '十二卷属', enTitle: "Haworthia truncata 'Kikukaishi'", core: '玉扇变种，叶窗纹路似菊花' },
  { title: '血红玛丽安', family: '百合科', genusZh: '十二卷属', enTitle: "Haworthia maughanii 'Blood Red Marian'", core: '玛丽安寿，叶色深红' },

  // 苦苣苔科
  { title: '断崖女王', family: '苦苣苔科', genusZh: '岩桐属', enTitle: 'Sinningia leucotricha', core: '块根多肉，叶被绒毛，花红色' },

  // 番杏科
  { title: '水史扑鹰爪', family: '番杏科', genusZh: '鹰爪属', enTitle: "Faucaria subintegra 'Shui Shi Pu'", core: '叶片带齿，形似鹰爪' },

  // 伽蓝菜属（景天科）
  { title: '雀扇', family: '景天科', genusZh: '伽蓝菜属', enTitle: 'Kalanchoe rhombopilosa', core: '叶形似雀扇，表面有斑点' }
];

function guessGenusEn(enTitle) {
  if (!enTitle) return '';
  const first = String(enTitle).trim().split(/\s+/)[0];
  // Remove leading punctuation
  return first.replace(/^[("'*]+/, '').replace(/[)"'*]+$/, '');
}

function normalizeItem(item) {
  // Ensure key order (category -> genus right after it)
  return {
    id: item.id,
    title: item.title,
    enTitle: item.enTitle ?? '',
    category: item.category ?? '',
    genus: item.genus ?? '',
    articles: item.articles ?? [],
    introduction: item.introduction ?? '',
    morphology: item.morphology ?? [],
    carePoints: item.carePoints ?? [],
    careInfo: item.careInfo ?? {},
    srcList: item.srcList ?? [],
    srcIcon: item.srcIcon ?? { local: '', remote: '' }
  };
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function main() {
  const repoRoot = path.join(__dirname, '..');
  const dataDir = path.join(repoRoot, 'public', 'data');
  const categoryDir = path.join(dataDir, 'category');
  const categoryConfigPath = path.join(dataDir, 'category-config.json');
  const genusConfigPath = path.join(dataDir, 'genus-config.json');
  const iconsRoot = path.join(repoRoot, 'public', 'images', 'icon');

  const categoryConfig = JSON.parse(await fs.readFile(categoryConfigPath, 'utf-8'));
  const categorySet = new Set((categoryConfig.categories || []).map((c) => c?.name).filter(Boolean));

  // Load all category files into memory
  const files = await fs.readdir(categoryDir, { withFileTypes: true });
  const categories = new Map(); // name -> items[]
  for (const f of files) {
    if (!f.isFile() || !f.name.endsWith('.json')) continue;
    const name = f.name.replace(/\.json$/i, '');
    const items = JSON.parse(await fs.readFile(path.join(categoryDir, f.name), 'utf-8'));
    categories.set(name, Array.isArray(items) ? items : []);
  }

  const genusMap = new Map(); // genusZh -> { name, enName, families:Set }

  let moved = 0;
  let updated = 0;
  let createdCategory = 0;
  let movedIcons = 0;

  const findItem = (title) => {
    for (const [cat, arr] of categories.entries()) {
      const idx = arr.findIndex((it) => (it?.title || '') === title);
      if (idx >= 0) return { cat, arr, idx, item: arr[idx] };
    }
    return null;
  };

  for (const m of MAPPINGS) {
    // Ensure category exists
    if (!categories.has(m.family)) {
      categories.set(m.family, []);
      createdCategory += 1;
    }
    if (!categorySet.has(m.family)) {
      categoryConfig.categories = categoryConfig.categories || [];
      categoryConfig.categories.push({
        name: m.family,
        description: `${m.family}多肉植物，形态独特，观赏价值高，适合盆栽观赏`
      });
      categorySet.add(m.family);
    }

    // Record genus unique list
    const genusEn = guessGenusEn(m.enTitle);
    if (!genusMap.has(m.genusZh)) {
      genusMap.set(m.genusZh, { name: m.genusZh, enName: genusEn, families: new Set([m.family]) });
    } else {
      const g = genusMap.get(m.genusZh);
      if (!g.enName && genusEn) g.enName = genusEn;
      g.families.add(m.family);
    }

    const found = findItem(m.title);
    if (!found) continue;

    const { cat: fromCat, arr: fromArr, idx, item } = found;

    // Update fields
    const genericIntro = '是多肉植物，形态优美，观赏价值高，适合盆栽观赏。';
    if (typeof item.introduction === 'string' && item.introduction.includes(genericIntro)) {
      item.introduction = `${m.core}。`;
    } else if (m.core && typeof item.introduction === 'string' && !item.introduction.includes(m.core)) {
      item.introduction = item.introduction ? `${item.introduction} 核心特征：${m.core}。` : `${m.core}。`;
    }

    item.category = m.family;
    item.genus = m.genusZh;
    if (m.enTitle) item.enTitle = m.enTitle;

    // Move item if needed
    if (fromCat !== m.family) {
      fromArr.splice(idx, 1);
      categories.get(m.family).push(item);
      moved += 1;
    } else {
      updated += 1;
    }

    // Move icon if it lives in 未分类 folder
    const local = item?.srcIcon?.local || '';
    if (typeof local === 'string' && local.includes('/images/icon/未分类/')) {
      const filename = path.basename(local);
      const fromAbs = path.join(repoRoot, local);
      const toRel = `public/images/icon/${m.family}/${filename}`;
      const toAbs = path.join(repoRoot, toRel);
      if (await fileExists(fromAbs)) {
        await ensureDir(path.dirname(toAbs));
        // If target doesn't exist, rename; otherwise keep original.
        if (!(await fileExists(toAbs))) {
          await fs.rename(fromAbs, toAbs);
        }
        item.srcIcon.local = toRel;
        movedIcons += 1;
      } else {
        // still update the path to match category folder (best effort)
        item.srcIcon.local = toRel;
      }
    }
  }

  // Write back all category files (stable order by id)
  for (const [cat, arr] of categories.entries()) {
    arr.sort((a, b) => (Number(a?.id) || 0) - (Number(b?.id) || 0));
    const normalized = arr.map((it) => normalizeItem(it));
    await fs.writeFile(path.join(categoryDir, `${cat}.json`), JSON.stringify(normalized, null, 2), 'utf-8');
  }

  // Write genus-config.json (dedup)
  const genera = Array.from(genusMap.values())
    .map((g) => ({ name: g.name, enName: g.enName || '', families: Array.from(g.families).sort() }))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN-u-co-pinyin'));
  await fs.writeFile(genusConfigPath, JSON.stringify({ genera }, null, 2), 'utf-8');

  // Keep category-config sorted by name for stability
  categoryConfig.categories = (categoryConfig.categories || []).slice().sort((a, b) => {
    return String(a?.name || '').localeCompare(String(b?.name || ''), 'zh-Hans-CN-u-co-pinyin');
  });
  await fs.writeFile(categoryConfigPath, JSON.stringify(categoryConfig, null, 2), 'utf-8');

  // Ensure icons dir for any newly created category exists (optional)
  for (const cat of categories.keys()) {
    await ensureDir(path.join(iconsRoot, cat));
  }

  console.log(
    [
      `Mappings: ${MAPPINGS.length}`,
      `Moved items: ${moved}`,
      `Updated in-place: ${updated}`,
      `New categories created: ${createdCategory}`,
      `Icons moved/updated: ${movedIcons}`,
      `Genera: ${genera.length}`
    ].join(' | ')
  );
}

main().catch((err) => {
  console.error('apply-genus-mapping failed', err);
  process.exit(1);
});



