# InstantLoad
InstantLoadJS is a JavaScript library to speed up your site.

## How does it work?
InstantLoad makes your website a one-page website by preloading the next page on your website when hovering a link. When the user clicks the link, the already loaded page replaces the current one with an instant transition. In addition InstantLoadJS offers seamless loading animations to make your website look even more modern.

## Install
CDN:

    cdn_link

NPM:

    npm_install_command

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

More comming soon...

## Customize the loading styles
You can configure the different loading styles via CSS. You can find the CSS selectors to use above.
|Selector |Element |
|---------------------|-------------------------------|
|`#instantload-bar`     |The loading line of the bar styled loading|
|`#instantload-whiteScreen`|The blink styled loading's layer|
|`#instantload-circle`|The circle styled spinner loading's container|
|`#instantload-circle-spinner`|The circle styled loading's spinner|

## Contributions
You are more than welcome contributing to the library.

Make sure to do `npm install`, after cloning the repository to install `UglifyJs` as a devDependency. Use this command to minify:

    uglifyjs instantload.js --output instantload.min.js --mangle --source-map

Please make a pull request if you have implemented something new
