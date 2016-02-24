'use strict';

var app = app || {};

(function() {

	var tabs = ['a', 'b', 'c', 'd'];
	var currentTab = 'a';

	app.PageView = Backbone.Marionette.LayoutView.extend({
		el: '#main',
		template: _.template($('#pageview').html(), {}),
		regions: {
			loginContainer: '#logincontainer',
			loggedInContainer: '#loggedincontainer',
			userInfoContainer: '#userinfocontainer',
			creditCardContainer: '#creditcardcontainer',
			stepTabsContainer: '#steptabscontainer'

		},
		childEvents: {
			showUserInfo: 'showUserInfo',
			updateCreditCard: 'updateCreditCard',
			handleNext: 'handleNext',
			handlePrev: 'handlePrev',
			handleWidget: 'handleWidget',
			handleDesign: 'handleDesign'
		},
		handleDesign: function handleDesign(e, data) {
			$('.thecc').removeClass('solidCard');
			$('.thecc').removeClass('gradientCard');
			$('.thecc').removeClass('patternCard');
			$('.thecc').addClass(data);
			var design = data.replace('Card', '');
			design = design[0].toUpperCase() + design.substring(1);
			$('#logodesign').text(design);
		},
		handleWidget: function handleWidget(e, data){
			$('.widgetActive').each(function(el){
				$($('.widgetActive')[el]).removeClass('widgetActive');
				$('.widget' + data).addClass('widgetInactive');
			})
			$('.widget' + data).addClass('widgetActive');
			$('#logolayout').text(data);
		},
		handleNext: function handleNext(e) {
			var next = tabs.indexOf(currentTab)+1;
			$('#alink' + tabs[next]).click();
			currentTab = tabs[next];
		},
		handlePrev: function handleNext(e) {
			var prev = tabs.indexOf(currentTab)-1;
			$('#alink' + tabs[prev]).click();
			currentTab = tabs[prev];
		},		
		updateCreditCard: function updateCreditCard(e, data) {
			$('#employeename').text(data);
			this.creditCardContainer.show(new app.CreditCard({model: new Backbone.Model({name: data})}));
		},		
		onRender: function onRender(){
			if(localStorage.getItem('ADPstate')) {
				this.loggedInContainer.show(new app.LoggedIn());
				this.creditCardContainer.show(new app.CreditCard({name: ''}));
				this.stepTabsContainer.show(new app.StepTabs({name: ''}));
			} else {
				this.loginContainer.show(new app.Login());
			}
		}
	});

	app.Login = Backbone.Marionette.ItemView.extend({
		template: '#login'
	});

	app.CreditCard = Backbone.Marionette.ItemView.extend({
		template: '#cardtemplate'
	});
	
	app.StepTabs = Backbone.Marionette.ItemView.extend({
		template: '#steptabs',
		events: {
			'click #getEmpName': 'getEmpName',
			'click .handleNext': 'handleNext',
			'click .handlePrev': 'handlePrev',
			'click .layoutImg': 'swapLayout',
			'click .designImg': 'swapDesign',
			'click .handleConfirm': 'handleConfirm'
		},
		handleConfirm: function handleConfirm(e) {
			e.preventDefault();
			$('#successemployeename').text($('#employeename').text());
			$('#successemail').text(this.userinfo.email);
			this.handleNext(e);
		},
		swapLayout: function swapLayout(e) {
			$('.layoutImg').each(function(el){
				$($('.layoutImg')[el]).removeClass('layoutImgBorder');
			})
			$(e.target).addClass('layoutImgBorder');
			this.triggerMethod('handleWidget', $(e.target).attr('pos'));
		},
		swapDesign: function swapDesign(e) {
			$('.designImg').each(function(el){
				$($('.designImg')[el]).removeClass('designImgBorder');
			})
			$(e.target).addClass('designImgBorder');
			this.triggerMethod('handleDesign', $(e.target).attr('add'));
		},
		handleNext: function handleNext(e) {
			e.preventDefault();
			this.triggerMethod('handleNext');
		},
		handlePrev: function handlePrev(e) {
			e.preventDefault();
			this.triggerMethod('handlePrev');
		},
		getEmpName: function getEmpName(e) {
			e.preventDefault();
			var state = localStorage.getItem('ADPstate');
			$.ajax({
				url: '/getUserInfo?state=' + state,
				success: this.userInfoSuccess.bind(this),
				error: this.userInfoError.bind(this)
			});
		},
		userInfoSuccess: function userInfoSuccess(result) {
			if(!result || result.error) {
				result = {given_name: '', family_name: ''};
			}
			this.userinfo = result;
			var name = result.given_name + ' ' + result.family_name;
			this.triggerMethod('updateCreditCard', name);
			this.$('#userinfoname').val(name)
		}, 
		userInfoError: function userInfoError(err) {
			var state = localStorage.getItem('ADPstate');
			localStorage.removeItem('ADPstate');
			window.location.href = '/logout?state=' + state;
		}
	});

	app.LoggedIn = Backbone.Marionette.ItemView.extend({
		template: '#loggedin',
		events: {
			'click #logoutButton': 'logOut'
		},
		logOut: function logOut(e) {
			var state = localStorage.getItem('ADPstate');
			localStorage.removeItem('ADPstate');
			window.location.href = '/logout?state=' + state;
		}
	});

})();

