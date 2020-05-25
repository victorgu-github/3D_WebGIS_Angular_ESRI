////////////////////////////////////////////////////
//
// CSS Style file for all
//
////////////////////////////////////////////////////
require('bootstrap/dist/css/bootstrap.min.css');
// main.css must put behind bootstrap.min.css, otherwise cannot override the bootstrap 
// config
require('../assets/css/main.css');
require('../assets/css/main.bootstrap.css');
require('../assets/css/main.esri.css');
require('../assets/css/main.foot.css');

// leatlet css
require('leaflet/dist/leaflet.css');
// leaflet images, load images defined in js file
require('leaflet/dist/images/marker-shadow.png');
require('leaflet/dist/images/marker-icon-2x.png');

////////////////////////////////////////////////////
//
// CSS Style file for 3D map
//
////////////////////////////////////////////////////

//3D map sceneView css and 3D map datatable css
require('../assets/css/3Dmap/sceneView.css');
require('../assets/css/3Dmap/datatable/control-header.css');
require('../assets/css/3Dmap/datatable/data-table.css');

////////////////////////////////////////////////////
//
// CSS Style file for 2D map
//
////////////////////////////////////////////////////

//leaflet2d map css
require('../assets/css/2Dmap/leaflet2d.css');
require('../assets/css/2Dmap/popup/popup2d.css');

////////////////////////////////////////////////////
//
// CSS Style file for 2D map
//
////////////////////////////////////////////////////

//side bar css
require('../assets/css/sidebar/sidebar.css');
require('../assets/css/sidebar/sidebar.dark.css');
require('../assets/css/sidebar/sidebar.bright.css');
require('../assets/css/sidebar/panels/2D3Dlayerlist/layerlist.css');
require('../assets/css/sidebar/panels/basemap/basemap.css');
require('../assets/css/sidebar/panels/heatmap/heatmap.css');
require('../assets/css/sidebar/panels/interpolation/interpolation.css');
require('../assets/css/sidebar/panels/nodelist/nodelist.css');
require('../assets/css/sidebar/panels/setting/setting.css');
require('../assets/css/sidebar/panels/scenario/scenario.css');

////////////////////////////////////////////////////
//
// CSS Style file for account
//
////////////////////////////////////////////////////

//account css
require('../assets/css/account/account.css');
require('../assets/css/account/profile/profile.css');

////////////////////////////////////////////////////
//
// CSS Style file for dashboard
//
////////////////////////////////////////////////////

// dashboard css
require('../assets/css/dashboard/dashboard.css');
require('../assets/css/dashboard/dashboardEditPageShared.css');
require('../assets/css/dashboard/dashboardTableShared.css');
require('../assets/css/dashboard/dashboard2DMapShared.css');
// Dashboard Overview Page
require('../assets/css/dashboard/dashboardContainer.css');
require('../assets/css/dashboard/overview/overview.css');
// New Device
require('../assets/css/dashboard/loraDevice/newLoraDevice.css');
// Edit Device
require('../assets/css/dashboard/loraDevice/commandEdit/commandEdit.css');
require('../assets/css/dashboard/loraDevice/maintanence/maintanence.css');
// Zmq Payload and Channel History CSS
require('../assets/css/dashboard/loraDevice/zmqPayloadAndChannelHistoryData.css');
// Monitor Device
require('../assets/css/dashboard/monitor/summary/monitorSummary.css');
require('../assets/css/dashboard/monitor/datatable/monitorDatatable.css');
require('../assets/css/dashboard/monitor/mapview/monitor2DMap.css');
require('../assets/css/dashboard/monitor/mapview/monitor2DMapForMengyang.dark.css');
require('../assets/css/dashboard/monitor/mapview/monitor2DMapForMengyang.bright.css');
// General User Application
require('../assets/css/dashboard/generalUserApp/newGeneralUserApp/newGeneralUserApp.css');
require('../assets/css/dashboard/generalUserApp/showGeneralUserAppForGenUsr/showGeneralUserAppForGenUsr.css');
// General User
require('../assets/css/dashboard/generalUser/editGeneralUser/editGeneralUser.css');

////////////////////////////////////////////////////
//
// CSS Style file for third party
//
////////////////////////////////////////////////////

require('../assets/css/third-party/angular-resizable.min.css');                   //origin: require('../assets/css/angular-resizable.min.css');
require('../assets/css/third-party/angular-ui-tree.css');                         //origin: require('../assets/css/angular-ui-tree.css');
require('../assets/css/third-party/fixedColumns.dataTables.min.css');             //origin: require('../assets/css/fixedColumns.dataTables.min.css');
require('../assets/css/third-party/fixedHeader.dataTables.min.css');              //origin: require('../assets/css/fixedHeader.dataTables.min.css');
require('../assets/css/third-party/github.min.css');                              //origin: require('../assets/css/github.min.css');
require('../assets/css/third-party/PruneCluster.css');                            //origin: require('../assets/css/PruneCluster.css');
require('../assets/css/third-party/rzslider.min.css');                            //origin: require('../assets/css/rzslider.min.css');
require('../assets/css/third-party/select.min.css');                              //origin: require('../assets/css/select.min.css');
require('../assets/css/third-party/loader.css');                                  //origin: require('../assets/css/loader.css');
//font-awesome.min.css and jquery.dataTables.css cannot put into third-party folder
require('../assets/css/third-party/font-awesome.min.css');                        //origin: require('../assets/css/font-awesome.min.css');
require('../assets/css/third-party/jquery.dataTables.css');                       //origin: require('datatables.net-dt/css/jquery.dataTables.css');
require('../assets/css/third-party/nz-toggle.css');
require('../assets/css/third-party/angular-bootstrap-toggle.min.css');
require('../assets/css/third-party/leaflet.awesome-markers.css');
require('../assets/css/third-party/leaflet-sidebar.min.css');
require('../assets/css/third-party/Control.FullScreen.css');
require('../assets/css/third-party/bootstrap-select.min.css');

////////////////////////////////////////////////////
//
// CSS Style file for customize widget
//
////////////////////////////////////////////////////

require('../assets/css/widgetCSS/customCheckbox.css');