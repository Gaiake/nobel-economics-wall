# Nobel Economics Wall

浙江大学经济学院一楼触摸大屏互动模块：按年代浏览诺贝尔经济学奖得主，点击人物头像查看获奖年份、理论贡献、名言与简介。

## 功能

- 覆盖 1969-2025 年诺贝尔经济学奖得主
- 按年代切换人物矩阵
- 点击头像查看人物详情
- 支持真实头像与头像焦点微调
- 无操作时自动轮播人物
- 纯静态页面，可离线部署

## 本地预览

在项目根目录运行：

```bash
python3 -m http.server 8080
```

然后打开：

```text
http://localhost:8080
```

## 测试

```bash
node --test tests/*.test.mjs
```

## 项目结构

```text
index.html              页面入口
src/app.js              交互与渲染逻辑
src/styles.css          大屏样式
src/laureateState.js    年代与人物选择状态
src/data/laureates.json 展示数据
assets/portraits/       人物头像
tests/                  数据与交互状态测试
```

