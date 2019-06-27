class EventBus {
    constructor(){
        this.events = this.events || {};
    }
}
EventBus.prototype.emit = function(type,...args){
    let e = this.events[type];

    e[0].apply(this,args);
};
EventBus.prototype.addListener = function(type,fun){
    const e = this.events[type];
    if(!e) {
        this.events[type] = [fun];
    }else{
        e.unshift(fun);
    }
}

const eventBus = new EventBus();
export default eventBus;