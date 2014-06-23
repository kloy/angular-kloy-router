/*
  I provide all functionality for managing a layout and defining sections for
  a layout.
*/
var ng = require('ng');

function LayoutManager (sectionConfigs, $rootScope, $injector) {

  var sections = {};

  /*
    I return a copy of all defined sections
  */
  this.sections = function () {

    return ng.copy(sections);
  };

  /*
    I run all section config statements to ensure the proper templates are
    used for each section.
  */
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

  /*
    I defined and configure a section
  */
  this.addSection = function (section, templateSelector) {

    var errMsg;

    if (section in sectionConfigs) {
      errMsg = "LayoutManagerProvider.addSection() duplicate section ";
      errMsg += "definition: " + section;
      throw errMsg;
    }

    sectionConfigs[section] = templateSelector;

    return this;
  };

  this.$get = /*@ngInject*/function ($rootScope, $injector) {

    return new LayoutManager(
      sectionConfigs,
      $rootScope,
      $injector
    );
  };
}

module.exports = LayoutManagerProvider;
