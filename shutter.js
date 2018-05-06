Array.prototype.contains = function(element){
    return this.indexOf(element) > -1;
};

module.exports = function(RED) {
    function Shutter(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            var position = node.context().get('position') || 100;
            var status = node.context().get('status') || "STOP";
            var stopMsg = {'topic':'action', 'payload':'STOP'};
            var closeMsg = {'topic':'position', 'payload':100};
            var openMsg = {'topic':'position', 'payload':0};

            switch(true){
                case /up/.test(msg.topic.toLowerCase()):
                    switch(msg.payload){
                        case "SHORT":
                            if (status == "STOP"){
                                node.send([null, openMsg]);
                            }else{
                                node.send([stopMsg, null]);
                            }
                            break;
                        case "LONG":
                            if (status != "UP"){
                                node.send([null, (status == "STOP" ? openMsg : closeMsg)]);
                            }
                            break;
                        case "RELEASED":
                            node.send([stopMsg, null]);
                            break;
                        default:
                            node.warn("Unable to process payload in this message", msg);
                    }
                    break;
                case /down/.test(msg.topic.toLowerCase()):
                    switch(msg.payload){
                        case "SHORT":
                            if (status == "STOP"){
                                node.send([null, closeMsg]);
                            }else{
                                node.send([stopMsg, null]);
                            }
                            break;
                        case "LONG":
                            if (status != "DOWN"){
                                node.send([null, (status == "STOP" ? closeMsg : openMsg)]);
                            }
                            break;
                        case "RELEASED":
                            node.send([stopMsg, null]);
                            break;
                        default:
                            node.warn("Unable to process payload in this message", msg);
                    }
                    break;
                case /status/.test(msg.topic.toLowerCase()):
                    if(['STOP', 'UP', 'DOWN'].contains(msg.payload.toUpperCase())){
                        node.context().set('status', msg.payload.toUpperCase());
                        node.status({fill:(msg.payload == "STOP" ? "grey" : (msg.payload == "UP" ? "green" : "red" )),shape:"dot",text:msg.payload+" ("+position+"%)"});
                    }else{
                        node.warn("Value not allowed for STATUS: "+msg.payload);
                    }
                    break;
                case /position/.test(msg.topic.toLowerCase()):
                    node.context().set('position', msg.payload);
                    node.status({fill:(status == "STOP" ? "grey" : (status == "UP" ? "green" : "red" )),shape:"dot",text:status+" ("+msg.payload+"%)"});
                    break;
                default:
                node.warn("Unable to process this message", msg);
            }
        });
    }
    RED.nodes.registerType("shutter",Shutter);
}