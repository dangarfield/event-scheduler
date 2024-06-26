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
        const pathSplit = eventPath.split('/')
        console.log('pathSplit', pathSplit)
        if(pathSplit.length !== 3) {
            document.querySelector('.content').innerHTML = 'Please select a valid event'
            return
        }
        // Get school data
        initEvent(pathSplit[1],pathSplit[2])
        // if event data is empty
        // document.querySelector('.content').innerHTML = 'Please select a valid event'

        // else load event page
    }
}



initRouting()