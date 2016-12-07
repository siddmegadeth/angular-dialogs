(function(){
	var app = angular.module('ang-dialogs', [
		'ui.bootstrap'
	]);

	app.service('$dialogs', [
		'$uibModal',
		'$templateCache',
		function( $uibModal, $templateCache) {
			this.modalInstance = null;
			this.modalData = null;
			var me = this;

			this.getModalInstance = function(){
				return this.modalInstance;
			}

			this.getModalData = function(){
				return this.modalData;
			}

			this.showDefaultDialog = function(message, config) {
				config = ((config === undefined) ? {} : config);
				config.messageType = "default";
				config.icon = (config.icon || 'glyphicon glyphicon-info-sign');
				this.showMessage(message, config);
			};

			this.showInfoDialog = function(message, config) {
				config = ((config === undefined) ? {} : config);
				config.messageType = "info";
				config.icon = (config.icon || 'glyphicon glyphicon-info-sign');
				this.showMessage(message, config);
			};

			this.showConfirmationDialog = function(message, config) {
				config = ((config === undefined) ? {} : config);
				config.messageType = "confirmation";
				config.icon = (config.icon || 'glyphicon glyphicon-question-sign');
				this.showMessage(message, config);
			};

			this.showSuccessDialog = function(message, config) {
				config = ((config === undefined) ? {} : config);
				config.messageType = "success";
				config.icon = (config.icon || '	glyphicon glyphicon-ok-circle');
				this.showMessage(message, config);
			};

			this.showWarningDialog = function(message, config) {
				config = ((config === undefined) ? {} : config);
				config.messageType = "warning";
				config.icon = (config.icon || '	glyphicon glyphicon-exclamation-sign');
				this.showMessage(message, config);
			};

			this.showErrorDialog= function(message, config) {
				config = (config === undefined) ? {} : config;
				config.messageType = "error";
				config.icon = (config.icon || 'glyphicon glyphicon-remove-circle');
				this.showMessage(message, config);
			};

			this.showWaitDialog = function(message, config) {
				config = ((config === undefined) ? {} : config);
				config.messageType = "wait";
				config.icon = (config.icon || 'glyphicon glyphicon-time');
				config.button = (config.button || false);
				config.spin = true;
				this.showMessage(message, config);
			};

			this.closeMessage = function(option){
				me.getModalInstance().close(option||'ok');
			};

			this.showMessage= function(message, config){
				var callback = (config.callback || null);
				var logMessage = (config.logMessage || message);
				// var showTimeout = (config.showTimeout || 0); //TODO
				// var closeTimeout = (config.closeTimeout || 0); //TODO
				var messageType = (config.messageType || "info");

				delete config.logMessage;
				delete config.callback;
				// delete config.showTimeout;
				// delete config.closeTimeout;

				config.message      = (message || "");
				config.title        = (config.title || "");
				config.button       = (config.button != false);
				config.reportButton = (config.reportButton || false); //TODO
				config.spin         = (config.spin || false); //TODO
				config.closable     = (config.closable || false);

				if (messageType === "error") {
					//TODO CHANGE TO ANGULAR $log
					console.error(this.logFormat() + logMessage);
				} else if (messageType === "warning") {
					console.warn(this.logFormat() + logMessage);
				} else if (messageType === "info") {
					console.info(this.logFormat() + logMessage);
				} else if (messageType === "wait") {
					console.info(this.logFormat() + logMessage);
				} else { //success
					console.info(this.logFormat() + logMessage);
				}

				this.modalInstance = $uibModal.open({
					template: $templateCache.get('error.dialog.tpl.html'),
					backdrop : (config.closable?true:'static'),
					controller: [
						'$scope',
						'$uibModalInstance',
						function($scope, $uibModalInstance){
							$scope.config = config;

							this.sendReportButtonHandler = function(){
								//TODO
								throw "Not implemented"
							};
							this.okButtonHandler = function(){
								//TODO
								$uibModalInstance.close('ok');
							};
							this.cancelButtonHandler = function(){
								//TODO
								$uibModalInstance.close('cancel');
							};
							this.closeButtonHandler = function(){
								//TODO
								$uibModalInstance.dismiss('close');
							};
						}
					],
					controllerAs: 'controller'
				});

				this.modalInstance.result.then(
					function (result) { //Close
						if(callback){
							callback(result)
						};
					},
					function (reason) { //Dismissed
						if(callback){
							callback(reason)
						};
					}
				);
			}; //END showMessage

			this.logFormat = function () {
				var date = new Date();
				return date.toUTCString() + " > ";
			};

			$templateCache.put('error.dialog.tpl.html',
			'<div class="modal-{{config.messageType}}">'+
			'  <div class="modal-header" >'+
			'    <button type="button" class="close" ' +
			'            ng-click="controller.closeButtonHandler()"' +
			'            ng-if="config.closable">' +
			'            &times;</button>'+
			'    <h4 class="modal-title" ng-show="config.title != \'\'">' +
			'      <span class="{{config.icon}}" style=" float: left; padding: 3px; margin-right: 10px; "></span>{{config.title}}' +
			'    </h4>'+
			'  </div>'+
			'  <div class="modal-body" >'+
			'    <p>'+
			'        <span ng-if="config.spin" class="glyphicon glyphicon-refresh spinning" style=" float: left; padding: 3px; margin-right: 10px; "></span>' +
			'        {{config.message}}'+
			'    </p>'+
			'  </div>'+
			'  <div class="modal-footer">'+
			'    <button type="button" class="btn btn-warning" ' +
			'            ng-click="controller.sendReportButtonHandler()"' +
			'            ng-if="config.messageType == \'error\' && config.reportButton">' +
			'            <i class="fa fa-bug"></i> Report error</button>'+
			'    <button type="button" class="btn btn-success" ' +
			'            ng-click="controller.okButtonHandler()"' +
			'            ng-if="config.messageType == \'confirmation\' && config.button">' +
			'            OK</button>'+
			'    <button type="button" class="btn btn-danger" ' +
			'            ng-click="controller.cancelButtonHandler()"' +
			'            ng-if="config.messageType == \'confirmation\' && config.button">' +
			'            Cancel</button>'+
			'    <button type="button" class="btn btn-default" ' +
			'            ng-click="controller.closeButtonHandler()"' +
			'            ng-if="config.messageType != \'confirmation\' && config.button">' +
			'            Close</button>'+
			'</div>');
		}
	]);
})();
