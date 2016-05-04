var config = {

    // Lenguage for the mirror
    language : "en", //must also manually update locales/X.js bower component in index.html
    layout: "main",

    // forcast.io "DarkSky" weather-service API
    forcast : {
      key : "538427f03c5da2905372a89ac1430dcf", // This is my forcast.io api key
      units : "auto" // recommended in forcast.io documentation
    },

    // Calendar (An array of iCals, only one at the moment but more can be added)
    calendar: {
      icals : ["https://calendar.google.com/calendar/ical/michaelspier_2016%40depauw.edu/private-6ea64f7494dd5b335e000b74c930577f/basic.ics"],
      maxResults: 9, // how many calendar events do I want to display
      maxDays: 365 // how many days do I want to check ahead for events
    }

};
