# 变更记录

## v1.4.19

### 新增功能
- 添加了`getUserStyle(styleName)`方法，用于获取用户预设的样式信息
- 该方法接受样式名称作为参数，返回包含字体大小、颜色、加粗等属性的样式对象

### 修复问题
- 修复了Document对象样式属性类型不匹配的问题
- 修复了测试用例中styles对象比较失败的问题
- 修复了styles-reader.js中defaultStyles创建时参数不足的问题

### 技术细节
- 修改了Styles构造函数，将内部的样式集合作为公共属性暴露出来
- 修改了readStylesFromZipFile函数，使用Styles.EMPTY作为默认值
- 确保了所有测试用例都通过
