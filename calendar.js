const events = [
    {date: '2025-02-14', title: 'Design Thinking Workshop', type: 'workshop'},
    {date: '2025-02-24', title: 'Workshop on Web Development', type: 'workshop'},
    {date: '2025-03-17', title: 'Cultural Fest', type: 'social'},
    {date: '2025-03-21', title: 'Alumni Meet', type: 'social'},
    {date: '2025-04-01', title: 'Tech Innovation Seminar', type: 'seminar'},
    {date: '2025-04-14', title: 'AI Trends Conference', type: 'seminar'},
];


let curMonth = new Date().getMonth();
let curYear = new Date().getFullYear();

function formatDate(year, month, day){
    const date = new Date(year, month, day);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); //+1 to change from 0 based indexing
    const dd = String(date.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
}
function generateCalendar(month, year){
    const monthName = new Date(year, month).toLocaleString('default', {month: 'long', year: 'numeric'});
    document.getElementById('month-name').textContent = monthName;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let calendarBody = '';
    let dayCount = 1;
    //create weeks
    for(let row = 0; row < 6; row++){
        let week = row===0 ? '<tr class="first-row">' : "<tr>";
        //create days
        for(let col = 0 ; col < 7; col++){
            if((row === 0 && col < firstDay) || dayCount > daysInMonth)
                week += '<td class="my-4 pt-4 gap-y-4"></td>'; //empty cell
            else{
                const curDate = formatDate(year, month, dayCount);
                const event = events.find(e => e.date === curDate);
                if(event){
                    let eventColor = '';
                    switch(event.type){
                        case 'workshop':
                            eventColor = '#5ac2fc';
                            break;
                        case 'social':
                            eventColor = '#0affe2';
                            break;
                        case 'seminar':
                            eventColor = '#fbcaef';
                            break;
                        default: 
                            eventColor = '#000038';
                    }
                    week += `<td class="event gap-y-4 my-4 p-4 text-sm text-[#000038] border border-gray-300 
                             transition-transform transform hover:scale-105 cursor-pointer 
                            rounded-md" title="${event.title}" onclick="redirectToReg('${event.title}', '${event.date}')" style="background-color: ${eventColor};">${dayCount}</td>`;
                }else 
                    week += `<td class="py-4 gap-y-4">${dayCount}</td>`;
                dayCount++;
            }
        }
        week += '</tr>';
        calendarBody += week;
        if(dayCount > daysInMonth) break;
    }
    document.getElementById('calendar-body').innerHTML = calendarBody;
    displayEvents();
}


function displayEvents(){
    const workshopList = document.getElementById('workshops');
    const socialList = document.getElementById('social');
    const seminarList = document.getElementById('seminars');

    workshopList.innerHTML = '';
    socialList.innerHTML = '';
    seminarList.innerHTML = '';

    events.forEach(event => {
        const item = document.createElement('li');
        item.textContent = `${event.date} - ${event.title}`;

        switch(event.type){
            case 'workshop':
                workshopList.appendChild(item);
                break;
            case 'social':
                socialList.appendChild(item);
                break;
            case 'seminar':
                seminarList.appendChild(item);
                break;
        }
    });
}

document.getElementById('prev-btn').addEventListener('click', () =>{
    curMonth--;
    if(curMonth < 0){
        curMonth = 11;
        curYear--;
    }
    generateCalendar(curMonth, curYear);
});
document.getElementById('next-btn').addEventListener('click', () =>{
    curMonth++;
    if(curMonth > 11){
        curMonth = 0;
        curYear++;
    }
    generateCalendar(curMonth, curYear);
});

function redirectToReg(eventTitle, eventDate){
    localStorage.setItem('selectedEvent', eventTitle);
    localStorage.setItem('selectedDate', eventDate);
    window.location.href = 'register.html';
}

loadEvents();
generateCalendar(curMonth, curYear);




// modal
const eventModal = document.getElementById("event-modal")
const addEventBtn = document.getElementById("add-event-btn");
const closeModal = document.getElementById("close-modal");
const eventForm = document.getElementById("event-form")

addEventBtn.addEventListener("click", ()=>{
    eventModal.classList.remove("hidden");
});

closeModal.addEventListener("click", ()=>{
    eventModal.classList.add("hidden");
});

eventModal.addEventListener("click", (e)=>{
    if(e.target === eventModal)
        eventModal.classList.add("hidden");
});

eventForm.addEventListener("submit", (e)=>{
    e.preventDefault();

    const eventName = document.getElementById("event-name").value;
    const eventDate = document.getElementById("event-date").value;
    const eventType = document.getElementById("event-type").value;

    if(eventName && eventDate && eventType){
        const event = {
            title: eventName, 
            date: eventDate, 
            type: eventType
        };

        saveEvent(event);
        eventModal.classList.add("hidden");
        eventForm.reset();
    }
    else alert("Please fill out all fields");
});

function saveEvent(event){
    events.push(event);
    localStorage.setItem('events', JSON.stringify(events));
        const registered = JSON.parse(localStorage.getItem('registeredEvents')) || [];
        registered.push(event);
        localStorage.setItem('registeredEvents', JSON.stringify(registered));
    displayEvents();
    generateCalendar(curMonth, curYear);
}

function loadEvents(){
    const storedEvents = localStorage.getItem('events');
    if(storedEvents){
        events.length = 0;
        events.push(...JSON.parse(storedEvents));
    }
}

if('Notification' in window){
    Notification.requestPermission().then(permission =>{
        if(permission === "granted")
            console.log("notifications allowed");
    });
}

function checkReminders(){
    if(Notification.permission === "granted"){
        const today = formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        const registered = JSON.parse(localStorage.getItem('registeredEvents')) || [];

        registered.forEach(event =>{
            if(event.date === today){
                new Notification("Event Reminder", {
                    body: `Don't forget ${event.title} is happening today!`,
                    icon: 'src/icon.png'
                });
            }
        });

    const updatedEvents = registered.filter(event => event.date !== today);
    localStorage.setItem('registeredEvents', JSON.stringify(updatedEvents));
    }
}

document.addEventListener('DOMContentLoaded',()=>{
    setInterval(checkReminders, 60*60*1000);
});