'use strict';

var app = app || {};

(function($){
	console.log(localStorage.getItem('ADPstate'));
	if(localStorage.getItem('ADPstate') === null) {
		try{
			var params = window.location.search;
			var paramVal = params.substring(params.indexOf('=')+1, params.length);
			if(paramVal) {
				localStorage.setItem('ADPstate', paramVal);
				window.location.href = '/sessionReady';
			}
		}catch(e) {
			console.log('Error parsing query string.');
		}
	}

	app.pageView = new app.PageView();
	app.pageView.render();

})($);


var tabsFn = (function() {
  
  function init() {
    setHeight();
  }
  
  function setHeight() {
    var $tabPane = $('.tab-pane'),
        tabsHeight = $('.nav-tabs').height();
    
    $tabPane.css({
      height: tabsHeight
    });
  }
    
  $(init);
})();