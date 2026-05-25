# 应用名称与 Logo 配置说明

## 为什么手机上还是显示「HBuilder」？

用 HBuilderX **「运行 → 运行到手机」** 时，安装的是 **官方调试基座**，桌面固定为绿底 H 图标、名称 HBuilder，**不会**读取本项目的图标配置。

要看到「饱了么」自己的图标和名称，必须：

1. **发行 → 原生 App-云打包**（或本地打包），生成正式 APK 后安装；或  
2. 使用 **自定义调试基座**（需先云打包一次生成基座）。

---

## 改应用名称

编辑 `src/manifest.json` 根字段：

```json
"name": "饱了么"
```

改完后重新打包 APK。`description` 为应用描述，可按需修改。

---

## 改应用 Logo（图标）

### 方式一：HBuilderX 可视化（推荐）

1. 打开 `src/manifest.json` → 切换到 **App 图标配置** / **Android/iOS 图标配置** 可视化页签  
2. 上传一张 **1024×1024** 正方形 PNG（已提供源图：`static/app-icon-1024.png`）  
3. 点击 **自动生成** 各尺寸图标  
4. 保存后重新云打包

### 方式二：手动配置 manifest

在 `app-plus.distribute.icons` 中填写各尺寸路径（相对项目根目录），例如：

```json
"icons": {
  "android": {
    "hdpi": "static/icons/72x72.png",
    "xhdpi": "static/icons/96x96.png",
    "xxhdpi": "static/icons/144x144.png",
    "xxxhdpi": "static/icons/192x192.png"
  }
}
```

可用 [icon.kitchen](https://icon.kitchen) 或 HBuilder 自动生成工具从 `app-icon-1024.png` 导出多尺寸。

---

## 启动图（可选）

`manifest.json` → `app-plus.splashscreen` 与 **App 启动图配置**，上传与品牌一致的启动页。

---

## 检查清单

- [ ] `name` 已改为目标名称  
- [ ] `distribute.icons` 已配置且非空 `{}`  
- [ ] 使用 **云打包 APK** 安装，而非调试基座  
- [ ] 安装前卸载旧 APK / 调试基座，避免混淆
