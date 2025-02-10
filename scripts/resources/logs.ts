import {
  CloudWatchLogsClient,
  DeleteLogGroupCommand,
} from "@aws-sdk/client-cloudwatch-logs";

export async function deleteLogGroup(logGroupArn: string) {
  const client = new CloudWatchLogsClient();
  const logGroupName = logGroupArn.split(":").pop();
  if (!logGroupName) {
    throw new Error(`Invalid log group ARN: ${logGroupArn}`);
  }
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
