function dateToUnixTimestamp(dateString) {

    const [day, month, year] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const unixTimestamp = Math.floor(date.getTime() / 1000);

    return unixTimestamp;
}

const dateString = '23-10-1990';
const unixTimestamp = dateToUnixTimestamp(dateString);

