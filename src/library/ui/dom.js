let HASH = '#'.charCodeAt(0);
let DOT = '.'.charCodeAt(0);
let TAG_NAME = 0;
let ID = 1;
let CLASS_NAME = 2;

let parseQuery = function (query) {
    let tag = null;
    let id = null;
    let className = null;
    let mode = TAG_NAME;
    let offset = 0;

    for (let i = 0; i <= query.length; i++) {
        let char = query.charCodeAt(i);
        let isHash = char === HASH;
        let isDot = char === DOT;
        let isEnd = !char;

        if (isHash || isDot || isEnd) {
            if (mode === TAG_NAME) {
                if (i === 0) {
                    tag = 'div';
                } else {
                    tag = query.substring(offset, i);
                }
            } else if (mode === ID) {
                id = query.substring(offset, i);
            } else {
                if (className) {
                    className += ' ' + query.substring(offset, i);
                } else {
                    className = query.substring(offset, i);
                }
            }

            if (isHash) {
                mode = ID;
            } else if (isDot) {
                mode = CLASS_NAME;
            }

            offset = i + 1;
        }
    }

    return { tag: tag, id: id, className: className };
};

let createElement = function (query, ns) {
    let ref = parseQuery(query);
    let tag = ref.tag;
    let id = ref.id;
    let className = ref.className;
    let element = ns ? document.createElementNS(ns, tag) : document.createElement(tag);

    if (id) {
        element.id = id;
    }

    if (className) {
        if (ns) {
            element.setAttribute('class', className);
        } else {
            element.className = className;
        }
    }

    return element;
};

let unmount = function (parent, child) {
    let parentEl = getEl(parent);
    let childEl = getEl(child);

    if (child === childEl && childEl.__redom_view) {
        // try to look up the view if not provided
        child = childEl.__redom_view;
    }

    if (childEl.parentNode) {
        doUnmount(child, childEl, parentEl);

        parentEl.removeChild(childEl);
    }

    return child;
};

let doUnmount = function (child, childEl, parentEl) {
    let hooks = childEl.__redom_lifecycle;

    if (hooksAreEmpty(hooks)) {
        childEl.__redom_mounted = false;
        return;
    }

    let traverse = parentEl;

    if (childEl.__redom_mounted) {
        trigger(childEl, 'onunmount');
    }

    while (traverse) {
        let parentHooks = traverse.__redom_lifecycle || {};

        for (let hook in hooks) {
            if (parentHooks[hook]) {
                parentHooks[hook] -= hooks[hook];
            }
        }

        if (hooksAreEmpty(parentHooks)) {
            traverse.__redom_lifecycle = null;
        }

        traverse = traverse.parentNode;
    }
     
};

let hooksAreEmpty = function (hooks) {
    if (hooks == null) {
        return true;
    }
    for (let key in hooks) {
        if (hooks[key]) {
            return false;
        }
    }
    return true;
};

let hookNames = ['onmount', 'onremount', 'onunmount'];
let shadowRootAvailable = typeof window !== 'undefined' && 'ShadowRoot' in window;

let mount = function (parent, child, before, replace) {
    let parentEl = getEl(parent);
    let childEl = getEl(child);

    if (child === childEl && childEl.__redom_view) {
        // try to look up the view if not provided
        child = childEl.__redom_view;
    }

    if (child !== childEl) {
        childEl.__redom_view = child;
    }

    let wasMounted = childEl.__redom_mounted;
    let oldParent = childEl.parentNode;

    if (wasMounted && (oldParent !== parentEl)) {
        doUnmount(child, childEl, oldParent);
    }

    if (before != null) {
        if (replace) {
            parentEl.replaceChild(childEl, getEl(before));
        } else {
            parentEl.insertBefore(childEl, getEl(before));
        }
    } else {
        parentEl.appendChild(childEl);
    }

    doMount(child, childEl, parentEl, oldParent);
    return child;
    
};

