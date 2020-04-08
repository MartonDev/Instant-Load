/*
 *
 * InstantLoad
 * Github: https://github.com/MartonDev/Instant-Load
 * Created by Marton Lederer (https://marton.lederer.hu)
 * Copyright (c) 2020- Marton Lederer
 *
 */

let instantload, InstantLoad = instantload = function() {

  //elements needed to be changed durring the InstantLoad processes
  //is the InstantLoad script running
  let running = false,
  //all elements that can be preloaded
  preloadableElements = [],
  //the current request to preload a page
  currentPageReq = null,
  //the instentload container in the dom
  instantloadContainer = null;

  //functions and arrays
  const preloadedPages = [],
  //custom InstantLoad events
  events = {preload: [], postload: [], change: [], init: []},
  //custom InstantLoad history, to overwrite the default
  instantHistory = {},

  //different styles when changing page
  loadingStyle = {

    bar: {

      startLoading: () => {

        const bar = document.createElement('div');

        bar.classList.add('bar');
        bar.id = 'instantload-bar';

        bar.loadingIncrease = setInterval(() => {

          bar.style.width = `calc(${bar.style.width} + 20vw)`;

        }, 830);

        instantloadContainer.appendChild(bar);

      },

      endLoading: () => {

        const bar = instantloadContainer.querySelectorAll('.bar')[0];

        bar.loadingIncrease = null;
        bar.style.width = '100vw';
        setTimeout(() => {

          bar.style.opacity = '0';
          setTimeout(() => {

            bar.remove();

          }, 300);

        }, 170);

      }

    },

    blink: {

      startLoading: () => {

        const whiteScreen = document.createElement('div');

        whiteScreen.classList.add('blink');
        whiteScreen.id = 'instantload-whiteScreen';
        instantloadContainer.appendChild(whiteScreen);
        whiteScreen.style.opacity = '1';

      },

      endLoading: () => {

        const whiteScreen = instantloadContainer.querySelectorAll('.blink')[0];

        setTimeout(() => {

          whiteScreen.style.opacity = '0';

          setTimeout(() => {

            whiteScreen.remove();

          }, 300);

        }, 300);

      }

    },

    circle: {

      startLoading: () => {

        const circle = document.createElement('div'),
        spinner = document.createElement('div');

        circle.classList.add('circle');
        circle.id = 'instantload-circle';
        spinner.classList.add('spinner');
        circle.appendChild(spinner);
        instantloadContainer.appendChild(circle);
        circle.style.opacity = '1';

      },

      endLoading: () => {

        const circle = instantloadContainer.querySelectorAll('.circle')[0];

        setTimeout(() => {

          circle.style.opacity = '0';

          setTimeout(() => {

            circle.remove();

          }, 300);

        }, 450);

      }

    },

    invisible: {

      startLoading: () => {

        //nothing here, invisible style has no loading animation

      },

      endLoading: () => {

        //nothing here, invisible style has no loading animation

      }

    }

  },

  //InstantLoad config, first passed through the init() function, can be changed later
  config = {reloadPagesOnPopstate: false, loadingStyle: loadingStyle.bar},

  //add custom css for loading styles and loading element
  addCustomStyleAndElements = () => {

    const styleElement = document.createElement('style');
    instantloadContainer = document.createElement('div');

    styleElement.innerText = '.instantload-container {position: fixed; top: 0; left: 0; width: 100vw; z-index: 1000000; overflow: hidden;} .instantload-container .bar {height: 4px; width: 0vw; background-color: #4287f5; opacity: 1; -webkit-transition: all .3s; -moz-transition: all .3s; -ms-transition: all .3s; -o-transition: all .3s; transition: all .3s;} .instantload-container .blink {width: 100vw; height: 100vh; background-color: #fff; opacity: 0; -webkit-transition: all .3s; -moz-transition: all .3s; -ms-transition: all .3s; -o-transition: all .3s; transition: all .3s;} .instantload-container .circle {position: relative; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, .5); opacity: 0; -webkit-transition: all .3s; -moz-transition: all .3s; -ms-transition: all .3s; -o-transition: all .3s; transition: all .3s;} .instantload-container .circle .spinner {position: absolute; top: 50%; left: 50%; width: 50px; height: 50px; border: 3px solid rgba(255, 255, 255, .3); border-radius: 50%; border-top-color: #fff; animation: spin .44s ease-in-out infinite; -webkit-animation: spin .44s ease-in-out infinite;} @keyframes spin {to{transform: rotate(360deg) translate(0, 0); -webkit-transform: rotate(360deg) translate(0, 0);}}@-webkit-keyframes spin {to{transform: rotate(360deg) translate(0, 0); -webkit-transform: rotate(360deg) translate(0, 0);}}}';
    instantloadContainer.classList.add('instantload-container');

    document.head.appendChild(styleElement);
    document.body.appendChild(instantloadContainer);

  },

  //trigger custom InstantLoad events
  triggerEvent = (eventType) => {

    for(let i = 0; i < events[eventType].length; i++) {

      events[eventType][i]();

    }

  },

  //register a new InstantLoad event
  registerEvent = (eventType, callback) => {

    events[eventType].push(callback);

  },

  //update script tags
  updateScripts = () => {

    let originalScripts = [];

    //since we delete and add scripts the querySelectorAll('script') content will always change, and we would loop through the cloned scripts too, we need to add the original scripts to an array
    document.head.querySelectorAll('script').forEach((script) => {

      if(!script.hasAttribute('instantload-blacklist'))
        originalScripts.push(script);

    });
    document.body.querySelectorAll('script').forEach((script) => {

      if(!script.hasAttribute('instantload-blacklist'))
        originalScripts.push(script);

    });

    for(let i = 0; i < originalScripts.length; i++) {

      if(originalScripts[i].instantload_tracked != true)
        continue;

      let cloneScript = document.createElement('script'),
      originalScript = originalScripts[i],
      parent = originalScript.parentNode,
      nextEl = originalScript.nextSiblings;

      //cloning text
      cloneScript.textContent = originalScript.textContent;
      cloneScript.instantload_tracked = true;

      //cloning all attrs
      for(let j = 0; j < originalScript.attributes.length; j++) {

        cloneScript.setAttribute(originalScript.attributes[j].name, originalScript.attributes[j].value);

      }

      originalScript.remove();
      parent.insertBefore(cloneScript, nextEl);

    }

  },

  //removes hashes
  clearURL = (url) => {

    return url.split('#').join('');

  },

  //listen for changes in the dom with the MutationObserver API
  //updates the event listeners to listen for newly added preloadable elements
  domChangeListener = new MutationObserver((mutations) => {

    const changedHyperlinks = [];

    for(let i = 0; i < mutations.length; i++) {

      mutations[i].addedNodes.forEach((node) => {

        if(node.tagName != null && node.tagName.toLowerCase() == 'a' && isPreloadable(node))
          changedHyperlinks.push(node);

      });

    }

    if(changedHyperlinks.legth == 0)
      return;

    clearTrackedElements();
    trackPreloadableElements();

  }),

  //change page to a preloaded one
  //updates the page body, updates the history, triggers change event
  changePage = (preloadedPage, url) => {

    instantHistory[clearURL(location.href)].scrollPos = {x: window.scrollX, y: window.scrollY};
    currentPageReq.abort();

    clearTrackedElements();
    domChangeListener.disconnect();

    document.documentElement.replaceChild(preloadedPage.body, document.body);
    document.documentElement.replaceChild(preloadedPage.head, document.head);

    addCustomStyleAndElements();
    config.loadingStyle.startLoading();

    //we need to manually replace scripts to make them function
    updateScripts();

    if(url != null) {

      history.pushState(null, null, url);
      scrollTo(0, 0);
      instantHistory[clearURL(location.href)] = {

        document: {head: document.head, body: document.body},
        scrollPos: {x: window.scrollX, y: window.scrollY}

      };

    }

    domChangeListener.observe(document.body, {childList: true});
    trackPreloadableElements();
    triggerEvent('change');
    config.loadingStyle.endLoading();

  },

  //send a request to a page and preload it
  //triggers preload event, stores the preloaded data within the element, triggers postload event
  preloadPage = (url, element, callback) => {

    triggerEvent('preload');

    currentPageReq = new XMLHttpRequest();

    currentPageReq.open('get', url);
    currentPageReq.timeout = 90000;
    currentPageReq.send();
    currentPageReq.onload = () => {

      //creating an empty document to fill with the response
      let newDocument = document.implementation.createHTMLDocument('');

      newDocument.documentElement.innerHTML = currentPageReq.responseText;
      element.preloadedPage = newDocument;

      triggerEvent('postload');

      callback();

    };

  },

  //back or forward button event
  popstateEvent = (e) => {

    if(instantHistory[clearURL(location.href)] == null) {

      location.reload();

    }else {

      changePage(instantHistory[clearURL(location.href)].document);
      scrollTo(instantHistory[clearURL(location.href)].scrollPos.x, instantHistory[clearURL(location.href)].scrollPos.y);

    }

  },

  //hover event of a preloadable element
  //calls the preloadPage() function to preload the target of the hovered element
  mouseOverEvent = (e) => {

    if(e.target.isPreloaded)
      return;

    preloadPage(clearURL(e.target.href), e.target, () => {

      e.target.isPreloaded = true;

    });

  },

  //mouse click event of a preloadable element
  //prevents the default redirect action, preloads the page if it isn't preloaded already, calls the changePage() function to update the document
  mouseClickEvent = (e) => {

    e.preventDefault();

    if(e.target.isPreloaded) {

      e.target.isPreloaded = false;
      changePage(e.target.preloadedPage, e.target.href);

    }else {

      //if somewhy the page isn't preloaded yet, we need to load it before we change the page
      preloadPage(clearURL(e.target.href), e.target, () => {

        e.target.isPreloaded = true;
        changePage(e.target.preloadedPage, e.target.href);

      });

    }

  },

  //the 'instantload-blacklist' attribute can be used for InstantLoad to ignore elements
  //this is necessary for the instantload scripts
  isNoPreload = (element) => {

    if(element.hasAttribute('instantload-blacklist'))
      return true;

    return false;

  },

  //check if the desired element is preloadable
  //check if the target is not '_blank', if the target doesn't point to a local url and if it is blacklisted
  isPreloadable = (element) => {

    const localhost = location.protocol + '//' + location.host + '/';

    if(element.taget || element.href.indexOf(localhost) != 0 || isNoPreload(element))
      return false;

    return true;

  },

  //adds InstantLoad event listeners
  addEventListeners = () => {

    for(let i = 0; i < preloadableElements.length; i++) {

      preloadableElements[i].addEventListener('mouseover', mouseOverEvent);
      preloadableElements[i].addEventListener('click', mouseClickEvent);

    }

    window.addEventListener('popstate', popstateEvent);

  },

  //tracks all the preloadable elements using the isPreloadable function and calls the addEventListeners() function
  trackPreloadableElements = () => {

    document.querySelectorAll('a').forEach(function(element) {

      if(isPreloadable(element)) {

        preloadableElements.push(element);

      }

    });

    addEventListeners();

  },

  //removes InstantLoad event listeners
  removeEventListeners = () => {

    for(let i = 0; i < preloadableElements.length; i++) {

      preloadableElements[i].removeEventListener('mouseover', mouseOverEvent);
      preloadableElements[i].removeEventListener('click', mouseClickEvent);

    }

  },

  //calls the removeEventListeners() function and clears all preloadable elements
  clearTrackedElements = () => {

    removeEventListeners();
    preloadableElements = [];

  },

  //checks if it's supported to use InstantLoad
  isSupported = () => {

    //if the pushState() function is not present in the History API, InstantLoad is not supported
    if(!'pushState' in history)
      return false;

    //you need to host your files from a server, file: protocol is not working, because we cannot preload from local machine
    if(location.protocol == 'file:')
      return false;

    return true;

  },

  //return if the library is running
  isRunning = () => {

    return running;

  },

  //return the config
  getConfig = () => {

    return config;

  },

  //initialize InstantLoad to the page
  //return if there is already an instance of InstantLoad running or if the browser/protocol is not supported
  init = (cfg) => {

    if(running) {

      console.warn('InstantLoad is already initialized.');
      return;

    }

    running = true;

    if(!isSupported()) {

      console.error('InstantLoad is not supported in this browser or protocol!');
      return;

    }

    if(cfg != null) {

      for(option in cfg) {

        //we could do config = cfg, but if the user doesn't pass all config options, we would loose some values
        config[option] = cfg[option];

      }

    }

    addCustomStyleAndElements();
    trackPreloadableElements();

    instantHistory[clearURL(location.href)] = {

      document: {head: document.head, body: document.body},
      scrollPos: {x: window.scrollX, y: window.scrollY}

    };
    domChangeListener.observe(document.body, {childList: true});

    triggerEvent('init');

  };

  return {

    init: init,
    on: registerEvent,
    config: getConfig,
    configOptions: {loadingStyles: loadingStyle},
    isRunning: isRunning,
    history: instantHistory

  };

}();
