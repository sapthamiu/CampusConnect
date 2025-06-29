window.addEventListener('load', function(){
    const event = document.getElementById('event');
    const eventTitle = localStorage.getItem('selectedEvent');
    if(eventTitle){
        event.value = eventTitle;
       // localStorage.removeItem('selectedEvent');
    }
});

function handleSubmit(event){
    event.preventDefault();
    window.location.href = "../public/confirmation.html";
}