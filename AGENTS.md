# TabKing - AGENTS.md

## 项目概述

**TabKing** (内部 localStorage 键名为 `aerotab`) 是一款美观、可高度自定义的浏览器新标签页应用。它同时也是一个 Chrome Manifest V3 扩展（override newtab），也可以作为独立 Web 应用运行。用户可以通过它快速搜索、管理常用网站快捷方式，并内置了一个实用工具箱。

> 注意：项目路径包含 `go/src`，但**这不是 Go 项目**。这是一个纯前端项目。路径中的 `go/src` 是 Go 工作区目录命名习惯的历史遗留，与本项目技术栈无关。

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React | ^19.2.1 |
| 语言 | TypeScript | ~5.8.2 |
| 构建工具 | Vite | ^6.2.0 |
| CSS 框架 | Tailwind CSS | ^4.1.17 |
| 图标 | lucide-react | ^0.555.0 |
| 哈希计算 | crypto-js + @types/crypto-js | ^4.2.0 |
| 二维码 | qrcode.react | ^4.2.0 |
| 插件 | @vitejs/plugin-react | ^5.0.0 |

## 项目结构

```
tabking/                       # 前端项目根目录
├── App.tsx                    # 主应用组件（状态管理、时钟、快捷键保护）
├── index.tsx                  # React 入口
├── index.css                  # 全局样式（引入 Tailwind）
├── index.html                 # 入口 HTML
├── types.ts                   # TypeScript 类型定义（Shortcut, AppSettings, SearchEngine 等）
├── constants.ts               # 搜索引擎配置、favicon 工具函数
├── metadata.json              # 应用元数据（用于 AI Studio）
├── vite.config.ts             # Vite 构建配置（含 GEMINI_API_KEY 注入）
├── tsconfig.json              # TypeScript 配置
├── tailwind.config.js         # Tailwind 主题扩展（玻璃态颜色等）
├── postcss.config.js          # PostCSS 插件配置
├── package.json               # 依赖与脚本
├── .env.local                 # 环境变量（GEMINI_API_KEY）—— 已被 gitignore 排除
├── .gitignore                 # 屏蔽 node_modules, dist, *.local 等
│
├── components/                # UI 组件
│   ├── SearchBar.tsx          # 搜索栏（引擎切换、搜索建议下拉）
│   ├── ShortcutGrid.tsx       # 快捷方式网格（拖拽排序、文件夹、增删改）
│   ├── SettingsModal.tsx      # 设置面板（通用/背景/布局/数据备份 四个Tab）
│   ├── Rain.tsx               # 下雨特效组件
│   └── Snowflakes.tsx         # 下雪特效组件
│
├── services/
│   └── api.ts                 # 搜索建议 API（Google/Bing/Baidu/Yandex 四引擎及自定义 URL 支持）
│
├── tools/                     # 内置工具箱（左侧菜单-右侧内容布局）
│   ├── ToolsPanel.tsx         # 工具箱容器（菜单列表 + 内容区）
│   ├── index.ts               # 组件导出索引
│   ├── types.ts               # Tool 类型定义
│   ├── TimestampConverter.tsx # 时间戳转换器
│   ├── JsonFormatter.tsx      # JSON 格式化/压缩
│   ├── ColorPicker.tsx        # 取色器（HEX/RGB/HSL/图片取色）
│   ├── Base64Encoder.tsx      # Base64 编解码
│   ├── PasswordGenerator.tsx  # 密码生成器
│   ├── UnicodeEncoder.tsx     # Unicode / HTML 实体编解码
│   ├── NumberBaseConverter.tsx# 进制转换器（二进制/十进制/十六进制）
│   ├── ImageCompressor.tsx    # 图片压缩器（Canvas 实现）
│   ├── FileHasher.tsx         # 文件哈希计算（MD5/SHA256）
│   ├── Notepad.tsx            # 记事本（增删改、持久化存储）
│   ├── UnitConverter.tsx      # 单位换算器（长度/重量/温度/面积/体积/速度）
│   └── QRCodeTool.tsx         # 二维码生成/解码
│
├── public/                    # 静态资源
│   ├── bg.jpg                 # 默认壁纸
│   ├── favicon.ico            # 站点图标
│   ├── manifest.json          # Chrome 扩展 Manifest V3 配置（版本 v1.2.0）
│   ├── wechat.png             # 微信打赏二维码
│   └── svg/                   # 搜索引擎图标 + 网站快捷方式图标（本地预置，共 23 个）
│       ├── google-icon.svg / bing-icon.svg / baidu-icon.svg
│       ├── yandex.png / chat-gpt.png / douyin.png
│       └── ... (各网站 favicon 本地副本)
│
├── dist/                      # 构建输出（`vite build` 产物，供扩展加载）
│   ├── index.html
│   ├── manifest.json
│   ├── favicon.ico
│   ├── bg.jpg
│   ├── assets/
│   └── svg/
│
└── node_modules/              # npm 依赖（已 gitignore）
```

