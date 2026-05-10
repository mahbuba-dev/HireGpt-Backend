/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { tokenUtils } from "../../utilis/token";
import { IRequestUser } from "../../interfaces/requestUser.interface";

import { JwtPayload } from "jsonwebtoken";
import { IChangePasswordPayload, IGoogleSessionPayload, ILoginUserPayload, IRegisterCandidatePayload, } from "./auth.interface";


import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { envVars } from "../../config/env";
import { jwtUtils } from "../../utilis/jwt";
import { getDemoAdminCredentials, getDemoCandidateCredentials, getDemoReqruiterCredentials, seedDemoAdmin, seedDemoCandidate, seedDemoReqruiter } from "../../utilis/seed";
import { UserRole, UserStatus } from "../../generated/enums";


type BetterAuthLikeError = {
  status?: string;
  statusCode?: number;
  body?: {
    message?: string;
    code?: string;
  };
  message?: string;
};

const isBetterAuthLikeError = (error: unknown): error is BetterAuthLikeError => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as BetterAuthLikeError;

  return (
    typeof candidate.statusCode === "number" ||
    typeof candidate.status === "string" ||
    typeof candidate.body?.message === "string"
  );
};

const mapBetterAuthError = (error: unknown, fallbackMessage: string) => {
  if (!isBetterAuthLikeError(error)) {
    return null;
  }

  const message = error.body?.message || error.message || fallbackMessage;
  const statusCode =
    typeof error.statusCode === "number"
      ? error.statusCode
      : error.status === "UNAUTHORIZED"
        ? status.UNAUTHORIZED
        : status.BAD_REQUEST;

  return new AppError(statusCode, message);
};


const registerCandidate = async (payload: IRegisterCandidatePayload) => {
  const { fullName, email, password } = payload;

  // 1. Create user in BetterAuth
  const data = await auth.api.signUpEmail({
    body: { name: fullName, email, password },
  });

  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Failed to register user");
  }

  // 2. Force role = JOB_SEEKER
  await prisma.user.update({
    where: { id: data.user.id },
    data: { role:UserRole.CANDIDATE, status: UserStatus.ACTIVE },
  });

  // 3. Create candidate profile
  const candidate = await prisma.$transaction(async (tx) => {
    try {
      const profile = await tx.candidate.create({
        data: {
          userId: data.user.id,
          fullName,
          email,
        },
      });
      return profile;
    } catch (err) {
      await tx.user.delete({ where: { id: data.user.id } });
      throw err;
    }
  });

  // 4. Generate tokens
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: UserRole.CANDIDATE,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: UserRole.CANDIDATE,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });
  console.log(data, accessToken, refreshToken, candidate);
  return {
    ...data,
    accessToken,
    refreshToken,
    candidate,
  };
};





//login//

const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;

  const data = await auth.api
    .signInEmail({
      body: { email, password }
    })
    .catch((error) => {
      const mappedError = mapBetterAuthError(
        error,
        "Invalid email or password"
      );

      if (mappedError) {
        throw mappedError;
      }

      throw error;
    });

  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "User is Blocked");
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError(status.FORBIDDEN, "User is deleted");
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });

  return {
    ...data,
    accessToken,
    refreshToken,
    // user: data.user,
    // token: data.token,        // <-- BetterAuth session token
    // redirect: data.redirect,
    // url: data.url,
    // accessToken,
    // refreshToken
  };
};

const loginDemoCandidate = async () => {
  await seedDemoCandidate();

  const credentials = getDemoCandidateCredentials();

  const data = await auth.api
    .signInEmail({
      body: {
        email: credentials.email,
        password: credentials.password,
      },
    })
    .catch((error) => {
      const mappedError = mapBetterAuthError(
        error,
        "Candidate demo login failed"
      );

      if (mappedError) {
        throw mappedError;
      }

      throw error;
    });

  if (data.user.role !== UserRole.CANDIDATE) {
    throw new AppError(status.FORBIDDEN, "Demo account role is invalid");
  }

  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "User is Blocked");
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError(status.FORBIDDEN, "User is deleted");
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

