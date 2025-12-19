var _ = require('underscore');

exports.convertToLowcodeSchema = convertToLowcodeSchema;

function convertToLowcodeSchema(simplifiedHtml) {
    var componentsTree = convertNodes(simplifiedHtml);
    return {componentsTree: componentsTree};
}

function convertNodes(nodes) {
    return _.flatten(_.map(nodes, function(node) {
        if (node.type === 'element') {
            var component = {
                componentName: node.tagName,
                props: node.attributes || {},
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
