"use strict";
import { functions } from "/ashcode/assets/js/functions.mjs"
window.functions = functions

export var itemHistory = [];
export var item = 0

export let timeSinceUpdate = 0;


export var editorJS
export var editorHTML;
export var save = [{}];
export let recent = {};
export var options = { autoClear: false, infiniteObjectNesting: false, autoSave: true, timeBeforeUpdate: 0.5, autoUpdate: true, aiAce: false };
if (localStorage.getItem('ashcodeSave') || localStorage.getItem('ashcodeRecent')) {
    alert('converting old saves to new saving system')
    save = JSON.parse(localStorage.getItem('ashcodeSave'));
    recent = JSON.parse(localStorage.getItem('ashcodeRecent'));
    updateLocalStorage()

    localStorage.removeItem('ashcodeSave')
    localStorage.removeItem('ashcodeRecent')
    window.location.reload();
}
export var changelog = `
 == 11/19/23 ==
 - Fixed many spelling mistakes
 - Fix and optimize CSS
 - Download Specific projects individually

 == 6/4/23 ==
 - Added signing in with accounts
   - Use on multiple devices
   - Download and upload settings
   - Sign in with your google account
   - You can still use locally without an account

 == 9/19/23 ==
 - Added AI
   - Ask Questions about your javascript
   - Option to use Ace for AI generated Code

 == 9/16/23 ==
 - Added storage meter
 - Fixed CSS for Chrome and Firefox
 - Turned into PWA (Progressive Web Application)
 - Allowed the built in console to receive html elements (note: event listeners and some types of elements, will still produce an error)

 == Roadmap == 
 - Allow users in PWA mode to "open in Ash-code"
 - Many CSS generators
   - drop-shadow
   - linear-gradient`
   export var injectScript = `
   <!-- Injected by ash-code | Forward Facing Console -->`
   fetch('assets/js/console.js').then(r => r.text()).then(data => {
    injectScript += `<script id="ashcodeInjectedScript">
    ${data}    
    <\/script>`
   })

if (localStorage.getItem('ashcodeData')) {
    let data = JSON.parse(localStorage.getItem('ashcodeData'));
    save = data.save;
    recent = data.recent;
    options = data.options;
    for (let option in options) {
        if (options[option] === true || options[option] === false) {
            document.querySelector(`span[data-name="${option}"]`).dataset.value = options[option].toString()
        }
    }
    document.querySelector('#console').style.height = options.consoleHeight || 300 + "px"
    document.querySelector('#controls>*:last-child').style.display = options.autoUpdate ? "none" : "unset"
}

export const frame = document.getElementsByTagName('iframe')[0];

export function updateLocalStorage() {
    localStorage.setItem('ashcodeData', JSON.stringify({
        save: save,
        recent: recent,
        options: options
    }))
}

export function setRecentProject(data) { recent = data }
export function setProjects(data) {save = data}

setInterval(() => {
    if (timeSinceUpdate !== 0) {
        timeSinceUpdate -= 500
    } else {
        frame.src = `data:text/html;base64,${window.btoa(unescape(encodeURIComponent(editorHTML.env.editor.getValue() + injectScript + "<script type='module'>try{" + editorJS.getValue() + "}catch(error){console.error(error)}<\/script>")))}`;
        if (options.autoClear) {
            document.getElementById('log').innerHTML = ""
        }
        timeSinceUpdate -= 500
    }
}, 500)

