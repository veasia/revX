# revX

main.js: Script to implement pixels for "revX"


## How to use by Tech

### Setup

revX pixel must be implemented if available on:
- home page
- category/sub category pages
- product pages
- basket page
- checkout page
- complete page


#### 1. Modify the default settings (provided in the ticket) and replace it with the correct values:

```javascript
  clientId: 1234,
```

#### 2. Configure the URLs to identify the pages.  

You can use a path or a selector to identify the page. (path value will do a comparaison with window.location.pathname value)

```javascript
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

```

#### 3. Configure the parameters to send with the pixel.  

You need to configure the below parameters (if available)

- category/sub category pages: category/sub category id, category/sub category name
- product pages: category/sub category id, category/sub category name, product name, product id, product price (before and after discount)
- basket page: order amount, list of product id (array)
- checkout page: order amount, list of product id (array)
- complete page: order amount, order id, list of product id (array)

Other parameters can be requested by trader (will be mentioned in the ticket)
 
```javascript
     atm_params: {
                f: 'c',
             // c: getValueBySelector(".product-info [itemprop='brand']")  //category id
             oprc: getValueBySelector(".product-box-content [itemprop='offers'] [itemprop='price']"),  //original price
               id: getNumberFromHref(5,'#product-id'), //sku
          // sprc: getValueBySelector(".four [itemprop='offers'] .discounted-price"), //sale price
               cn: getValueBySelector("#breadcrumb-container li h2 a")     //category
            }

```
#### 4.  Use helpers function to configure parameters

Some re-usable functions have been added to the code such as:

 4.1. getValueBySelector(N) 

returns innerHTML without spaces

 4.2. getNumberFromHref(N,selector) for N ∈{1,6}

returns a number from a path (url, src) or html element (input….), useful to get ids

 4.3. replaceValue(selector, replace1,replace2)

used to clean a string

 4.4. getListProductId(selector,regex)

returns an array of id

 4.5. waitForGlobalVar(type) 

returns a global variable

#### 5.  Add any other additional functions needed to configure parameters

You can add them at the end of the script.

#### 6. Once configured, you can easily test on client's website by injecting your script into the console.

Look for “atomex” in the network (for each page configured) and make sure the parameters are correct.

![Settings Window](/atomex.png)

#### 7. Copy all the content to the Custom Events of the client under VeCapture Manager Profiles inside the function onTagPageLoad and add a timeout of 1ms.

```javascript
      {onTagPageLoad: (function(window) {
      setTimeout(function(){  //content of main.js here 
      },1);
      })(window)}
```
It should look something like this. Please be aware that there might be other CustomEvents and other Settings. Do not remove them. Also be careful with the trailing comma in objects: last element in an object can’t have comma.

![Settings Window](/capture.png)

Test again on staging and make sure there are no errors on client’s website.
Then you can live the scripts and close the ticket.


## Version Log

### Version 1.0

- It adds the revX pixel on different pages
- Use a set of reusable functions


### Known limitations from The Trade Desk

- Some parameters might not be present on client's website.
- Extra work might be needed to configure some parameters.
- This revX script was developed in a short time with few resources, revX is rarely used by Traders, if the demand is higher, we must consider to improve the script.
- After implementation, tech should carefully make sure the script is not conflicting with client’s website.

