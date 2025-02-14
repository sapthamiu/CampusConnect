const eventTitle = localStorage.getItem('selectedEvent');
const eventDate = localStorage.getItem('selectedDate');
if(eventTitle && eventDate){
    const filler = document.getElementById('filler');
    filler.innerHTML += `We look forward to seeing you at the <strong>${eventTitle}</strong> on <strong>${eventDate}</strong>`;
    localStorage.removeItem('selectedEvent');
    localStorage.removeItem('selectedDate');
}