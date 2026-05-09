/* eslint-disable @typescript-eslint/no-explicit-any */


import { prisma } from "../lib/prisma";
import { envVars } from "../config/env";
import { auth } from "../lib/auth";
import { UserRole, UserStatus } from "../generated/enums";

const DEMO_CANDIDATE_EMAIL = process.env.DEMO_CANDIDATE_EMAIL || "candidate@hiregpt.demo";
const DEMO_CANDIDATE_PASSWORD = process.env.DEMO_CANDIDATE_PASSWORD || "Demo@12345";
const DEMO_CANDIDATE_NAME = process.env.DEMO_CANDIDATE_NAME || "Demo Candidate";

const DEMO_REQRUITER_EMAIL = process.env.DEMO_REQRUITER_EMAIL || "reqruiter@hiregpt.demo";
const DEMO_REQRUITER_PASSWORD = process.env.DEMO_REQRUITER_PASSWORD || "Demo@12345";
const DEMO_REQRUITER_NAME = process.env.DEMO_REQRUITER_NAME || "Demo Reqruiter";

const DEMO_ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL || "admin@consultedge.demo";
const DEMO_ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || "Demo@12345";
const DEMO_ADMIN_NAME = process.env.DEMO_ADMIN_NAME || "Demo Admin";

export const getDemoCandidateCredentials = () => ({
    email: DEMO_CANDIDATE_EMAIL,
    password: DEMO_CANDIDATE_PASSWORD,
    name: DEMO_CANDIDATE_NAME,
});
// Backward compatibility
export const getDemoClientCredentials = getDemoCandidateCredentials;

export const getDemoReqruiterCredentials = () => ({
    email: DEMO_REQRUITER_EMAIL,
    password: DEMO_REQRUITER_PASSWORD,
    name: DEMO_REQRUITER_NAME,
});
// Backward compatibility
export const getDemoExpertCredentials = getDemoReqruiterCredentials;

export const getDemoAdminCredentials = () => ({
    email: DEMO_ADMIN_EMAIL,
    password: DEMO_ADMIN_PASSWORD,
    name: DEMO_ADMIN_NAME,
});

export const seedDemoCandidate = async () => {
    const credentials = getDemoCandidateCredentials();

    const existingUser = await prisma.user.findUnique({
        where: {
            email: credentials.email,
        },
        select: {
            id: true,
        },
    });

    let userId = existingUser?.id;

    if (!userId) {
        const created = await auth.api.signUpEmail({
            body: {
                email: credentials.email,
                password: credentials.password,
                name: credentials.name,
                role: UserRole.CANDIDATE,
                rememberMe: false,
            },
        });

        userId = created.user.id;
    }

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            name: credentials.name,
            role: UserRole.CANDIDATE,
            status: UserStatus.ACTIVE,
            emailVerified: true,
            needPasswordChange: false,
            isDeleted: false,
            deletedAt: null,
        },
    });

    await prisma.candidate.upsert({
        where: {
            userId,
        },
        create: {
            userId,
            fullName: credentials.name,
            email: credentials.email,
            isDeleted: false,
        },
        update: {
            fullName: credentials.name,
            email: credentials.email,
            isDeleted: false,
            deletedAt: null,
        },
    });

    return credentials;
};
// Backward compatibility
export const seedDemoClient = seedDemoCandidate;


export const seedAdmin = async()=>{
    try{
    const isAdminExists = await prisma.user.findFirst({
        where:{
            role:UserRole.ADMIN
        }
    })
    if(isAdminExists){
        console.log("Admin seed skipped: admin already exists");
        return;
    }


    const adminUser = await auth.api.signUpEmail({
        body:{
            email:envVars.ADMIN_EMAIL,
            password:envVars.ADMIN_PASSWORD,
            name:"Admin Saheb",
            role:UserRole.ADMIN,
            rememberMe:false
        }
    })



 await prisma.$transaction(async(tx)=>{
        await tx.user.update({
            where:{
                id:adminUser.user.id
            },
            data:{
                emailVerified:true
            }
        })



        await tx.admin.create({
            data:{
                userId:adminUser.user.id,
                name:' Admin Saheb',
                email:envVars.ADMIN_EMAIL,
               
            }
        })



    })

    const admin = await prisma.admin.findFirst({
        where:{
            email:envVars.ADMIN_EMAIL
        },
        include:{
            user:true
        }
    })
  console.log(' admin created', admin);
    }

    catch(error:any){
     console.error("Error sending  admin", error)
   
     await prisma.user.delete({
        where:{
            email:envVars.ADMIN_EMAIL
        }
     })

    }
}

// ---------------------------------------------------------------------------
// Demo Expert
// ---------------------------------------------------------------------------
export const seedDemoReqruiter = async () => {
    const credentials = getDemoReqruiterCredentials();

    // Ensure at least one industry exists so the demo reqruiter can be linked.
    let industry = await prisma.industry.findFirst({
        where: { isDeleted: false },
        select: { id: true },
    });

    if (!industry) {
        industry = await prisma.industry.create({
            data: {
                name: "General Recruiting",
                description: "General recruiting and talent acquisition services.",
            },
            select: { id: true },
        });
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: credentials.email },
        select: { id: true },
    });

    let userId = existingUser?.id;

    if (!userId) {
        const created = await auth.api.signUpEmail({
            body: {
                email: credentials.email,
                password: credentials.password,
                name: credentials.name,
                role: UserRole.RECRUITER,
                rememberMe: false,
            },
        });

        userId = created.user.id;
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            name: credentials.name,
            role: UserRole.RECRUITER,
            status: UserStatus.ACTIVE,
            emailVerified: true,
            needPasswordChange: false,
            isDeleted: false,
            deletedAt: null,
        },
    });

    await prisma.recruiter.upsert({
        where: { userId },
        create: {
            userId,
            fullName: credentials.name,
            email: credentials.email,
            title: "Senior Talent Acquisition Specialist",
            bio: "Demo reqruiter profile used for product walkthroughs.",
            experience: 8,
            consultationFee: 120,
            isVerified: true,
            industryId: industry.id,
            isDeleted: false,
        },
        update: {
            fullName: credentials.name,
            email: credentials.email,
            isVerified: true,
            isDeleted: false,
            deletedAt: null,
        },
    });

    return credentials;
};
// Backward compatibility
export const seedDemoExpert = seedDemoReqruiter;

// ---------------------------------------------------------------------------
// Demo Admin
// ---------------------------------------------------------------------------
export const seedDemoAdmin = async () => {
    const credentials = getDemoAdminCredentials();

    const existingUser = await prisma.user.findUnique({
        where: { email: credentials.email },
        select: { id: true },
    });

    let userId = existingUser?.id;

    if (!userId) {
        const created = await auth.api.signUpEmail({
            body: {
                email: credentials.email,
                password: credentials.password,
                name: credentials.name,
                role: UserRole.ADMIN,
                rememberMe: false,
            },
        });

        userId = created.user.id;
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            name: credentials.name,
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
            emailVerified: true,
            needPasswordChange: false,
            isDeleted: false,
            deletedAt: null,
        },
    });

    await prisma.admin.upsert({
        where: { userId },
        create: {
            userId,
            name: credentials.name,
            email: credentials.email,
        },
        update: {
            name: credentials.name,
            email: credentials.email,
        },
    });

    return credentials;
};