import { AthenaClient, DeleteWorkGroupCommand } from "@aws-sdk/client-athena";

export async function deleteWorkGroup(workGroupArn: string) {
  const client = new AthenaClient();
  const workGroupName = workGroupArn.split("/").pop();
  try {
    const deleteCommand = new DeleteWorkGroupCommand({
      WorkGroup: workGroupName,
    });
    await client.send(deleteCommand);
    console.log(`Deleted workgroup: ${workGroupArn}`);
  } catch (error) {
    console.error(`Error deleting workgroup ${workGroupArn}:`, error);
    throw error;
  }
}
