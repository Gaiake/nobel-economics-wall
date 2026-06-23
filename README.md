# 学科思政基地六屏大屏

浙江大学学科思政育人示范基地一楼触摸大屏项目。页面按 6 块竖屏拼接设计，真实画布尺寸为 `6480 × 1920`。

## 展示内容

- 第 1 屏：基地导航页，展示项目介绍，并切换中间两屏内容。
- 第 2 屏：诺贝尔经济学奖获奖者群像墙，支持按年代筛选。
- 第 3 屏：当前选中获奖者详情，展示获奖年份、理论贡献、名言与简介。
- 第 4-6 屏：同花顺宏观经济大屏，嵌入地址为 `https://board.10jqka.com.cn/fe/largescreen/macroEconomySchool.html`。

中间两屏默认展示诺贝尔经济学奖内容，也可以通过左侧导航切换到科普互动游戏或科普电子书橱。5 分钟无触摸操作后，页面会自动回到诺奖展示。

## 本地预览

```bash
node scripts/serve-preview.mjs
```

默认访问地址为 `http://127.0.0.1:8080/`。如果端口被占用，可以改用：

```bash
PORT=8081 node scripts/serve-preview.mjs
```

页面画布固定为 `6480 × 1920`，现场测试时建议将主机输出分辨率设置为同尺寸，并让浏览器进入全屏。

## 部署

本项目是静态页面，无构建步骤。GitHub Pages 可直接部署仓库根目录。

现场主机使用时，打开部署后的网页并让浏览器全屏覆盖完整 `6480 × 1920` 输出区域即可。右三屏的同花顺内容依赖网络访问，现场需要保证能正常打开同花顺链接。

## 项目结构

```text
index.html              页面入口
src/app.js              页面渲染与交互逻辑
src/displayShell.js     六屏尺寸、导航项、外部嵌入链接配置
src/laureateState.js    年代与人物选择状态
src/styles.css          大屏布局与视觉样式
src/data/laureates.json 诺奖得主展示数据
assets/portraits/       人物头像
scripts/serve-preview.mjs 本地静态预览服务
```
