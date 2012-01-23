/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

exports.WindowObserver = WindowObserver;

/**
 * This class will call listener's method applyToWindow() for all new chrome
 * windows being opened. It will also call listener's method removeFromWindow()
 * for all windows still open when the extension is shut down.
 * @param {Object} listener
 * @param {String} [when]   when to execute applyToWindow(). "start" means immediately
 *                          when the window opens, "ready" when its contents are available
 *                          and "end" (default) means to wait until the "load" event.
 * @constructor
 */
function WindowObserver(listener, when)
{
  this._listener  = listener;
  this._when = when;

  let e = Services.ww.getWindowEnumerator();
  while (e.hasMoreElements())
    this._listener.applyToWindow(e.getNext().QueryInterface(Ci.nsIDOMWindow));

  Services.ww.registerNotification(this);

  this._shutdownHandler = function()
  {
    let e = Services.ww.getWindowEnumerator();
    while (e.hasMoreElements())
      this._listener.removeFromWindow(e.getNext().QueryInterface(Ci.nsIDOMWindow));

    Services.ww.unregisterNotification(this);
  }.bind(this);
  onShutdown.add(this._shutdownHandler);
}
WindowObserver.prototype =
{
  _listener: null,
  _when: null,
  _shutdownHandler: null,

  shutdown: function()
  {
    if (!this._shutdownHandler)
      return;

    onShutdown.remove(this._shutdownHandler);
    this._shutdownHandler();
    this._shutdownHandler = null;
  },

  observe: function(subject, topic, data)
  {
    if (topic == "domwindowopened")
    {
      if (this._when == "start")
      {
        this._listener.applyToWindow(window);
        return;
      }

      let window = subject.QueryInterface(Ci.nsIDOMWindow);
      window.addEventListener(this._when == "ready" ? "DOMContentLoaded" : "load", function()
      {
        if (this._shutdownHandler)
          this._listener.applyToWindow(window);
      }.bind(this), false);
    }
  },

  QueryInterface: XPCOMUtils.generateQI([Ci.nsISupportsWeakReference, Ci.nsIObserver])
};
