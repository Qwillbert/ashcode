import { setRecentProject, updateLocalStorage, frame, injectScript, editorJS, editorHTML, changelog, save, options, recent, itemHistory, item, setOptions, setProjects, helpData } from "../../main.mjs";
import { getCloudStore, uploadCloudStore } from "./firebase.mjs";
import popup from "./popup.mjs";
export const functions = {};

functions.updateFrame = function (save, timeSinceUpdate) {
    timeSinceUpdate = options.timeBeforeUpdate * 1000
    functions.quickUpdate()
    if (save) {
        functions.autoSave();
    }
}
functions.quickUpdate = function () {
    if (options.dev_useDataURI) {
        frame.src = `data:text/html;base64,${window.btoa(unescape(encodeURIComponent(`${editorHTML.env.editor.getValue() + injectScript}<script ${options.jsModules?'type="module"':''}>try{${editorJS.getValue()}}catch(error){console.error(error)}<\/script>`)))}`;
        return
    } 
    var blob = new Blob([(`${editorHTML.env.editor.getValue() + injectScript}<script ${options.jsModules?'type="module"':''}>${editorJS.getValue()}<\/script>`)], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob)
    frame.src = blobUrl;
}

let conversation = [];
var fullText = ""
functions.askAI = function (query, resetConvo = true) {
    document.querySelector('#aiPopup').style.display = "block"
    document.querySelector('#closeAiPopup').style.display = "block"
    if (resetConvo) {
        fullText = ""
        conversation = [];
    } else {
        fullText += "\n\n"
    }
    conversation.push({ "role": "user", "content": query })
    fetch("https://ai.fakeopen.com/v1/chat/completions", {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer pk-this-is-a-real-free-pool-token-for-everyone',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: query,
            messages: conversation,
            max_tokens: 100,
            temperature: 0.5,
            n: 1,
            stop: '\n',
            model: "gpt-3.5-turbo",
            stream: true
        }),
    }).then(response => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        return reader.read().then(function processText({ done, value }) {
            if (done) {
                conversation.push({ "role": "user", "content": fullText })
                let reply = document.createElement('input');
                reply.classList.add("reply");
                reply.placeholder = "respond..."
                document.querySelector("#aiPopup").appendChild(reply)
                document.querySelector('input.reply').addEventListener('keydown', (e) => {
                    if (e.key == "Enter") {
                        functions.askAI(e.target.value, false)
                        e.target.remove()
                    }
                })
                return;
            }
            // try {
            let v = decoder.decode(value)
            if (v.split('\n').length > 2) {
                v.split('\n').forEach(section => {
                    if (section !== "" && section != "data: [DONE]") {
                        if (JSON.parse(section.replaceAll('data: ', '')).choices[0].finish_reason !== "stop") {
                            if (JSON.parse(section.replaceAll("data: ", "").replaceAll("[DONE]", "")).choices[0].delta.content !== undefined) {
                                fullText += JSON.parse(section.replaceAll("data: ", "").replaceAll("[DONE]", "")).choices[0].delta.content;
                                document.querySelectorAll('#aiPopup>pre').forEach(element => {
                                    element.env.editor.destroy()
                                })
                                document.querySelector('#aiPopup').innerHTML = functions.processTextString(fullText)
                                if (options.aiAce || false) {
                                    document.querySelectorAll('#aiPopup>textarea').forEach(element => {
                                        let editor = ace.edit(element, {
                                            enableBasicAutocompletion: false,
                                            enableSnippets: false,
                                            enableLiveAutocompletion: false,
                                            enableEmmet: false,
                                            showPrintMargin: false,
                                            customScrollbar: true,
                                            readOnly: true
                                        });
                                        editor.session.setMode('ace/mode/' + element.dataset.lang)
                                        editor.setTheme("ace/theme/one_dark");
                                    })
                                }
                            }
                        }
                    } else {
                        hljs.highlightAll();
                    }
                })
            }
            // } catch (error) {
            //     console.error(error)
            //     console.log(decoder.decode(value))
            // }
            return reader.read().then(processText);
        });
    });
}

