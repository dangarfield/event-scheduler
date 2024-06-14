import { MongoClient } from 'mongodb'

// console.log('process.env.MONGODB_URI', process.env.MONGODB_URI)

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
    const { headers } = req
    const authHeader = headers['authorization']
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Missing or invalid Authorization header' }),
        }
    }
    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    // console.log('headerCredentials', credentials, process.env.PASSWORD)
    const isValid = credentials.toLowerCase() === process.env.PASSWORD.toLowerCase()
    if (!isValid) {
      return {
          statusCode: 401,
          body: JSON.stringify({ message: 'Invalid username or password' }),
      }
    }

    if (req.httpMethod === 'GET') {
      console.log('get all events')
      const eventsCollection = await getEventsCollection()
      let allEvents = await eventsCollection.find().toArray()
      console.log('allEvents', allEvents)
      allEvents.forEach(event => {
        event.id = event._id
        delete event._id
      })
      return {
            statusCode: 200,
            body: JSON.stringify(allEvents)
        }
    } else if (req.httpMethod === 'POST') {
      const eventsCollection = await getEventsCollection()
      const event = JSON.parse(req.body)
      event._id = event.id
      delete event.id
      console.log('event', event)
      await eventsCollection.updateOne({ _id: event._id }, { $set: event }, { upsert: true });

      // await eventsCollection.insertOne({ data: body })
      // return Response.json({
      //   message: 'Hello POST'
      // })
      return {
            statusCode: 200,
            body: JSON.stringify({message: 'Hello POST'})
        }
    } else if (req.httpMethod === 'DELETE') {
      const eventsCollection = await getEventsCollection()
      const event = JSON.parse(req.body)
      await eventsCollection.deleteOne({_id:event.id})
      return {
            statusCode: 200,
            body: JSON.stringify({message: 'Complete'})
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