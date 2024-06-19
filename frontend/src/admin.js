import * as FileSaver from "file-saver"
import * as XLSX from "xlsx"
import Toastify from 'toastify-js'

const allEvents = []

const getEventDataFromTable = (eventEle) => {
    const slots = Array.from(eventEle.querySelectorAll('.data-slot')).map(slotEle => {
        const formSize = parseInt(slotEle.querySelector('.form-size').value)
        
        const teachers = []
        const name1 = slotEle.querySelector('.name1').value
        const email1 = slotEle.querySelector('.email1').value
        const name2 = slotEle.querySelector('.name2').value
        const email2 = slotEle.querySelector('.email2').value
        const name3 = slotEle.querySelector('.name3').value
        const email3 = slotEle.querySelector('.email3').value
        if (name1 !== '' && email1 !== '') teachers.push({name:name1,email:email1})
        if (formSize >= 2 && name2 !== '' && email2 !== '') teachers.push({name:name2,email:email2})
        if (formSize >= 3 && name3 !== '' && email3 !== '') teachers.push({name:name3,email:email3})
        
        return {
            date: new Date(slotEle.getAttribute('data-date')),
            slot: slotEle.querySelector('.slot').value,
            time: slotEle.querySelector('.time').value,
            school: slotEle.querySelector('.school').value,
            formSize,
            classSize: parseInt(slotEle.querySelector('.class-size').value) || '',
            teachers,
            notes: slotEle.querySelector('.notes').value,
            disabled: slotEle.querySelector('.form-check-input').checked
        }
    })
    const dates = []
    for (const slot of slots) {
        if (!dates.some(e => e.date.getTime() === slot.date.getTime())) {
            dates.push({date:slot.date,slots:[]})
        }
        const date = dates.find(e => e.date.getTime() === slot.date.getTime())
        delete slot.date
        date.slots.push(slot)
    }

    const event = {
        id: eventEle.querySelector('#event').value,
        name: eventEle.querySelector('#name').value,
        intro: eventEle.querySelector('#intro').value,
        attendees: eventEle.querySelector('#attendees').value.split('\n'),
        dates
    }
    return event
}
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
                    <div class="col">
                        <table class="table table-striped table-borderless">
                            <thead>
                                <tr>
                                    <th scope="col">Date</th>
                                    <th scope="col" style="width:8%">Slot</th>
                                    <th scope="col">Time</th>
                                    <th scope="col">School</th>
                                    <th scope="col" style="width:5%">Form Size</th>
                                    <th scope="col" style="width:5%">Class Size</th>
                                    <th scope="col">Teacher Name</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Notes</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                            ${event.dates.map((date) => {
                                return date.slots.map((slot,slotIndex) => {
                                    let name1 = ''
                                    let email1 = ''
                                    let name2 = ''
                                    let email2 = ''
                                    let name3 = ''
                                    let email3 = ''
                                    if (slot.teachers.length > 0) {
                                        name1 = slot.teachers[0].name
                                        email1 = slot.teachers[0].email
                                    }
                                    if (slot.teachers.length > 1) {
                                        name2 = slot.teachers[1].name
                                        email2 = slot.teachers[1].email
                                    }
                                    if (slot.teachers.length > 2) {
                                        name3 = slot.teachers[2].name
                                        email3 = slot.teachers[2].email
                                    }
                                    if (!slot.formSize) slot.formSize = 1
                                    console.log('formSize', slot.formSize)
                                    return `<tr class="data-slot${slot.school!==''?' table-success':''}" data-date="${date.date.toISOString()}">
                                        <th scope="row">${slotIndex === 0?date.date.toDateString():''}</th>
                                        <td><input type="text" class="form-control form-control-sm w-100 slot" value="${slot.slot}"></td>
                                        <td><input type="time" class="form-control form-control-sm w-100 time" value="${slot.time}"></td>
                                        <td><input type="text" class="form-control form-control-sm w-100 school" value="${slot.school}"></td>
                                        <td>
                                            <select class="form-select form-select-sm form-size">
                                                <option value="1"${slot.formSize === 1 ?' selected':''}>1</option>
                                                <option value="2"${slot.formSize === 2 ?' selected':''}>2</option>
                                                <option value="3"${slot.formSize === 3 ?' selected':''}>3</option>
                                            </select>
                                        </td>
                                        <td><input type="number" class="form-control form-control-sm w-100 class-size" value="${slot.classSize}"></td>
                                        <td>
                                            <input type="text" class="form-control form-control-sm w-100 name1" value="${name1}">
                                            <input type="text" class="form-control form-control-sm w-100 name2" value="${name2}"${slot.formSize >= 2 ? '':'style="display:none"'}>
                                            <input type="text" class="form-control form-control-sm w-100 name3" value="${name3}"${slot.formSize >= 3 ? '':'style="display:none"'}>
                                        </td>
                                        <td>
                                            <input type="email" class="form-control form-control-sm w-100 email1" value="${email1}">
                                            <input type="email" class="form-control form-control-sm w-100 email2" value="${email2}"${slot.formSize >= 2 ? '':'style="display:none"'}>
                                            <input type="email" class="form-control form-control-sm w-100 email3" value="${email3}"${slot.formSize >= 3 ? '':'style="display:none"'}>
                                        </td>
                                        <td><textarea class="form-control form-control-sm w-100 notes" rows="1">${slot.notes}</textarea></td>
                                        <td>
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" role="switch" id="${event.id}-${date.date.getTime()}-${slot.slot}-disable"${slot.disabled?' checked':''}>
                                                <label class="form-check-label" for="${event.id}-${date.date.getTime()}-${slot.slot}-disable">Disable slot</label>
                                            </div>
                                        </td>
                                    </tr>`
                                }).join('')
                            }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="text-end">
                    <button type="button" class="btn btn-danger delete">Delete</button>
                    <button type="button" class="btn btn-secondary save-to-excel">Save to excel</button>
                    <button type="submit" class="btn btn-primary">Update event</button>
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
            const event = getEventDataFromTable(eventEle)
            saveEvent(event)
            
            console.log('UPDATE event', event)
        })
        eventEle.querySelector('.save-to-excel').addEventListener('click', () => {
            console.log('save to excel', eventID)
            const excelData = [
                ['Date','Slot','Time','School','Form Size','Class Size','Teacher Name','Teacher Email','Notes','Disabled']
            ]
            const event = getEventDataFromTable(eventEle)
            for (const date of event.dates) {
                for (let [slotIndex, slot] of date.slots.entries()) {
                    const name = slot.teachers.length>0? slot.teachers[0].name:''
                    const email = slot.teachers.length>0? slot.teachers[0].email:''
                    const line = [
                        slotIndex===0?date.date.toDateString():'', // Only show on first slot
                        slot.slot,
                        slot.time,
                        slot.school,
                        slot.formSize,
                        slot.classSize,
                        name,
                        email,
                        slot.notes,
                        slot.disabled?'Disabled':''
                    ]
                    excelData.push(line)
                    if (slot.teachers.length>=2) {
                        excelData.push(['','','','','','',slot.teachers[1].name,slot.teachers[1].email,'',''])
                    }
                    if (slot.teachers.length>=3) {
                        excelData.push(['','','','','','',slot.teachers[2].name,slot.teachers[2].email,'',''])
                    }
                }
            }

            console.log('excelData',event, excelData)
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
        eventEle.querySelectorAll('.form-size').forEach((formSizeEle) => {
            formSizeEle.addEventListener('change', (eformSizeEleChange) => {
                const formSize = parseInt(eformSizeEleChange.target.value)
                switch (formSize) {
                    case 1:
                        eformSizeEleChange.target.parentNode.parentNode.querySelector('.name2').style.display = 'none'
                        eformSizeEleChange.target.parentNode.parentNode.querySelector('.email2').style.display = 'none'
                        eformSizeEleChange.target.parentNode.parentNode.querySelector('.name3').style.display = 'none'
                        eformSizeEleChange.target.parentNode.parentNode.querySelector('.email3').style.display = 'none'
                        break;
                    case 2:
                        eformSizeEleChange.target.parentNode.parentNode.querySelector('.name2').style.display = 'block'
                        eformSizeEleChange.target.parentNode.parentNode.querySelector('.email2').style.display = 'block'
                        eformSizeEleChange.target.parentNode.parentNode.querySelector('.name3').style.display = 'none'
                        eformSizeEleChange.target.parentNode.parentNode.querySelector('.email3').style.display = 'none'
                        break;
                    case 3:
                        eformSizeEleChange.target.parentNode.parentNode.querySelector('.name2').style.display = 'block'
                        eformSizeEleChange.target.parentNode.parentNode.querySelector('.email2').style.display = 'block'
                        eformSizeEleChange.target.parentNode.parentNode.querySelector('.name3').style.display = 'block'
                        eformSizeEleChange.target.parentNode.parentNode.querySelector('.email3').style.display = 'block'
                        break;
                
                    default:
                        break;
                }
                // eformSizeEleChange.target.parentNode.parentNode.querySelector('.name2')
                console.log(';asdsad')
            })
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
            <h1>Attendee Scheduler Admin</h1>
            <p class="lead">This site allows you to configure an event, send links to your attendees, allowing them to choose a selection, the you can export to Excel</p>
            
            <div class="accordion instructions mb-3">
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                            Instructions (click to expand)
                        </button>
                    </h2>
                    <div id="collapseOne" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
                        <div class="accordion-body">
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
                        </div>
                    </div>
                </div>
            </div>

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
        console.log('dateList', dateList)
        return dateList
    }
    const addSlots = (dates, slotType) => {
        return dates.map(date => {
            const slots = []
            if (slotType === 'morningafternoon') {
                slots.push({slot: 'Morning', time:'', school:'', formSize:'', classSize:'', teachers:[], notes:''})
                slots.push({slot: 'Afternoon', time:'', school:'', formSize:'', classSize:'', teachers:[], notes:''})
            } else {
                slots.push({slot: 'Day', time:'', school:'', formSize:'', classSize:'', teachers:[], notes:''})
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
        allEvents.push(event)
        await saveEvent(event)
        renderEvents()
    })

    document.querySelector('.instructions .accordion-button').addEventListener('click', () => {
        console.log('asdsad')
        document.querySelector('.instructions .accordion-button').classList.toggle('collapsed')
        document.querySelector('.instructions .accordion-collapse').classList.toggle('collapse')
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