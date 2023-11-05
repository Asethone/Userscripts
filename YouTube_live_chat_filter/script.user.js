// ==UserScript==
// @name        YouTube live chat message filter
// @namespace   https://github.com/Asethone/Userscripts/tree/main/YouTube_live_chat_filter/
// @version     0.1.13
// @description This script allows you to apply custom filter on live chat messages and redirect acquired data to a special popup window
// @author      Asethone
// @match       https://www.youtube.com/live_chat*
// @icon        https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL   https://github.com/Asethone/Userscripts/raw/main/YouTube_live_chat_filter/script.user.js
// @downloadURL https://github.com/Asethone/Userscripts/raw/main/YouTube_live_chat_filter/script.user.js
// @resource    view_html   https://github.com/Asethone/Userscripts/raw/main/YouTube_live_chat_filter/view.html
// @grant       GM_getResourceText
// ==/UserScript==

/*
 * Filter function for retrieving data from chat message
 * @param   {String}    message Chat message
 * @return  {Array}             Array of strings. Each string will be added to popup window as a separate message
 */
let filterMessage = function(message) {
    // Handle whole messages
    return [message];
};

(function () {
    'use strict'

    console.log('RUNNING script.user.js...');
    // Data
    let isActive = false;           // is message tracking active
    let viewWindow = null;          // view popup window
    const authorsSet = new Set();   // authors
    // Button colors
    const statusColor = { false: '#3e3e3e', true: '#ea3322' };
    // Append button to header
    let chatHeader = document.querySelector("yt-live-chat-header-renderer");
    let button = document.createElement('button');
    button.style.padding = '10px';
    button.style.marginRight = '5px';
    button.style.borderRadius = '10px';
    button.style.backgroundColor = statusColor[isActive];
    button.style.border = 'none';
    chatHeader.insertBefore(button, document.querySelector("#live-chat-header-context-menu"));
    // Create popup function
    const createPopup = function () {
        // Calculate screen dimensions
        const windowInitWidth = 600;
        const windowInitHeight = Math.floor(window.screen.height * 0.8);
        // Open popup
        viewWindow = window.open('', 'View', `popup=yes,width=${windowInitWidth},height=${windowInitHeight}`);
        if (!viewWindow.document.title) {
            viewWindow.document.title = 'View';
            const viewHtml = GM_getResourceText('view_html');
            viewWindow.document.write(viewHtml);
        }
        // Set popup's onclose callback
        viewWindow.setOnCloseCallback(() => {
            updateStatus(false);
            viewWindow = null;
        });
        // Set popup's save button callback
        viewWindow.setOnSaveCallback(() => {
            return Array.from(authorsSet);
        });
    }
    // Scrap chat messages
    const msgList = document.querySelector('#chat #items');
    const onAppend = function (appendedNode) {
        if (viewWindow === null)
            return;
        // if element is not a chat message (may be some youtube alerts, notifications, etc.) do not handle it
        if (appendedNode.tagName != 'YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER')
            return;
        // timeout just in case images src are not yet loaded correctly
        setTimeout(() => {
            const message = (() => {
                const elMsg = appendedNode.querySelector('#message');
                let strMsg = '';
                for (const node of elMsg.childNodes) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        strMsg += node.textContent;
                    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'IMG') {
                        let emoji = node.getAttribute('alt');
                        if (emoji)
                            strMsg += emoji;
                    }
                }
                return strMsg;
            })();
            // filter message
            const messageContents = filterMessage(message);
            if (!messageContents)
                return;
            // get author image and name
            const imgSrc = appendedNode.querySelector('#img').getAttribute('src');
            const author = appendedNode.querySelector('#author-name').textContent;
            // send message to popup window
            for (const content of messageContents) {
                viewWindow.addMessage(imgSrc, author, content);
                authorsSet.add(author);
            }
        }, 100);
    };
    // Mutation callback
    const callback = function (mutations) {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                onAppend(node);
            }
        }
    };
    // Create observer to watch for new chat messages
    let observer = new MutationObserver(callback);
    // Toggle status function
    function updateStatus(status) {
        isActive = status;
        button.style.backgroundColor = statusColor[isActive];
        console.log('Tracking status: ' + (isActive ? 'active' : 'non active'));
        if (isActive) {
            if (!viewWindow)
                createPopup();
            observer.observe(msgList, { childList: true });
        } else {
            observer.disconnect();
        }
    };
    // Set button onclick handler
    button.onclick = () => {
        updateStatus(!isActive);
    };
    // Set main window's onclose handler
    window.onclose = () => {
        if (viewWindow)
            viewWindow.close();
    };
    // Disable tracking if chat is opened in new window
    let observerPopup = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (!mutation.target.classList.contains('iron-selected')) {
                updateStatus(false);
                viewWindow = null;
            }
        }
    });
    const divChatContainer = document.getElementById('chat-messages');
    observerPopup.observe(divChatContainer, {
        attributeFilter: ["class"]
    });
})();