require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor/min/vs' } }); window.MonacoEnvironment = { getWorkerUrl: () => proxy }; let proxy = URL.createObjectURL(new Blob([`self.MonacoEnvironment = {baseUrl: 'https://unpkg.com/monaco-editor/min/'};importScripts('https://unpkg.com/monaco-editor/min/vs/base/worker/workerMain.js');`], { type: 'text/javascript' })); require(["vs/editor/editor.main"], function () {
    ace.config.set('basePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.15.2/src-noconflict');
    monaco.editor.defineTheme('atom', {
        base: 'vs-dark',
        inherit: false,
        rules: [{ "token": "comment", "foreground": "#5C6370", "fontStyle": "italic" }, { "token": "comment markup.link", "foreground": "#5C6370" }, { "token": "entity.name.type", "foreground": "#E5C07B" }, { "token": "entity.other.inherited-class", "foreground": "#E5C07B" }, { "token": "keyword", "foreground": "#C678DD" }, { "token": "keyword.control", "foreground": "#C678DD" }, { "token": "keyword.operator", "foreground": "#C678DD" }, { "token": "keyword.other.special-method", "foreground": "#61AFEF" }, { "token": "keyword.other.unit", "foreground": "#D19A66" }, { "token": "storage", "foreground": "#C678DD" }, { "token": "storage.type.annotation", "foreground": "#C678DD" }, { "token": "storage.modifier.package", "foreground": "#ABB2BF" }, { "token": "constant", "foreground": "#D19A66" }, { "token": "constant.variable", "foreground": "#D19A66" }, { "token": "constant.character.escape", "foreground": "#56B6C2" }, { "token": "constant.numeric", "foreground": "#D19A66" }, { "token": "constant.other.color", "foreground": "#56B6C2" }, { "token": "constant.other.symbol", "foreground": "#56B6C2" }, { "token": "variable", "foreground": "#E06C75" }, { "token": "variable.interpolation", "foreground": "#BE5046" }, { "token": "variable.parameter", "foreground": "#ABB2BF" }, { "token": "string", "foreground": "#98C379" }, { "token": "string > source", "foreground": "#ABB2BF" }, { "token": "string.regexp", "foreground": "#56B6C2" }, { "token": "string.regexp source.ruby.embedded", "foreground": "#E5C07B" }, { "token": "string.other.link", "foreground": "#E06C75" }, { "token": "punctuation.definition.comment", "foreground": "#5C6370" }, { "token": "punctuation.definition.method-parameters", "foreground": "#ABB2BF" }, { "token": "punctuation.definition.heading", "foreground": "#61AFEF" }, { "token": "punctuation.definition.bold", "foreground": "#E5C07B", "fontStyle": "bold" }, { "token": "punctuation.definition.italic", "foreground": "#C678DD", "fontStyle": "italic" }, { "token": "punctuation.section.embedded", "foreground": "#BE5046" }, { "token": "punctuation.section.method", "foreground": "#ABB2BF" }, { "token": "support.class", "foreground": "#E5C07B" }, { "token": "support.type", "foreground": "#56B6C2" }, { "token": "support.function", "foreground": "#56B6C2" }, { "token": "support.function.any-method", "foreground": "#61AFEF" }, { "token": "entity.name.function", "foreground": "#61AFEF" }, { "token": "entity.name.class", "foreground": "#E5C07B" }, { "token": "entity.name.section", "foreground": "#61AFEF" }, { "token": "entity.name.tag", "foreground": "#E06C75" }, { "token": "entity.other.attribute-name", "foreground": "#D19A66" }, { "token": "entity.other.attribute-name.id", "foreground": "#61AFEF" }, { "token": "meta.class", "foreground": "#E5C07B" }, { "token": "meta.class.body", "foreground": "#ABB2BF" }, { "token": "meta.method-call", "foreground": "#ABB2BF" }, { "token": "meta.definition.variable", "foreground": "#E06C75" }, { "token": "meta.link", "foreground": "#D19A66" }, { "token": "meta.require", "foreground": "#61AFEF" }, { "token": "meta.selector", "foreground": "#C678DD" }, { "token": "meta.separator", "foreground": "#ABB2BF" }, { "token": "meta.tag", "foreground": "#ABB2BF" }, { "token": "underline" }, { "token": "none", "foreground": "#ABB2BF" }, { "token": "invalid.deprecated", "foreground": "#523D14" }, { "token": "invalid.illegal", "foreground": "#FFFFFF" }, { "token": "markup.bold", "foreground": "#D19A66", "fontStyle": "bold" }, { "token": "markup.changed", "foreground": "#C678DD" }, { "token": "markup.deleted", "foreground": "#E06C75" }, { "token": "markup.italic", "foreground": "#C678DD", "fontStyle": "italic" }, { "token": "markup.heading", "foreground": "#E06C75" }, { "token": "markup.heading punctuation.definition.heading", "foreground": "#61AFEF" }, { "token": "markup.link", "foreground": "#56B6C2" }, { "token": "markup.inserted", "foreground": "#98C379" }, { "token": "markup.quote", "foreground": "#D19A66" }, { "token": "markup.raw", "foreground": "#98C379" }, { "token": "source.c keyword.operator", "foreground": "#C678DD" }, { "token": "source.cpp keyword.operator", "foreground": "#C678DD" }, { "token": "source.cs keyword.operator", "foreground": "#C678DD" }, { "token": "source.css property-name", "foreground": "#828997" }, { "token": "source.css property-name.support", "foreground": "#ABB2BF" }, { "token": "source.elixir source.embedded.source", "foreground": "#ABB2BF" }, { "token": "source.elixir constant.language", "foreground": "#61AFEF" }, { "token": "source.elixir variable.definition", "foreground": "#C678DD" }, { "token": "source.elixir parameter.variable.function", "foreground": "#D19A66", "fontStyle": "italic" }, { "token": "source.elixir quoted", "foreground": "#98C379" }, { "token": "source.elixir keyword.special-method", "foreground": "#E06C75" }, { "token": "source.elixir readwrite.module punctuation", "foreground": "#E06C75" }, { "token": "source.elixir regexp.section", "foreground": "#BE5046" }, { "token": "source.elixir separator", "foreground": "#D19A66" }, { "token": "source.elixir variable.constant", "foreground": "#E5C07B" }, { "token": "source.elixir array", "foreground": "#828997" }, { "token": "source.gfm markup" }, { "token": "source.gfm link entity", "foreground": "#61AFEF" }, { "token": "source.go storage.type.string", "foreground": "#C678DD" }, { "token": "source.ini keyword.other.definition.ini", "foreground": "#E06C75" }, { "token": "source.java storage.modifier.import", "foreground": "#E5C07B" }, { "token": "source.java storage.type", "foreground": "#E5C07B" }, { "token": "source.java keyword.operator.instanceof", "foreground": "#C678DD" }, { "token": "source.java-properties meta.key-pair", "foreground": "#E06C75" }, { "token": "source.java-properties meta.key-pair > punctuation", "foreground": "#ABB2BF" }, { "token": "source.js keyword.operator", "foreground": "#56B6C2" }, { "token": "source.js keyword.operator.delete", "foreground": "#C678DD" }, { "token": "source.ts keyword.operator", "foreground": "#56B6C2" }, { "token": "source.flow keyword.operator", "foreground": "#56B6C2" }, { "token": "source.json meta.structure.dictionary.json > string.quoted.json", "foreground": "#E06C75" }, { "token": "source.json meta.structure.dictionary.json > string.quoted.json > punctuation.string", "foreground": "#E06C75" }, { "token": "source.json meta.structure.dictionary.json > value.json > string.quoted.json", "foreground": "#98C379" }, { "token": "source.json meta.structure.dictionary.json > constant.language.json", "foreground": "#56B6C2" }, { "token": "ng.interpolation", "foreground": "#E06C75" }, { "token": "ng.interpolation.begin", "foreground": "#61AFEF" }, { "token": "ng.interpolation function", "foreground": "#E06C75" }, { "token": "ng.interpolation function.begin", "foreground": "#61AFEF" }, { "token": "ng.interpolation bool", "foreground": "#D19A66" }, { "token": "ng.interpolation bracket", "foreground": "#ABB2BF" }, { "token": "ng.pipe", "foreground": "#ABB2BF" }, { "token": "ng.tag", "foreground": "#56B6C2" }, { "token": "ng.attribute-with-value attribute-name", "foreground": "#E5C07B" }, { "token": "ng.attribute-with-value string", "foreground": "#C678DD" }, { "token": "ng.attribute-with-value string.begin", "foreground": "#ABB2BF" }, { "token": "source.php class.bracket", "foreground": "#ABB2BF" }, { "token": "source.python keyword.operator.logical.python", "foreground": "#C678DD" }, { "token": "source.python variable.parameter", "foreground": "#D19A66" }, { "token": "c", "foreground": "#ABB2BF" }, { "token": "s", "foreground": "#ABB2BF" }, { "token": "s", "foreground": "#98C379" }, { "token": "s", "foreground": "#D19A66" }, { "token": "s", "foreground": "#E06C75" }, { "token": "s", "foreground": "#E06C75" }, { "token": "punctuation.separator.key-value.ts", "foreground": "#56B6C2" }, { "token": "source.js.embedded.html keyword.operator", "foreground": "#56B6C2" }, { "token": "variable.other.readwrite.js", "foreground": "#ABB2BF" }, { "token": "support.variable.dom.js", "foreground": "#E06C75" }, { "token": "support.variable.property.dom.js", "foreground": "#E06C75" }, { "token": "meta.template.expression.js punctuation.definition", "foreground": "#BE5046" }, { "token": "source.ts punctuation.definition.typeparameters", "foreground": "#ABB2BF" }, { "token": "source.ts punctuation.definition.block", "foreground": "#ABB2BF" }, { "token": "source.ts punctuation.separator.comma", "foreground": "#ABB2BF" }, { "token": "support.variable.property.js", "foreground": "#E06C75" }, { "token": "keyword.control.default.js", "foreground": "#E06C75" }, { "token": "keyword.operator.expression.instanceof.js", "foreground": "#C678DD" }, { "token": "keyword.operator.expression.of.js", "foreground": "#C678DD" }, { "token": "meta.brace.round.js", "foreground": "#ABB2BF" }, { "token": "source.js punctuation.accessor", "foreground": "#ABB2BF" }, { "token": "punctuation.terminator.statement.js", "foreground": "#ABB2BF" }, { "token": "meta.array-binding-pattern-variable.js variable.other.readwrite.js", "foreground": "#D19A66" }, { "token": "source.js support.variable", "foreground": "#E06C75" }, { "token": "variable.other.constant.property.js", "foreground": "#D19A66" }, { "token": "keyword.operator.new.ts", "foreground": "#C678DD" }, { "token": "source.ts keyword.operator", "foreground": "#56B6C2" }, { "token": "punctuation.separator.parameter.js", "foreground": "#ABB2BF" }, { "token": "constant.language.import-export-all.js", "foreground": "#E06C75" }, { "token": "constant.language.import-export-all.jsx", "foreground": "#56B6C2" }, { "token": "keyword.control.as.js", "foreground": "#ABB2BF" }, { "token": "variable.other.readwrite.alias.js", "foreground": "#E06C75" }, { "token": "variable.other.constant.js", "foreground": "#D19A66" }, { "token": "meta.export.default.js variable.other.readwrite.js", "foreground": "#E06C75" }, { "token": "source.js meta.template.expression.js punctuation.accessor", "foreground": "#98C379" }, { "token": "source.js meta.import-equals.external.js keyword.operator", "foreground": "#ABB2BF" }, { "token": "e", "foreground": "#98C379" }, { "token": "m", "foreground": "#ABB2BF" }, { "token": "meta.definition.property.js variable", "foreground": "#ABB2BF" }, { "token": "meta.type.parameters.js support.type", "foreground": "#ABB2BF" }, { "token": "source.js meta.tag.js keyword.operator", "foreground": "#ABB2BF" }, { "token": "meta.tag.js punctuation.section.embedded", "foreground": "#ABB2BF" }, { "token": "meta.array.literal.js variable", "foreground": "#E5C07B" }, { "token": "support.type.object.module.js", "foreground": "#E06C75" }, { "token": "constant.language.json", "foreground": "#56B6C2" }, { "token": "variable.other.constant.object.js", "foreground": "#D19A66" }, { "token": "storage.type.property.js", "foreground": "#56B6C2" }, { "token": "meta.template.expression.js string.quoted punctuation.definition", "foreground": "#98C379" }, { "token": "meta.template.expression.js string.template punctuation.definition.string.template", "foreground": "#98C379" }, { "token": "keyword.operator.expression.in.js", "foreground": "#C678DD" }, { "token": "variable.other.object.js", "foreground": "#ABB2BF" }, { "token": "meta.object-literal.key.js", "foreground": "#E06C75" }, { "token": "s", "foreground": "#ABB2BF" }, { "token": "s", "foreground": "#D19A66" }, { "token": "c", "foreground": "#D19A66" }, { "token": "s", "foreground": "#E06C75" }, { "token": "m", "foreground": "#D19A66" }, { "token": "p", "foreground": "#ABB2BF" }, { "token": "p", "foreground": "#ABB2BF" }, { "token": "e", "foreground": "#E06C75" }, { "token": "s", "foreground": "#ABB2BF" }, { "token": "v", "foreground": "#ABB2BF" }, { "token": "v", "foreground": "#ABB2BF" }, { "token": "v", "foreground": "#ABB2BF" }, { "token": "e", "foreground": "#61AFEF" }, { "token": "s", "foreground": "#E5C07B" }, { "token": "k", "foreground": "#C678DD" }, { "token": "e", "foreground": "#56B6C2" }, { "token": "s", "foreground": "#ABB2BF" }, { "token": "e", "foreground": "#D19A66" }, { "token": "s", "foreground": "#56B6C2" }, { "token": "m", "foreground": "#D19A66" }, { "token": "s", "foreground": "#56B6C2" }, { "token": "m", "foreground": "#ABB2BF" }, { "token": "p", "foreground": "#E06C75" }, { "token": "s", "foreground": "#ABB2BF" }, { "token": "p", "foreground": "#D19A66" }, { "token": "p", "foreground": "#E06C75" }, { "token": "p", "foreground": "#D19A66" }, { "token": "m", "foreground": "#ABB2BF" }, { "token": "s", "foreground": "#E5C07B" }, { "token": "e", "foreground": "#E06C75" }, { "token": "p", "foreground": "#E06C75" }, { "token": "m", "foreground": "#ABB2BF" }, { "token": "p", "foreground": "#D19A66" }, { "token": "m", "foreground": "#98C379" }, { "token": "b", "foreground": "#E06C75" }, { "token": "m", "foreground": "#5C6370", "fontStyle": "italic" }, { "token": "punctuation.definition.string.begin.markdown", "foreground": "#ABB2BF" }, { "token": "p", "foreground": "#C678DD" }, { "token": "markup.underline.link.markdown", "foreground": "#C678DD" }, { "token": "string.other.link.title.markdown", "foreground": "#61AFEF" }, { "token": "p", "foreground": "#E06C75" }, { "token": "v", "foreground": "#D19A66" }, { "token": "k", "foreground": "#98C379" }, { "token": "p", "foreground": "#E06C75" }, { "token": "m", "foreground": "#ABB2BF" }],
        colors: { "activityBar.background": "#333842", "activityBar.foreground": "#D7DAE0", "editorInlayHint.background": "#2C313A", "editorInlayHint.foreground": "#636e83", "notebook.cellEditorBackground": "#2C313A", "activityBarBadge.background": "#528BFF", "activityBarBadge.foreground": "#D7DAE0", "button.background": "#4D78CC", "button.foreground": "#FFFFFF", "button.hoverBackground": "#6087CF", "diffEditor.insertedTextBackground": "#00809B33", "dropdown.background": "#353b45", "dropdown.border": "#181A1F", "editorIndentGuide.activeBackground": "#626772", "editor.background": "#282C34", "editor.foreground": "#ABB2BF", "editor.lineHighlightBackground": "#99BBFF0A", "editor.selectionBackground": "#3E4451", "editorCursor.foreground": "#528BFF", "editor.findMatchHighlightBackground": "#528BFF3D", "editorGroup.background": "#21252B", "editorGroup.border": "#181A1F", "editorGroupHeader.tabsBackground": "#21252B", "editorIndentGuide.background": "#ABB2BF26", "editorLineNumber.foreground": "#636D83", "editorLineNumber.activeForeground": "#ABB2BF", "editorWhitespace.foreground": "#ABB2BF26", "editorRuler.foreground": "#ABB2BF26", "editorHoverWidget.background": "#21252B", "editorHoverWidget.border": "#181A1F", "editorSuggestWidget.background": "#21252B", "editorSuggestWidget.border": "#181A1F", "editorSuggestWidget.selectedBackground": "#2C313A", "editorWidget.background": "#21252B", "editorWidget.border": "#3A3F4B", "input.background": "#1B1D23", "input.border": "#181A1F", "focusBorder": "#528BFF", "list.activeSelectionBackground": "#2C313A", "list.activeSelectionForeground": "#D7DAE0", "list.focusBackground": "#2C313A", "list.hoverBackground": "#2C313A66", "list.highlightForeground": "#D7DAE0", "list.inactiveSelectionBackground": "#2C313A", "list.inactiveSelectionForeground": "#D7DAE0", "notification.background": "#21252B", "pickerGroup.border": "#528BFF", "scrollbarSlider.background": "#4E566680", "scrollbarSlider.activeBackground": "#747D9180", "scrollbarSlider.hoverBackground": "#5A637580", "sideBar.background": "#21252B", "sideBarSectionHeader.background": "#333842", "statusBar.background": "#21252B", "statusBar.foreground": "#9DA5B4", "statusBarItem.hoverBackground": "#2C313A", "statusBar.noFolderBackground": "#21252B", "tab.activeBackground": "#282C34", "tab.activeForeground": "#D7DAE0", "tab.border": "#181A1F", "tab.inactiveBackground": "#21252B", "titleBar.activeBackground": "#21252B", "titleBar.activeForeground": "#9DA5B4", "titleBar.inactiveBackground": "#21252B", "titleBar.inactiveForeground": "#9DA5B4", "statusBar.debuggingForeground": "#FFFFFF", "extensionButton.prominentBackground": "#2BA143", "extensionButton.prominentHoverBackground": "#37AF4E", "badge.background": "#528BFF", "badge.foreground": "#D7DAE0", "peekView.border": "#528BFF", "peekViewResult.background": "#21252B", "peekViewResult.selectionBackground": "#2C313A", "peekViewTitle.background": "#1B1D23", "peekViewEditor.background": "#1B1D23" }
    })
    editorJS = monaco.editor.create(document.getElementById('editorJS'), {
        language: 'javascript',
        theme: 'atom',
        fontSize: "12px",
        automaticLayout: true,
    });
    editorJS.addAction({
        id: "askAI",
        label: "Ask AI about selection",
        keybindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyA,
        ],
        precondition: null,
        keybindingContext: null,
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1.5,
        run: function (ed) {
            let selection = ed.getModel().getValueInRange(ed.getSelection())
            let message = prompt('ask ai')
            functions.askAI(`Here is my code: \`\`\`${selection}\`\`\`, ` + message)
        },
    });
    editorHTML = ace.edit('editorHTML')
    // var langTools = ace.require("ace/ext/language_tools");
    editorHTML.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        enableEmmet: true,
        showPrintMargin: false,
        customScrollbar: true
    })
    editorHTML.session.on('change', function () {
        if (options.autoUpdate) {
            functions.updateFrame(true, timeSinceUpdate);
        }
    });
    monaco.editor.getModels()[0].onDidChangeContent(() => {
        if (options.autoUpdate) {
            functions.updateFrame(true, timeSinceUpdate);
        }
    });
    document.getElementById('editorHTML').style.fontSize = '12px'
    editorHTML.session.setMode('ace/mode/html')
    editorHTML.setTheme("ace/theme/one_dark");
    document.querySelectorAll('.dropdown > span:not(:last-child)').forEach(element => {
        let e = document.createElement('hr')
        element.insertAdjacentElement('afterEnd', e)
    })
    
    document.querySelector('#closeAiPopup').addEventListener('click', (e) => {
        document.querySelector('#aiPopup').style.display = "none"
        document.querySelector('#closeAiPopup').style.display = "none"
    })
})