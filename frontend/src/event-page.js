import Toastify from 'toastify-js'

const getEvents = async attendeeID => {
  const response = await fetch(`/api/attendees/${attendeeID}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  if (response.status !== 200) return
  const events = await response.json()
  console.log('FETCH events', events)
  return events
}
const renderDateSlots = (eventEle, event) => {
  eventEle.querySelector('.date-slots').innerHTML = `${event.dates
    .map((date, dateIndex) => {
      const dateDate = new Date(date.date)
      return `<div class="card text-bg-light">
            <div class="card-body row">
                <div class="col">
                    <p class="mb-0">${dateDate.toDateString()}</p>
                </div>
                ${date.slots
                  .map(slot => {
                    console.log('slot', slot.disabled, event.isClosed)
                    const notAvailable =
                      slot.disabled ||
                      (slot.school !== '' && slot.school !== event.school)
                    let time = slot.time
                    let timeMin = '09:00'
                    let timeMax = '11:00'
                    let tMin = 9 * 60 + 30
                    let tMax = 11 * 60 + 30
                    if (slot.slot === 'Afternoon') {
                      // time = '12:00'
                      timeMin = '12:00'
                      timeMax = '14:00'
                      tMin = 13 * 60
                      tMax = 14 * 60 + 20
                    }
                    // if (slot.time) time = slot.time

                    const times = Array.from(
                      { length: (tMax - tMin) / 5 + 1 },
                      (_, i) => {
                        const minutes = tMin + i * 5
                        return new Date(minutes * 60000)
                          .toISOString()
                          .substr(11, 5)
                      }
                    )
                    console.log('times', times, times.includes(slot.time))
                    if (!times.includes(slot.time)) {
                      time = '09:00'
                      if (slot.slot === 'Afternoon') {
                        time = '13:00'
                      }
                    }

                    return `<div class="col">
                            <input type="radio" class="btn-check" name="slot" data-date="${
                              date.date
                            }" data-slot="${slot.slot}"
                                id="${date.date}-${
                      slot.slot
                    }" autocomplete="off" ${
                      notAvailable || event.isClosed ? 'disabled' : ''
                    } ${slot.school === event.school ? 'checked' : ''}>
                            <label class="btn ${
                              notAvailable
                                ? 'btn-outline-secondary'
                                : 'btn-outline-primary'
                            }  w-100" for="${date.date}-${slot.slot}">${
                      slot.slot
                    }</label>
                            
                            <!--<input type="time" class="form-control mt-1 time"
                                min="${timeMin}" max="${timeMax}" step="600" 
                                ${
                                  slot.school === event.school
                                    ? ''
                                    : 'style="display:none;"'
                                }
                                value="${time}" />-->
                            <select class="form-select time" ${
                              slot.school === event.school
                                ? ''
                                : 'style="display:none;"'
                            }${event.isClosed ? ' disabled' : ''}>
                                ${times
                                  .map(t => {
                                    return `<option value="${t}"${
                                      t === time ? ' selected' : ''
                                    }>${t}</option>`
                                  })
                                  .join('')}
                            </select>

                        </div>`
                  })
                  .join('')}

            </div>
        </div>
        ${
          (dateIndex !== event.dates.length - 1 && dateDate.getDay() === 5) ||
          dateDate.getDay() === 7
            ? '<hr class="border border-secondary opacity-100"/>'
            : ''
        }
        `
    })
    .join('')}
    <div class="card text-bg-light">
        <div class="card-body row">
            <div class="col-md-12">
                <button type="submit" class="btn btn-primary w-100">Save date</button>
            </div>
        </div>
    </div>`
}
const renderEvents = events => {
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
            <button class="nav-link event-link mb-2${
              eventIndex === 0 ? ' active' : ''
            } ${
      eventComplete ? 'event-complete' : 'event-incomplete'
    }" data-event="${event.id}">
                <i class="bi ${
                  eventComplete ? '' : 'bi-exclamation-triangle'
                } me-1"></i> ${event.name}
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
    let closingHTML = ''

    if (event.closing && event.closing !== '') {
      const closingDate = new Date(event.closing)
      closingDate.setHours(23)
      closingDate.setMinutes(59)
      console.log(
        'closing dates',
        closingDate,
        new Date(),
        new Date() - closingDate
      )
      console.log('isClosed', closingDate <= new Date())
      if (closingDate <= new Date()) {
        event.isClosed = true
        closingHTML = `<div class="alert alert-danger" role="alert">
                        Selection time for this event is now closed. Contact the phase team directly for changes
                    </div>`
      } else {
        closingHTML = `<div class="alert alert-primary" role="alert">
                        Selection time for this event closes on ${closingDate.toDateString()}
                    </div>`
      }
    }
    eventHTML.push(`
        <div class="event" data-event="${event.id}"${
      eventIndex === 0 ? '' : ' style="display:none;"'
    }>
            <div class="row">
                <div class="col-md-6 offset-md-3">
                    <h1>${event.name}</h1>
                    ${event.intro
                      .split('\n')
                      .map(text => `<p>${text}</p>`)
                      .join('')}
                    <form class="event mb-3">
                        <div class="card text-bg-light mb-3">
                            <div class="card-body row gx-3">
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <select class="form-select" id="attendees" required disabled>
                                            <option selected value="${
                                              event.school
                                            }">${event.school}</option>
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
                                                    <option value="1"${
                                                      event.formSize === 1
                                                        ? ' selected'
                                                        : ''
                                                    }>1</option>
                                                    <option value="2"${
                                                      event.formSize === 2
                                                        ? ' selected'
                                                        : ''
                                                    }>2</option>
                                                    <option value="3"${
                                                      event.formSize === 3
                                                        ? ' selected'
                                                        : ''
                                                    }>3</option>
                                                </select>
                                                <label for="floatingSelect">No. of Classes</label>
                                            </div>
                                        </div>
                                        <div class="col-7">
                                            <div class="form-floating mb-3">
                                                <input type="number" class="form-control" id="class-size" value="${
                                                  event.classSize
                                                }" required>
                                                <label for="size">Total No. of Students</label>
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
                                        <textarea class="form-control" placeholder="Leave a comment here" id="notes" style="height: 132px">${
                                          event.notes
                                        }</textarea>
                                        <label for="notes">Notes</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ${closingHTML}
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
        <div class="navbar bg-dark bg-body-primary border-bottom border-body navbar-expand-lg mb-3 pb-0">
            <div class="container-fluid col-md-6 offset-md-3">
                <span class="navbar-brand mb-0 lead text-white">Select event:</span>
                <div class="collapseX navbar-collapseX">
                    <ul class="navbar-navX nav nav-pills">
                        ${eventTabHTML.join('')}
                    </ul>
                </div>
            </div>
        </div>
    </div>
    ${eventHTML.join('')}`
}
const showHideContactDetails = eventEle => {
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
      break
    case 2:
      eventEle.querySelector('#email2').parentNode.style.display = 'block'
      eventEle.querySelector('#name2').parentNode.style.display = 'block'
      eventEle.querySelector('#email3').parentNode.style.display = 'none'
      eventEle.querySelector('#name3').parentNode.style.display = 'none'
      eventEle.querySelector('#email2').setAttribute('required', 'required')
      eventEle.querySelector('#name2').setAttribute('required', 'required')
      eventEle.querySelector('#email3').removeAttribute('required')
      eventEle.querySelector('#name3').removeAttribute('required')
      break
    case 3:
      eventEle.querySelector('#email2').parentNode.style.display = 'block'
      eventEle.querySelector('#name2').parentNode.style.display = 'block'
      eventEle.querySelector('#email3').parentNode.style.display = 'block'
      eventEle.querySelector('#name3').parentNode.style.display = 'block'
      eventEle.querySelector('#email2').setAttribute('required', 'required')
      eventEle.querySelector('#name2').setAttribute('required', 'required')
      eventEle.querySelector('#email3').setAttribute('required', 'required')
      eventEle.querySelector('#name3').setAttribute('required', 'required')
      break
    default:
      break
  }
}
const bindEvents = (events, defaultEventID) => {
  for (const event of events) {
    const eventEle = document.querySelector(`.event[data-event="${event.id}"]`)
    renderDateSlots(eventEle, event)
    eventEle.querySelectorAll('input[name="slot"]').forEach(input => {
      input.addEventListener('change', e => {
        console.log('e', e)
        eventEle.querySelectorAll('.time').forEach(timeEle => {
          timeEle.style.display = 'none'
        })
        e.target.parentNode.querySelector('.time').style.display = 'block'
      })
    })
    eventEle.querySelector('#attendees').addEventListener('change', e => {
      console.log('e', e.target.value)
      renderDateSlots(eventEle, event)
    })
    showHideContactDetails(eventEle)
    eventEle.querySelector('#form-size').addEventListener('change', () => {
      showHideContactDetails(eventEle)
    })
    eventEle.querySelector('form.event').addEventListener('submit', async e => {
      e.preventDefault()
      const selectedSlot = eventEle.querySelector('input[name="slot"]:checked')
      console.log('selectedSlot', selectedSlot)
      if (selectedSlot === null) {
        Toastify({
          text: 'Please select a date',
          duration: 3000,
          style: {
            background: 'linear-gradient(to right, #ff1212, #ff5656)'
          }
        }).showToast()
        return
      }

      const eventLinkEle = document.querySelector(
        `.event-link[data-event="${event.id}"]`
      )
      eventLinkEle.classList.remove('event-incomplete')
      eventLinkEle.classList.add('event-complete')
      eventLinkEle.innerHTML = event.name
      const formSize = parseInt(eventEle.querySelector('#form-size').value)
      const teachers = [
        {
          name: eventEle.querySelector('#name1').value,
          email: eventEle.querySelector('#email1').value
        }
      ]
      if (formSize > 1)
        teachers.push({
          name: eventEle.querySelector('#name2').value,
          email: eventEle.querySelector('#email2').value
        })
      if (formSize > 2)
        teachers.push({
          name: eventEle.querySelector('#name3').value,
          email: eventEle.querySelector('#email3').value
        })

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
      console.log('update', update)
      const response = await fetch(
        `/api/events/${event.id}/${btoa(
          eventEle.querySelector('#attendees').value
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update)
        }
      )
      if (response.status !== 200) return
      const saveRes = await response.json()
      console.log('SAVE saveRes', saveRes)

      const confirmToast = Toastify({
        text: `<span class="">
                    <i class="bi bi-check-circle-fill"></i>
                    Confirmed for ${new Date(update.date).toDateString()} - ${
          update.slot
        } - ${update.time}
                    <sup><i class="bi bi-x"></i></sup>
                    </span>`,
        duration: -1,
        position: 'center',
        gravity: 'bottom',
        style: {
          background: 'linear-gradient(to right, #0d6efd, #0dcaf0)',
          'font-size': '30px'
        },
        offset: {
          y: 150
        },
        escapeMarkup: false,
        onClick: function (ele) {
          // console.log('onClick', ele, this, confirmToast)
          confirmToast.hideToast()
        }
      })
      confirmToast.showToast()
    })
  }
  document.querySelectorAll('.event-link').forEach(link => {
    link.addEventListener('click', e => {
      const eventID = e.currentTarget.getAttribute('data-event')
      console.log('e', e.currentTarget.getAttribute('data-event'))
      document.querySelectorAll('.event[data-event]').forEach(eventEle => {
        console.log('eventEle', eventEle)
        if (eventID === eventEle.getAttribute('data-event')) {
          // console.log('show', eventID)
          eventEle.style.display = 'block'
        } else {
          // console.log('hide', eventID)
          eventEle.style.display = 'none'
        }
      })
      document.querySelectorAll('.event-link').forEach(linkEle => {
        // console.log('linkEle', linkEle)
        if (eventID === linkEle.getAttribute('data-event')) {
          // console.log('show', eventID)
          linkEle.classList.add('active')
        } else {
          // console.log('hide', eventID)
          linkEle.classList.remove('active')
        }
      })
    })
  })
  const defaultEventLink = document.querySelector(
    `.event-link[data-event="${defaultEventID}"]`
  )
  console.log('defaultEventLink', defaultEventLink)
  if (defaultEventLink) defaultEventLink.click()
}
export const initEvent = async (defaultEventID, attendeeID) => {
  console.log('initEvent', attendeeID)
  const events = await getEvents(attendeeID)
  if (events === undefined) {
    document.querySelector('.content').innerHTML = 'Please select a valid event'
    return
  }
  renderEvents(events)
  bindEvents(events, defaultEventID)
}
