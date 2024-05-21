import amqp, { Channel, Connection } from 'amqplib';
import config from '../config/config';
import { User } from '../database';
import { ApiError } from '../utils';

class RabbitMQService {
    private requestQueue = "USER_DETAILS_REQUEST";
    private responseQueue = "USER_DETAILS_RESPONSE";
    private connection!: Connection;
    private channel!: Channel;

    constructor(){
        this.init();
    }

    async init(){
        //establish connection to RabbitMQ server 
        this.connection = await amqp.connect(config.msgBrokerURL!);
        this.channel = await this.connection.createChannel();

        //asseting queues ensures they exist
        await this.channel.assertQueue(this.requestQueue);
        await this.channel.assertQueue(this.responseQueue);

        //start listening for messages on the request queue
        this.listenForRequest();
    }

    private async listenForRequest(){
        this.channel.consume(this.requestQueue, async (msg) => {
            if(msg && msg.content){
                const { userId } = JSON.parse(msg.content.toString());
                const userDetails = await getUserDetails(userId);

                //send the user details response
                this.channel.sendToQueue(
                    this.responseQueue,
                    Buffer.from(JSON.stringify(userDetails)),
                    { correlationId: msg.properties.correlationId }
                );

                //acknowledge the processed message
                this.channel.ack(msg);
            }
        })
    }
}

const getUserDetails = async (userId: string) => {
    const userDetails = await User.findById(userId).select("-password");
    if(!userDetails){
        throw new ApiError(400, "User not found");
    }

    return userDetails;
}

export const rabbitMQService = new RabbitMQService();