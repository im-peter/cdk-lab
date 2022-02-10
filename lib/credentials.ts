require('dotenv').config()

interface Credentials {
    id: string;
    secret: string;
    region: string;
}

export default () : Credentials => {
    const {AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION} = process.env

    if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_REGION ) {
        return {id: AWS_ACCESS_KEY_ID, secret: AWS_SECRET_ACCESS_KEY, region: AWS_REGION}
    }

    throw 'missing required aws credentials'
}