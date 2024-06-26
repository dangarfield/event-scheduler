import Toastify from 'toastify-js'

const getEvents = async (attendeeID) => {
    const response = await fetch(`/api/attendees/${attendeeID}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
    if (response.status !== 200) return
    const events = await response.json()
    console.log('FETCH events',events)
    return events
}
const renderDateSlots = (eventEle, event) => {
    eventEle.querySelector('.date-slots').innerHTML = `${event.dates.map((date,dateIndex) => {
        const dateDate = new Date(date.date)
        return `<div class="card text-bg-light mb-3">
            <div class="card-body row">
                <div class="col">
                    <p class="mb-0">${dateDate.toDateString()}</p>
                </div>
                ${date.slots.map(slot => {
                    const notAvailable = slot.disabled || (slot.school !== '' && slot.school !== event.school)
                    let time = slot.time || '09:00'
                    let timeMin = '09:00'
                    let timeMax = '12:00'
                    if (slot.slot === 'Afternoon') {
                        time = '12:00'
                        timeMin = '12:00'
                        timeMax = '15:00'
                    }
                    if (slot.time) time = slot.time

                    return `<div class="col">
                            <input type="radio" class="btn-check" name="slot" data-date="${date.date}" data-slot="${slot.slot}"
                                id="${date.date}-${slot.slot}" autocomplete="off" ${notAvailable?'disabled':''} ${slot.school === event.school ?'checked':''}>
                            <label class="btn ${notAvailable?'btn-outline-secondary':'btn-outline-primary'}  w-100" for="${date.date}-${slot.slot}">${slot.slot}</label>
                            
                            <input type="time" class="form-control mt-1 time"
                                min="${timeMin}" max="${timeMax}" step="600" 
                                ${slot.school === event.school ?'':'style="display:none;"'}
                                value="${time}" />
                        </div>`
                }).join('')}

            </div>
        </div>
        ${dateIndex !== event.dates.length-1 && dateDate.getDay()===5 || dateDate.getDay()===7 ?'<hr class="border border-secondary opacity-100"/>':''}
        `
    }).join('')}
    <div class="card text-bg-light">
        <div class="card-body row">
            <div class="col-md-12">
                <button type="submit" class="btn btn-primary w-100">Save date</button>
            </div>
        </div>
    </div>`
}
const renderEvents = (events) => {
    const eventHTML = []
    const eventTabHTML = []
    for (const [eventIndex, event] of events.entries()) {
        
        let eventComplete = false
        for (const date of event.dates) {
            for (const slot of date.slots) {
                if (slot.school === event.school) eventComplete = true
            }
        }
        console.log('eventComplete', eventComplete)
        
        eventTabHTML.push(`<li class="nav-item me-2">
            <button class="nav-link event-link${eventIndex===0?' active':''} ${eventComplete?'event-complete':'event-incomplete'}" data-event="${event.id}">
                <i class="bi ${eventComplete?'':'bi-exclamation-triangle'} me-1"></i> ${event.name}
            </button>
        </li>`)
        document.title = event.name // TODO - Ensure title for multiple / single event is correct
        let email1 = ''
        let name1 = ''
        let email2 = ''
        let name2 = ''
        let email3 = ''
        let name3 = ''
        if (event.teachers.length > 0) {
            email1 = event.teachers[0].email
            name1 = event.teachers[0].name
        }
        if (event.teachers.length > 1) {
            email2 = event.teachers[1].email
            name2 = event.teachers[1].name
        }
        if (event.teachers.length > 2) {
            email3 = event.teachers[2].email
            name3 = event.teachers[2].name
        }
        eventHTML.push(`
        <div class="event" data-event="${event.id}"${eventIndex===0?'':' style="display:none;"'}>
            <div class="row">
                <div class="col-md-6 offset-md-3">
                    <h1>${event.name}</h1>
                    ${event.intro.split('\n').map(text => `<p>${text}</p>`).join('')}

                    <form class="event mb-3">
                        <div class="card text-bg-light mb-3">
                            <div class="card-body row gx-3">
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <select class="form-select" id="attendees" required disabled>
                                            <option selected value="${event.school}">${event.school}</option>
                                        </select>
                                        <label for="attendees">School Name</label>
                                    </div>
                                    
                                    
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="name1" value="${name1}" required>
                                        <label for="name1">Lead Teacher Name</label>
                                    </div>
                                    <div class="form-floating mb-3" style="display:none;">
                                        <input type="text" class="form-control" id="name2" value="${name2}">
                                        <label for="name2">Teacher 2 Name</label>
                                    </div>
                                    <div class="form-floating mb-3" style="display:none;">
                                        <input type="text" class="form-control" id="name3" value="${name3}">
                                        <label for="name3">Teacher 3 Name</label>
                                    </div>

                                    
                                </div>
                                <div class="col-md-6">
                                    <div class="row gx-3">
                                        <div class="col-5">
                                            <div class="form-floating mb-3">
                                                <select class="form-select" id="form-size" required>
                                                    <option value="1"${event.formSize === 1 ?' selected':''}>1</option>
                                                    <option value="2"${event.formSize === 2 ?' selected':''}>2</option>
                                                    <option value="3"${event.formSize === 3 ?' selected':''}>3</option>
                                                </select>
                                                <label for="floatingSelect">No. of Classes</label>
                                            </div>
                                        </div>
                                        <div class="col-7">
                                            <div class="form-floating mb-3">
                                                <input type="number" class="form-control" id="class-size" value="${event.classSize}" required>
                                                <label for="size">Total Year 6 Students</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-floating mb-3">
                                        <input type="email" class="form-control" id="email1" value="${email1}" required>
                                        <label for="email1">Lead Teacher Email</label>
                                    </div>
                                    <div class="form-floating mb-3" style="display:none;">
                                        <input type="email" class="form-control" id="email2" value="${email2}">
                                        <label for="email2">Teacher 2 Email</label>
                                    </div>
                                    <div class="form-floating mb-3" style="display:none;">
                                        <input type="email" class="form-control" id="email3" value="${email3}">
                                        <label for="email3">Teacher 3 Email</label>
                                    </div>

                                </div>
                                <div class="col-12">
                                    <div class="form-floating">
                                        <textarea class="form-control" placeholder="Leave a comment here" id="notes" style="height: 132px">${event.notes}</textarea>
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
        `)
    }
    console.log('eventHTML', eventHTML)
    document.querySelector('.content').innerHTML = `
    <div class="row">
        <div class="navbar bg-body-tertiary border-bottom border-body navbar-expand-lg mb-3">
            <div class="container-fluid col-md-6 offset-md-3">
                <div class="collapse navbar-collapse col-md-6 offset-md" id="navbarNav">
                    <ul class="navbar-navX nav nav-pills">
                        ${eventTabHTML.join('')}
                    </ul>
                </div>
            </div>
        </div>
    </div>
    ${eventHTML.join('')}`// TODO - Add divider
}
const showHideContactDetails = (eventEle) => {
    const formSize = parseInt(eventEle.querySelector('#form-size').value)
    console.log('formSize', formSize)
    switch (formSize) {
        case 1:
            eventEle.querySelector('#email2').parentNode.style.display = 'none'
            eventEle.querySelector('#name2').parentNode.style.display = 'none'
            eventEle.querySelector('#email3').parentNode.style.display = 'none'
            eventEle.querySelector('#name3').parentNode.style.display = 'none'
            eventEle.querySelector('#email2').removeAttribute('required')
            eventEle.querySelector('#name2').removeAttribute('required')
            eventEle.querySelector('#email3').removeAttribute('required')
            eventEle.querySelector('#name3').removeAttribute('required')
            break;
        case 2:
            eventEle.querySelector('#email2').parentNode.style.display = 'block'
            eventEle.querySelector('#name2').parentNode.style.display = 'block'
            eventEle.querySelector('#email3').parentNode.style.display = 'none'
            eventEle.querySelector('#name3').parentNode.style.display = 'none'
            eventEle.querySelector('#email2').setAttribute('required', 'required')
            eventEle.querySelector('#name2').setAttribute('required', 'required')
            eventEle.querySelector('#email3').removeAttribute('required')
            eventEle.querySelector('#name3').removeAttribute('required')
            break;
        case 3:
            eventEle.querySelector('#email2').parentNode.style.display = 'block'
            eventEle.querySelector('#name2').parentNode.style.display = 'block'
            eventEle.querySelector('#email3').parentNode.style.display = 'block'
            eventEle.querySelector('#name3').parentNode.style.display = 'block'
            eventEle.querySelector('#email2').setAttribute('required', 'required')
            eventEle.querySelector('#name2').setAttribute('required', 'required')
            eventEle.querySelector('#email3').setAttribute('required', 'required')
            eventEle.querySelector('#name3').setAttribute('required', 'required')
            break;
        default:
            break;
    }
}
const bindEvents = (events) => {
    for (const event of events) {
        const eventEle = document.querySelector(`.event[data-event="${event.id}"]`)
        renderDateSlots(eventEle, event)
        eventEle.querySelectorAll('input[name="slot"]').forEach((input) => {
            input.addEventListener('change', (e) => {
                console.log('e', e)
                eventEle.querySelectorAll('.time').forEach((timeEle) => {
                    timeEle.style.display = 'none'
                })
                e.target.parentNode.querySelector('.time').style.display = 'block'
            })
        })
        eventEle.querySelector('#attendees').addEventListener('change', (e) => {
            console.log('e',e.target.value)
            renderDateSlots(eventEle, event)
        })
        showHideContactDetails(eventEle)
        eventEle.querySelector('#form-size').addEventListener('change', ()=> {
            showHideContactDetails(eventEle)
        })
        eventEle.querySelector('form.event').addEventListener('submit', async (e) => {
            e.preventDefault()
            const selectedSlot = eventEle.querySelector('input[name="slot"]:checked')
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

            const formSize = parseInt(eventEle.querySelector('#form-size').value)
            const teachers = [{name: eventEle.querySelector('#name1').value, email: eventEle.querySelector('#email1').value}]
            if (formSize > 1) teachers.push({name: eventEle.querySelector('#name2').value, email: eventEle.querySelector('#email2').value})
            if (formSize > 2) teachers.push({name: eventEle.querySelector('#name3').value, email: eventEle.querySelector('#email3').value})

            const update = {
                date: selectedSlot.getAttribute('data-date'),
                slot: selectedSlot.getAttribute('data-slot'),
                time: selectedSlot.parentNode.querySelector('.time').value,
                school: eventEle.querySelector('#attendees').value,
                teachers,
                formSize,
                classSize: parseInt(eventEle.querySelector('#class-size').value),
                notes: eventEle.querySelector('#notes').value
            }
            console.log('update',update)
            const response = await fetch(`/api/events/${event.id}/${btoa(eventEle.querySelector('#attendees').value)}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(update)
            })
            if (response.status !== 200) return
            const saveRes = await response.json()
            console.log('SAVE saveRes',saveRes)
        })
    }
    document.querySelectorAll('.event-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const eventID = e.currentTarget.getAttribute('data-event')
            console.log('e', e.currentTarget.getAttribute('data-event'))
            document.querySelectorAll('.event[data-event]').forEach(eventEle => {
                console.log('eventEle', eventEle)
                if (eventID === eventEle.getAttribute('data-event')) {
                    console.log('show', eventID)
                    eventEle.style.display = 'block'
                } else {
                    console.log('hide', eventID)
                    eventEle.style.display = 'none'
                }
            })
            document.querySelectorAll('.event-link').forEach(linkEle => {
                console.log('linkEle', linkEle)
                if (eventID === linkEle.getAttribute('data-event')) {
                    console.log('show', eventID)
                    linkEle.classList.add('active')
                } else {
                    console.log('hide', eventID)
                    linkEle.classList.remove('active')
                }
            })
            // eventEle.querySelectorAll('.time').forEach((timeEle) => {
            //     timeEle.style.display = 'none'
            // })
            // e.target.parentNode.querySelector('.time').style.display = 'block'
        })
    })
    const eventIncompleteLink = document.querySelector('.event-incomplete')
    console.log('eventIncompleteLink', eventIncompleteLink)
    if(eventIncompleteLink) eventIncompleteLink.click()
}
export const initEvent = async (attendeeID) => {
    console.log('initEvent', attendeeID)
    const events = await getEvents(attendeeID)
    if (events === undefined) {
        document.querySelector('.content').innerHTML = 'Please select a valid event'
        return
    }
    renderEvents(events)
    bindEvents(events)
}