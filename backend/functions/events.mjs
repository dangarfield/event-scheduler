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
    const eventID = req.path.split('/').pop()
    if (req.httpMethod === 'GET') {
      console.log('get all events')
      const eventsCollection = await getEventsCollection()
      let event = await eventsCollection.findOne({_id:eventID})
      console.log('event', event)
      if(event === null) {
        return {
            statusCode: 400,
            body: JSON.stringify(event)
        }
      } else {
        event.id = event._id
        delete event._id
        // TODO clean up, eg remove emails
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
          }
          if (date.date === slotData.date && slot.slot === slotData.slot) {
            slot.attendee = slotData.attendee
            slot.email = slotData.email
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