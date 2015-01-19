L.Control.Attribution.prototype.options.prefix = '';

// Defaults.
var compareUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var compareUrl1 = 'http://mapa.cloudapp.net/ump_tiles/{z}/{x}/{y}.png';
var compareUrl2 = 'http://tiles.ump.waw.pl/ump_tiles/{z}/{x}/{y}.png';

var googleMapType = 'ROADMAP';

// Parse query options.
var search = location.search.replace('?', '').replace('/', '').split('&');
if (search.length) {
    for (var i = 0; i < search.length; i++) {
        var opt = search[i].split('=');
        if (opt[0] == 'osm') {
            compareUrl2 = compareUrl
        } else if (opt[0] == 'google') {
            googleMapType = opt[1];
        }
    }
}

// Set up maps.
var compareLayer1 = new L.TileLayer(
      compareUrl1,
      {maxZoom: 19, subdomains: 'abc', attribution: 'UMPpcPL'}),
    omap1 = new L.Map('osm1').addLayer(compareLayer1),
    lat = 52, lng = 21, z = 9;

if (location.hash.match(/,/g)) {
    var pts = location.hash.slice(1).split(',');
    location.hash = [pts[2], pts[0], pts[1]].join('/');
}

omap1.setView([lat, lng], z).addHash();

var compareLayer2 = new L.TileLayer(
      compareUrl2,
      {maxZoom: 19, subdomains: 'abc', attribution: 'UMPpcPL'}),
omap2 = new L.Map('osm2').addLayer(compareLayer2)
omap2.setView([lat, lng], z).addHash();


var omapLock = 0, gmapLock = 0;

var omapMove = function(e) {
  if (omapLock > Date.now()) return;
  gmapLock = Date.now() + 500;
  var c = omap1.getCenter();
  var z = omap1.getZoom();
  omap2.setView(c, z);
};

var omapMove2 = function(e) {
  if (gmapLock > Date.now()) return;
  gmapLock = Date.now() + 500;
  var c = omap2.getCenter();
  var z = omap2.getZoom();
  omap1.setView(c, z);
};


omap1.on('moveend', omapMove);
omap2.on('moveend', omapMove2);

function geolookup(e) {
  var query = $('#search input[type=text]').val(),
      url = 'http://open.mapquestapi.com/nominatim/v1/search?format=json&json_callback=callback&limit=1&q=';
  $.ajax({
      url: url + query,
      dataType: 'jsonp',
      jsonpCallback: 'callback',
      success: function (value) {
          var v = value[0];
          if (value === undefined) {
              alert('Could not find ' + query);
          } else {
            var z = 13;
            if (v.type == 'state' || v.type == 'county' ||
              v.type == 'maritime'  || v.type == 'country') {
              z = 7;
            }
            omap1.setView(new L.LatLng(parseFloat(v.lat), parseFloat(v.lon)), z);
          }
      }
  });
  return e.preventDefault();
}

$('#search .button').click(geolookup);
$('#search input[type=text]').keypress(function(e) {
  if (e.which == 13) geolookup();
});
