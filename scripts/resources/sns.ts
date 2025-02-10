import { SNSClient, DeleteTopicCommand } from "@aws-sdk/client-sns";

export async function deleteSnsTopic(topicArn: string) {
  const client = new SNSClient();

  try {
    const deleteCommand = new DeleteTopicCommand({
      TopicArn: topicArn,
    });
    await client.send(deleteCommand);
    console.log(`Deleted SNS topic: ${topicArn}`);
  } catch (error) {
    console.error(`Error deleting SNS topic ${topicArn}:`, error);
    throw error;
  }
}