functions.processTextString = function (inputText) {
    let ace = options.aiAce || false
    inputText = inputText.replaceAll('>', '&gt;').replaceAll('<', '&lt;')
    var codeBlockRegex = /```([\s\S]*?)```/g;
    var codeBlocks = inputText.match(codeBlockRegex);
    if (codeBlocks) {
        for (let codeBlock of codeBlocks) {
            var codeContent = codeBlock.slice(3, -3).trim();
            codeContent = codeContent.split('\n');
            let codeLanguage = codeContent.splice(0, 1);
            codeContent = codeContent.join("\n")
            if (ace) {
                var codeElement = `<textarea data-lang=\"${codeLanguage}\">${codeContent}</textarea>`;
            } else {
                var codeElement = `
                <span>
                    <svg onclick="navigator.clipboard.writeText(event.target.nextElementSibling.innerText)" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16l140.1 0L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>
                    <pre>
                     <code data-lang="${codeLanguage}">${codeContent}
                      </code>
                </pre>
                </span><br>`;
            }
            inputText = inputText.replace(codeBlock, codeElement);
        }
    }
    return inputText;
}
functions.clearConsole = function () {
    document.getElementById('log').innerHTML = ""
}
functions.openInNewTab = function () {
    let n = window.open();
    n.document.write(editorHTML.env.editor.getValue() + "<script>" + editorJS.getValue() + "<\/script>")
}
functions.fullscreen = function () {
    frame.classList.toggle('fullscreen')
}
functions.openChangelog = function () {
    popup({
        title: "Changelog",
        content: `<span noGrid></span>${changelog.replaceAll("\n", "<br>")}`,
        closeBtn: true,
        clickToClose: true,
        closeBtnText: "x",
        bg: true
    })
}
functions.formatWorkspace = function () {
    editorHTML.setValue(html_beautify(editorHTML.getValue()))
    editorJS.setValue(js_beautify(editorJS.getValue()))
}
functions.resetWorkspace = function () {
    editorHTML.env.editor.setValue("");
    editorJS.setValue('');
}
functions.saveAndLoad = function (saved) {
    if (saved) {
        let html = functions.generateHTML("save")
        popup({
            title: "Save your workspace",
            content: html,
            closeBtn: true,
            clickToClose: true,
            closeBtnText: "x",
            bg: true
        })
    } else {
        let html = functions.generateHTML("load")
        popup({
            title: "Load a workspace",
            content: html,
            closeBtn: true,
            clickToClose: true,
            closeBtnText: "x",
            bg: true
        })
    }
}
functions.autoSave = function (force = false) {
    if (options.autoSave || force) {
        setRecentProject({
            js: encodeURIComponent(editorJS.getValue()),
            html: encodeURIComponent(editorHTML.getValue()),
            name: `Recent Project - ${new Date().toLocaleDateString() + ", " + new Date().toLocaleTimeString()}`
        })

        updateLocalStorage()
    }
}
functions.generateHTML = function (type) {
    if (type == "save") {
        var html = ""
        let totalBytes = 0;
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalBytes += localStorage.getItem(key).length;
            }
        }
        const totalKilobytes = (totalBytes / 1024).toFixed(2);
        html += `<div class="storageDisplay">${totalKilobytes} KB out of 9,000 KB (${(totalKilobytes / 45).toFixed(1)}%)<br><progress min='0' max='4500' value="${totalKilobytes}"></div>`
        for (let i = 0; i < save.length; i++) {
            const s = save[i];
            let size = functions.getStorageSize(JSON.stringify(s))
            html += `<div title="${size}" class="menuItem save" onclick="functions.modifySave('overwrite', ${i})" oncontextmenu="event.preventDefault(); functions.modifySave('remove', ${i})">${s.name ? s.name : "Empty"}<br><span>${size}</span></div>`;
        }
        html += `<div class="menuItem save" onclick="functions.modifySave('new')">+</div>`
        return html
    } else if (type == "load") {
        var html = ""
        let totalBytes = 0;
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalBytes += localStorage.getItem(key).length;
            }
        }
        const totalKilobytes = (totalBytes / 1024).toFixed(2);
        html += `<div class="storageDisplay">${totalKilobytes} KB out of 9,000 KB (${(totalKilobytes / 90).toFixed(1)}%)<br><progress min='0' max='9000' value="${totalKilobytes}"></div>`
        if (recent && recent.name) {
            html += `<div class="menuItem save" onclick="functions.modifySave('load', 'recent')">${recent.name}</div>`
        }
        for (let i = 0; i < save.length; i++) {
            const s = save[i];
            let size = functions.getStorageSize(JSON.stringify(s))
            html += `<div class="menuItem save" onclick="functions.modifySave('load', ${i})">${s.name ? s.name : "Empty"}<br><span>${size}</span></div>`;
        }
        return html
    }
}
functions.getStorageSize = function (str) {
    const bytes = new Blob([str]).size;
    const units = ["bytes", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
}
functions.modifySave = function (f, id) {
    if (f == "overwrite") {
        let a = prompt("Save name", save[id].name);
        if (a != null) {
            save[id].name = a;
            save[id].html = encodeURIComponent(editorHTML.getValue());
            save[id].js = encodeURIComponent(editorJS.getValue());
            document.querySelector('.popup-close').click()
        } else {
            alert('Canceled!')
        }
    } else if (f == "new") {
        save.push({})
    } else if (f == "load") {
        if (id == 'recent' && recent) {
            document.querySelector('.popup-close').click();
            options.autoSave = false;
            editorJS.setValue(decodeURIComponent(recent.js));
            editorHTML.setValue(decodeURIComponent(recent.html));
            options.autoSave = JSON.parse(document.querySelector('*[onclick="functions.toggleSimpleOption(event, \'autoSave\')"]').dataset.value);
        } else {
            editorHTML.setValue(decodeURIComponent(save[id].html));
            editorJS.setValue(decodeURIComponent(save[id].js));
            document.querySelector('.popup-close').click();
        }
    } else if (f == "remove") {
        if (confirm(`Are you certain you would like to delete ${save[id].name}?`)) {
            save.splice(id, 1);
        } else {
            alert('Canceled!');
        }
    }

    localStorage.setItem('ashcodeData', JSON.stringify({
        save: save,
        recent: recent,
        options: options
    }))
    let html = functions.generateHTML("save");
    if (document.querySelector('.popup-content')) document.querySelector('.popup-content').innerHTML = html;

}

functions.displayJSON = function (inputString, outputElement) {
    if (typeof inputString == "object") {
        functions.displayObject(inputString, outputElement, 0);
        console.log('parsed object');
    } else {

        outputElement.innerHTML = inputString;
        console.log('obj unable to parse');
    }

}

functions.downloadWorkspace = function () {
    let name = prompt("Project Name", "index");
    const exportUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(editorHTML.env.editor.getValue() + "<script>" + editorJS.getValue() + "<\/script>")}`;
    const link = document.createElement("a");
    link.download = `${name}.html`;
    link.href = exportUrl;
    link.click();
    link.remove();
}

functions.importWorkspace = function () {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".html";
    fileInput.click();
    fileInput.addEventListener("change", () => {
        if (fileInput.files[0]) {
            let file = fileInput.files[0];
            if (file.type == "text/html") {
                file.text().then((content) => {
                    editorHTML.setValue(content);
                });
            } else {
                alert("File must be in the HTML format.");
            };
        };
    });
};

functions.exportAll = function () {
    updateLocalStorage()
    const exportUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(localStorage.getItem('ashcodeData')))}`
    const link = document.createElement("a")
    link.download = `Ash-Code-backup - ${new Date().toLocaleDateString().replaceAll("/", "-") + ", " + new Date().toLocaleTimeString().replaceAll("/", "-")}.json`
    link.href = exportUrl
    link.click()
    link.remove()
}

