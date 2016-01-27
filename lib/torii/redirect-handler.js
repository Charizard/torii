/**
 * RedirectHandler will attempt to find
 * these keys in the URL. If found,
 * this is an indication to Torii that
 * the Ember app has loaded inside a popup
 * and should postMessage this data to window.opener
 */

import PopupIdSerializer from "./lib/popup-id-serializer";
import { CURRENT_REQUEST_KEY } from "./services/popup";

var RedirectHandler = Ember.Object.extend({

  run: function(){
    var windowObject = this.windowObject;

    return new Ember.RSVP.Promise(function(resolve, reject){
      try {
        localStorage.setItem('test', 'x');
        localStorage.removeItem('test');
        var pendingRequestKey = windowObject.localStorage.getItem(CURRENT_REQUEST_KEY);
        windowObject.localStorage.removeItem(CURRENT_REQUEST_KEY);
        if (pendingRequestKey) {
          var url = windowObject.location.toString();
          windowObject.localStorage.setItem(pendingRequestKey, url);

          windowObject.close();
        } else{
          reject('Not a torii popup');
        }
      } catch (error) {
        console.log('Error when getting ' + CURRENT_REQUEST_KEY + ' from localStorage');
        if (windowObject.opener && windowObject.opener.name === 'torii-opener') {
          var url = windowObject.location.toString();
          var data = CURRENT_REQUEST_KEY + ":" + url;
          windowObject.opener.postMessage(data, windowObject.location.protocol+'//'+windowObject.location.host);
          windowObject.close();
        } else {
          reject('Not a torii popup');
        }
      }
    });
  }

});

RedirectHandler.reopenClass({
  // untested
  handle: function(windowObject){
    var handler = RedirectHandler.create({windowObject: windowObject});
    return handler.run();
  }
});

export default RedirectHandler;