const loginDemoReqruiter = async () => {
  await seedDemoReqruiter();

  const credentials = getDemoReqruiterCredentials();

  const data = await auth.api
    .signInEmail({
      body: {
        email: credentials.email,
        password: credentials.password,
      },
    })
    .catch((error) => {
      const mappedError = mapBetterAuthError(error, "Reqruiter demo login failed");
      if (mappedError) throw mappedError;
      throw error;
    });

  if (data.user.role !== UserRole.RECRUITER) {
    throw new AppError(status.FORBIDDEN, "Demo account role is invalid");
  }

  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "User is Blocked");
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError(status.FORBIDDEN, "User is deleted");
  }

  const tokenPayload = {
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  };

  return {
    ...data,
    accessToken: tokenUtils.getAccessToken(tokenPayload),
    refreshToken: tokenUtils.getRefreshToken(tokenPayload),
  };
};

const loginDemoAdmin = async () => {
  await seedDemoAdmin();

  const credentials = getDemoAdminCredentials();

  const data = await auth.api
    .signInEmail({
      body: {
        email: credentials.email,
        password: credentials.password,
      },
    })
    .catch((error) => {
      const mappedError = mapBetterAuthError(error, "Admin demo login failed");
      if (mappedError) throw mappedError;
      throw error;
    });

  if (data.user.role !== UserRole.ADMIN) {
    throw new AppError(status.FORBIDDEN, "Demo account role is invalid");
  }

  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "User is Blocked");
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError(status.FORBIDDEN, "User is deleted");
  }

  const tokenPayload = {
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  };

  return {
    ...data,
    accessToken: tokenUtils.getAccessToken(tokenPayload),
    refreshToken: tokenUtils.getRefreshToken(tokenPayload),
  };
};




//get me

const getMe = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: { id: user.userId },
    include: {
      candidates: true,
      recruiters: {
        include: {
          industries: true,
          interviews: true,
          jobApplications: true,
          jobs: true,
        },
      },
      admins: true,
    },
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return isUserExists;
};


//get new token
const getNewToken = async(refreshToken:string, sessionToken?:string)=> {
    const verifyRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET)
    if(!verifyRefreshToken.success){
     throw new AppError(status.UNAUTHORIZED, "invalid refresh token")
    };

    const data = verifyRefreshToken.data as JwtPayload

    if(!data?.userId){
      throw new AppError(status.UNAUTHORIZED, "invalid refresh token payload")
    }

    const user = await prisma.user.findUnique({
      where: {
        id: data.userId,
      },
    })

    if(!user || user.isDeleted || user.status === UserStatus.DELETED || user.status === UserStatus.BLOCKED){
      throw new AppError(status.UNAUTHORIZED, "User is not authorized")
    }

    let nextSessionToken: string | null = null

    if (sessionToken) {
      try {
        const betterAuthSession = await auth.api.getSession({
          headers: {
            Cookie: `better-auth.session_token=${sessionToken}`,
          },
        })

        if (
          betterAuthSession?.session &&
          betterAuthSession.user?.id === user.id
        ) {
          await prisma.session.update({
            where: {
              token: betterAuthSession.session.token,
            },
            data: {
              expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
              updatedAt: new Date(),
            },
          }).catch(() => null)

          nextSessionToken = sessionToken
        }
      } catch {
        nextSessionToken = null
      }
    }

   const newAccessToken = tokenUtils.getAccessToken({
        userId:user.id,
        email:user.email,
        name:user.name,
        role:user.role,
        status:user.status,
        isDeleted:user.isDeleted,
        emailVerified:user.emailVerified
    })

    const newRefreshToken = tokenUtils.getRefreshToken({
        userId:user.id,
        email:user.email,
        name:user.name,
        role:user.role,
        status:user.status,
        isDeleted:user.isDeleted,
        emailVerified:user.emailVerified
    })

    return {
        accessToken:newAccessToken,
        refreshToken:newRefreshToken,
        sessionToken:nextSessionToken
    }
}






//change password
// const changePassword = async(payload:IChangePasswordPayload, sessionToken:string)=>{
//   const session = await auth.api.getSession({
//     headers:new Headers({
//         Authorization:`Bearer ${sessionToken}`
//     })
//   })
//   console.log(session);
//   if(!session){
//     throw new AppError(status.UNAUTHORIZED, "Invalid session token")
//   }

// const {currentPassword, newPassword} = payload

// const result = await auth.api.changePassword({
//     body:{
//         currentPassword,
//         newPassword,
//         revokeOtherSessions:true
//     },
//     headers: new Headers({
//         Authorization:`Bearer ${sessionToken}`
//     })

