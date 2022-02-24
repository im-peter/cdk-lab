import {
    EventBridgeEvent,
    Context
} from 'aws-lambda'

exports.main = async function(event: EventBridgeEvent<any, any>, context: Context) : Promise<any> {
    const body = JSON.stringify({
        Title : 'Event from ',
        context: context,
        event: event
    }, null, 4)

    console.info(body)

    return {
        statusCode: 200,
        headers: {},
        body: body
    }
}