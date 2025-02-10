import { EC2Client, DeleteSecurityGroupCommand } from "@aws-sdk/client-ec2";

export async function deleteSecurityGroup(securityGroupArn: string) {
  const client = new EC2Client();
  const groupId = securityGroupArn.split("/").pop();
  try {
    const deleteCommand = new DeleteSecurityGroupCommand({
      GroupId: groupId,
    });
    await client.send(deleteCommand);
    console.log(`Deleted EC2 security group: ${groupId}`);
  } catch (error) {
    console.error(`Error deleting EC2 security group ${groupId}:`, error);
    throw error;
  }
}
