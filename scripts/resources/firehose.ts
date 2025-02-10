import {
  FirehoseClient,
  DeleteDeliveryStreamCommand,
} from "@aws-sdk/client-firehose";

export async function deleteFirehoseDeliveryStream(resourceArn: string) {
  const client = new FirehoseClient();
  const deliveryStreamName = resourceArn.split("/")[1];

  const command = new DeleteDeliveryStreamCommand({
    DeliveryStreamName: deliveryStreamName,
    AllowForceDelete: true,
  });

  try {
    await client.send(command);
    console.log(`Deleted Firehose delivery stream: ${deliveryStreamName}`);
  } catch (error) {
    console.error(
      `Error deleting Firehose delivery stream ${deliveryStreamName}:`,
      error
    );
    throw error;
  }
}
