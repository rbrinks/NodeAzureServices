var request = require('request');

module.exports = function(RED)
{
    function qna(config)
    {
        RED.nodes.createNode(this,config);
        var node = this;
        this.on('input', function(msg)
        {
            node.status({fill: "blue", shape: "dot", text: "Requesting"});
            if (this.credentials == null || this.credentials.key == null || this.credentials.key == "")
            {
                node.error("Input EndpointKey key", msg);
                node.status({fill: "red", shape: "ring", text: "Error"});
                console.log("Input EndpointKey key");
            } else if(config.url == null || config.url == ''){
                node.error("no url found", msg);
                node.status({fill: "red", shape: "ring", text: "Error"});
                console.log("no url found");
            }
            else
            {
                var options = { 
                    method: 'POST',
                    url: config.url,
                    headers: {
                        'cache-control': 'no-cache',
                        'content-type': 'application/json',
                        authorization: this.credentials.key
                    },
                    body: {question: msg.payload },
                    json: true
                };  
                    request.post(options, function (error, response, body)
                    {
                        try 
                        {
                            if(!error)
                            {
                                msg.qna_score = body.answers[0].score
                                msg.qna_answer = body.answers[0].answer
                                node.send(msg);
                                node.status({});
                            }
                        }
                        catch (e)
                        {
                            node.error(e, msg);
                            node.status({fill: "red", shape: "ring", text: "Error"});
                        }
                        
                    });
            }
        });
    }

    RED.nodes.registerType("qna", qna,
    {
        credentials: {
            key: {
                type: "password"
            }
        }
    });                       
}