const EventDispatcher = require('./event-dispatcher').EventDispatcher;

/**
 * 字段不要和originObj以及dispatcher重名
 */
function KvoSource(originObj) {
    let that = this;

    Object.defineProperty(that, "originObj", {
        enumerable: false,
        configurable: false,
        writable: false,
        value: originObj ? originObj : {}
    });

    Object.defineProperty(that, "dispatcher", {
        enumerable: false,
        configurable: false,
        writable: false,
        value: new EventDispatcher()
    });

    if(originObj) {
        Object.keys(originObj).forEach(function (key) {
            if(originObj.hasOwnProperty(key)) {
                that.addMethod(key);
            }
        });
    }
}

KvoSource.prototype.addDescriptor = function (key) {
    let descriptor = Object.getOwnPropertyDescriptor(this, key);

    if(!descriptor || !descriptor.get || !descriptor.set) {
        this.addMethod(key);
    }
};

KvoSource.prototype.addMethod = function (key) {
    let that = this;

    Object.defineProperty(that, key, {
        get: function () {
            return that.originObj[key];
        },
        set: function (value) {
            that.setKvoValue(key, value);
        },
        enumerable: true,
    });
};

/**
 * 如果绑定的key没有set get等属性，自动添加property和set、get方法
 */
KvoSource.prototype.bind = function (key, func, context) {
    let that = this;

    that.addDescriptor(key);

    let receiver = {
        func: func,
        context: context,
        async: true
    };

    if(that.dispatcher.addBinding(key, receiver)) {
        that.dispatcher.dispatchEventTo(receiver, key, {
            oldValue: null,
            newValue: that[key],
            source: that
        });
    }
};

KvoSource.prototype.unbind = function (key, func, context) {
    this.dispatcher.removeBinding(key, {
        func: func,
        context: context,
        async: true
    });
};

KvoSource.prototype.setKvoValue = function (key, value) {
    let preValue = this.originObj[key];

    if(preValue !== value) {
        this.originObj[key] = value;

        this.notifyKvoEvent(key, preValue, value);
    }
};

KvoSource.prototype.notifyKvoEvent = function (key, oldValue, newValue) {
    let that = this;

    that.dispatcher.dispatchEvent(key, {
        oldValue: oldValue,
        newValue: newValue,
        source: that
    });
};

// TODO: Homer 2017/12/10 后面可以递归监控引用类型属性的变更

/**
 * 因为目前kvo对于引用类型，没有实现的这么细致，所以对于引用类型属性的更改可以手动setValue一下，无脑notify
 */
KvoSource.prototype.setValue = function (key, value) {
    let preValue = this.originObj[key];

    this.originObj[key] = value;

    this.notifyKvoEvent(key, preValue, value);
};

/**
 * notify a key change manually
 * 还是一般用于引用类型属性变更的主动通知
 */
KvoSource.prototype.notify = function (key) {
    let value = this[key];

    this.notifyKvoEvent(key, value, value);
};

function kvo(obj) {
    return new KvoSource(obj);
}

module.exports = {
    kvo: kvo,
    KvoSource: KvoSource,
};