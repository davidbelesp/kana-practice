
var handwriting = function (obj) {
    if (obj instanceof handwriting) return obj;
    if (!(this instanceof handwriting)) return new handwriting(obj);
    this._wrapped = obj;
};

handwriting.recognize = function (trace, options, callback, onError) {
    if (handwriting.Canvas && this instanceof handwriting.Canvas) {
        trace = this.trace;
        options = this.options;
        callback = this.callback;
    } else if (!options) options = {};
    var data = JSON.stringify({
        "options": "enable_pre_space",
        "requests": [{
            "writing_guide": {
                "writing_area_width": options.width || this.width || undefined,
                "writing_area_height": options.height || this.width || undefined
            },
            "ink": trace,
            "language": options.language || "zh_TW"
        }]
    });
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            switch (this.status) {
                case 200:
                    var response = JSON.parse(this.responseText);
                    var results;
                    if (response.length === 1) {
                        if (onError) onError(new Error(response[0]));
                        else console.error(response[0]);
                    }
                    else results = response[1][0][1];
                    if (!!options.numOfWords) {
                        results = results.filter(function (result) {
                            return (result.length == options.numOfWords);
                        });
                    }
                    if (!!options.numOfReturn) {
                        results = results.slice(0, options.numOfReturn);
                    }
                    callback(results, undefined);
                    break;
                case 403:
                    if (onError) onError(new Error("access denied"));
                    break;
                case 503:
                    if (onError) onError(new Error("can't connect to recognition server"));
                    break;
            }


        }
    });
    xhr.open("POST", "https://www.google.com.tw/inputtools/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8");
    xhr.setRequestHeader("content-type", "application/json");
    xhr.send(data);
};

export default handwriting;
