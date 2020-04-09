# InstantLoad
InstantLoadJS is a JavaScript library to speed up your site.

## How does it work?
InstantLoad makes your website a one-page website by preloading the next page on your website when hovering a link. When the user clicks the link, the already loaded page replaces the current one with an instant transition. In addition InstantLoadJS offers seamless loading animations to make your website look even more modern.

## Install
CDN:

    https://unpkg.com/instant-load@1.1.1/instantload.min.js

NPM:

    npm i instant-load

## Initialize
Place the InstantLoad script on the bottom of your webpage, before any other scripts, like this:

    <script src="/path/to/instantload.min.js" instantload-blacklist></script>

After adding the `instantload.min.js` script to your site, you'll need to initialize the library by adding this script after it:

    <script instantload-blacklist>InstantLoad.init();</script>

It's important to keep the `instantload-blacklist` attribute on the scripts above.

## Configure
InstantLoad offers high level customizations via it's config. You can pass your settings through the `InstantLoad.init()` function, like this:

    InstantLoad.init({reloadPagesOnPopstate: false, loadingStyle: InstantLoad.configOptions.loadingStyles.circle});

### Full list of config options
|Config property name |Type                           |Description                  |
|---------------------|-------------------------------|-----------------------------|
|reloadPagesOnPopstate|`boolean`                      |If `true`, on pressing the back/forward button, the target page will be reloaded. <br>Default: `false`|
|loadingStyle               |`InstantLoad.configOptions.loadingStyles`            |Customize the loading transition.<br>Possible values:<br>- `bar`<br> - `blink`<br>- `circle`<br>- `invisible`<br>Default: `bar`|

More coming soon...

## API
The InstantLoad object returns some useful values. Let's take a look at them!

### `InstantLoad.init()`
This will initialize the InstantLoad script and start speeding up you site

### `InstantLoad.config()`
This will return the current config for the library. You can also use it to change the config, after initializing InstantLoad.

### `InstantLoad.on('eventType', callback)`
Used to add your own events to InstantLoad. More belove

### `InstantLoad.history`
This will return the history of your site, after initializing the library.

### `InstantLoad.configOptions`
This stores the options for different config elements

### `InstantLoad.isRunning`
Check if InstantLoad had been initialized

### Blacklisting scripts
If you don't want your scripts to get re-inserted and re-initialized, you will find the `instantload-blacklist` attribute really useful. Add it to your scripts to blacklist it from InstantLoad, like this:

    <script src="/path/to/my/script.js" instantload-blacklist></script>

## Event Handling
InstantLoad has it's own events, and you can listen to them like this:

    InstantLoad.on('change', function(event) {console.log('Page changed', event)});

### Event types
|Event type|Return values |Description|
|----------|-----------|-----------|
|`init`    |`eventType`: `init`<br>`trackedElements`: All preloadable elements |Occurs after the initialization of InstantLoad|
|`preload` |`eventType`: `preload` |Occurs before preloading a page, when hovering a link|
|`postload`|`eventType`: `postload`<br>`success`: Whether the request was successful<br>`message`: Request message |Occurs after preloading a page, when hovering a link|
|`change`  |`eventType`: `change`<br>`popstateEvent`: Whether the change was triggered by the back/forward arrows or not |Occurs after changing the page|

## Customize the loading styles
You can configure the different loading styles via CSS. You can find the CSS selectors to use above.
|Selector |Element |
|---------------------|-------------------------------|
|`#instantload-bar`     |The loading line of the bar styled loading|
|`#instantload-whiteScreen`|The blink styled loading's layer|
|`#instantload-circle`|The circle styled spinner loading's container|
|`#instantload-circle-spinner`|The circle styled loading's spinner|

## Why did I make this library?
I was working on a project of mine, and I wanted to use the well-known [instantclick.io](https://github.com/dieulot/instantclick) library, but I realized, that while it is great and very much useful, it lacks some customizations I'd like to use and it is a bit buggy.

So I sat down and wrote my own version of it.

Hope you like it :) Thank you for the inspiration [instantclick](https://github.com/dieulot/instantclick)

## Contributions
You are more than welcome contributing to the library.

Make sure to do `npm install`, after cloning the repository to install `UglifyJs` as a devDependency. Use this command to minify:

    uglifyjs instantload.js --output instantload.min.js --mangle --source-map

Please make a pull request if you have implemented something new