let doMount = function (child, childEl, parentEl, oldParent) {
    let hooks = childEl.__redom_lifecycle || (childEl.__redom_lifecycle = {});
    let remount = (parentEl === oldParent);
    let hooksFound = false;

    for (let i = 0, list = hookNames; i < list.length; i += 1) {
        let hookName = list[i];

        if (!remount) { // if already mounted, skip this phase
            if (child !== childEl) { // only Views can have lifecycle events
                if (hookName in child) {
                    hooks[hookName] = (hooks[hookName] || 0) + 1;
                }
            }
        }
        if (hooks[hookName]) {
            hooksFound = true;
        }
    }

    if (!hooksFound) {
        childEl.__redom_mounted = true;
        return;
    }

    let traverse = parentEl;
    let triggered = false;

    if (remount || (traverse && traverse.__redom_mounted)) {
        trigger(childEl, remount ? 'onremount' : 'onmount');
        triggered = true;
    }

    while (traverse) {
        let parent = traverse.parentNode;
        let parentHooks = traverse.__redom_lifecycle || (traverse.__redom_lifecycle = {});

        for (let hook in hooks) {
            parentHooks[hook] = (parentHooks[hook] || 0) + hooks[hook];
        }

        if (triggered) {
            break;
        } else {
            if (traverse === document ||
                (shadowRootAvailable && (traverse instanceof window.ShadowRoot)) ||
                (parent && parent.__redom_mounted)
            ) {
                trigger(traverse, remount ? 'onremount' : 'onmount');
                triggered = true;
            }
            traverse = parent;
        }
    }
};

let trigger = function (el, eventName) {
    if (eventName === 'onmount' || eventName === 'onremount') {
        el.__redom_mounted = true;
    } else if (eventName === 'onunmount') {
        el.__redom_mounted = false;
    }

    let hooks = el.__redom_lifecycle;

    if (!hooks) {
        return;
    }

    let view = el.__redom_view;
    let hookCount = 0;

    view && view[eventName] && view[eventName]();

    for (let hook in hooks) {
        if (hook) {
            hookCount++;
        }
    }

    if (hookCount) {
        let traverse = el.firstChild;

        while (traverse) {
            let next = traverse.nextSibling;

            trigger(traverse, eventName);

            traverse = next;
        }
    }
};

let setStyle = function (view, arg1, arg2) {
    let el = getEl(view);

    if (arg2 !== undefined) {
        el.style[arg1] = arg2;
    } else if (typeof arg1 === 'string') {
        el.setAttribute('style', arg1);
    } else {
        for (let key in arg1) {
            setStyle(el, key, arg1[key]);
        }
    }
};

/* global SVGElement */

let xlinkns = 'http://www.w3.org/1999/xlink';

let setAttr = function (view, arg1, arg2) {
    let el = getEl(view);
    let isSVG = el instanceof SVGElement;

    let isFunc = typeof arg2 === 'function';

    if (arg2 !== undefined) {
        if (arg1 === 'style') {
            setStyle(el, arg2);
        } else if (isSVG && isFunc) {
            el[arg1] = arg2;
        } else if (arg1 === 'dataset') {
            setData(el, arg2);
        } else if (!isSVG && (arg1 in el || isFunc)) {
            el[arg1] = arg2;
        } else {
            if (isSVG && (arg1 === 'xlink')) {
                setXlink(el, arg2);
                return;
            }
            el.setAttribute(arg1, arg2);
        }
    } else {
        for (let key in arg1) {
            setAttr(el, key, arg1[key]);
        }
    }
};

function setXlink (el, obj) {
    for (let key in obj) {
        el.setAttributeNS(xlinkns, key, obj[key]);
    }
}

function setData (el, obj) {
    for (let key in obj) {
        el.dataset[key] = obj[key];
    }
}

let text = function (str) { return document.createTextNode((str != null) ? str : ''); };

let parseArguments = function (element, args) {
    for (let i = 0, list = args; i < list.length; i += 1) {
        let arg = list[i];

        if (arg !== 0 && !arg) {
            continue;
        }

        let type = typeof arg;

        // support middleware
        if (type === 'function') {
            arg(element);
        } else if (type === 'string' || type === 'number') {
            element.appendChild(text(arg));
        } else if (isNode(getEl(arg))) {
            mount(element, arg);
        } else if (arg.length) {
            parseArguments(element, arg);
        } else if (type === 'object') {
            setAttr(element, arg);
        }
    }
};

