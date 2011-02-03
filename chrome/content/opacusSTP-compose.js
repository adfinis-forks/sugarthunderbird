/**********************************************************************
 * Portions written by Opacus (C) Mathew Bland, Jonathan Cutting,
 * Opacus Ltd.
 * 
 * This file is part of the Opacus SugarCRM Thunderbird Plugin.
 *
 * The Opacus SugarCRM Thunderbird Plugin
 * is free software:you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The Opacus SugarCRM Thunderbird Plugin
 * is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with the Opacus SugarCRM Thunderbird Plugin.
 * If not, see <http://www.gnu.org/licenses/>.
 *********************************************************************/
// Compose
function addSendButton(){
	var wMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var parentWindow = wMediator.getMostRecentWindow("mail:3pane");
	if(parentWindow.opacusSTP.prefs.getBoolPref('addButtons') === true){
		try {
		  var myId    = "opacusSTP-send"; // ID of button to add
		  var afterId = "button-send";    // ID of element to insert after
		  var navBar  = document.getElementById("composeToolbar2");
		  var curSet  = navBar.currentSet.split(",");

		  if (curSet.indexOf(myId) == -1) {
			var pos = curSet.indexOf(afterId) + 1 || curSet.length;
			var set = curSet.slice(0, pos).concat(myId).concat(curSet.slice(pos));

			navBar.setAttribute("currentset", set.join(","));
			navBar.currentSet = set.join(",");
			document.persist(navBar.id, "currentset");
			try {
			  BrowserToolboxCustomizeDone(true);
			}
			catch (e) {}
		  }
		}
		catch(e) {}
		parentWindow.opacusSTP.prefs.setBoolPref("addButtons",false);
	}
}



function SendObserver() {
	var wMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	this.parentWindow = wMediator.getMostRecentWindow("mail:3pane");
	this.register();
}

SendObserver.prototype = {
  observe: function(subject, topic, data) {
	if(this.parentWindow.opacusSTP.sendAndArchiveStatus == 'success'){
		subject.gMsgCompose.compFields.otherRandomHeaders += "X-Opacus-Archived: onsend\r\n"; 
	} else {
		subject.gMsgCompose.compFields.otherRandomHeaders += "X-Opacus-Archived: none\r\n";
	}
  },
  register: function() {
    var observerService = Components.classes["@mozilla.org/observer-service;1"]
                          .getService(Components.interfaces.nsIObserverService);
    observerService.addObserver(this, "mail:composeOnSend", false);
  },
  unregister: function() {
    var observerService = Components.classes["@mozilla.org/observer-service;1"]
                            .getService(Components.interfaces.nsIObserverService);
    observerService.removeObserver(this, "mail:composeOnSend");
  }
};


/*
 * Register observer for send events. Check for event target to ensure that the 
 * compose window is loaded/unloaded (and not the content of the editor).
 * 
 * Unregister to prevent memory leaks (as per MDC documentation).
 */
var sendObserver;
window.addEventListener('load', function (e) {addSendButton()}, false);
// Make use of Gecko 1.9.2 activate event too
window.addEventListener('activate', function (e) {addSendButton()}, false);
window.addEventListener('load', function (e) {if (e.target == document) sendObserver = new SendObserver(); }, true);
window.addEventListener('unload', function (e) { if (e.target == document) sendObserver.unregister();}, true);




