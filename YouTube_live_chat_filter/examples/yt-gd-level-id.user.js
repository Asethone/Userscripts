// ==UserScript==
// @name        YouTube live chat filter GD level IDs
// @namespace   https://github.com/Asethone/Userscripts/tree/main/YouTube_live_chat_filter/
// @version     0.1.6
// @description Redirect live chat messages with only GD level identificators to special popup window
// @author      Asethone
// @match       https://www.youtube.com/live_chat*
// @icon        https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL   https://github.com/Asethone/Userscripts/raw/main/YouTube_live_chat_filter/examples/yt-gd-level-id.user.js
// @downloadURL https://github.com/Asethone/Userscripts/raw/main/YouTube_live_chat_filter/examples/yt-gd-level-id.user.js
// @resource    view_html   https://github.com/Asethone/Userscripts/raw/main/YouTube_live_chat_filter/view.html
// @require     https://github.com/Asethone/Userscripts/raw/main/YouTube_live_chat_filter/script.user.js
// @grant       GM_getResourceText
// ==/UserScript==

(function () {
    'use strict'

    console.log('RUNNING yt-gd-level-id.user.js...')
    // Set filter function
    const set = new Set();
    filterMessage = function(message) {
        const ids = message.match(/(?<!\d)\d{6,9}(?!\d)/g);
        if (ids === null)
            return null;
        const contents = [];
        for (const id of ids) {
            if (!set.has(id)) {
                set.add(id);
                contents.push(id);
            }
        }
        return contents;
    }
})();
