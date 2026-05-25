# 饱了么 UniApp 项目

## 项目说明

本项目是「饱了么」外卖平台的 UniApp 版本，基于 Vue 3 + Pinia + TypeScript，可打包为 Android APK。

## 目录结构

```
uniapp-baoleme/
├── manifest.json          # UniApp 应用配置（AppID、权限等）
├── pages.json             # 页面路由配置
├── uni.scss               # 全局 SCSS 变量
├── vite.config.ts         # Vite 构建配置
├── src/
│   ├── App.vue            # 应用入口
│   ├── main.ts            # 启动文件
│   ├── types/index.ts     # TypeScript 类型定义
│   ├── data/dishes.ts     # 初始数据 & MySQL DDL
│   ├── stores/            # Pinia 状态管理
│   │   ├── auth.ts        # 登录状态
│   │   └── cart.ts        # 购物车状态
│   ├── api/               # API 服务层（见下方接口说明）
│   │   ├── config.ts      # 请求基础配置
│   │   ├── auth.ts        # 认证接口
│   │   ├── dishes.ts      # 菜品/分类接口
│   │   ├── orders.ts      # 订单接口
│   │   ├── chat.ts        # 客服聊天接口
│   │   └── recommend.ts   # AI 推荐接口
│   └── pages/
│       ├── login/index.vue          # 登录/注册页
│       ├── client/
│       │   ├── home.vue             # 顾客端首页（点餐）
│       │   ├── orders.vue           # 我的订单
│       │   └── chat.vue             # 客服聊天
│       └── merchant/
│           ├── analytics.vue        # 掌柜概览/数据统计
│           ├── orders.vue           # 订单管理
│           ├── sku.vue              # 菜品管理（CRUD）
│           ├── chat.vue             # 客服工作台
│           └── database.vue         # MySQL DDL 查看
```

---

## ⚠️ 接口状态说明（重要，对接后端时必读）

### 当前状态：全部接口为 🔴 MOCK

所有 API 请求目前对接的是原 React 项目的 **Express 内存服务器**（`server.ts`），数据存储在内存中，重启后丢失。

### 对接 SSM 后端步骤

只需修改 `src/api/config.ts` 中的 `BASE_URL`：

```typescript
// 当前（MOCK）：
export const BASE_URL = '';  // 请求到本地 Express server

// 对接 SSM 后端时改为：
export const BASE_URL = 'http://你的服务器IP:8080';
```

### 接口清单

| 接口 | 方法 | 路径 | 当前状态 | SSM Controller |
|------|------|------|----------|----------------|
| 获取分类列表 | GET | `/api/categories` | 🔴 MOCK | `CategoryController` |
| 上传菜品图片 | POST | `/api/upload/image` | 🔴 待后端实现 | `UploadController` |
| 获取菜品列表 | GET | `/api/dishes` | 🔴 MOCK | `DishController` |
| 新增菜品 | POST | `/api/dishes` | 🔴 MOCK | `DishController` |
| 更新菜品 | PUT | `/api/dishes/{id}` | 🔴 MOCK | `DishController` |
| 删除菜品 | DELETE | `/api/dishes/{id}` | 🔴 MOCK | `DishController` |
| 获取订单列表 | GET | `/api/orders` | 🔴 MOCK | `OrderController` |
| 提交订单 | POST | `/api/orders` | 🔴 MOCK | `OrderController` |
| 更新订单状态 | PUT | `/api/orders/{id}/status` | 🔴 MOCK | `OrderController` |
| 获取聊天会话 | GET | `/api/chat/session?userId=` | 🔴 MOCK | `ChatController` |
| 获取所有会话 | GET | `/api/chat/sessions/all` | 🔴 MOCK | `ChatController` |
| 切换客服模式 | POST | `/api/chat/session/mode` | 🔴 MOCK | `ChatController` |
| 获取消息列表 | GET | `/api/chat/messages/{sessionId}` | 🔴 MOCK | `ChatController` |
| 发送消息 | POST | `/api/chat/messages` | 🔴 MOCK | `ChatController` |
| 结束会话 | PUT | `/api/chat/session/{id}/resolve` | 🔴 MOCK | `ChatController` |
| AI 推荐 | POST | `/api/gemini/recommend` | 🔴 MOCK | `ChatController` |
| 用户登录 | POST | `/api/auth/login` | 🔴 MOCK（本地验证） | `UserController` |
| 用户注册 | POST | `/api/auth/register` | 🔴 MOCK（本地存储） | `UserController` |

---

## 开发运行

### 安装依赖

```bash
cd uniapp-baoleme
npm install
```

### H5 开发预览

```bash
npm run dev:h5
```

> 需要同时启动原项目的 Express 后端：`cd .. && npm run dev`

### 打包 Android APK

使用 HBuilderX 打包：
1. 用 HBuilderX 打开 `uniapp-baoleme` 目录
2. 菜单 → 发行 → 原生 App-云打包
3. 选择 Android，填写证书信息，提交打包

或使用 uni-app CLI：
```bash
npm run build:app
# 然后用 HBuilderX 离线打包
```

---

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 顾客端 | xiaoming | 123456 |
| 商家端 | admin | admin |
