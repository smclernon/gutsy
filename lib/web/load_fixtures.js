var settings = require('../settings');
var utils = require('../utils');
var _ = require('underscore');
var path = require('path');

var make_defaults = utils.make_class({
  init: function(){
    var self = this;
    self.tags =  [];
    self.links =  {};
    self.environments =  [];
    self.metadata =  {};
    self.related_apis =  {};
    self.dependent_services =  [];
    self.events =  [];
    self.kpi_spec =  '';

    self.errors =  [];
    // By convention, middlewares will populate this fields,
    // if the related_apis exist, with {'error': X, 'data': X}
    self.pager_duty =  null;
    self.version_one =  null;
    self.github =  null;
    self.new_relic =  null;
    self.dreadnot =  null;
  }
});

/**
 * If req.params.project, assigns req.devops to loaded devops object
 */
module.exports = function load_devops(devops_directory) {
  var extcreds;
  var devops = {};

  if (!devops_directory){
    devops_directory = path.join(__dirname, '..', '..', settings.saved_crawls_path);
  }
  _.each(settings.devopsjson_uris, function(uri, project_name){

    var devops_path = path.join(devops_directory, project_name);

    var api_name;
    var api_obj;
    var _devops;

    _devops = utils.load_devops(devops_path);

    _devops.project = project_name;

    // fill in missing optional fields
    _.defaults(_devops, new make_defaults());

    // fill in __external__ related api creds from local settings
    // if they exist

    if (settings.external_creds && settings.external_creds[project_name]) {
      extcreds = settings.external_creds[project_name];
      for (api_name in _devops.related_apis){
        api_obj = _devops.related_apis[api_name];
        if (extcreds[api_name]){
          _.extend(api_obj, extcreds[api_name]);
        }
        _devops[api_name] = api_obj;
      }
    }
    devops[project_name] = _devops;
  });
  return devops;
};
