
    var settings = {
        clientId: 1234,
        default_atm_params: {
            t: 'r',
            channel: getDevice()
        },
        webpages:[{
            name: 'Homepage',
            url: {
                path: '/'
            },
            atm_params: {
                f: 'v'
            }
        },
        {
            name: 'Category',
            url: {
               selector: '#breadcrumb-container .active h2'  
            },
            atm_params: {
                f: 'b',
                   c: waitForGlobaVar(1),  //category id
         cn:   getValueBySelector("#breadcrumb-container .active h2")    //category name
            }
        },
      {
            name: 'Product',
            url: {
                selector: '.container-product .product-info-holder' 
            },
            atm_params: {
                f: 'c',
                // c: getValueBySelector(".product-info [itemprop='brand']")  //category id
                oprc:  getValueBySelector(".product-box-content [itemprop='offers'] [itemprop='price']"),  //original price
                id:getNumberFromHref(5,'#product-id'), //sku
                // sprc: getValueBySelector(".four [itemprop='offers'] .discounted-price"), //sale price
                cn:   getValueBySelector("#breadcrumb-container li h2 a")     //category
            }
        },
    
         {
            name: 'Basket',
            url: {
                path: '/tx.pl'
            },
            atm_params: {
                f: 's',
                //  id: getListProductId2("[name='productId']"),  //product id, pass coma if >1 product added
                sprc: getValueBySelector("#cart-amount .grand-total-amt") //total basket
            }

        },{
            name: 'Checkout',
            url: {
                path: '/v1/payment'
            },
            atm_params: {
                f: 's',
               //id:  getListProductId(".minicart-item__brand-link","[A-Z0-9]{4,}"),  //product id, pass coma if >1 product added
                sprc: getValueBySelector(".payment-summary-total [amount='1']") //total basket 
            }
        },
       {
            name: 'Conversion',
            url: {
                path: '/tx-toppay-thanks.pl'
            },
            atm_params: {
                f: 'p',
                tid: getNumberFromHref(1),
                tamt: getValueBySelector(".mb-10 .text-price") //total order
            }

         //   isConversionPage: {
          //      orderId: '',
           //    orderValue: '',
              //  pixelId: ''
           // }
        }]
    };


