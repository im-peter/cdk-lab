import {DynamoDB} from 'aws-sdk'
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Context
} from 'aws-lambda'

const db = new DynamoDB.DocumentClient()


exports.main = async function(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    try {
        const method = event.httpMethod
        // const path = event.path

        if (method === "GET") {

            const result = await db.put({
                TableName: 'cdk-dynamo-test',
                Item: {
                    id: context.awsRequestId,
                    info: 'Does this get through to the other side?'
                }
            }).promise()

            return {
                statusCode: 200,
                headers: {},
                body: JSON.stringify({
                    message : 'Working fine!',
                    context: context,
                    event: event,
                    result: result
                })
            }
        }

        // We only accept GET for now
        return {
            statusCode: 400,
            headers: {},
            body: JSON.stringify({
                message: "We only accept GET /",
                event: event
            })
        }
    } catch (error) {
        return {
            statusCode: 400,
            headers: {},
            body: JSON.stringify({
                message: error,
                event: event
            })
        }
    }
}