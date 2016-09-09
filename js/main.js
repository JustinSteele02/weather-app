//Get coords from window.navigator if user accepts & call weather func
$(document).ready(function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var lat = position.coords.latitude,
          lng = position.coords.longitude;
      updateWeather(lat, lng);
    });
  }
});

//Create city search bar with autocomplete using google maps api & places library
function initAutocomplete() {
  var pacOptions = {
    types: ["(cities)"]
  };
  autocomplete = new google.maps.places.Autocomplete(document.getElementById("pac-input"), pacOptions);
  autocomplete.addListener("place_changed", getCoord);
}

$("#pac-input").focus(initAutocomplete());

//Get geo coords of city selected in bar & call weather func
function getCoord() {
  var place = autocomplete.getPlace(),
      lat = place.geometry.location.lat(),
      lng = place.geometry.location.lng();

  $('#location').text(place.formatted_address);
  $("#pac-input").val("");
  refreshWeather(lat, lng);
  updateWeather(lat, lng);
}

//Call weatherAPI with coords & insert data into html
function updateWeather(lat, lng) {
  $.ajax({
    url: 'https://api.forecast.io/forecast/b6bc23038b8a958fb8d13b73e7089c59/' + lat + ',' + lng,
    dataType: 'jsonp',
    success: function(weather) {
      var weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      //BACKGROUNDS, change based on current weather. Not yet implemented.
      //$('body').css('background-image', 'url(img/backgrounds/' + weather.currently.icon + '.jpg)');

      //CURRENT
      $('#cur-sum').text(weather.currently.summary);
      $('#cur-temp').css('background-image', 'url(img/icons/' + weather.currently.icon + '.png)');
      $('#cur-temp').text(Math.round(weather.currently.temperature));
      $('#cur-wind').text('Wind Speed: ' + Math.round(weather.currently.windSpeed) + ' mph');
      $('#cur-humid').text('Humidity: ' + weather.currently.humidity + ' %');

      //DAILY
      weather.daily.data.forEach(function(day, index) {
        var uTime = new Date(day.time * 1000),
            weekDay = weekDays[uTime.getDay()],
            month = months[uTime.getMonth()],
            date = uTime.getDate(),
            $dayBlock = $('.daily-block:nth-child(' + (index + 1) + ')');

        $dayBlock.children('.day').text(weekDay + ', ' + month + ' ' + date);
        $dayBlock.children('.day-icon').attr('src', 'img/icons/' + day.icon + '.png');
        $dayBlock.find('.high-temp').text(Math.round(day.temperatureMax));
        $dayBlock.find('.low-temp').text(Math.round(day.temperatureMin));
        $dayBlock.children('.day-sum').text(day.summary);
      });

      //HOURLY
      weather.hourly.data.forEach(function(hour, index) {
        var uTime = new Date(hour.time * 1000),
            $hourBlock = $('.hourly-block:nth-child(' + (index + 1) + ')'),
            formHour = function() {
              if (uTime.getHours() > 12) {
                return uTime.getHours() - 12 + ' pm';
              } else if (uTime.getHours() === 12) {
                return '12 pm';
              } else if (uTime.getHours() === 0) {
                return '12 am';
              } else {
                return uTime.getHours() + ' am';
              }
            }();

        $hourBlock.children('.hour').text(formHour);
        $hourBlock.children('.hour-icon').attr('src', 'img/icons/' + hour.icon + '.png');
        $hourBlock.find('.hour-temp').text(Math.round(hour.temperature));
        $hourBlock.children('.hour-sum').text(hour.summary);
      });

      //DETAILS

    }
  });
}

function refreshWeather(lat, lng) {
  $('#refresh').click(function() {
    updateWeather(lat, lng);
  });
}

//Toggle temperature unit by clicking button
(function() {
  var tempState = false,
      $temps = $('#cur-temp, .high-temp, .low-temp, .hour-temp'),
      $unit = $('#temp-unit');

  $('#toggle-temp').click(function() {
    tempState = !tempState;
    if (tempState) {
      $temps.each(function() {
        $(this).text(Math.round(($(this).text() - 32) * 5 / 9));
      });
      $unit.text('C');
      $(this).html('&deg;F');
    } else {
      $temps.each(function() {
        $(this).text(Math.round($(this).text() * 9 / 5 + 32));
      });
      $unit.text('F');
      $(this).html('&deg;C');
    }
  });
})();

//Parallax effect
$(document).on('scroll', function() {
  var scrollPos = $(this).scrollTop();
  $('body').css('background-position', '0 ' + -scrollPos / 4 + 'px');
});

//Controls, needs to be refactored into slide function
$('i').click(function() {
  var thisCtrl = $(this).attr('id'),
    dailyBlocks = $('.daily-block').filter(':not(:animated)'),
    hourlyBlocks = $('.hourly-block').filter(':not(:animated)'),
    slideLength = Math.round($('.forecast-inner').width() / 180) * 180,
    dayFromLeft = Math.abs($('.daily-block:first-child').position().left),
    hourFromLeft = Math.abs($('.hourly-block:first-child').position().left),
    dayFromRight = Math.abs($('.daily-block:last-child').position().left + $('.daily-block:last-child').outerWidth()) - slideLength,
    hourFromRight = Math.abs($('.hourly-block:last-child').position().left + $('.daily-block:last-child').outerWidth()) - slideLength;

  switch (thisCtrl) {
    case 'daily-left':
      if (dayFromLeft > 0 && dayFromLeft >= slideLength) {
        dailyBlocks.animate({
          right: '-=' + slideLength
        }, 700);
      } else {
        dailyBlocks.animate({
          right: '-=' + dayFromLeft
        }, 700);
      }
      break;
    case 'daily-right':
      if (dayFromRight > 0 && dayFromRight >= slideLength) {
        dailyBlocks.animate({
          right: '+=' + slideLength
        }, 700);
      } else if (dayFromRight > 0) {
        dailyBlocks.animate({
          right: '+=' + dayFromRight
        }, 700);
      }
      break;
    case 'hourly-left':
      if (hourFromLeft > 0 && hourFromLeft >= slideLength) {
        hourlyBlocks.animate({
          right: '-=' + slideLength
        }, 700);
      } else {
        hourlyBlocks.animate({
          right: '-=' + hourFromLeft
        }, 700);
      }
      break;
    case 'hourly-right':
      if (hourFromRight > 0 && hourFromRight >= slideLength) {
        hourlyBlocks.animate({
          right: '+=' + slideLength
        }, 700);
      } else if (hourFromRight > 0) {
        hourlyBlocks.animate({
          right: '+=' + hourFromRight
        }, 700);
      }
      break;
  }
});

//Mobile controls
$('#daily-tab').click(function() {
  $('#hourly').hide();
  $('#daily').show();
  $(this).css('color', 'white');
  $('#hourly-tab').css('color', 'rgba(255, 255, 255, 0.4)');
});

$('#hourly-tab').click(function() {
  $('#daily').hide();
  $('#hourly').show();
  $(this).css('color', 'white');
  $('#daily-tab').css('color', 'rgba(255, 255, 255, 0.4)');
});

$(window).resize(function() {
  if ($(this).width() > 619) {
    $('#daily, #hourly').show();
  }
});
