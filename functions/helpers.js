function dateToUnixTimestamp(dateString) {
    const [day, month, year] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const unixTimestamp = Math.floor(date.getTime() / 1000); 

    return unixTimestamp;
}

function dateToUnixTimestampPlusADay(dateString) {
    const [day, month, year] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0)); 
    const unixTimestamp = Math.floor(date.getTime() / 1000); 

    return unixTimestamp;
}

function formatDateToMatchApiArgument(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${day}-${month}-${year}`;
}

function getLastFridayOrNonHolidayDate(dateString) {

    const holidays = [
      '01-01', // New Year's Day
      '01-15', // Martin Luther King, Jr. Day
      '02-19', // Washington's Birthday
      '03-29', // Good Friday
      '05-27', // Memorial Day
      '06-19', // Juneteenth National Independence Day
      '07-04', // Independence Day
      '09-02', // Labor Day
      '11-28', // Thanksgiving Day
      '12-25'  // Christmas Day
    ];
  
    const parts = dateString.split('-');
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    
    const date = new Date(year, month, day);
  
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const lastFriday = new Date(date);
      lastFriday.setDate(date.getDate() - (dayOfWeek === 0 ? 2 : 1));
      const formattedLastFriday = `${lastFriday.getDate().toString().padStart(2, '0')}-${(lastFriday.getMonth() + 1).toString().padStart(2, '0')}-${lastFriday.getFullYear()}`;
      return formattedLastFriday;
    } else if (holidays.includes((month + 1).toString().padStart(2, '0') + '-' + day.toString().padStart(2, '0'))) {
      const lastFriday = new Date(date);
      lastFriday.setDate(date.getDate() - 1);
      const formattedLastFriday = `${lastFriday.getDate().toString().padStart(2, '0')}-${(lastFriday.getMonth() + 1).toString().padStart(2, '0')}-${lastFriday.getFullYear()}`;
      return formattedLastFriday;
    } else {
      return dateString;
    }
  }

  module.exports = { formatDateToMatchApiArgument, getLastFridayOrNonHolidayDate, dateToUnixTimestamp, dateToUnixTimestampPlusADay };