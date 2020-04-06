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
  currentPageReq = null;

  //functions and arrays
  const preloadedPages = [],
  //custom InstantLoad events
  events = {preload: [], postload: [], change: [], init: []},
  //custom InstantLoad history, to overwrite the default
  instantHistory = {};

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

  //update scritp tags
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

      let cloneScript = document.createElement('script'),
      originalScript = originalScripts[i],
      parent = originalScript.parentNode,
      nextEl = originalScript.nextSiblings;

      //cloning text
      cloneScript.textContent = originalScript.textContent;

      //cloning all attrs
      for(let j = 0; j < originalScript.attributes.length; j++) {

        cloneScript.setAttribute(originalScript.attributes[j].name, originalScript.attributes[j].value);

      }

      originalScript.remove();
      parent.insertBefore(cloneScript, nextEl);

    }

  },

  //change page to a preloaded one
  //updates the page body, updates the history, triggers change event
  changePage = (element) => {

    currentPageReq.abort();

    clearTrackedElements();

    document.documentElement.replaceChild(element.preloadedPage.body, document.body);
    document.documentElement.replaceChild(element.preloadedPage.head, document.head);

    //we need to manually replace scripts to make them function
    updateScripts();

    history.pushState(null, null, element.href);

    //updateStyles(element.preloadedPage.head);
    trackPreloadableElements();

    triggerEvent('change');

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

  //hover event of a preloadable element
  //calls the preloadPage() function to preload the target of the hovered element
  mouseOverEvent = (e) => {

    if(e.target.isPreloaded)
      return;

    preloadPage(e.target.href.replace('#', ''), e.target, () => {

      e.target.isPreloaded = true;

    });

  },

  //mouse click event of a preloadable element
  //prevents the default redirect action, preloads the page if it isn't preloaded already, calls the changePage() function to update the document
  mouseClickEvent = (e) => {

    e.preventDefault();

    if(e.target.isPreloaded) {

      changePage(e.target);

    }else {

      //if somewhy the page isn't preloaded yet, we need to load it before we change the page
      preloadPage(e.target.href.replace('#', ''), e.target, () => {

        e.target.isPreloaded = true;
        changePage(e.target);

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

    const localhost =  location.protocol + '//' +  location.host + '/';

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

  //initialize InstantLoad to the page
  //return if there is already an instance of InstantLoad running or if the browser/protocol is not supported
  init = () => {

    if(running) {

      console.warn('InstantLoad is already initialized.');
      return;

    }

    running = true;

    if(!isSupported()) {

      console.error('InstantLoad is not supported in this browser or protocol!');
      return;

    }

    trackPreloadableElements();
    triggerEvent('init');

  };

  return {

    init: init,
    on: registerEvent,
    isRunning: isRunning

  };

}();
