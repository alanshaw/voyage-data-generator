(function ($) {

  // Create options value accessors
  var opts = {}

  $('[id^="opt-"]').each(function () {
    var opt = $(this)
      , name = opt.attr("id").replace("opt-", "")
    opts[name] = function () {
      return opt.is(":checked")
    }
  })

  var map = L.map('map').setView([51.505, -0.09], 3)

  new L.StamenTileLayer("watercolor").addTo(map)

  var voyageData = []
    , waypoints = []
    , output = $('#output')

  // Select the output JSON on focus
  output.focus(function () {
    // Chrome doesn't select unless done in next event loop
    setTimeout(function () {
      output.select()
    }, 100)
  })

  // Add marker by click and hold for 1 second
  var addMarkerTimeoutId = null
    , addMarkerAllowed = true

  map.on("mousedown", function (e) {
    addMarkerAllowed = false
    addMarkerTimeoutId = setTimeout(function () {
      addMarkerAllowed = true
      addMarker(e)
    }, 1000)
  })

  map.on('mousemove mouseup', function () {
    clearTimeout(addMarkerTimeoutId)
    addMarkerAllowed = true
  })

  function addMarker (e) {

    var prev = voyageData[voyageData.length - 1]
      , next = {latitude: e.latlng.lat, longitude: e.latlng.lng}
      , heading = 0

    if (prev) {

      // Calculate heading
      var xDiff = next.latitude - prev.latitude
      var yDiff = next.longitude - prev.longitude

      heading = Math.atan2(yDiff, xDiff) * (180 / Math.PI)
    }

    if (opts.heading()) {
      next.heading = heading
    }

    // Backfill the first waypoint heading
    if (voyageData.length == 1) {

      if (opts.heading()) {
        prev.heading = next.heading
      }

      waypoints[0].setIconAngle(heading)
    }

    if (opts.timestamp()) {
      next.timestamp = moment().format()
    }

    if (opts.speed()) {
      next.speed = Math.floor(Math.random()*20)
    }

    voyageData.push(next)

    var icon = L.icon({iconUrl: 'img/icon-arrow.svg', iconSize: [30, 30], iconAnchor: [15, 15]})

    waypoints.push(L.marker(e.latlng, {icon: icon, iconAngle: heading}).addTo(map))

    output.html(JSON.stringify(voyageData))

    drawTracks()
  }

  var tracks = null

  function drawTracks () {

    if (tracks) {
      map.removeLayer(tracks)
    }

    tracks = L.polyline(voyageData.map(function (d) {
      return [d.latitude, d.longitude]
    })).addTo(map)
  }

})(jQuery);

