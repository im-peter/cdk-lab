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

            await db.put({
                TableName: 'cdk-dynamo-test',
                Item: {
                    info: 'Does this get through to the other side?'
                }
            }).promise()

            return {
                statusCode: 200,
                headers: {},
                body: JSON.stringify({
                    message : 'Working fine!',
                    context: context,
                    event: event
                }),
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
        const message = JSON.stringify(error, null, 2)
        return {
            statusCode: 400,
            headers: {},
            body: JSON.stringify({
                message,
            })
        }
    }
}