## 核心功能

### 1. 新标签页
- 实时时钟（显示时/分 + 星期/月/日）
- 搜索栏（Google / Bing / Baidu / Yandex / 知乎 / GitHub / 哔哩哔哩 / 抖音 八引擎切换，支持搜索建议下拉）
- 快捷方式网格（可拖拽排序、创建文件夹、合并/拆分、右键菜单编辑/删除）
- 背景特效：下雪（❄️）和下雨（🌧️）动画，可在设置中开关
- 记事本：浮动弹窗，支持多笔记增删改，自动持久化存储
- 打赏弹窗：微信打赏二维码支持

### 2. 设置面板
- **General**: 链接打开方式（新标签/当前页）、搜索建议服务器选择（auto/google/bing/baidu/yandex/custom）、视觉特效开关（下雪/下雨）
- **Background**: 自定义壁纸上传（限制 3MB）、背景模糊度调节（0-20px）
- **Layout**: 图标尺寸（40-120px）、行列间距（0-64px）、网格列数/行数
- **Data & Backup**: 导入/导出 JSON 配置文件（含数据校验、版本检查、记事本数据支持）

### 3. 工具箱（12 个工具）
时间戳转换、JSON 格式化、取色器、Base64 编解码、密码生成器、Unicode 编解码、进制转换、图片压缩、文件哈希、记事本、单位换算、二维码生成/解码

### 4. 生产环境保护
- 禁用 F12 / Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+U
- 禁用右键菜单
- 通过检查 URL 是否包含 `localhost`/`127.0.0.1` 来判断环境

## 构建和运行命令

均在 `tabking/` 目录下执行：

```bash
cd tabking

# 安装依赖
npm install

# 启动开发服务器（端口 3000，监听 0.0.0.0）
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

## 环境变量

在 `tabking/.env.local` 中设置：

```
GEMINI_API_KEY=your_key_here
```

`GEMINI_API_KEY` 通过 Vite 的 `define` 配置注入到 `process.env.API_KEY` 和 `process.env.GEMINI_API_KEY` 两个变量。该文件已加入 `.gitignore`，不会提交到仓库。

## 数据持久化

所有用户数据通过 `localStorage` 持久化，键名：

| 键 | 用途 |
|------|------|
| `aerotab_settings` | 应用设置（背景、布局、搜索引擎、特效开关等 `AppSettings`） |
| `aerotab_shortcuts` | 快捷方式列表（`Shortcut[]`） |
| `tabking_notes` | 记事本笔记列表（`Note[]`：id, title, content, updatedAt） |
| `tabking_notepad_badge_clicked` | 记事本 NEW 角标是否已被点击（`"true"` 后不再显示） |

## Chrome 扩展构建部署

1. 执行 `npm run build` 生成 `dist/` 目录
2. 在 Chrome 中打开 `chrome://extensions`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"，选择 `tabking/dist/` 目录