functions.importAll = function () {
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = ".json"
    fileInput.click()
    fileInput.addEventListener("change", () => {
        if (fileInput.files[0]) {
            let file = fileInput.files[0]
            if (file.type == "application/json") {
                file.text().then((content) => {
                    let parsed = JSON.parse(content)
                    if (parsed) {
                        localStorage.setItem('ashcodeData', JSON.parse(content))
                        window.location.reload()
                    } else {
                        alert("Invalid JSON document")
                    }
                })
            } else {
                alert("File must be in the JSON format.")
            }
        }
    })
}

functions.displayObject = function (obj, parentElement, depth, wkey = null) {
    if (depth >= 10 && !options.infiniteObjectNesting || depth >= 100 && options.infiniteObjectNesting) {
        parentElement.innerHTML += "<p>Object is nested too deeply</p>";
        return;
    }
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    details.style.paddingLeft = "10px"
    if (wkey !== null) {
        summary.innerText = wkey;
    } else {
        summary.innerText = "object";
    }
    details.appendChild(summary);
    parentElement.appendChild(details);
    for (const [key, value] of Object.entries(obj)) {
        const element = document.createElement("div");
        if (typeof value === "object" && value !== null) {
            functions.displayObject(value, element, depth + 1, key);
        } else {
            element.innerHTML = `${key}: ${value}`;
        }
        details.appendChild(element);
    }
}

