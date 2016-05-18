var config = {

    // Language set to be used in initialization of the Weather service
    language : "en",

    // forecast.io "DarkSky" weather-service API used for accurate weather data
    forecast : {
      key : "538427f03c5da2905372a89ac1430dcf", // This is my personal forecast.io API key
      units : "auto" // recommended from the forecast.io documentation
    },

    // Array of iCal files to be used by the Calendar service
    calendar: {
      icals : ["https://calendar.google.com/calendar/ical/michaelspier_2016%40depauw.edu/private-6ea64f7494dd5b335e000b74c930577f/basic.ics"],
      maxResults: 7, // how many calendar events do I want to display
      maxDays: 365 // how many days do I want to check ahead for events
    }

};
