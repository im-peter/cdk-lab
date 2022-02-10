import {S3} from 'aws-sdk'
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Context
} from 'aws-lambda'

const s3 = new S3()


exports.main = async function(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    try {
        var method = event.httpMethod

        if (method === "GET") {
            if (event.path === "/") {
                const data = await s3.listBuckets().promise()
                var body = {
                    message : '',
                    buckets: data.Buckets || [],
                    context: context,
                    event: event
                }
                return {
                    statusCode: 200,
                    headers: {},
                    body: JSON.stringify(body),
                }
            }
        }

        // We only accept GET for now
        return {
            statusCode: 400,
            headers: {},
            body: JSON.stringify({
                message: "We only accept GET /",
                buckets: [],
                event: event
            })
        }
    } catch (error) {
        var message = JSON.stringify(error, null, 2)
        return {
            statusCode: 400,
            headers: {},
            body: JSON.stringify({message, buckets: []})
        }
    }
}