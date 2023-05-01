const convertToLocaleDateString = () => {
     const date = new Date()
     const options = { year: 'numeric', month: 'long', day: 'numeric' };
     const dateString = date.toLocaleDateString('en-US', options);
     return dateString
}

const convertToValidDateFormat = (dateString) => {
     const time = '00:00:00'
     const appendedDateStringWithTime = `${dateString}T${time}.000Z`
     return appendedDateStringWithTime
}

export { convertToLocaleDateString, convertToValidDateFormat }