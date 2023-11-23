"use strict";
import { functions } from "/assets/js/functions.mjs"
import { monacoColors, monacoRules } from "./assets/js/colors.mjs";
window.functions = functions

export var itemHistory = [];
export var item = 0

export let timeSinceUpdate = 0;


export var editorJS
export var editorHTML;
export var save = [{}];
export let recent = {};
export var options = { autoClear: false, infiniteObjectNesting: false, autoSave: true, timeBeforeUpdate: 0.5, autoUpdate: true, aiAce: false, jsModules: false, warnOnClose: true, dev_useDataURI: false };
window.options = options
if (localStorage.getItem('ashcodeSave') || localStorage.getItem('ashcodeRecent')) {
    alert('converting old saves to new saving system')
    save = JSON.parse(localStorage.getItem('ashcodeSave'));
    recent = JSON.parse(localStorage.getItem('ashcodeRecent'));
    updateLocalStorage()

    localStorage.removeItem('ashcodeSave')
    localStorage.removeItem('ashcodeRecent')
    window.location.reload();
}
export var changelog = ""
fetch("changelog.txt").then(r=>r.text()).then(data => {
    changelog = data
})

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
    // options = data.options;
    for (let option in data.options) {
        options[option] = data.options[option];
    }
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
export function setProjects(data) { save = data }
export function setOptions(data) { options = data }

export var helpData = {};
fetch("assets/data/help.json").then(r=>r.json()).then(data => {
    helpData = data
})

setInterval(() => {
    if (timeSinceUpdate !== 0) {
        timeSinceUpdate -= 500
    } else {
        functions.quickUpdate()
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
        rules: monacoRules,
        colors: monacoColors
    })
    editorJS = monaco.editor.create(document.getElementById('editorJS'), {
        language: 'javascript',
        theme: 'atom',
        fontSize: "12px",
        automaticLayout: true,
        minimap: { enabled: false },
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
        let spacer = document.createElement('hr')
        element.insertAdjacentElement('afterEnd', spacer)
    })

    document.querySelector('#closeAiPopup').addEventListener('click', () => {
        document.querySelector('#aiPopup').style.display = "none"
        document.querySelector('#closeAiPopup').style.display = "none"
    })
})
let originalErrorFunction = console.error
console.error = function (param) {
    originalErrorFunction(param)
    functions.showToast(`Error: ${param}`, 10000)
}

document.addEventListener("keydown", (e) => {
    if (e.key == "s" && e.ctrlKey) {
        e.preventDefault();
        functions.saveAndLoad(true);
    }
    if (e.key == "S" && e.ctrlKey) {
        e.preventDefault();
        functions.uploadCloudStore()
    }
    if (e.key == "o" && e.ctrlKey) {
        e.preventDefault();
        functions.saveAndLoad(false);
    }
    if (e.key == "I" && e.ctrlKey) {
        e.preventDefault();
        document.querySelector('span[onclick="functions.toggleConsole()"]').click()
    }
    if (e.key == "F11") {
        e.preventDefault();
        functions.fullscreen()
    }
})

window.addEventListener('beforeunload', function (event) {
    if (options.warnOnClose) {
        event.preventDefault();
        event.returnValue = '';
        return 'Are you sure you want to leave? You might lose unsaved content.';
    }
});

document.getElementById('send').addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        document.getElementById('log').innerHTML += `<div class="info">${e.target.value}</div>`;
        document.getElementsByTagName('iframe')[0].contentWindow.postMessage(e.target.value, "*");
        if (itemHistory[itemHistory.length - 1] !== e.target.value) {
            itemHistory.push(e.target.value)
            item = itemHistory.length
        }
        e.target.value = "";
    }
    if (e.key == "ArrowUp") {
        item--;
        if (item < 0) item = 0
        document.getElementById('send').value = itemHistory[item]
    }
    if (e.key == "ArrowDown") {
        item++;
        if (item > itemHistory.length - 1) item = itemHistory.length - 1
        document.getElementById('send').value = itemHistory[item]
    }
})

setInterval(() => {
    if (document.querySelector('.popup-container')) {
        document.querySelector('.ace_editor').style.zIndex = "-1";
    } else if (document.querySelector('.ace_editor')) {
        document.querySelector('.ace_editor').style.zIndex = "";
    }
}, 10)

window.addEventListener('message', (e) => {
    if (e.data.vscodeScheduleAsyncWork) return
    console.log(e)
    if (e.data.type === 'log') {
        document.getElementById('log').innerHTML += `<div class="message"></div>`;
        functions.displayJSON(e.data.message, document.querySelector('#log>.message:last-child'));
    }
    if (e.data.type === 'warn') {
        document.getElementById('log').innerHTML += `<div class="warn">${e.data.message}</div>`;
    }
    if (e.data.type === 'error') {
        document.getElementById('log').innerHTML += `<div class="error">${e.data.message}</div>`;
    }
    if (e.data.type === 'message') {
        document.getElementById('log').innerHTML += `<div class="infoB"></div>`;
        functions.displayJSON(e.data.message, document.querySelector('#log>.infoB:last-child'));
    }
    document.getElementById('log').scrollTop = document.getElementById('log').scrollHeight;
});