let ensureEl = function (parent) { return typeof parent === 'string' ? html(parent) : getEl(parent); };
let getEl = function (parent) { return (parent.nodeType && parent) || (!parent.el && parent) || getEl(parent.el); };
let isNode = function (a) { return a && a.nodeType; };

let htmlCache = {};

let memoizeHTML = function (query) { return htmlCache[query] || (htmlCache[query] = createElement(query)); };

let html = function (query) {
    let args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    let element;

    let type = typeof query;

    if (type === 'string') {
        element = memoizeHTML(query).cloneNode(false);
    } else if (isNode(query)) {
        element = query.cloneNode(false);
    } else if (type === 'function') {
        let Query = query;
        element = new (Function.prototype.bind.apply( Query, [ null ].concat( args) ));
    } else {
        throw new Error('At least one argument required');
    }

    parseArguments(getEl(element), args);

    return element;
};

html.extend = function (query) {
    let args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    let clone = memoizeHTML(query);

    return html.bind.apply(html, [ this, clone ].concat( args ));
};

let el = html;
let h = html;

let setChildren = function (parent) {
    let children = [], len = arguments.length - 1;
    while ( len-- > 0 ) children[ len ] = arguments[ len + 1 ];

    let parentEl = getEl(parent);
    let current = traverse(parent, children, parentEl.firstChild);

    while (current) {
        let next = current.nextSibling;

        unmount(parent, current);

        current = next;
    }
};

function traverse (parent, children, _current) {
    let current = _current;

    let childEls = new Array(children.length);

    for (let i = 0; i < children.length; i++) {
        childEls[i] = children[i] && getEl(children[i]);
    }

    for (let i$1 = 0; i$1 < children.length; i$1++) {
        let child = children[i$1];

        if (!child) {
            continue;
        }

        let childEl = childEls[i$1];

        if (childEl === current) {
            current = current.nextSibling;
            continue;
        }

        if (isNode(childEl)) {
            let next = current && current.nextSibling;
            let exists = child.__redom_index != null;
            let replace = exists && next === childEls[i$1 + 1];

            mount(parent, child, current, replace);

            if (replace) {
                current = next;
            }

            continue;
        }

        if (child.length != null) {
            current = traverse(parent, child, current);
        }
    }

    return current;
}

let propKey = function (key) { return function (item) { return item[key]; }; };

let listPool = function (View, key, initData) {
    return new ListPool(View, key, initData);
};

let ListPool = function ListPool (View, key, initData) {
    this.View = View;
    this.initData = initData;
    this.oldLookup = {};
    this.lookup = {};
    this.oldViews = [];
    this.views = [];

    if (key != null) {
        this.key = typeof key === 'function' ? key : propKey(key);
    }
};
ListPool.prototype.update = function update (data, context) {
    let ref = this;
    let View = ref.View;
    let key = ref.key;
    let initData = ref.initData;
    let keySet = key != null;

    let oldLookup = this.lookup;
    let newLookup = {};

    let newViews = new Array(data.length);
    let oldViews = this.views;

    for (let i = 0; i < data.length; i++) {
        let item = data[i];
        let view = (void 0);

        if (keySet) {
            let id = key(item);

            view = oldLookup[id] || new View(initData, item, i, data);
            newLookup[id] = view;
            view.__redom_id = id;
        } else {
            view = oldViews[i] || new View(initData, item, i, data);
        }
        view.update && view.update(item, i, data, context);

        let el = getEl(view.el);

        el.__redom_view = view;
        newViews[i] = view;
    }

    this.oldViews = oldViews;
    this.views = newViews;

    this.oldLookup = oldLookup;
    this.lookup = newLookup;
};

let list = function (parent, View, key, initData) {
    return new List(parent, View, key, initData);
};