functions.toggleConsole = function () {
    if (event.target.dataset.value == "false") {
        event.target.dataset.value = "true"
        document.getElementById("console").style.display = "block"
    } else {
        event.target.dataset.value = "false"
        document.getElementById("console").style.display = "none"
    }
}

functions.toggleSimpleOption = function (event, optionToToggle) {
    if (event.target.dataset.value == "false") {
        event.target.dataset.value = "true";
        options[optionToToggle] = true
    } else {
        event.target.dataset.value = "false"
        options[optionToToggle] = false;
    }
    updateLocalStorage()
    if (options.jsMode) {
        document.querySelector('#editorHTML').style.display = "none"
        document.querySelector('#editorJS').style.height = "calc(99.9% - env(titlebar-area-height, 20px))"
    } else {
        document.querySelector('#editorHTML').style.display = "block"
        document.querySelector('#editorJS').style.height = "50%"
    }
    document.querySelector('#controls>*:last-child').style.display = options.autoUpdate ? "none" : "unset"
}

functions.toggleEnableEmmet = function () {
    if (event.target.dataset.value == "false") {
        event.target.dataset.value = "true"
        editorHTML.setOptions({
            enableEmmet: true
        })
    } else {
        event.target.dataset.value = "false"
        editorHTML.setOptions({
            enableEmmet: false
        })
    }
}

functions.updateTabSize = function () {
    var tabSize = prompt("New Tab Size, 1-8", '4');
    if (parseInt(tabSize) !== NaN) {
        tabSize = parseInt(tabSize)
        if (tabSize >= 1 && tabSize <= 8) {
            editorJS.getModel().updateOptions({ tabSize: tabSize })
            editorHTML.session.$tabSize = tabSize;
            updateLocalStorage()
        }
    }
}

functions.setConsoleHeight = function () {
    var newConsoleHeight = prompt("Set Console Height.", options.consoleHeight || 0)
    if (parseFloat(newConsoleHeight) !== NaN) {
        let newC = parseFloat(newConsoleHeight);
        if (newC >= 100 && newC <= 350) {
            options.consoleHeight = Math.round(newC)
            document.querySelector('#console').style.height = newC + "px"
            updateLocalStorage()
        } else alert('please enter a value greater than 100 and less than 350')
    } else alert('please make sure the value you entered a number')
}

