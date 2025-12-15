
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { Blob } from 'buffer';
import { WECHAT_APPID, WECHAT_SECRET } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(projectRoot, 'public')));

// Paths
const DATA_DIR = path.join(projectRoot, 'public/data');
const CATEGORY_DIR = path.join(DATA_DIR, 'category');
const IMAGES_DIR = path.join(projectRoot, 'public/images');
const ICON_DIR = path.join(IMAGES_DIR, 'icon');
const DETAIL_DIR = path.join(IMAGES_DIR, 'detail');

// WeChat config (local config.js, gitignored)
let tokenCache = { token: null, expiresAt: 0 };

// Ensure directories exist
[ICON_DIR, DETAIL_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Helper to read JSON
const readJson = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return null;
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
        console.error(`Error reading ${filePath}:`, err);
        return null;
    }
};

// Helper to write JSON
const writeJson = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error(`Error writing ${filePath}:`, err);
        return false;
    }
};

// WeChat helpers
const getAccessToken = async () => {
    if (!WECHAT_APPID || !WECHAT_SECRET) {
        throw new Error('WeChat APPID/SECRET not configured');
    }
    const now = Date.now();
    if (tokenCache.token && tokenCache.expiresAt > now + 60_000) {
        return tokenCache.token;
    }
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.errcode) {
        throw new Error(`WeChat token error: ${data.errcode} ${data.errmsg}`);
    }
    tokenCache = { token: data.access_token, expiresAt: now + (data.expires_in || 7000) * 1000 };
    return tokenCache.token;
};

