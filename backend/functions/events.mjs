import { MongoClient } from 'mongodb'

let db

const getConnection = async () => {
    if (db) return db
    const client = new MongoClient(process.env.MONGODB_URI)
    db = await client.connect()
    return db
}

const getEventsCollection = async () => {
  const connection = await getConnection()
  const database = connection.db('events')
  const collection = database.collection('events')
  return collection
}


export async function handler(req, context) {
  // console.log('req', req)
  

  try {
    const pathSplit = req.path.split('/')
    console.log('pathSplit', pathSplit)
    if (pathSplit.length !== 5) {
      return {
        statusCode: 400,
        body: JSON.stringify({error:'Bad request'})
      }
    }
    
    const eventID = pathSplit[3]
    let attendeeID = ''
    try {
      attendeeID = atob(pathSplit[4])
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({error:'Bad request'})
      }
    }
    
    console.log('EVENT request', eventID, attendeeID)
    if (req.httpMethod === 'GET') {
      console.log('get event')
      const eventsCollection = await getEventsCollection()
      let event = await eventsCollection.findOne({_id:eventID})
      // console.log('event', event)
      if(event === null) {
        return {
            statusCode: 400,
            body: JSON.stringify({error:'Bad request'})
        }
      } else if (!event.attendees.includes(attendeeID)) {
        return {
          statusCode: 400,
          body: JSON.stringify({error:'Unknown attendee'})
      }
      } else {
        event.id = event._id
        delete event._id
        delete event.attendees

        event.attendee = attendeeID
        event.email = ''
        event.size = 10
        event.notes = ''
        
        // clean up, eg remove emails
        for (const date of event.dates) {
          for (const slot of date.slots) {
            console.log('slot', slot)
            if (slot.attendee !== attendeeID && slot.attendee !== '') {
              slot.attendee = ''
              slot.email = ''
              slot.size = 10
              slot.notes = ''
              slot.disabled = true
            } else if (slot.attendee === attendeeID) {
              event.email = slot.email || ''
              event.size = slot.size || 10
              event.notes = slot.notes || ''
            }
          }
        }
        console.log('event', event)
        return {
          statusCode: 200,
          body: JSON.stringify(event)
        }
      }
    } else if (req.httpMethod === 'POST') {
      const eventsCollection = await getEventsCollection()
      const slotData = JSON.parse(req.body)
      // event._id = event.id
      // delete event.id
      console.log('POST update', eventID, slotData)
      const event = await eventsCollection.findOne({_id: eventID})

      console.log('event', JSON.stringify(event))
      for (const date of event.dates) {
        for (const slot of date.slots) {
          console.log('slot: ', date.date, slot.slot, slot.attendee)
          if (slot.attendee === slotData.attendee) {
            slot.attendee = ''
            slot.email = ''
            delete slot.size
            delete slot.notes
          }
          if (date.date === slotData.date && slot.slot === slotData.slot) {
            slot.attendee = slotData.attendee
            slot.email = slotData.email
            slot.size = slotData.size
            slot.notes = slotData.notes
          }
        }
      }
      console.log('event AFTER', JSON.stringify(event))

      await eventsCollection.updateOne({ _id: event._id }, { $set: event });

      // await eventsCollection.insertOne({ data: body })
      // return Response.json({
      //   message: 'Hello POST'
      // })
      return {
            statusCode: 200,
            body: JSON.stringify({message: 'Update POST'})
        }
    
    } else {
      // return Response.json({
      //   message: 'error'
      // })
      return {
            statusCode: 500,
            body: 'Error'
        }

    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  // } finally {
  //       // Ensures that the client will close when you finish/error
  //       console.log('You are no longer connected to MongoDB')
  //       await client.close();
    }

}