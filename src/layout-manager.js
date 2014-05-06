var ng = require('ng');

function LayoutManager (sectionConfigs, $rootScope, $injector) {

  var sections = {};

  this.sections = function () {

    return ng.copy(sections);
  };

  this.sync = function () {

    Object.keys(sectionConfigs).forEach(function (section) {

      var config = sectionConfigs[section],
          helpers = {},
          template = null;

      helpers.template = function (_template) {

        template = _template;
      };

      $injector.invoke(config, helpers);
      sections[section] = template;
    });
  };
}

function LayoutManagerProvider () {

  var sectionConfigs = {};

  this.section = function (section, templateSelector) {

    var errMsg;

    if (section in sectionConfigs) {
      errMsg = "LayoutManagerProvider.section() duplicate state definition: ";
      errMsg += section;
      throw errMsg;
    }

    sectionConfigs[section] = templateSelector;

    return this;
  };

  this.$get = [
    '$rootScope',
    '$injector',
    function ($rootScope, $injector) {

      return new LayoutManager(
        sectionConfigs,
        $rootScope,
        $injector
      );
    }
  ];
}

module.exports = LayoutManagerProvider;