// })
// if(session.user.needPasswordChange){
// await prisma.user.update({
//     where:{
//         id:session.user.id
//     },
//     data:{
//         needPasswordChange:false
//     }
//  })
// }
 
// console.log('session', session?.user);

// const accessToken = tokenUtils.getAccessToken({
//         userId:session.user.id,
//         email:session.user.email,
//         name:session.user.name,
//         role:session.user.role,
//         status:session.user.status,
//         isDeleted:session.user.isDeleted,
//         emailVerified:session.user.emailVerified
//     })

//     const refreshToken = tokenUtils.getRefreshToken({
//         userId:session.user.id,
//         email:session.user.email,
//         name:session.user.name,
//         role:session.user.role,
//         status:session.user.status,
//         isDeleted:session.user.isDeleted,
//         emailVerified:session.user.emailVerified
//     })
// return {
//   ...result,
//   accessToken,
//   refreshToken
// }
// } 



const changePassword = async (
  payload: IChangePasswordPayload,
  authContext: {
    sessionToken?: string;
    authorizationHeader?: string;
    cookieHeader?: string;
    userId?: string;
  }
) => {
  const { sessionToken, authorizationHeader, cookieHeader, userId } = authContext;

  const buildHeaders = (token?: string) => {
    const headerInit: Record<string, string> = {};

    if (authorizationHeader) {
      headerInit.Authorization = authorizationHeader;
    } else if (token) {
      headerInit.Authorization = `Bearer ${token}`;
    }

    if (cookieHeader) {
      headerInit.Cookie = cookieHeader;
    } else if (token) {
      headerInit.Cookie = `better-auth.session_token=${token}; __Secure-better-auth.session_token=${token}`;
    }

    return new Headers(headerInit);
  };

  if (!sessionToken && !authorizationHeader && !cookieHeader && !userId) {
    throw new AppError(status.UNAUTHORIZED, "Session expired. Please login again.");
  }

  let authHeaders = buildHeaders(sessionToken);
  let session = await auth.api
    .getSession({
      headers: authHeaders,
    })
    .catch(() => null);

  if (!session?.user && userId) {
    const activeSession = await prisma.session.findFirst({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (activeSession?.token) {
      authHeaders = buildHeaders(activeSession.token);
      session = await auth.api
        .getSession({
          headers: authHeaders,
        })
        .catch(() => null);
    }
  }

  if (!session?.user) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token. Please login again.");
  }

  const { currentPassword, newPassword } = payload;

  if (currentPassword && currentPassword === newPassword) {
    throw new AppError(
      status.BAD_REQUEST,
      "New password must be different from current password"
    );
  }

  const credentialAccount = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "credential",
    },
  });

  let result;

  if (credentialAccount?.password) {
    if (!currentPassword) {
      throw new AppError(status.BAD_REQUEST, "Current password is required");
    }

    result = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
      headers: authHeaders,
    });
  } else {
    result = await auth.api.setPassword({
      body: {
        newPassword,
      },
      headers: authHeaders,
    });
  }

  const operationStatus = "status" in result ? result.status : true;

  if (!operationStatus) {
    const errorMessage =
      typeof (result as any)?.message === "string"
        ? (result as any).message
        : "Password change failed. Please verify your current password and try again.";

    throw new AppError(status.BAD_REQUEST, errorMessage);
  }

  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { needPasswordChange: false },
    });
  }

  const updatedUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!updatedUser) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    role: updatedUser.role,
    status: updatedUser.status,
    isDeleted: updatedUser.isDeleted,
    emailVerified: updatedUser.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    role: updatedUser.role,
    status: updatedUser.status,
    isDeleted: updatedUser.isDeleted,
    emailVerified: updatedUser.emailVerified,
  });

  const betterAuthToken = "token" in result ? result.token : null;

  return {
    status: operationStatus,
    token: betterAuthToken,
    user: updatedUser,
    accessToken,
    refreshToken,
  };
};


//logout
const logOutUser = async(sessionToken:string)=>{
    const result = await auth.api.signOut({
        headers: new Headers({
            Authorization:`Bearer ${sessionToken}`
        })
    })
    return result
}



//verify email
const verifyEmail = async(email:string, otp:string)=>{
    const result = await auth.api.verifyEmailOTP({
        body:{
            email,otp
        }
    })
    if(result.status && !result.user.emailVerified){
        await prisma.user.update({
            where:{
                email,
            },
            data:{
                emailVerified:true
            }
        })
    }
}


