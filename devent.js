const EventDispatcher = require('event-dispatcher').EventDispatcher;

const defaultDispatcher = new EventDispatcher();

function sendEvent(action, data) {
    defaultDispatcher.dispatchEvent(action, data);
}

function bind(action, func, context) {
    defaultDispatcher.addBinding(action, {
        func: func,
        context: context,
        async: false
    });
}

/**
 * 异步通知
 */
function bindAsync(action, func, context) {
    defaultDispatcher.addBinding(action, {
        func: func,
        context: context,
        async: true
    });
}

function remove(action, func, context) {
    defaultDispatcher.removeBinding(action, {
        func: func,
        context: context
    });
}

/**
 * 根据 event名(不分大小写) 做查找，虽然有点蛋疼，但是没有函数extra information的情况下想自动一点只能这样了
 */
function autoBind(context) {
    doAutoBind(context, false);
}

function autoBindAsync(context) {
    doAutoBind(context, true);
}

function doAutoBind(context, async) {
    Object.keys(context).forEach(function (key) {
        if(context.hasOwnProperty(key)) {
            let value = context[key];

            //用函数名来做查找的依据
            if(typeof value === "function" && EventKeys.indexOf(key.toLowerCase()) !== -1) {
                defaultDispatcher.addBinding(key, {
                    func: value,
                    context: context,
                    async: async
                });
            }
        }
    });
}

function autoUnbind(context) {
    Object.keys(context).forEach(function (key) {
        if(context.hasOwnProperty(key)) {
            let value = context[key];

            //用函数名来做查找的依据
            if(typeof value === "function" && EventKeys.indexOf(key.toLowerCase()) !== -1) {
                defaultDispatcher.removeBinding(key, {
                    func: value,
                    context: context
                });
            }
        }
    });
}

const DEventActions = {
    OnLoginSuccess: "OnLoginSuccess",    // no params
    OnLoginFailed: "OnLoginFailed",

    OnWssLoginSuccess: "OnWssLoginSuccess",

    OnPushStoreChange: "OnPushStoreChange", //这个相当于user change

    OnNewPushNotify: "OnNewPushNotify",

    OnPushGroupMessage: "OnPushGroupMessage", //
    OnPushNotify: "OnPushNotify",

    OnNewGroupMessageNotify: "OnNewGroupMessageNotify",  //新聊天消息通知

    OnHttpRequestNeedLogin: "OnHttpRequestNeedLogin", //发协议需要登录时

    OnServerConfigSync: "OnServerConfigSync", //获取到服务器的配置信息
};

const EventKeys = Object.keys(DEventActions).map(function (value) {
    return value.toLowerCase();
});

module.exports = {
    DEventActions: DEventActions,
    bind: bind,
    bindAsync: bindAsync,
    remove: remove,
    sendEvent: sendEvent,
    autoBind: autoBind,
    autoBindAsync: autoBindAsync,
    autoUnbind: autoUnbind
};