const uploadImageToWeChat = async (absPath) => {
    const token = await getAccessToken();
    const buffer = fs.readFileSync(absPath);
    const form = new FormData();
    form.append('media', new Blob([buffer]), path.basename(absPath));
    const url = `https://api.weixin.qq.com/cgi-bin/material/add_material?type=image&access_token=${token}`;
    const resp = await fetch(url, { method: 'POST', body: form });
    const data = await resp.json();
    if (data.errcode) {
        throw new Error(`WeChat upload error: ${data.errcode} ${data.errmsg}`);
    }
    return data; // expected { media_id, url }
};

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const type = req.query.type || 'detail'; // 'icon' or 'detail'
        const category = req.query.category || 'uncategorized';
        // The user mentioned public/images/detail/xxx 科/
        // We will create the category folder if it doesn't exist
        const targetDir = path.join(type === 'icon' ? ICON_DIR : DETAIL_DIR, category);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        cb(null, targetDir);
    },
    filename: function (req, file, cb) {
        // Naming: SucculentName + type + timestamp + ext
        const name = req.query.name || 'unknown';
        const type = req.query.type || 'detail';
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${name}${type}${timestamp}${ext}`);
    }
});

const upload = multer({ storage: storage });

// API Endpoints

// 1. Get Categories (from category-config.json)
app.get('/api/categories', (req, res) => {
    const configPath = path.join(DATA_DIR, 'category-config.json');
    const data = readJson(configPath);
    if (!data) return res.status(500).json({ error: 'Failed to read category config' });

    // Also scan the directory to find uncategorized or non-config files if needed, 
    // but strictly following requirement to use config:
    res.json(data.categories);
});

// 2. Get Data for a Category
app.get('/api/data/:categoryName', (req, res) => {
    const categoryName = req.params.categoryName;
    const filePath = path.join(CATEGORY_DIR, `${categoryName}.json`);

    const data = readJson(filePath);
    if (!data) return res.status(404).json({ error: 'Category file not found', default: [] });

    res.json(data);
});

// 3. Save Data for a Category (Add/Edit/Delete handled by frontend sending full updated list or delta)
// Simplest is to save the whole list for the category.
app.post('/api/data/:categoryName', (req, res) => {
    const categoryName = req.params.categoryName;
    const filePath = path.join(CATEGORY_DIR, `${categoryName}.json`);
    const newData = req.body;

    if (!Array.isArray(newData)) {
        return res.status(400).json({ error: 'Data must be an array' });
    }

    if (writeJson(filePath, newData)) {
        res.json({ success: true, count: newData.length });
    } else {
        res.status(500).json({ error: 'Failed to write file' });
    }
});

// 3b. Upsert single item (recommended to avoid large payload)
app.post('/api/data/:categoryName/item', (req, res) => {
    const categoryName = req.params.categoryName;
    const filePath = path.join(CATEGORY_DIR, `${categoryName}.json`);
    const item = req.body;

    if (!item || typeof item !== 'object') {
        return res.status(400).json({ error: 'Item must be an object' });
    }
    if (item.id === undefined || item.id === null) {
        return res.status(400).json({ error: 'Item must contain id' });
    }

    const data = readJson(filePath) || [];
    if (!Array.isArray(data)) {
        return res.status(500).json({ error: 'Category file is not an array' });
    }

    const idx = data.findIndex(entry => entry && entry.id === item.id);
    if (idx >= 0) {
        data[idx] = item;
    } else {
        data.push(item);
    }

    if (writeJson(filePath, data)) {
        res.json({ success: true, count: data.length });
    } else {
        res.status(500).json({ error: 'Failed to write file' });
    }
});

// 3c. Delete single item by id
app.delete('/api/data/:categoryName/item/:id', (req, res) => {
    const categoryName = req.params.categoryName;
    const idRaw = req.params.id;
    const filePath = path.join(CATEGORY_DIR, `${categoryName}.json`);

    const data = readJson(filePath) || [];
    if (!Array.isArray(data)) {
        return res.status(500).json({ error: 'Category file is not an array' });
    }

    const originalLen = data.length;
    const filtered = data.filter(entry => entry && String(entry.id) !== idRaw);
    if (filtered.length === originalLen) {
        return res.status(404).json({ error: 'Item not found' });
    }

    if (writeJson(filePath, filtered)) {
        res.json({ success: true, count: filtered.length });
    } else {
        res.status(500).json({ error: 'Failed to write file' });
    }
});

// 5. Upload existing local icon to WeChat and update remote URL
app.post('/api/wechat/upload-icon', async (req, res) => {
    try {
        const { id, category, srcIndex } = req.body || {};
        if (id === undefined || id === null || !category) {
            return res.status(400).json({ error: 'id and category are required' });
        }
        const filePath = path.join(CATEGORY_DIR, `${category}.json`);
        const data = readJson(filePath);
        if (!Array.isArray(data)) {
            return res.status(404).json({ error: 'Category not found' });
        }
        const idx = data.findIndex(entry => entry && entry.id === id);
        if (idx < 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        const item = data[idx];
        let localPath = item.srcIcon && item.srcIcon.local;
        let targetField = 'srcIcon';
        let targetIndex = -1;
        if (typeof srcIndex === 'number') {
            targetField = 'srcList';
            targetIndex = srcIndex;
            if (!Array.isArray(item.srcList) || !item.srcList[targetIndex]) {
                return res.status(400).json({ error: 'srcList item not found' });
            }
            localPath = item.srcList[targetIndex].local;
        }
        if (!localPath) {
            return res.status(400).json({ error: 'No local file to upload' });
        }
        const absPath = path.join(projectRoot, localPath);
        if (!fs.existsSync(absPath)) {
            return res.status(400).json({ error: 'Local file not found on server' });
        }
        const wxResp = await uploadImageToWeChat(absPath);
        const remoteUrl = wxResp.url || wxResp.media_id || '';
        const updated = { ...item };
        if (targetField === 'srcIcon') {
            updated.srcIcon = { local: localPath, remote: remoteUrl };
            updated.srcList = updated.srcList || [];
        } else {
            updated.srcList = Array.isArray(updated.srcList) ? [...updated.srcList] : [];
            updated.srcList[targetIndex] = {
                ...(updated.srcList[targetIndex] || {}),
                local: localPath,
                remote: remoteUrl
            };
            updated.srcIcon = updated.srcIcon || { local: '', remote: '' };
        }
        data[idx] = updated;
        if (!writeJson(filePath, data)) {
            return res.status(500).json({ error: 'Failed to update json' });
        }
        res.json({ success: true, remote: remoteUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Upload failed' });
    }
});

// 4. Upload Image
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Construct local path relative to public root, so it can be used in srcList
    // req.file.path is absolute. 
    // We want: public/images/detail/Category/NameTypeTs.ext

    const relativePath = path.relative(projectRoot, req.file.path);
    // On windows it might use backslashes, ensure forward slashes
    const normalizedPath = relativePath.split(path.sep).join('/');

    res.json({
        success: true,
        path: normalizedPath,
        filename: req.file.filename
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
