var request = require('request');

module.exports = function(RED)
{
    function translator(config)
    {
        RED.nodes.createNode(this,config);
        var node = this;
        this.on('input', function(msg)
        {
            node.status({fill: "blue", shape: "dot", text: "Requesting"});
            if (this.credentials == null || this.credentials.key == null || this.credentials.key == "")
            {
                node.error("Input subscription key", msg);
                node.status({fill: "red", shape: "ring", text: "Error"});
                console.log("Input subscription key");
            } else if(config.url == null || config.url == ''){
                node.error("no url found", msg);
                node.status({fill: "red", shape: "ring", text: "Error"});
                console.log("no url found");
            }
            else
            {
                var options = { 
                    method: 'POST',
                    url: config.url + '/translator/text/v3.0/translate',
                    qs: { 'api-version': '3.0', to: config.to == '' ? msg.to : config.to},
                    headers: {
                        'cache-control': 'no-cache',
                        'content-type': 'application/json',
                        'ocp-apim-subscription-key': this.credentials.key
                    },
                    body: [ { Text: msg.payload } ],
                    json: true
                };  
                    request.post(options, function (error, response, body)
                    {
                        try 
                        {
                            if(!error)
                            {
                                msg.translated = body[0].translations[0].text
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

    RED.nodes.registerType("Translator", translator,
    {
        credentials: {
            key: {
                type: "password"
            }
        }
    });                       
}