var config = {
        getLog: function (t) { return 'RevX remarketing tag ' + t + ' page';},
        getScriptUrl: function (id) {return document.location.protocol + '//cdn.atomex.net/static/js/pxs/' + id + '/ast.js';},
        getTrackBackUrl: function(px, id, value) { return document.location.protocol + '//trk.atomex.net/cgi-bin/tracker.fcgi/conv?px='+px+'&ty=1&tid='+ id + '&tamt=' + value;},
        vePixelUrl: '//' + settings.veHostDomain + '/DataReceiverService.asmx/Pixel?journeycode=' + settings.journeycode
    };
    
    setTimeout(function(){
        var urlSettings = needsToRun(settings);

        if (!urlSettings) { return false; } //Doesn't match any url

        // 1.- thing
        //console.log(config.getLog(urlSettings.name)); 

        // 2.-. Get all the params needed. These are common.
        window._atm_client_id = settings.clientId;
        window._atm_params = {};
        for(var defaultParam in settings.default_atm_params){
            if ((settings.default_atm_params).hasOwnProperty(defaultParam)) {
                window._atm_params[defaultParam] = settings.default_atm_params[defaultParam];
            }
        }


        //for(var specialParam in settings.webpages[0].atm_params){
        //  if ((settings.webpages[0]).hasOwnProperty(specialParam)) {
        //      window._atm_params[specialParam] = settings.webpages[0].atm_params[specialParam];
        //  }
        //}

        // 3.- Needs to wait for Google tracking values
        if (urlSettings.needsGlobalParams) { 
            waitForGlobaVar(urlSettings.needsGlobalParams, continueTracking);

        } else {
            continueTracking();
        }

        function setGlobalVariables() {
            for(var param in urlSettings.atm_params){
                if ((urlSettings.atm_params).hasOwnProperty(param)) {
                    window._atm_params[param] = urlSettings.atm_params[param];
                }
            }
        }

        // 4.- Continues tracking after values from Google are in the page if they are needed.
        function continueTracking () {

            // 5.- Sets the variables into the global _atm_params
            setGlobalVariables();

            // 6.- Adds the JS from atomex
            createJS(config.getScriptUrl(settings.clientId));

            // 6B.- If it is the conversion page adds both the Pixel from Ve and the JS tracback from atomex
            if (urlSettings.isConversionPage) {
                createPixel(config.vePixelUrl);
                //createJS(config.getTrackBackUrl(settings.clientId));
            }

        }

    },1);


    function waitForGlobaVar(type) {


          switch(type){
            case 1:  //return category id
           
                    if(window.department_id){
                        return window.department_id; //return null if no match
                    }
                    return '';
                break;

    }
}

    function needsToRun(conf) {
        var url;
        for (var i = conf.webpages.length - 1; i >= 0; i--) {  
            if (matchWebPage(conf.webpages[i].url)){   
                return conf.webpages[i];  
            }
        }
        return false;
    }


    //HELPERS
    function matchWebPage(objectUrl) {
        var matches = false;
        if (objectUrl.hasOwnProperty('path')) {     //need a string
            matches = (window.location.pathname === objectUrl.path);
            if (!matches) return false;
        }
        if (objectUrl.hasOwnProperty('regexp')) {
            matches = (window.location.href.search(objectUrl.regexp) !== -1);
            if (!matches) return false;
        }
        if (objectUrl.hasOwnProperty('selector')) { 
            matches = document.querySelector(objectUrl.selector);
            if (!matches) return false;
        }
        if (objectUrl.hasOwnProperty('func')) {
            matches = getValueByFunction(objectUrl.func);
            if (!matches) return false;
        }
        return matches;
    }

    function getValue(object){
        if      (object.selector)   { return getValueBySelector(object.selector); } 
        else if (object.func)       { return getValueByFunction(object.func); } 
        else if (object.globalVar)  { return object.globalVar; }
        else if (object.google)     { return getValueByGoogle(object.google); } 
        else                        { return ''; }
    }

    function getValueByGoogle (param) {
        return window.google_tag_params[param];
    }

    function getValueByFunction (func) {
        try {
            return func();
        } catch (e) {
            return '';
        }
    }

    function getValueBySelector(selector,attribute) {
        var element = document.querySelector(selector);
        if(element && attribute){
            return element.getAttribute(attribute);
        }
         if(element){
            return element.innerHTML.trim();
        }
        return '';
    }

    function getNumberFromHref(type,selector){
        switch(type){
            case 1:  //return first number from pathname
                    var hrefValue = window.location.pathname;  
                var hrefValueSelector = document.querySelector(selector);  
                    if(hrefValue && hrefValueSelector){
                        var pattern = new RegExp("[0-9]+", "g");
                        if(hrefValue.match(pattern)!=null && hrefValue.match(pattern).length>1){
                        return hrefValue.match(pattern)0; //return null if no match
                        }
                    }
                    return '';
                break;
        
            case 2:  //return first number from href value
                var hrefValue = document.querySelector(selector);
                    if(hrefValue){
                        hrefValue = document.querySelector(selector).href;
                        var pattern = new RegExp("[0-9]{4,}");
                        return hrefValue.match(pattern); //return null if no match
                    }
                    return '';
                break;
            case 3:  //return second number from pathname
                var hrefValue = window.location.pathname;  
                var hrefValueSelector = document.querySelector(selector);  
                    if(hrefValue && hrefValueSelector){
                        var pattern = new RegExp("[0-9]+", "g");
                        if(hrefValue.match(pattern)!=null && hrefValue.match(pattern).length>1){
                        return hrefValue.match(pattern)[1]; //return null if no match
                        }
                    }
                    return '';
                break;
        
            case 4:  //return second number from href value
                var hrefValue = document.querySelector(selector);
                    if(hrefValue){
                        hrefValue = document.querySelector(selector).href;
                        var pattern = new RegExp("[0-9]+", "g");
                        return hrefValue.match(pattern)[1]; //return null if no match
                    }
                    return '';
                break;

                case 5:  //return value from input
                var hrefValue = document.querySelector(selector);
                    if(hrefValue){
                        hrefValue = document.querySelector(selector).value;
                        return hrefValue; //return null if no match
                    }
                    return '';
                break;

                case 6:  //return number from html
                var hrefValue = document.querySelector(selector);
                    if(hrefValue){
                        hrefValue = document.querySelector(selector).innerHTML;
                        hrefValue = hrefValue.match("[0-9]+");
                        return hrefValue; //return null if no match
                    }
                    return '';
                break;
        }
    }   

    function getListProductId(selector,regex){
        var element = document.querySelectorAll(selector);
        if(element){
            var basket = [];
            var vePattern = new RegExp(regex);
            for (var i = element.length - 1; i >= 0; i--) {  
                if (element[i]){  
                    basket[i] = element[i].href.match(vePattern)[0]; 
                }
            }
            return basket.toString();
        }
        return '';
    }

        function getListProductId2(selector){
        var element = document.querySelectorAll(selector);
        if(element){
            var basket = [];
            for (var i = element.length - 1; i >= 0; i--) {  
                if (element[i]){  
                    basket[i] = element[i].value; 
                }
            }
            return basket.toString();
        }
        return '';
    }


    function replaceValue(selector,replace1,replace2){
        var element = getValueBySelector(selector);
        if (element && replace2){
            element = element.replace(replace1,replace2);
            return element;
        }
          if (element){
            element = element.replace(replace1,'');
            return element;
        }
    }

    function createJS(url) {
        var ast = document.createElement('script'); 
        ast.type = "text/javascript";
        ast.src = url;
        document.body.appendChild(ast);
    }

    function createPixel(url) {
        var ast = document.createElement('img');
        ast.width = "1"; 
        ast.height = "1";    
        ast.src = url;
        document.body.appendChild(ast);   
    }

    function getAsyncValue(object, key, callback) {
        if(object && object[key]) {
            return callback(object[key]);
        } else{
            var timerId = window.setInterval(function(){
                if(object && object[key]) {
                    clerInterval(timerId);
                    return callback(object[key]);
                }
            },500); 
        }
    }

    function getDevice(){
        return ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) ? 'm' : 'd';
    }
