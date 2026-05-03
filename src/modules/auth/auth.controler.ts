import { Request, Response } from "express";

import { authService } from "./auth.service";

import status from "http-status";
import { tokenUtils } from "../../utilis/token";
import AppError from "../../errorHelpers/AppError";


import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponsr";
import { envVars } from "../../config/env";
import { auth } from "../../lib/auth";
import { CookieUtils } from "../../utilis/cookie";

const getBetterAuthSessionToken = (req: Request) =>
  req.cookies["better-auth.session_token"] ??
  req.cookies["__Secure-better-auth.session_token"];

const registeredUser = catchAsync(
    async(req:Request, res:Response)=>{
        const payload = req.body
        console.log(payload);
        const result = await authService.registerClient(payload)
        sendResponse(res, {
            httpStatusCode:status.CREATED,
            success:true,
            message:"user registered successfully",
            data:result
        })
    }
)


const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  // 1) Call service
  const result = await authService.loginUser(payload);

  const {
    accessToken,
    refreshToken,
    token,        // BetterAuth session token
    user,         // MUST be included
    ...rest       // role, emailVerified, needPasswordChange, redirect, etc.
  } = result;

  // 2) Set your own JWT cookies
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);

  // 3) Set BetterAuth session cookie
  tokenUtils.setBetterAuthSessionCookie(res, token);

  // 4) Send response EXACTLY how frontend expects it
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "login successfully",
    data: {
      accessToken,
      refreshToken,
      token,
      user,     // REQUIRED
      ...rest,  // role, emailVerified, needPasswordChange, redirect
    },
  });
});

const clientDemoLogin = catchAsync(async (_req: Request, res: Response) => {
  const result = await authService.loginDemoClient();

  const {
    accessToken,
    refreshToken,
    token,
    user,
    ...rest
  } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "demo login successfully",
    data: {
      accessToken,
      refreshToken,
      token,
      user,
      ...rest,
    },
  });
});

const expertDemoLogin = catchAsync(async (_req: Request, res: Response) => {
  const result = await authService.loginDemoExpert();
  const { accessToken, refreshToken, token, user, ...rest } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "expert demo login successfully",
    data: { accessToken, refreshToken, token, user, ...rest },
  });
});

const adminDemoLogin = catchAsync(async (_req: Request, res: Response) => {
  const result = await authService.loginDemoAdmin();
  const { accessToken, refreshToken, token, user, ...rest } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "admin demo login successfully",
    data: { accessToken, refreshToken, token, user, ...rest },
  });
});


// get me
const getMe = catchAsync(
    async(req:Request, res:Response)=>{
        const user = req.user;
        const result = await authService.getMe(user)
       
      sendResponse(res, {
        httpStatusCode:status.OK,
        success:true,
        message:"user profile fetched successfully",
        data: result
      })
    }
)


//get new token
const getNewToken = catchAsync(async(req:Request, res:Response)=>{
    const refreshToken = req.cookies.refreshToken
    const betterAuthSessionToken = getBetterAuthSessionToken(req)

    if(!refreshToken){
        throw new AppError(status.UNAUTHORIZED, "refresh token is missing")
    }
    const results = await authService.getNewToken(refreshToken, betterAuthSessionToken)
    const {accessToken, refreshToken:newRefreshToken, sessionToken} = results

    tokenUtils.setAccessTokenCookie(res, accessToken)
    tokenUtils.setRefreshTokenCookie (res, newRefreshToken)
    if (sessionToken) {
      tokenUtils.setBetterAuthSessionCookie(res, sessionToken)
    }

    sendResponse(res,{
        httpStatusCode:status.OK,
        success:true,
        message:"new tokens successfully",
        data:{
            accessToken,
            refreshToken:newRefreshToken,
            sessionToken,

        }
    })
})




