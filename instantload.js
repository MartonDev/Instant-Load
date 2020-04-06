/*
 *
 * InstantLoad
 * Github: https://github.com/MartonDev/Instant-Load
 * Created by Marton Lederer (https://marton.lederer.hu)
 *
 */

let instantload, InstantLoad = instantload = function(document, location, userAgent) {

  let running = false,
  preloadableElements = [];

  const preloadedPages = [],
  events = {preload: [], postload: [], change: [], init: []},

  triggerEvent = (eventType) => {

    for(let i = 0; i < events[eventType].length; i++) {

      events[eventType][i]();

    }

  },

  registerEvent = (eventType, callback) => {

    events[eventType].push(callback);

  },

  changePage = (element) => {

    history.pushState(null, null, element.href);
    document.body = element.preloadedPage.body;

  },

  preloadPage = (url, element, callback) => {

    triggerEvent('preload');

    const page = new XMLHttpRequest();

    page.open('get', url);
    page.timeout = 90000;
    page.send();
    page.onload = () => {

      let newDocument = document.implementation.createHTMLDocument('');

      newDocument.documentElement.innerHTML = page.responseText;
      element.preloadedPage = newDocument;

      triggerEvent('postload');

      callback();

    };

  },

  mouseOverEvent = (e) => {

    if(e.target.isPreloaded)
      return;

    preloadPage(e.target.href.replace('#', ''), e.target, () => {

      e.target.isPreloaded = true;

    });

  },

  mouseClickEvent = (e) => {

    e.preventDefault();

    if(e.target.isPreloaded) {

      changePage(e.target);

    }else {

      preloadPage(e.target.href.replace('#', ''), e.target, () => {

        e.target.isPreloaded = true;
        changePage(e.target);

      });

    }

  },

  isNoPreload = (element) => {

    if(element.hasAttribute('instantload-blacklist'))
      return true;

    return false;

  },

  isPreloadable = (element) => {

    const localhost =  location.protocol + '//' +  location.host + '/';

    if(element.taget || element.href.indexOf(localhost) != 0 || isNoPreload(element))
      return false;

    return true;

  },

  addEventListeners = () => {

    for(let i = 0; i < preloadableElements.length; i++) {

      preloadableElements[i].addEventListener('mouseover', mouseOverEvent);
      preloadableElements[i].addEventListener('click', mouseClickEvent);

    }

  },

  trackPreloadableElements = () => {

    document.querySelectorAll('a').forEach(function(element) {

      if(isPreloadable(element)) {

        preloadableElements.push(element);

      }

    });

    addEventListeners();

  },

  removeEventListeners = () => {

    for(let i = 0; i < preloadableElements.length; i++) {

      preloadableElements[i].removeEventListener('mouseover', mouseOverEvent);
      preloadableElements[i].removeEventListener('click', mouseClickEvent);

    }

  },

  clearTrackedElements = () => {

    removeEventListeners();
    preloadableElements = [];

  },

  init = () => {

    if(running)
      return;

    running = true;

    trackPreloadableElements();
    triggerEvent('init');

  };

  return {

    init: init,
    on: registerEvent

  };

}(document, location, navigator.userAgent);