functions.updateAutoUpdateTimer = function () {
    var newTimeBeforeUpdate = prompt("Time with no input before auto update (seconds)", options.timeBeforeUpdate);
    if (parseFloat(newTimeBeforeUpdate) !== NaN) {
        let time = parseFloat(newTimeBeforeUpdate);
        if (time >= 0 && time < 10) {
            options.timeBeforeUpdate = Math.round(time);
            updateLocalStorage()
        } else alert('please enter a time greater or equal than 0 seconds and less than 10 seconds');
    } else alert('Please make sure that the time entered is a number')
}

functions.showToast = function (message, duration = 5000) {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = message;
    toastContainer.appendChild(toast);
    toast.offsetHeight;
    toast.classList.add('show');
    let t = setTimeout(() => {
        toast.style.opacity = 0;
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, duration);
    toast.onclick = (e) => {
        toastContainer.removeChild(toast);
        clearTimeout(t)
    }
}

functions.getCloud = function () {
    getCloudStore().then(data => {
        if (data == "error") return
        let html = `<span noGrid></span>Are you sure you want to download this saved data?<br>Uploaded at: ${new Date(data.date).toLocaleString()}`
        html += `<br><input type="checkbox" id="projectsCloudDownload" checked><label for="projectsCloudDownload">Projects: ${data.save.length}</label>`
        html += "<div class='projectList'>"
        data.save.forEach((item) => {
            html += item.name + "<br>";
        })
        html += `</div><input type="checkbox" id="optionsCloudDownload" checked><label for="optionsCloudDownload">Options</label><div class='projectList'>`;
        for (let o in data.options) {
            html += `${o}: ${data.options[o]}<br>`
        }
        html += "</div><button>Download</button>"
        popup({
            title: "Saved Data",
            content: html,
            closeBtn: true,
            clickToClose: true,
            closeBtnText: "x",
            bg: true
        })
        document.querySelector('.projectList+button').addEventListener('click', () => {
            if (document.getElementById('projectsCloudDownload').checked) {
                setProjects(data.save);
                
            }
            if (document.getElementById('optionsCloudDownload').checked) {
                setOptions(data.options);
            }
            functions.autoSave(true);
            window.location.reload()
        })
    })
}

functions.getCloudProjects = function () {
    getCloudStore().then(data => {
        const projects = data.save;
        let html = `<span noGrid id="projectDownload">Download specific projects<br>Uploaded at: ${new Date(data.date).toLocaleString()}<br><br>`
        projects.forEach((project, i) => {
            html += `<input type="checkbox" id="${project.name}-${i}" data-id="${i}"></input><label for="${project.name}-${i}">${project.name}</label><br>`
        })
        html += "<button>Download</button></span>"
        popup({
            title: "Download Projects",
            content: html,
            closeBtn: true,
            clickToClose: true,
            closeBtnText: "x",
            bg: true
        })
        document.querySelector("#projectDownload>button").addEventListener("click", (e)=>{
            document.querySelectorAll("#projectDownload>input").forEach(input=>{
                save.push(projects[parseInt(input.dataset.id)])
            })
            document.querySelector('.popup-close').click()
            functions.showToast("Downloaded projects from Cloud!", 5000)
        })
    })
}

functions.uploadCloudStore = function () {
    uploadCloudStore({ save, options, date: Date.now() })
}

functions.displayHelp = function (help) {
    const svg = "<svg onclick=\"navigator.clipboard.writeText(event.target.nextElementSibling.innerText)\" xmlns=\"http://www.w3.org/2000/svg\" height=\"1em\" viewBox=\"0 0 448 512\"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d=\"M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16l140.1 0L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z\"/></svg>"
    var body = helpData[help].body;
    var codeblocks = helpData[help].codeblocks;
    body = body.join("<br>")
    body = body.replaceAll("%copy", svg);
    codeblocks.forEach((codeblock, i) => {
        console.log(codeblock, i)
        body = body.replace("%code" + (i + 1), codeblock.join("\n"))
    })

    popup({
        title: helpData[help].title,
        content: "<span noGrid></span>" + body,
        closeBtn: true,
        clickToClose: true,
        closeBtnText: "x",
        bg: true
    });
    hljs.highlightAll();
}