//change password
// const changePassword = catchAsync(async(req:Request, res:Response)=> {
//     const payload = req.body
//     const betterAuthSessionToken = req.cookies["better-auth.session_token"]
//     const result = await authService.changePassword(payload, betterAuthSessionToken)
//     const {accessToken, refreshToken, token} = result

//       tokenUtils.setAccessTokenCookie(res, accessToken)
//     tokenUtils.setRefreshTokenCookie (res, refreshToken)
//     tokenUtils.setBetterAuthSessionCookie(res, token as string)

//   sendResponse(res,{
//         httpStatusCode:status.OK,
//         success:true,
//         message:"password changed successfully",
//         data:result
//     })

// })

const changePassword = catchAsync(async (req: Request, res: Response) => {

  const payload = req.body;
  const betterAuthSessionToken = getBetterAuthSessionToken(req);

  const result = await authService.changePassword(
    payload,
    {
      sessionToken: betterAuthSessionToken,
      authorizationHeader: req.headers.authorization,
      cookieHeader: req.headers.cookie,
      userId: req.user?.userId,
    }
  );

  const { accessToken, refreshToken } = result;
  const betterAuthToken = result.token;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);

  if (betterAuthToken) {
    tokenUtils.setBetterAuthSessionCookie(res, betterAuthToken);
  }

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

//logOut User
const logOutUser = catchAsync(async(req:Request, res:Response)=>{
    const betterAuthSessionToken = getBetterAuthSessionToken(req)
    const result = await authService.logOutUser(betterAuthSessionToken)

    // Aggressive purge: cookies set with different option combinations
    // (sameSite, secure, path, name prefix) historically left "ghost"
    // duplicates in the browser's Application tab. Clear every variant we
    // have ever set so the user ends up with zero auth cookies after
    // logout. Subsequent logins then start clean.
    const cookieNames = [
        "accessToken",
        "refreshToken",
        "better-auth.session_token",
        "__Secure-better-auth.session_token",
    ];

    const clearOptionVariants = [
        { httpOnly: true, secure: true, sameSite: "none" as const, path: "/" },
        { httpOnly: true, secure: false, sameSite: "lax" as const, path: "/" },
        { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
        { path: "/" },
        {},
    ];

    for (const name of cookieNames) {
        for (const opts of clearOptionVariants) {
            CookieUtils.clearCookie(res, name, opts);
        }
    }
     sendResponse(res,{
        httpStatusCode:status.OK,
        success:true,
        message:"successfully Logout",
        data:result
    })
})


//verify email
const verifyEmail = catchAsync(async(req:Request, res:Response)=> {
    const {email,otp} = req.body
     await authService.verifyEmail(email,otp)

    sendResponse(res, {
        httpStatusCode:status.OK,
        success:true,
        message:"email verified successfully",
        
    })
})

  // forget password
const forgetPassword = catchAsync(async(req:Request, res:Response)=> {
    const {email} = req.body
     await authService.forgetPassword(email)

    sendResponse(res, {
        httpStatusCode:status.OK,
        success:true,
        message:"password reset OTP sent to email successfully",
        
    })
})


   //reset password
const resetPassword = catchAsync(async(req:Request,  res:Response)=> {
    const {email, otp,  newPassword} = req.body
     await authService.resetPassword(email, otp,  newPassword)

    sendResponse(res, {
        httpStatusCode:status.OK,
        success:true,
        message:"password reset successfully",
        
    })
})


 //google login

// /api/v1/auth/login/google?redirect=/profile
const googleLogin = catchAsync((req: Request, res: Response) => {
    const redirectPath = req.query.redirect || "/dashboard";

    const encodedRedirectPath = encodeURIComponent(redirectPath as string);

    const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Login</title>
</head>
<body>
    <div><p>Redirecting to Google...</p></div>
    <script>
    (async () => {
        try {
            // Use a relative URL so the request always targets this same backend
            // origin, regardless of how BETTER_AUTH_URL is configured. Avoids
            // mixed-content / cross-origin failures behind a proxy.
            const response = await fetch("/api/auth/sign-in/social", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ provider: "google", callbackURL: ${JSON.stringify(callbackURL)} })
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                document.body.innerHTML = '<div><p>Error redirecting to Google. Please try again later.</p></div>';
            }
        } catch (error) {
            document.body.innerHTML = '<div><p>Error redirecting to Google: ' + (error && error.message ? error.message : 'Unknown error') + '</p></div>';
        }
    })();
    </script>
</body>
</html>`;

    res.set("Content-Type", "text/html").send(html);
})

const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = req.query.redirect as string || "/dashboard";

    const sessionToken = getBetterAuthSessionToken(req);

    if(!sessionToken){
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
    }

    const session = await auth.api.getSession({
        headers:{
            "Cookie" : `better-auth.session_token=${sessionToken}`
        }
    })

    if (!session) {
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
    }


    if(session && !session.user){
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
    }

    const result = await authService.googleLoginSuccess(session);

    const {accessToken, refreshToken} = result;

    // Still set the cross-site cookies for browsers that allow them (same-domain
    // deploys, custom domains, etc.). They will simply be ignored by the
    // frontend on a different site.
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, sessionToken);

    // ?redirect=//profile -> /profile
    const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
    const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

    // Cross-site cookie workaround: pass tokens to the frontend via a
    // dedicated `/auth/oauth-callback` route. The frontend route reads the
    // tokens from the query string, persists them via `setTokenInCookies`,
    // and then redirects to the originally requested page. Query params are
    // used (instead of a hash) so that the frontend's server-side handler
    // (e.g. Next.js App Router) can also read them if needed. The callback
    // URL is short-lived and tokens are immediately removed by the
    // frontend after consumption.
    const callbackParams = new URLSearchParams({
        accessToken,
        refreshToken,
        sessionToken,
        redirect: finalRedirectPath,
    }).toString();

    res.redirect(`${envVars.FRONTEND_URL}/auth/oauth-callback?${callbackParams}`);
})
// const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
//   const redirectPath = req.query.redirect as string || "/dashboard";

//   const sessionToken = req.cookies["better-auth.session_token"];

//   if (!sessionToken) {
//     return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
//   }

//   const session = await auth.api.getSession({
//     headers: {
//       Cookie: `better-auth.session_token=${sessionToken}`,
//     },
//   });

//   if (!session || !session.user) {
//     return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session`);
//   }

//   // Your existing logic
//   const { accessToken, refreshToken } =
//     await authService.googleLoginSuccess(session);

//   tokenUtils.setAccessTokenCookie(res, accessToken);
//   tokenUtils.setRefreshTokenCookie(res, refreshToken);

//   const isValidRedirectPath =
//     redirectPath.startsWith("/") && !redirectPath.startsWith("//");

//   const finalRedirectPath = isValidRedirectPath
//     ? redirectPath
//     : "/dashboard";

//   return res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`);
// });



const handlerOAuthError = catchAsync(async(req:Request, res:Response)=>{
  const error = req.query.error as string || "oauth failed"
  res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`)
})



 const checkEmailAvailability = catchAsync(async (req, res) => {
    const email = req.query.email as string;

    const exists = await authService.checkEmailExists(email);

    if (exists) {
      return sendResponse(res, {
        httpStatusCode: 400,
        success: false,
        message: "Email already exists",
      });
    }

    return sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Email available",
    });
  })





  const updateProfile = catchAsync(async (req, res) => {
  const user = req.user;
  const payload = req.body;

  const result = await authService.updateProfile(user, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});



export const authControler = {
    registeredUser,
    loginUser,
  clientDemoLogin,
  expertDemoLogin,
  adminDemoLogin,
    getMe,
    getNewToken,
    changePassword,
    logOutUser,
    verifyEmail,
    forgetPassword,
    resetPassword,
    googleLogin,
    googleLoginSuccess,
    handlerOAuthError,
    checkEmailAvailability,
    updateProfile,

}