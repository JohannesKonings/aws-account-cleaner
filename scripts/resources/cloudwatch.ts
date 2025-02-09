import {
  CloudWatchClient,
  DeleteAlarmsCommand,
} from "@aws-sdk/client-cloudwatch";

export async function deleteCloudWatchAlarm(alarmName: string) {
  const client = new CloudWatchClient();
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
