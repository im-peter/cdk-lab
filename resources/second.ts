import {EventBridge} from 'aws-sdk'
import {
    DynamoDBStreamEvent,
    Context
} from 'aws-lambda'

const client = new EventBridge({
    region: 'eu-west-1',
})

exports.main = async function(event: DynamoDBStreamEvent, context: Context): Promise<any> {
    const result = await client.putEvents({
        Entries: [
            {
                Source: 'dynamodb.stream.lambda',
                EventBusName: 'cdk-eventbridge-test',
                DetailType: 'transaction',
                Time: new Date(),

                Detail: JSON.stringify({
                    Account: '034366512379',
                    event,
                    context
                })
            }
        ]
    }).promise()

    const body = {
        Title: 'Event from Dynamo-stream',
        context: context,
        event: event,
        eventBridgeResult: result
    }

    console.info(body)

    return {
        statusCode: 200,
        headers: {},
        body: body
    }
}