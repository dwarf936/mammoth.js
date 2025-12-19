var _ = require('underscore');

exports.convertToLowcodeSchema = convertToLowcodeSchema;

function convertToLowcodeSchema(simplifiedHtml) {
    var componentsTree = convertNodes(simplifiedHtml);
    return {componentsTree: componentsTree};
}

function convertNodes(nodes) {
    return _.flatten(_.map(nodes, function(node) {
        if (node.type === 'element') {
            // 处理两种可能的格式：测试用例格式和实际代码格式
            var componentName = node.tag ? node.tag.tagName : node.tagName;
            var props = node.tag ? node.tag.attributes || {} : node.attributes || {};
            var component = {
                componentName: componentName,
                props: props,
                children: convertNodes(node.children || [])
            };
            return [component];
        } else if (node.type === 'text') {
            return [node.value];
        } else {
            return [];
        }
    }), true);
}
