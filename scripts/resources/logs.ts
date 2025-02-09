import {
  CloudWatchLogsClient,
  DeleteLogGroupCommand,
} from "@aws-sdk/client-cloudwatch-logs";

export async function deleteLogGroup(logGroupName: string) {
  const client = new CloudWatchLogsClient();
  const command = new DeleteLogGroupCommand({
    logGroupName,
  });

  try {
    await client.send(command);
    console.log(`Deleted log group: ${logGroupName}`);
  } catch (error) {
    console.error(`Error deleting log group ${logGroupName}:`, error);
    throw error;
  }
}
