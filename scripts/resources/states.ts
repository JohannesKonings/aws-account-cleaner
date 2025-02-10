import { SFNClient, DeleteStateMachineCommand } from "@aws-sdk/client-sfn";
import { AthenaClient, DeleteWorkGroupCommand } from "@aws-sdk/client-athena";

export async function deleteStateMachine(stateMachineArn: string) {
  const client = new SFNClient();

  try {
    const deleteCommand = new DeleteStateMachineCommand({
      stateMachineArn,
    });
    await client.send(deleteCommand);
    console.log(`Deleted state machine: ${stateMachineArn}`);
  } catch (error) {
    console.error(`Error deleting state machine ${stateMachineArn}:`, error);
    throw error;
  }
}

export async function deleteWorkGroup(workGroupName: string) {
  const client = new AthenaClient();

  try {
    const deleteCommand = new DeleteWorkGroupCommand({
      WorkGroup: workGroupName,
    });
    await client.send(deleteCommand);
    console.log(`Deleted workgroup: ${workGroupName}`);
  } catch (error) {
    console.error(`Error deleting workgroup ${workGroupName}:`, error);
    throw error;
  }
}
