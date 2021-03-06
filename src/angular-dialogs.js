/*! Angular dialogs v0.93 | Rafael Hernandez <https://github.com/fikipollo> | MIT license */
(function () {
  var app = angular.module('ang-dialogs', [
    'ui.bootstrap'
  ]);

  app.service('$dialogs', [
    '$uibModal',
    '$templateCache',
    '$log',
    '$timeout',
    '$interval',
    function ($uibModal, $templateCache, $log, $timeout, $interval) {
      var me = this;
      this.modals = {};
      this.modalStack = [];

      this.getModalInstance = function (modalID) {
        return this.modals[modalID];
      };

      this.showDefaultDialog = function (message, config) {
        config = (config || {});
        config.messageType = "default";
        config.icon = (config.icon || 'glyphicon glyphicon-info-sign');
        return this.showMessage(message, config);
      };

      this.showInfoDialog = function (message, config) {
        config = (config || {});
        config.messageType = "info";
        config.icon = (config.icon || 'glyphicon glyphicon-info-sign');
        return this.showMessage(message, config);
      };

      this.showConfirmationDialog = function (message, config) {
        config = (config || {});
        config.messageType = "confirmation";
        config.icon = (config.icon || 'glyphicon glyphicon-question-sign');
        return this.showMessage(message, config);
      };

      this.showSuccessDialog = function (message, config) {
        config = (config || {});
        config.messageType = "success";
        config.icon = (config.icon || '	glyphicon glyphicon-ok-circle');
        return this.showMessage(message, config);
      };

      this.showWarningDialog = function (message, config) {
        config = (config || {});
        config.messageType = "warn";
        config.icon = (config.icon || '	glyphicon glyphicon-exclamation-sign');
        return this.showMessage(message, config);
      };

      this.showErrorDialog = function (message, config) {
        config = (config || {});
        config.messageType = "error";
        config.icon = (config.icon || 'glyphicon glyphicon-remove-circle');
        return this.showMessage(message, config);
      };

      this.showWaitDialog = function (message, config) {
        config = (config || {});
        config.messageType = "wait";
        config.icon = (config.icon || 'glyphicon glyphicon-time');
        config.button = (config.button || false);
        config.spin = true;
        return this.showMessage(message, config);
      };

      this.showMessage = function (message, config) {
        config = {
          messageType : config.messageType || "info",
          title : (config.title || ""),
          message : (message || ""),
          callback : config.callback,
          logMessage : config.logMessage || (message || ""),
          button : (config.button !== false),
          reportButton : (config.reportButton === true),
          reportButtonHandler: config.reportButtonHandler,
          buttonReportText : (config.buttonReportText || "Send report"),
          buttonOkText : (config.buttonOkText || "Accept"),
          buttonCancelText : (config.buttonCancelText || "Cancel"),
          buttonCloseText : (config.buttonCloseText || "Close"),
          spin : (config.spin === true),
          icon : (config.icon || ""),
          closable : (config.closable === true),
          closeTimeout : config.closeTimeout
        };

        this.log(config.logMessage, config.messageType);

        var modalInstance = $uibModal.open({
          template: $templateCache.get('angular.dialog.tpl.html'),
          backdrop: (config.closable ? true : 'static'),

          controller: [
            '$scope',
            '$uibModalInstance',
            function ($scope, $uibModalInstance) {
              $scope.config = config;

              this.sendReportButtonHandler = config.reportButtonHandler || function(){me.log("Not implemented", "error")};
              this.okButtonHandler = function () {
                $uibModalInstance.close('ok');
              };
              this.cancelButtonHandler = function () {
                $uibModalInstance.close('cancel');
              };
              this.closeButtonHandler = function () {
                $uibModalInstance.dismiss('close');
              };
            }
          ],
          controllerAs: 'controller'
        });

        modalInstance.config = config;

        modalInstance.result.then(
          function (result) { //Close
            me.unregisterModal(modalInstance);
            if (config.callback) {
              config.callback(result)
            }
          },
          function (reason) { //Dismissed
            me.unregisterModal(modalInstance);
            if (config.callback) {
              config.callback(reason)
            }
          }
        );

        //Get new ID and register the dialog
        modalInstance.id = this.getNewModalID();
        this.modals[modalInstance.id] = modalInstance;
        this.modalStack.push(modalInstance);

        if(config.closeTimeout){
          $timeout(function () {
            me.log("Autoclosing dialog");
            me.closeDialog({modalID: modalInstance.id});
          }, config.closeTimeout*1000);
          $interval(function(){
            config.closeTimeout--;
          }, 1000, config.closeTimeout);
        }

        return modalInstance;
      }; //END showMessage

      this.closeDialog = function (params, modal) {
        params = (params || {});
        params.option = (params.option || "ok");

        if(modal === undefined){
          if (params.modalID) { //Close by ID
            modal = me.getModalInstance(params.modalID);
          } else if (params.type) { //Close all dialogs for a given type
            for (var i in me.modalStack) {
              if (me.modalStack[i].config.type === params.type) {
                me.closeDialog(params, me.modalStack[i]);
              }
            }
            return;
          }else { //Close the most recent dialog
            modal = me.modalStack[me.modalStack.length-1];
          }
        }

        if (modal === undefined) {
          return;
        }

        var isOpened = modal.opened.$$state.status;
        if (isOpened === 1) {
          modal.close(params.option);
        } else{ //Wait for opening
          $timeout(function () {
            me.closeDialog(params, modal);
          }, 500);
        }
      };

      this.unregisterModal = function (modal) {
        delete me.modals[modal.id];
        for (var i in me.modalStack) {
          if (me.modalStack[i].id === modal.id) {
            me.modalStack.splice(i, 1);
            return;
          }
        }
      };

      this.getNewModalID = function () {
        var newID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        if (this.modals[newID] !== undefined)
        return this.getNewModalID();
        return newID;
      };

      this.log = function (message, messageType) {
        if ("warn error log debug".indexOf(messageType) < 0) {
          messageType = "info";
        }
        $log[messageType](new Date().toUTCString() + " > " + message);
      };

      $templateCache.put('angular.dialog.tpl.html',
      '<div class="modal-{{config.messageType}}">' +
      '  <div class="modal-header" >' +
      '    <button type="button" class="close" ' +
      '            ng-click="controller.closeButtonHandler()"' +
      '            ng-if="config.closable">' +
      '            &times;</button>' +
      '    <h4 class="modal-title" ng-show="config.title != \'\'">' +
      '      <span class="{{config.icon}}" style=" float: left; padding: 3px; margin-right: 10px; "></span>{{config.title}}' +
      '    </h4>' +
      '  </div>' +
      '  <div class="modal-body" >' +
      '    <p>' +
      '        <span ng-if="config.spin" class="glyphicon glyphicon-refresh glyphicon-spin" style=" float: left; padding: 3px; margin-right: 10px; "></span>' +
      '        {{config.message}}' +
      '    </p>' +
      '    <i ng-if="config.closeTimeout" style="font-size: 10px;">This dialog will auto-close in {{config.closeTimeout}} seconds.</i>'+
      '  </div>' +
      '  <div class="modal-footer">' +
      '    <button type="button" class="btn btn-warning" ' +
      '            ng-click="controller.sendReportButtonHandler()"' +
      '            ng-if="config.messageType == \'error\' && config.reportButton">' +
      '            <i class="fa fa-bug"></i> {{config.buttonReportText}}</button>' +
      '    <button type="button" class="btn btn-success" ' +
      '            ng-click="controller.okButtonHandler()"' +
      '            ng-if="config.messageType == \'confirmation\' && config.button">' +
      '            {{config.buttonOkText}}</button>' +
      '    <button type="button" class="btn btn-danger" ' +
      '            ng-click="controller.cancelButtonHandler()"' +
      '            ng-if="config.messageType == \'confirmation\' && config.button">' +
      '            {{config.buttonCancelText}}</button>' +
      '    <button type="button" class="btn btn-default" ' +
      '            ng-click="controller.closeButtonHandler()"' +
      '            ng-if="config.messageType != \'confirmation\' && config.button">' +
      '            {{config.buttonCloseText}}</button>' +
      '</div>');
    }
  ]);
})();
