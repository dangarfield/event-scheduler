import Toastify from 'toastify-js'

const getEvent = async (eventID, attendeeID) => {
    const response = await fetch(`/api/events/${eventID}/${attendeeID}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
    if (response.status !== 200) return
    const event = await response.json()
    console.log('FETCH event',event)
    return event
}
const renderDateSlots = (event) => {
    document.querySelector('.date-slots').innerHTML = `${event.dates.map(date => {
        return `<div class="card mb-3">
            <div class="card-body row">
                <div class="col">
                    <p class="mb-0">${new Date(date.date).toDateString()}</p>
                </div>
                ${date.slots.map(slot => {
                    const notAvailable = slot.disabled || (slot.attendee !== '' && slot.attendee !== event.attendee)
                    return `<div class="col">
                        <input type="radio" class="btn-check" name="slot" data-date="${date.date}" data-slot="${slot.slot}"
                            id="${date.date}-${slot.slot}" autocomplete="off" ${notAvailable?'disabled':''} ${slot.attendee === event.attendee ?'checked':''}>
                        <label class="btn ${notAvailable?'btn-outline-secondary':'btn-outline-primary'}  w-100" for="${date.date}-${slot.slot}">${slot.slot}</label>
                    </div>`
                }).join('')}

            </div>
        </div>`
    }).join('')}
    <div class="card">
        <div class="card-body row">
            
            <div class="col-md-12">
                <button type="submit" class="btn btn-primary w-100">Save date</button>
            </div>
        </div>
    </div>`
}
const renderEvent = (event) => {
    document.querySelector('.content').innerHTML = `
    <div class="container">
        <div class="row">
            <div class="col-md-6 offset-md-3">
                <h1>${event.name}</h1>
                ${event.intro.split('\n').map(text => `<p>${text}</p>`).join('')}

                <form class="event mb-3">
                    <div class="card mb-3">
                        <div class="card-body row">
                            <div class="col-md-6">
                                <div class="form-floating mb-3">
                                    <select class="form-select" id="attendees" required disabled>
                                        <option selected value="${event.attendee}">${event.attendee}</option>
                                    </select>
                                    <label for="attendees">Who do you represent?</label>
                                </div>
                                <div class="form-floating mb-3">
                                    <input type="email" class="form-control" id="email" value="${event.email}" required>
                                    <label for="email">Email address</label>
                                </div>
                                <div class="form-floating">
                                    <input type="number" class="form-control" id="size" value="${event.size}" required>
                                    <label for="size">Class Size</label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating">
                                    <textarea class="form-control" placeholder="Leave a comment here" id="notes" style="height: 206px">${event.notes}</textarea>
                                    <label for="notes">Notes</label>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div class="date-slots">
                    </div>
                </form>
            </div>
        </div>
    </div>
    `
}
const bindEvent = (event) => {
    renderDateSlots(event)
    // renderDateSlots(event)
    // document.querySelector('#attendees').addEventListener('change', (e) => {
    //     console.log('e',e.target.value)
    //     renderDateSlots(event, e.target.value)
    // })
    document.querySelector('form.event').addEventListener('submit', async (e) => {
        e.preventDefault()
        const selectedSlot = document.querySelector('input[name="slot"]:checked')
        console.log('selectedSlot', selectedSlot)
        if (selectedSlot === null) {
            Toastify({
                text: "Please select a date",
                duration: 3000,
                style: {
                    background: "linear-gradient(to right, #ff1212, #ff5656)",
                }                
            }).showToast()
            return
        }
        Toastify({
            text: "Date saved! Thanks!",
            duration: 3000,              
        }).showToast()
        const response = await fetch(`/api/events/${event.id}/${btoa(document.querySelector('#attendees').value)}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                date: selectedSlot.getAttribute('data-date'),
                slot: selectedSlot.getAttribute('data-slot'),
                attendee: document.querySelector('#attendees').value,
                email: document.querySelector('#email').value,
                size: parseInt(document.querySelector('#size').value),
                notes: document.querySelector('#notes').value
            })
        })
        if (response.status !== 200) return
        const saveRes = await response.json()
        console.log('SAVE saveRes',saveRes)
    })
}
export const initEvent = async (eventID, attendeeID) => {
    console.log('initEvent', eventID, attendeeID)
    const event = await getEvent(eventID, attendeeID)
    if (event === undefined) {
        document.querySelector('.content').innerHTML = 'Please select a valid event'
        return
    }
    renderEvent(event)
    bindEvent(event)
}