let List = function List (parent, View, key, initData) {
    this.__redom_list = true;
    this.View = View;
    this.initData = initData;
    this.views = [];
    this.pool = new ListPool(View, key, initData);
    this.el = ensureEl(parent);
    this.keySet = key != null;
};
List.prototype.update = function update (data, context) {
    if ( data === void 0 ) data = [];

    let ref = this;
    let keySet = ref.keySet;
    let oldViews = this.views;

    this.pool.update(data, context);

    let ref$1 = this.pool;
    let views = ref$1.views;
    let lookup = ref$1.lookup;

    if (keySet) {
        for (let i = 0; i < oldViews.length; i++) {
            let oldView = oldViews[i];
            let id = oldView.__redom_id;

            if (lookup[id] == null) {
                oldView.__redom_index = null;
                unmount(this, oldView);
            }
        }
    }

    for (let i$1 = 0; i$1 < views.length; i$1++) {
        let view = views[i$1];

        view.__redom_index = i$1;
    }

    setChildren(this, views);

    if (keySet) {
        this.lookup = lookup;
    }
    this.views = views;
};

List.extend = function (parent, View, key, initData) {
    return List.bind(List, parent, View, key, initData);
};

list.extend = List.extend;

/* global Node */

let place = function (View, initData) {
    return new Place(View, initData);
};

let Place = function Place (View, initData) {
    this.el = text('');
    this.visible = false;
    this.view = null;
    this._placeholder = this.el;

    if (View instanceof Node) {
        this._el = View;
    } else {
        this._View = View;
    }

    this._initData = initData;
};
Place.prototype.update = function update (visible, data) {
    let placeholder = this._placeholder;
    let parentNode = this.el.parentNode;

    if (visible) {
        if (!this.visible) {
            if (this._el) {
                mount(parentNode, this._el, placeholder);
                unmount(parentNode, placeholder);

                this.el = this._el;
                this.visible = visible;

                return;
            }
            let View = this._View;
            let view = new View(this._initData);

            this.el = getEl(view);
            this.view = view;

            mount(parentNode, view, placeholder);
            unmount(parentNode, placeholder);
        }
        this.view && this.view.update && this.view.update(data);
    } else {
        if (this.visible) {
            if (this._el) {
                mount(parentNode, placeholder, this._el);
                unmount(parentNode, this._el);

                this.el = placeholder;
                this.visible = visible;

                return;
            }
            mount(parentNode, placeholder, this.view);
            unmount(parentNode, this.view);

            this.el = placeholder;
            this.view = null;
        }
    }
    this.visible = visible;
};

let router = function (parent, Views, initData) {
    return new Router(parent, Views, initData);
};

let Router = function Router (parent, Views, initData) {
    this.el = ensureEl(parent);
    this.Views = Views;
    this.initData = initData;
};
Router.prototype.update = function update (route, data) {
    if (route !== this.route) {
        let Views = this.Views;
        let View = Views[route];

        this.route = route;
        this.view = View && new View(this.initData, data);

        setChildren(this.el, [ this.view ]);
    }
    this.view && this.view.update && this.view.update(data, route);
};

let ns = 'http://www.w3.org/2000/svg';

let svgCache = {};

let memoizeSVG = function (query) { return svgCache[query] || (svgCache[query] = createElement(query, ns)); };

let svg = function (query) {
    let args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    let element;

    let type = typeof query;

    if (type === 'string') {
        element = memoizeSVG(query).cloneNode(false);
    } else if (isNode(query)) {
        element = query.cloneNode(false);
    } else if (type === 'function') {
        let Query = query;
        element = new (Function.prototype.bind.apply( Query, [ null ].concat( args) ));
    } else {
        throw new Error('At least one argument required');
    }

    parseArguments(getEl(element), args);

    return element;
};

svg.extend = function (query) {
    let clone = memoizeSVG(query);

    return svg.bind(this, clone);
};

svg.ns = ns;

let s = svg;

export { el, h, html, list, List, listPool, ListPool, mount, unmount, place, Place, router, Router, setAttr, setStyle, setChildren, s, svg, text };