`manifest.json` 使用 Manifest V3，配置了 `chrome_url_overrides.newtab` 来替换新标签页。

## 类型系统

核心类型定义在 `types.ts`：

- **`AppSettings`**: 应用整体配置（背景、模糊度、网格布局、默认搜索引擎、打开方式、建议服务器、下雪/下雨特效开关）
- **`Shortcut`**: 快捷方式（id、标题、URL、图标、类型 link/folder、子项列表）
- **`SearchEngineType`**: 枚举 `google | bing | baidu | yandex | zhihu | github | bilibili | douyin`
- **`SearchEngine`**: 搜索引擎配置（名称、搜索 URL、建议 URL、Logo 路径）
- **`GridConfig`**: 网格布局参数（行/列/图标尺寸/间距）

## 代码风格约定

- **语言**: 注释主要使用中文，变量名/函数名使用英文
- **组件风格**: React 函数式组件 + TypeScript，使用 `React.FC<Props>` 类型标注
- **样式**: 全组件均使用 Tailwind CSS 的 utility classes，没有独立的 CSS 文件（仅 `index.css` 引入 Tailwind）
- **设计主题**: 深色主题 + 玻璃态（`bg-white/10 backdrop-blur-md`），白色/半透明为主
- **图标**: 统一使用 `lucide-react` 图标库
- **状态管理**: 全部使用 React 本地状态（`useState`/`useEffect`），无全局状态管理库
- **持久化**: 通过 `useEffect` 监听状态变化自动写 `localStorage`

## 测试

当前项目**没有**配置任何测试框架（无 Jest、Vitest、Cypress 等），也没有测试文件。

## 安全注意事项

1. **`.env.local`** 包含 `GEMINI_API_KEY`，已通过 `.gitignore` 排除，切勿提交
2. **生产环境禁用开发者工具**: 通过 `keydown` 和 `contextmenu` 事件拦截实现
3. **配置文件导入校验**: `SettingsModal.tsx` 中有完整的 `validateSettings`、`validateShortcuts` 和 `validateNotes` 数据校验逻辑，包括：
   - 必需字段检查
   - 数据类型验证
   - 应用来源检查（防止跨应用导入）
   - 版本兼容性检查（v2 及以上版本支持记事本数据）
4. **图片上传大小限制**: 背景图片限制 3MB
5. **所有计算在浏览器本地完成**: 文件哈希、图片压缩等操作不上传服务器
6. **`vite.config.ts`** 中开发服务器监听 `0.0.0.0`，局域网可访问，注意使用场景
7. JSON 配置文件读取时使用 `try-catch` 包裹 `JSON.parse` 防止异常

## 边界情况与防御性编程

项目中已有实践：

- **搜索栏**: 空查询检查、自定义 URL 的 `{query}` 占位符替换、200ms 防抖、GBK 编码处理（百度）、Yandex 多格式 JSON 解析
- **快捷方式**: 重复 ID 检查、空文件夹自动清理（单子文件夹自动展开）、无效 URL 自动补 `https://`、文件夹拖拽合并/拆分
- **设置面板**: 数值输入范围限制（min/max）、背景图片为空时的默认墻纸回退、`AppSettings` 默认合并（兼容新增字段）
- **工具箱各工具**: 输入验证、空状态处理、异常捕获、错误提示
- **背景特效**: Snowflakes/Rain 组件空状态（`enabled=false` 时返回 null，不渲染 DOM）
- **记事本**: 空笔记列表默认展示空状态提示、笔记数据 `localStorage` 自动持久化、关闭弹窗不丢失数据
- **打赏弹窗**: 点击遮罩层关闭、Esc 关闭支持
- **配置文件导入**: JSON 解析异常 try-catch、版本检查（拒绝过高版本）、空 notes 兼容处理

## 路径别名

TypeScript 中配置了 `@/` 路径别名指向项目根目录（`tabking/`），但当前代码中未实际使用，所有导入均为相对路径。
