(function() {
  'use strict';

  function CalendarService($window, $http, $q) {
    var service = {};

    service.events = [];

// Returns calendar file from config.js for use in index.html
    service.getCalendarEvents = function() {
      service.events = [];
      return loadFile(config.calendar.icals);
    }

// loads in the calendars (from an array of iCal files)
    var loadFile = function(urls) {
      var toLoad = [];

      angular.forEach(urls, function(url) {
        toLoad.push($http.get(url));
      });

      return $q.all(toLoad).then(function(data) {
        for (var i = 0; i < toLoad.length; i++) {
          parseICAL(data[i].data);
        }
      });
    }

// reads from the calendar files
// makes the data readable, using moment.js formatting
    var makeDate = function(type, ical_date) {
        if(ical_date.endsWith('Z')){
            return moment(ical_date, 'YYYYMMDDTHHmmssZ');
        }

        if(!type.endsWith('VALUE=DATE')){
            return moment(ical_date, 'YYYYMMDDTHHmmss');
        } else {
            return moment(ical_date, 'YYYYMMDD');
        }
    }

    var parseICAL = function(data) {
      //Ensure cal is empty
      var events = [];

      //Clean string and split the file so we can handle it (line by line)
      var cal_array = data.replace(new RegExp("\\r", "g"), "").replace(/\n /g, "").split("\n");

      //Keep track of when we are activly parsing an event
      var in_event = false;
      //Use as a holder for the current event being proccessed.
      var cur_event = null;
      for (var i = 0; i < cal_array.length; i++) {
        var ln = cal_array[i];
        //If we encounted a new Event, create a blank event object + set in event options.
        if (!in_event && ln == 'BEGIN:VEVENT') {
          var in_event = true;
          var cur_event = {};
        }
        //If we encounter end event, complete the object and add it to our events array then clear it for reuse.
        if (in_event && ln == 'END:VEVENT') {
          in_event = false;
          if(!contains(events, cur_event)) {
            events.push(cur_event);
          }
          cur_event = null;
        }
// "If we are in an event"
// this is what will
        else if (in_event) {

// Splits the item based on the first ":"
          var idx = ln.indexOf(':');
// Applies trimming to values - reduces risk of badly formatted ical files.
          var type = ln.substr(0, idx).replace(/^\s\s*/, '').replace(/\s\s*$/, ''); //Trim
          var val = ln.substr(idx + 1).replace(/^\s\s*/, '').replace(/\s\s*$/, '');

// If type = start date, proccess and store it
          if (type.startsWith('DTSTART')) {
            cur_event.start = makeDate(type, val);
          }

// If the type = end date, process and store it
          else if (type.startsWith('DTEND')) {
            cur_event.end = makeDate(type, val);
          }

// Converts the timestamp
          else if (type == 'DTSTAMP') {

          } else {
            val = val
              .replace(/\\r\\n/g, '<br />')
              .replace(/\\n/g, '<br />')
              .replace(/\\,/g, ',');
          }

// Adds the value to the event object
          if ( type !== 'SUMMARY' || (type=='SUMMARY' && cur_event['SUMMARY'] == undefined)) {
            cur_event[type] = val;
          }
          if (cur_event['SUMMARY'] !== undefined && cur_event['RRULE'] !== undefined &&
              cur_event['DTSTART'] !== undefined && cur_event['DTEND'] !== undefined) {
            var options = new RRule.parseString(cur_event['RRULE']);
      			options.dtstart = cur_event.start.toDate();
      			var event_duration = cur_event.end.diff(cur_event.start,'minutes');
      			var rule = new RRule(options);
            var oneYear = new Date();
      			oneYear.setFullYear(oneYear.getFullYear() + 1);
      			var dates = rule.between(new Date(), oneYear, true, function (date, i){return i < 10});
      			for (var date in dates) {
              var recuring_event = {};
              recuring_event.SUMMARY = cur_event.SUMMARY;
      				var dt = new Date(dates[date]);
      				var startDate = moment(dt);
      				var endDate = moment(dt);
              endDate.add(event_duration, 'minutes');
              recuring_event.start = startDate;
              recuring_event.end = endDate;
              if(!contains(events, recuring_event)) {
                events.push(recuring_event);
              }
      			}
          }
        }
      }

      //Add all of the extracted events to the CalendarService
      service.events.push.apply(service.events, events);
    }

    var contains = function(input, obj) {
      var i = input.length;
      while (i--) {
        var current = input[i];
        if (obj.start.isValid()) {
          if (current.start.isSame(obj.start.toDate()) && current.SUMMARY === obj.SUMMARY) {
            return true;
          }
        }
      }
      return false;
    }

    Array.prototype.contains = function(obj) {
        var i = this.length;
        while (i--) {
            if (this[i] === obj) {
                return true;
            }
        }
        return false;
    }

    service.getEvents = function(events) {
      return service.events;
    }

    service.getFutureEvents = function() {
      var future_events = [],
        current_date = new moment(),
        end_date = new moment().add(config.calendar.maxDays, 'days');

        // Handles addition of Calendar Events that are edge cases
        // (if starting before current time, or if no end time but starting within maxDays limit [from config.js])
      service.events.forEach(function(itm) {
        if ((itm.end != undefined && (itm.end.isAfter(current_date) && itm.start.isBefore(current_date))) || itm.start.isBetween(current_date, end_date)){
            future_events.push(itm);
        }
      });
      future_events = sortAscending(future_events);
      return future_events.slice(0, config.calendar.maxResults);
    }

    var sortAscending = function(events) {
      return events.sort(function(a, b) {
        var key1 = a.start;
        var key2 = b.start;

        if (key1.isBefore(key2)) {
          return -1;
        } else if (key1.isSame(key2)) {
          return 0;
        } else {
          return 1;
        }
      });
    }

    return service;
  }

  angular.module('SmartMirror')
    .factory('CalendarService', CalendarService);
}());
