// server component
import { prisma } from "@/lib/prisma";

export default async function UserPage({
  params,
}: {
  params: { user: string };
}) {
  const userID = params.user;

  const user = await prisma.user.findUnique({
    where: {
      id: userID,
    },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user.email}</p>
      <p>{user.phoneNumber}</p>
      <p>{user.phoneNumberVerified}</p>
      <p>{user.email}</p>
      <p>{user.emailVerified}</p>
      <p>{user.messageLanguage}</p>
    </div>
  );
}