//forget password
const forgetPassword = async(email:string)=>{
    const isUserExists = await prisma.user.findUnique({
        where:{
            email
        }
    })

    if(!isUserExists){
        throw new AppError(status.NOT_FOUND, "user not found")
    }
    if(!isUserExists.emailVerified){
          throw new AppError(status.BAD_REQUEST, "email not verified")
    }
    if(isUserExists.isDeleted || isUserExists.status === UserStatus.DELETED){
         throw new AppError(status.NOT_FOUND, "user not found")
    }

    await auth.api.requestPasswordResetEmailOTP({
        body:{
            email
        }
    })
}


//reset password
const resetPassword = async(email:string, otp:string, newPassword:string) => {
   const isUserExists = await prisma.user.findUnique({
        where:{
            email
        }
    })

    if(!isUserExists){
        throw new AppError(status.NOT_FOUND, "user not found")
    }

    if(!isUserExists.emailVerified){
          throw new AppError(status.BAD_REQUEST, "email not verified")
    }

    if(isUserExists.isDeleted || isUserExists.status === UserStatus.DELETED){
         throw new AppError(status.NOT_FOUND, "user not found")
    }

    const previousCredentialAccount = await prisma.account.findFirst({
      where: {
        userId: isUserExists.id,
        providerId: "credential",
      },
      select: {
        password: true,
        updatedAt: true,
      },
    })

    const result = await auth.api.resetPasswordEmailOTP({
        body:{
            email,
            otp,
            password:newPassword
        }
    })

    if (!result?.success) {
      throw new AppError(status.BAD_REQUEST, "Password reset failed")
    }

    const updatedCredentialAccount = await prisma.account.findFirst({
      where: {
        userId: isUserExists.id,
        providerId: "credential",
      },
      select: {
        password: true,
        updatedAt: true,
      },
    })

    if (!updatedCredentialAccount?.password) {
      throw new AppError(status.BAD_REQUEST, "New password was not saved")
    }

    if (
      previousCredentialAccount &&
      previousCredentialAccount.password === updatedCredentialAccount.password &&
      previousCredentialAccount.updatedAt.getTime() === updatedCredentialAccount.updatedAt.getTime()
    ) {
      throw new AppError(status.BAD_REQUEST, "New password was not saved")
    }

    //update need password change true

    if(isUserExists.needPasswordChange){
await prisma.user.update({
    where:{
        id:isUserExists.id
    },
    data:{
        needPasswordChange:false
    }
 })
}

   // delete all session for this user
    await prisma.session.deleteMany({
        where:{
            userId:isUserExists.id
        }
    })



}







  //googleLoginSuccess
const googleLoginSuccess = async (session : Record<string, any>) =>{
    const isCandidateExists = await prisma.candidate.findUnique({
      where : {
        userId : session.user.id,
      }
    })

    if(!isCandidateExists){
      await prisma.candidate.create({
        data : {
          userId : session.user.id,
          fullName : session.user.name,
          email : session.user.email,
        }
      })
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
    });

    return {
        accessToken,
        refreshToken,
    }
}



  const checkEmailExists = async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return !!user; // true = exists, false = available
  }






  const updateProfile = async (user: IRequestUser, payload: any) => {
  const baseUpdate = {
    name: payload.name,
    email: payload.email,
    image: payload.image,
  };

  const updatedUser = await prisma.user.update({
    where: { id: user.userId },
    data: baseUpdate,
  });

  // Expert update
  if (updatedUser.role === "RECRUITER") {
    await prisma.recruiter.update({
      where: { userId: user.userId },
      data: {
        title: payload.title,
        experience: payload.experience,
        industryId: payload.industryId,
      },
    });
  }

  // Candidate update
  if (updatedUser.role === "CANDIDATE") {
    await prisma.candidate.update({
      where: { userId: user.userId },
      data: {
        fullName: payload.fullName,
      },
    });
  }

  return updatedUser;
};






export const authService = {
  registerCandidate,
  loginUser,
  loginDemoCandidate,
  loginDemoReqruiter,
  loginDemoAdmin,
  getMe,
  getNewToken,
  changePassword,
  logOutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
  googleLoginSuccess,
  checkEmailExists,
  updateProfile
}