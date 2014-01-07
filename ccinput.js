angular.module('rzModule', [])

.factory('CcInput',['$timeout', function($timeout)
{
  /**
   * Credit card input directive
   *
   * @param {ngScope} scope   The AngularJS scope
   * @param {Element} ccInput The slider directive element wrapped in jqLite
   * @param {*} attributes    The slider directive attributes
   * @constructor
   */
  var CcInput = function(scope, ccInput, attributes)
  {
    this.scope = scope;
    this.ccInput = ccInput;

    this.ccLogo = null;
    this.ccNumber = null;
    this.ccExpYear = null;
    this.ccExpMonth = null;
    this.ccCcv = null;

    this.init();
  };

  CcInput.prototype = {

    init: function()
    {
      this.initElemHandles();
      this.bindEvents();
    },

    initElemHandles: function()
    {
      angular.forEach(this.ccInput.children(), function(elem, index)
      {
        var _elem = angular.element(elem);

        switch(index)
        {
          case 0: this.ccLogo = _elem; this.ccLogo[0].ccField = 'logo'; break;
          case 1: this.ccNumber = _elem; this.ccNumber[0].ccField = 'number'; break;
          case 2: this.ccExpMonth = _elem; this.ccExpMonth[0].ccField = 'eMonth'; break;
          case 3: this.ccExpYear = _elem; this.ccExpYear[0].ccField = 'eYear'; break;
          case 4: this.ccCcv = _elem; this.ccCcv[0].ccField = 'ccv'; break;
        }

      }, this);

    },

    bindEvents: function()
    {
      var self = this;
      this.ccInput.on('keypress keydown', angular.bind(this, this.onKey));
      this.ccInput.on('touchstart', function() { $(this).focus(); });
    },

    onKey: function(e)
    {
      var kc = e.keyCode,
        numberStr = this.isNumber(kc) ? String.fromCharCode(e.keyCode) : '';

      console.log('ok', kc);

      e.preventDefault();
      e.stopPropagation();

      switch (e.target.ccField)
      {
        case 'number':
          this.handleCCNumber(numberStr, kc);
          break;
        case 'eMonth':
          this.handleCCMonth(numberStr, kc);
          break;
        case 'eYear':
          this.handleCCYear(numberStr, kc);
          break;
        case 'ccv':
          this.handleCCV(numberStr, kc);
          break;
      }
    },

    isNumber: function(kc)
    {
      return kc >= 48 && kc <= 57;
    },

    handleCCNumber: function(numberStr, kc)
    {
      var newValue = this.ccNumber.val() + numberStr,
        length = newValue.length, cssClass;

      newValue = this.formatCCN(newValue);
      cssClass = this.getCardType(newValue) + '-32px';

      if(kc == 8)
      {
        newValue = newValue.substr(0, length-1).trim();
      }
      else if(length == 19)
      {
        this.focusPos = 1;
        this.ccExpMonth.triggerHandler('touchstart');
      }
      else if(length > 19)
      {
        this.handleCCMonth(numberStr, kc);
        this.ccExpMonth.triggerHandler('touchstart');
        return;
      }

      this.ccNumber.val(newValue);
      this.ccLogo.removeClass('vi-32px ae-32px mc-32px ds-32px na-32px').addClass(cssClass);
      this.scope.$apply();
    },

    handleCCMonth: function(numberStr, kc)
    {
      var newValue = this.ccExpMonth.val() + numberStr,
        length = newValue.length;

      if(length === 0 && kc == 8)
      {
        this.ccNumber.triggerHandler('touchstart');
      }
      else if(kc == 8)
      {
        newValue = newValue.substr(0, length-1)
      }
      else if(length === 2)
      {
        this.focusPos = 2;
        this.ccExpYear.triggerHandler('touchstart');
      }
      else if(length > 2)
      {
        this.handleCCYear(numberStr, kc);
        this.ccExpYear.triggerHandler('touchstart');
        return;
      }

      this.ccExpMonth.val(newValue);
      this.scope.rzCardExpMonth = newValue;
      this.scope.$apply();
    },

    handleCCYear: function(numberStr, kc)
    {
      var newValue = this.ccExpYear.val() + numberStr,
        length = newValue.length;

      if(length === 0 && kc == 8)
      {
        this.ccExpMonth.triggerHandler('touchstart');
      }
      else if(kc == 8)
      {
        newValue = newValue.substr(0, length-1)
      }
      else if(length === 2)
      {
        this.focusPos = 3;
        this.ccCcv.triggerHandler('touchstart');
      }
      else if(length > 2)
      {
        this.handleCCV(numberStr, kc);
        this.ccCcv.triggerHandler('touchstart');
        return;
      }

      this.ccExpYear.val(newValue);
      this.scope.rzCardExpYear = newValue;
      this.scope.$apply();
    },

    handleCCV: function(numberStr, kc)
    {
      var newValue = this.ccCcv.val() + numberStr,
        length = newValue.length;

      if(length === 0 && kc == 8)
      {
        this.ccExpYear.triggerHandler('touchstart');
      }
      else if(kc == 8)
      {
        newValue = newValue.substr(0, length-1);
      }
      else if(length > 3)
      {
        return;
      }

      this.ccCcv.val(newValue);
      this.scope.rzCardCcv = newValue;
      this.scope.$apply();
    },

    formatCCN: function(number)
    {
      number = number.trim().replace(/ /g, '');
      this.scope.rzCardNumber = number;
      number = number.match(/.{1,4}/g);

      if(number)
      {
        return number.join(' ').trim();
      }
      else
      {
        return '';
      }
    },

    getCardType: function(number)
    {
      var type = 'na';

      if(number.length < 3)
      {
        return type;
      }

      if(number.match(/^4[4-7]/) !== null)
      {
        type = 'ae';
      }
      else if(number.match(/^5[1-5]/) !== null)
      {
        type = 'mc';
      }
      else if(number.match(/^4/) !== null)
      {
        type = 'vi';
      }
      else if(number.match(/^6011|65/) !== null)
      {
        type = 'ds';
      }

      return type;
    }
  };

  return CcInput;
}])

.directive('ccinput', ['CcInput', function(CcInput)
{
  return {
    restrict: 'E',
    scope: {
      rzCardNumber: '=',
      rzCardExpMonth: '=',
      rzCardExpYear: '=',
      rzCardCcv: '='
    },
    template: '<span class="ccLogo na-32px"></span>' +
      '<input class="ccNumber" type="tel" placeholder="1234 1234 1234 1234"/>' +
      '<input class="ccExpMonth" type="number" placeholder="MM"/>' +
      '<input class="ccExpYear" type="number" placeholder="YY"/>' +
      '<input class="ccCcv" type="number" placeholder="CCV"/>',

    link: function(scope, elem, attr)
    {
      return new CcInput(scope, elem, attr);
    }
  };
}]);

// IDE assist

/**
 * @name ngScope
 *
 * @property {number} rzSliderModel
 * @property {number} rzSliderHigh
 * @property {number} rzSliderCeil
 */

/**
 * @name jqLite
 *
 * @property {number|undefined} rzsl
 * @property {number|undefined} rzsw
 * @property {string|undefined} rzsv
 * @property {Function} css
 * @property {Function} text
 */

/**
 * @name Event
 * @property {Array} touches
 */
