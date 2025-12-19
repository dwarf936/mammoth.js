function lowcodeWriter() {
    var components = [];
    var componentStack = [];
    var currentComponent = null;

    function createComponent(tagName, attributes) {
        return {componentName: tagName, props: attributes || {}, children: []};
    }

    function open(tagName, attributes) {
        var component = createComponent(tagName, attributes);
        
        if (componentStack.length === 0) {
            components.push(component);
        } else {
            var parent = componentStack[componentStack.length - 1];
            parent.children.push(component);
        }
        
        componentStack.push(component);
        currentComponent = component;
    }

    function close(tagName) {
        componentStack.pop();
        currentComponent = componentStack.length > 0 ? componentStack[componentStack.length - 1] : null;
    }

    function selfClosing(tagName, attributes) {
        var component = createComponent(tagName, attributes);
        
        if (componentStack.length === 0) {
            components.push(component);
        } else {
            var parent = componentStack[componentStack.length - 1];
            parent.children.push(component);
        }
    }

    function text(value) {
        if (currentComponent) {
            // 如果当前组件已有子文本，合并它们
            var lastChild = currentComponent.children[currentComponent.children.length - 1];
            if (typeof lastChild === "string") {
                currentComponent.children[currentComponent.children.length - 1] += value;
            } else {
                currentComponent.children.push(value);
            }
        } else {
            // 如果没有当前组件，创建一个文本组件或直接添加到根
            components.push(value);
        }
    }

    function asSchema() {
        return {componentsTree: components};
    }

    return {
        open: open,
        close: close,
        selfClosing: selfClosing,
        text: text,
        asSchema: asSchema
    };
}

module.exports = lowcodeWriter;
