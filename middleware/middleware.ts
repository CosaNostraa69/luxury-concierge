import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    // Vos règles de redirection personnalisées ici
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (
          req.nextUrl.pathname.startsWith("/protected") &&
          token === null
        ) {
          return false;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // Pages qui nécessitent une authentification
    "/dashboard/:path*",
    "/protected/:path*",
  ],
};