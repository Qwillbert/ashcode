var parentIdentifier = "parent";
window.console.log = function (message) { returnData('log', message) };
window.console.error = function (message) { returnData('error', message) };
window.console.warn = function (message) { returnData('warn', message) };
window.onerror = function (message) {
    window[parentIdentifier].postMessage({ type: "error", message: message }, "*")
};
window.addEventListener('message', (e) => {
    try {
        window[parentIdentifier].postMessage({
            type: "message",
            message: replaceHtmlElementsWithTags(eval(decodeURIComponent(e.data)))
        }, "*")
    } catch (error) {
        console.error(error)
    }
});
function returnData(type, message) {
    window[parentIdentifier].postMessage({
        type: type,
        message: replaceHtmlElementsWithTags(message)
    }, "*")
}
function replaceHtmlElementsWithTags(obj) {
    if (typeof obj === 'object') {
        if (obj instanceof HTMLElement) {
            const elementData = {
                tagName: obj.tagName,
                attributes: {},
                children: replaceHtmlElementsWithTags(Array.from(obj.children)),
            };
            for (let i = 0; i < obj.attributes.length; i++) {
                const attribute = obj.attributes[i];
                elementData.attributes[attribute.name] = attribute.value;
            }
            return elementData;
        } else {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    if (value instanceof HTMLElement) {
                        obj[key] = {
                            tagName: value.tagName,
                            attributes: {},
                            children: replaceHtmlElementsWithTags(Array.from(value.children)),
                        };
                        for (let i = 0; i < value.attributes.length; i++) {
                            const attribute = value.attributes[i];
                            obj[key].attributes[attribute.name] = attribute.value;
                        }
                    } else if (typeof value === 'object') {
                        obj[key] = replaceHtmlElementsWithTags(value);
                    }
                }
            }
        }
    }
    return obj;
}