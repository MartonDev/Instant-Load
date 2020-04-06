let instantload, InstantLoad = instantload = function() {

  const preloadedPages = [],
  preloadableElements = [],
  changePage = (element) => {



  },
  preloadPage = (url, element, callback) => {

    const page = new XMLHttpRequest();

    page.open('get', url);
    page.send();
    page.onload = () => {

      element.preloadedPage = page.responseText;

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

    const localhost = window.location.protocol + '//' + window.location.host + '/';

    if(element.taget || element.href.indexOf(localhost) != 0 || isNoPreload(element)) {

      return false;

    }

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



  },
  clearTrackedElements = () => {

    removeEventListeners();
    preloadableElements = [];

  },
  init = () => {

    trackPreloadableElements();

  };

  return {

    init: init

  };

}();
