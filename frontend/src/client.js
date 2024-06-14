import {initAdmin} from './admin.js'
import {initEvent} from './event-page.js'

const initRouting = async () => {
    const eventPath = window.location.pathname
    console.log('initRouting', eventPath)
    if (eventPath === '/') {
        document.querySelector('.content').innerHTML = 'Please select a valid event'
    } else if(eventPath === '/admin') {
        initAdmin()
    } else {
        // Get event data
        initEvent(eventPath.substring(1))
        // if event data is empty
        // document.querySelector('.content').innerHTML = 'Please select a valid event'

        // else load event page
    }
}



initRouting()