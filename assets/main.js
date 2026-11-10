/*
 * 渐进增强：想法照旧手写在 index.html 里，这个脚本只负责排版。
 * 把 `<li>2026.11.04 内容</li>` 拆成日期 + 内容，并按年份分组。
 * 没有 JS 时页面依然可读。
 */
(function () {
    "use strict";

    var DATE_RE = /^\s*(\d{4})\.(\d{1,2})\.(\d{1,2})\s*/;

    function pad(n) {
        return n.length === 1 ? "0" + n : n;
    }

    // 从 li 开头的文本里取出日期，并把它从文本中去掉。
    function takeDate(li) {
        var first = li.firstChild;
        if (!first || first.nodeType !== Node.TEXT_NODE) return null;
        var m = first.textContent.match(DATE_RE);
        if (!m) return null;
        first.textContent = first.textContent.slice(m[0].length);
        return { y: m[1], m: pad(m[2]), d: pad(m[3]) };
    }

    function enhanceThoughts(list) {
        var items = Array.prototype.filter.call(list.children, function (el) {
            return el.tagName === "LI";
        });
        var frag = document.createDocumentFragment();
        var group = null;
        var lastKey = null;

        items.forEach(function (li) {
            var date = takeDate(li);
            var year = date ? date.y : group ? group.year : "";

            if (!group || group.year !== year) {
                var section = document.createElement("section");
                section.className = "year-group";
                var h2 = document.createElement("h2");
                h2.className = "year-title";
                h2.textContent = year;
                var count = document.createElement("span");
                count.className = "count";
                h2.appendChild(count);
                var ol = document.createElement("ol");
                ol.className = "thought-list";
                section.appendChild(h2);
                section.appendChild(ol);
                frag.appendChild(section);
                group = { year: year, list: ol, count: count, n: 0 };
            }

            var body = document.createElement("div");
            body.className = "thought-body";
            while (li.firstChild) body.appendChild(li.firstChild);

            var time = document.createElement(date ? "time" : "span");
            if (date) {
                time.dateTime = date.y + "-" + date.m + "-" + date.d;
                time.textContent = date.m + "." + date.d;
            }

            var key = date ? date.y + date.m + date.d : lastKey;
            li.className = "thought" + (key === lastKey ? " same-day" : "");
            li.appendChild(time);
            li.appendChild(body);
            group.list.appendChild(li);
            group.n += 1;
            group.count.textContent = group.n + " 条";
            lastKey = key;
        });

        list.replaceWith(frag);
    }

    var thoughts = document.querySelector("main .thoughts");
    if (thoughts) enhanceThoughts(thoughts);

    // 页脚版权年份始终显示当前年份
    var thisYear = document.getElementById("this-year");
    if (thisYear) thisYear.textContent = new Date().getFullYear();
})();
