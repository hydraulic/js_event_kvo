function EventDispatcher() {
    //不可枚举，不可写
    Object.defineProperty(this, "connections", {
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });
}

/**
 * @param data 不考虑变长参数了，想搞多个参数，自己包个数组吧
 */
EventDispatcher.prototype.dispatchEvent = function (action, data) {
    let that = this;

    let connection = that.connections[action];

    if(connection) {
        connection.forEach(function (receiver, index, array) {
            if(!receiver.async) {
                receiver.func.call(receiver.context, action, data);
            } else {
                setTimeout(function () {
                    receiver.func.call(receiver.context, action, data);
                }, 0);
            }
        });
    }
};

/**
 * @param receiver = {
               func: function () {}, //回调函数
               context: that,  //上下文，就是this
               async: false   //是否异步
          };
 * @returns {boolean} false is duplicate bind, true is first and success bind
 */
EventDispatcher.prototype.addBinding = function (action, receiver) {
    let connection = this.connections[action];

    if(!connection) {
        connection = [];

        this.connections[action] = connection;
    }

    let index= -1;

    for(let i = 0; i < connection.length; i++) {
        if(isReceiverEqual(receiver, connection[i])) {
            index = i;
            break;
        }
    }

    if(index === -1) {
        connection.push(receiver);
    }

    return index === -1;
};

/**
 * @returns {boolean} true if success removed, false if not found
 */
EventDispatcher.prototype.removeBinding = function (action, receiver) {
    let connection = this.connections[action];

    let index = -1;

    if(connection) {
        for(let i = 0; i < connection.length; i++) {
            if(isReceiverEqual(receiver, connection[i])) {
                index = i;
                break;
            }
        }

        if(index !== -1) {
            connection.splice(index);
        }

        if(connection.length === 0) {
            delete this.connections[action];
        }
    }

    return index !== -1;
};

/**
 * @returns {boolean}
 */
function isReceiverEqual(receiverA, receiverB) {
    return receiverA.func === receiverB.func && (receiverA.context === receiverB.context
        || (!receiverA.context && !receiverB.context));
}

module.exports = {
    EventDispatcher: EventDispatcher,
};