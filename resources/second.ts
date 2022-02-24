import {EventBridge} from 'aws-sdk'
import {
    DynamoDBStreamEvent,
    Context
} from 'aws-lambda'

const client = new EventBridge({
    region: 'eu-west-1',
})

exports.main = async function(event: DynamoDBStreamEvent, context: Context) : Promise<any> {
    const result = await client.putEvents({
        Entries: [ 
            {
              Source: 'dynamodb.stream.lambda',
              EventBusName: 'cdk-eventbridge-test',
              DetailType: 'transaction',
              Time: new Date(),

              Detail: JSON.stringify({
                event,
                context
              })
            }
        ]
    }).promise()

    const body = JSON.stringify({
        Title : 'Event from Dynamo-stream',
        context: context,
        event: event,
        eventBridgeResult: result
    }, null, 4)

    console.info(body)

    return {
        statusCode: 200,
        headers: {},
        body: body
    }
}