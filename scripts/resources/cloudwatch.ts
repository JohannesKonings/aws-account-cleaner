import {
  CloudWatchClient,
  DeleteAlarmsCommand,
} from "@aws-sdk/client-cloudwatch";

export async function deleteCloudWatchAlarm(alarmArn: string) {
  const client = new CloudWatchClient();
  const alarmName = alarmArn.split(":").pop();
  if (!alarmName) {
    throw new Error(`Invalid alarm ARN: ${alarmArn}`);
  }
  const command = new DeleteAlarmsCommand({
    AlarmNames: [alarmName],
  });

  try {
    await client.send(command);
    console.log(`Deleted CloudWatch alarm: ${alarmName}`);
  } catch (error) {
    console.error(`Error deleting CloudWatch alarm ${alarmName}:`, error);
    throw error;
  }
}
