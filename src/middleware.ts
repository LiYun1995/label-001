export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/polls/create", "/polls/:id/vote"],
};
