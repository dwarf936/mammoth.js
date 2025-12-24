# mammoth.js

mammoth.js是一个用于将DOCX文档转换为HTML或Markdown的JavaScript库。它可以在浏览器和Node.js环境中使用。

## 新增功能

### getUserStyle(styleName)方法

mammoth.js现在支持通过样式名称获取用户预设的样式信息。

```javascript
var mammoth = require("mammoth");

mammoth.getUserStyle(input, "Normal").then(function(result) {
    console.log(result.value); // 输出Normal样式的信息
});
```

该方法接受两个参数：
- `input`: DOCX文件的路径、Buffer或ArrayBuffer
- `styleName`: 样式名称，例如"Normal"、"Heading 1"等

返回一个Promise，解析为包含样式信息的对象，或null（如果样式不存在）。

## 安装

```bash
npm install mammoth
```

## 使用示例

### 将DOCX转换为HTML

```javascript
var mammoth = require("mammoth");

mammoth.convertToHtml({path: "input.docx"})
    .then(function(result) {
        console.log(result.value); // 输出HTML
    })
    .catch(function(error) {
        console.error(error);
    });
```

### 将DOCX转换为Markdown

```javascript
var mammoth = require("mammoth");

mammoth.convertToMarkdown({path: "input.docx"})
    .then(function(result) {
        console.log(result.value); // 输出Markdown
    })
    .catch(function(error) {
        console.error(error);
    });
```

## 文档

完整的文档请访问[mammoth.js的官方网站](https://github.com/mwilliamson/mammoth.js)。
