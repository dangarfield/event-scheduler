import * as FileSaver from "file-saver"
import * as XLSX from "xlsx"
import Toastify from 'toastify-js'

const allEvents = []

const exportToSpreadsheet = (data, fileName) => {
    const workSheet = XLSX.utils.aoa_to_sheet(data)
    const workBook = {
      Sheets: { data: workSheet, cols: [] },
      SheetNames: ["data"],
    }
    const excelBuffer = XLSX.write(workBook, { bookType: "xlsx", type: "array" })
    const fileData = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" })
    FileSaver.saveAs(fileData, fileName)
}
const renderAttendeeLinks = (eventID, eventEle) => {
    const attendees = eventEle.querySelector('#attendees').value.split('\n').map(a => {return {name:a,link:btoa(a)}})
    console.log('attendees', attendees)
    eventEle.querySelector('.attendee-links').innerHTML = attendees.map(a => {
        return `<p class="mb-0"><a href="/${eventID}/${a.link}" target="_blank">Link for ${a.name}</a></p>`
    }).join('')
}
const renderEvents = () => {
    console.log('renderEvents', allEvents, document.querySelector('.existing-holder'))
    document.querySelector('.existing-holder').innerHTML = allEvents.map(event => {

        return `
        <div class="card text-bg-light mb-3">
            <div class="card-body">
                <form class="mb-3 data-event" data-event="${event.id}">
                <div class="row">
                    <div class="col">
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="event" value="${event.id}">
                            <label for="event">Event ID</label>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="name" value="${event.name}">
                            <label for="name">Event Name</label>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-floating mb-3">
                            <textarea class="form-control" placeholder="Introduction Text" id="intro" style="height:200px">${event.intro}</textarea>
                            <label for="intro">Introduction Text</label>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-floating mb-3">
                            <textarea class="form-control" placeholder="School List" id="attendees" style="height:200px">${event.attendees.join('\n')}</textarea>
                            <label for="attendees">School List</label>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-floating mb-3">
                            <h5>Attendee Links</h5>
                            <div class="attendee-links"></div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-auto">
                        
                        ${event.dates.map(date => {
                            return `<div class="row mb-3 date-row" data-date="${date.date.toISOString()}">
                                <div class="col">
                                    ${date.date.toDateString()}
                                </div>
                                <div class="col-auto">
                                    ${date.slots.map(slot => {
                                        return `<div class="row mb-2 slot gx-2" data-date="${date.date.toDateString()}">
                                                    <div class="col-auto">
                                                        <div class="form-floating">
                                                            <input type="text" class="form-control form-control-sm slot" value="${slot.slot}" style="width:100px">
                                                            <label>Slot</label>
                                                        </div>
                                                    </div>
                                                    <div class="col-auto">
                                                        <div class="form-floating">
                                                            <input type="text" class="form-control form-control-sm attendee" value="${slot.attendee}" style="min-width:250px">
                                                            <label>Attendee</label>
                                                        </div>
                                                    </div>
                                                    <div class="col-auto">
                                                        <div class="form-floating">
                                                            <input type="email" class="form-control form-control-sm email" value="${slot.email}" style="min-width:250px">
                                                            <label>Email</label>
                                                        </div>
                                                    </div>
                                                    <div class="col-auto">
                                                        <div class="form-floating">
                                                            <input type="number" class="form-control form-control-sm size" value="${slot.size}" style="max-width:100px">
                                                            <label>Class Size</label>
                                                        </div>
                                                    </div>
                                                    <div class="col-auto">
                                                        <div class="form-floating">
                                                            <textarea class="form-control form-control-sm notes" style="height: 50px;min-width:250px">${slot.notes || ''}</textarea>
                                                            <label>Notes</label>
                                                        </div>
                                                    </div>
                                                    <div class="col-auto">
                                                        <div class="form-check form-switch">
                                                            <input class="form-check-input" type="checkbox" role="switch" id="${event.id}-${date.date.getTime()}-${slot.slot}-disable"${slot.disabled?' checked':''}>
                                                            <label class="form-check-label" for="${event.id}-${date.date.getTime()}-${slot.slot}-disable">Disable slot</label>
                                                        </div>
                                                    </div>
                                                </div>`
                                    }).join('')}
                                </div>
                            </div>`
                        }).join('')}

                        <button type="button" class="btn btn-danger delete">Delete</button>
                        <a class="btn btn-secondary" target="_blank" href="/${event.id}">Go to page</a>
                        <button type="button" class="btn btn-secondary save-to-excel">Save to excel</button>
                        <button type="submit" class="btn btn-primary">Update event</button>
                    </div>
                </div>
            </form>
        </div>
    </div>`
    }).join('')
    
    if(allEvents.length === 0) {
        document.querySelector('.existing-holder').innerHTML = '<p>No events set up</p>'
    }

    document.querySelectorAll('.data-event').forEach(eventEle => {
        const eventID = eventEle.getAttribute('data-event')
        console.log('BIND eventID', eventID)
        eventEle.addEventListener('submit', (e) => {
            e.preventDefault()
            const event = {
                id: eventEle.querySelector('#event').value,
                name: eventEle.querySelector('#name').value,
                intro: eventEle.querySelector('#intro').value,
                attendees: eventEle.querySelector('#attendees').value.split('\n'),
                dates: Array.from(eventEle.querySelectorAll('.date-row')).map(dateEle => {
                    return {
                        date: new Date(dateEle.getAttribute('data-date')),
                        slots: Array.from(dateEle.querySelectorAll('.row.slot')).map(slotEle => {
                            return {
                                slot: slotEle.querySelector('.slot').value,
                                attendee: slotEle.querySelector('.attendee').value,
                                email: slotEle.querySelector('.email').value,
                                size: slotEle.querySelector('.size').value,
                                notes: slotEle.querySelector('.notes').value,
                                disabled: slotEle.querySelector('.form-check-input').checked
                            }
                        })
                    }
                })
            }
            saveEvent(event)
            
            console.log('UPDATE event', event)
        })
        eventEle.querySelector('.save-to-excel').addEventListener('click', () => {
            console.log('save to excel', eventID)
            const excelData = [
                ['Date','Slot','Attendee','Email','Class Size','Notes','Disabled']
            ]
            const slotEles = Array.from(eventEle.querySelectorAll('.row.slot')).map(slotEle => {
                return [
                    slotEle.getAttribute('data-date'),
                    slotEle.querySelector('.slot').value,
                    slotEle.querySelector('.attendee').value,
                    slotEle.querySelector('.email').value,
                    slotEle.querySelector('.size').value,
                    slotEle.querySelector('.notes').value,
                    slotEle.querySelector('.form-check-input').checked ? 'Disabled' : ''
                ]
            })
            excelData.push(...slotEles)

            console.log('excelData',excelData, slotEles)
            exportToSpreadsheet(excelData,`${eventID}.xlsx`)
            
        })
        eventEle.querySelector('.delete').addEventListener('click', async () => {
            const confirmed = confirm('Are you sure?')
            if (confirmed) {
                console.log('DELETE', eventID)
                const response = await fetch('/api/all-events', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${btoa(localStorage.getItem('password'))}`
                    },
                    body: JSON.stringify({id: eventID})
                })
                const saveResult = await response.json()
                console.log('saveResult',saveResult)
                window.location.reload()
            }
        })
        renderAttendeeLinks(eventID, eventEle)
        eventEle.querySelector('#attendees').addEventListener('change', () => {
            console.log('attendees change')
            renderAttendeeLinks(eventID, eventEle)
        })
    })
}

const renderNew = () => {
    const randomEventName = `Event ${Math.floor(100 + Math.random() * 900)}`
    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 6)
    const formattedTodayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const formattedNextWeekDate = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`

    document.querySelector('.content').innerHTML = `
    <div class='row'>
        <div class="col-12">
            <h1>Admin</h1>
            <p class="lead">This site allows you to configure an event, send links to your attendees, allowing them to choose a selection, the you can export to Excel</p>
            
            <h3>Instructions</h3>
            <p>Configuring:</p>
            <ul>
                <li>Event name - This is shown on the attendee page, a version of it also makes up the URL</li>
                <li>School list - Add as many as you want here, schools will not see each other's names, slots or email addresses etc</li>
                <li>Introduction text - This is show on the attendee page</li>
                <li>From / to date - This is just a date range of the event. You can disable certain days and slots after it is created</li>
                <li>Available days / slots - Working work / every. Full day / Morning afternoon. You can rename the slots after created, eg, 9-11am etc</li>
                <li>Once the event has been created, you can view the results, links and edit information on this page below</li>
            </ul>
            <p>Running</p>
            <ul>
                <li>Editing event - You can change all aspects of the event. Eg, name, text, schools etc. You can also view the information that has been added for each slot</li>
                <li>Overriding - Edit the text in the 'All events' table for the event you want and press 'update event'</li>
                <li>Send links to schools - As you update the schools list, you can copy the links for each school. They can re-edit their selection</li>
                <li>Save to excel - Click the button to save it</li>
            </ul>

            <p>Not implemented</p>
            <ul>
                <li>Notifications for you or the attendees</li>
            </ul>

            <h2>Create New Event</h2>
            <div class="card text-bg-light mb-3">
                <div class="card-body">
                    <form class="new-event">
                        <div class="row">
                            <div class="col-6">
                                <div class="form-floating mb-3">
                                    <input type="text" class="form-control" id="new-event" value="${randomEventName}">
                                    <label for="new-event">Event Name</label>
                                </div>


                                <div class="form-floating mb-3">
                                    <textarea class="form-control" placeholder="School List" id="new-attendees" style="height:400px">School 1\nSchool 2\nSchool 3</textarea>
                                    <label for="new-attendees">School List</label>
                                </div>


                            </div>
                            <div class="col-6">
                            
                                <div class="form-floating mb-3">
                                    <textarea class="form-control" placeholder="Introduction Text" id="new-intro" style="height:200px">Hello and welcome!\nPlease select a slot for your event.\n\nThe Phase Team</textarea>
                                    <label for="new-intro">Introduction Text</label>
                                </div>
                                <div class="row mb-3">
                                    <label for="new-from" class="col-sm-2 col-form-label">From Date</label>
                                    <div class="col-sm-10">
                                        <input type="date" class="form-control" id="new-from" style="max-width: 200px" value="${formattedTodayDate}">
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <label for="new-to" class="col-sm-2 col-form-label">To Date</label>
                                    <div class="col-sm-10">
                                        <input type="date" class="form-control" id="new-to" style="max-width: 200px" value="${formattedNextWeekDate}">
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label for="new-working-week" class="col-sm-2 col-form-label">Available Days</label>
                                    <input type="radio" class="btn-check" name="new-working-week" id="true" autocomplete="off" checked>
                                    <label class="btn" for="true">Working Work</label>
                                    <input type="radio" class="btn-check" name="new-working-week" id="false" autocomplete="off">
                                    <label class="btn" for="false">Every Day</label>
                                </div>

                                <div class="mb-3">
                                    <label for="new-slots" class="col-sm-2 col-form-label">Available Slots</label>
                                    <input type="radio" class="btn-check" name="new-slots" id="allday" autocomplete="off">
                                    <label class="btn" for="allday">All day</label>
                                    <input type="radio" class="btn-check" name="new-slots" id="morningafternoon" autocomplete="off" checked>
                                    <label class="btn" for="morningafternoon">Morning / Afternoon</label>
                                </div>

                                <button type="submit" class="btn btn-primary">Create event</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="col-12 new-holder">
        <div>
        <div class="col-12">
            <h2>All Events<h2>
        </div>
        <div class="col-12 existing-holder">
        </div>
    </div>
    `
}
const bindNew = () => {
    const generateDateList = (fromDate, toDate, isWorkingWeek) => {
        const dateList = []
        const currentDate = new Date(fromDate)
        while (currentDate <= toDate) {
            const dayOfWeek = currentDate.getDay()
            if (!isWorkingWeek || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
                dateList.push(new Date(currentDate))
            }
            currentDate.setDate(currentDate.getDate() + 1)
        }
        return dateList
    }
    const addSlots = (dates, slotType) => {
        return dates.map(date => {
            const slots = []
            if(slotType === 'morningafternoon') {
                slots.push({slot: 'Morning', attendee:'', email:''})
                slots.push({slot: 'Afternoon', attendee:'', email:''})
            } else {
                slots.push({slot: 'Day', attendee:'', email:''})
            }
            return {date, slots}
        })
    }
    document.querySelector('.new-event').addEventListener('submit', async (e) => {
        e.preventDefault()
        const name = document.querySelector('.new-event #new-event').value
        const fromDate = new Date(document.querySelector('.new-event #new-from').value)
        const toDate = new Date(document.querySelector('.new-event #new-to').value)
        const isWorkingWeek = document.querySelector('.new-event input[name="new-working-week"]:checked').getAttribute('id') === 'true'
        const dates = generateDateList(fromDate, toDate, isWorkingWeek)
        const dateSlots = addSlots(dates, document.querySelector('.new-event input[name="new-slots"]:checked').getAttribute('id'))
        const event = {
            id: name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'),
            name,
            intro: document.querySelector('.new-event #new-intro').value,
            dates: dateSlots,
            attendees: document.querySelector('.new-event #new-attendees').value.split('\n')
        }
        console.log('event', event)
        // TODO - Persist event
        allEvents.push(event)
        await saveEvent(event)
        renderEvents()
    })
}
const saveEvent = async (event) => {
    const response = await fetch('/api/all-events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(localStorage.getItem('password'))}`
        },
        body: JSON.stringify(event)
    })
    const saveResult = await response.json()
    console.log('saveResult',saveResult)
    Toastify({
        text: "Event saved",
        duration: 3000
    }).showToast()
}
const getAllEvents = async () => {
    let password = localStorage.getItem('password') || ''
    if(password === '') password = prompt("Enter password", "C surname") || ''
    console.log('password', password)

    const response = await fetch('/api/all-events', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(password)}`
        }
    })
    if(response.status !== 200) {
        window.location.reload()
    } else {
        console.log('response.status', response.status)
        localStorage.setItem('password', password)
        const savedEvents = await response.json()

        const parsedEvents = savedEvents.map(event => {
            return {
                ...event,
                dates: event.dates.map(dateObj => {
                    return {
                        ...dateObj,
                        date: new Date(dateObj.date)
                    };
                })
            };
        });
                
        allEvents.push(...parsedEvents)

        console.log('FETCH allEvents', allEvents)
    }
}
export const initAdmin = async () => {
    
    await getAllEvents() 

    
    // get events
    renderNew()
    bindNew()
    renderEvents()
}